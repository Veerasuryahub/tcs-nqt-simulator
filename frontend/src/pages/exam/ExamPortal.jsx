import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { examService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EXAM_SECTIONS } from '../../constants/sections';
import Editor from '@monaco-editor/react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Play, Send, AlertTriangle, Award, PanelRightOpen, PanelRightClose } from 'lucide-react';

const ExamPortal = () => {
  const [questions, setQuestions] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Coding states
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [languageId, setLanguageId] = useState('71'); // Default Python
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const startSectionId = queryParams.get('section');
  const isPractice = queryParams.get('practice') === 'true';

  const currentSection = EXAM_SECTIONS[currentSectionIndex];

  useEffect(() => {
    if (startSectionId) {
      initExam(startSectionId, isPractice);
    } else {
      checkActiveSession();
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);
    };
  }, []);

  const checkActiveSession = async () => {
    try {
      const activeRes = await examService.getActiveSubmission();
      if (activeRes.data) {
        const sub = activeRes.data;
        setSubmissionId(sub._id);
        
        const qMap = {};
        sub.sections.forEach(s => {
          qMap[s.name] = s.questions.map(q => q.questionId);
        });
        setQuestions(qMap);

        const secIndex = EXAM_SECTIONS.findIndex(s => s.id === sub.currentSection);
        setCurrentSectionIndex(secIndex !== -1 ? secIndex : 0);
        
        const restoredQuestions = {};
        sub.sections.forEach(s => {
          restoredQuestions[s.name] = s.questions.map(q => q.questionId);
        });
        setQuestions(restoredQuestions);
        
        const savedAnswers = {};
        sub.sections.forEach(s => {
          if (s.answers) {
            Object.assign(savedAnswers, s.answers);
          }
        });
        setAnswers(savedAnswers);

        const currentSecData = sub.sections.find(s => s.name === sub.currentSection);
        setTimeLeft(currentSecData?.timeRemaining || EXAM_SECTIONS[secIndex].duration);
        setTotalTimeSpent(sub.timeTaken || 0);

        startTimer();
        startAutoSave();
        setLoading(false);
      } else {
        initExam();
      }
    } catch (err) {
      console.error(err);
      initExam();
    }
  };

  const initExam = async (sectionId = null, practice = false) => {
    try {
      setLoading(true);
      const sRes = await examService.startExam({ initialSection: sectionId, isPractice: practice });
      const sub = sRes.data;
      setSubmissionId(sub._id);
      
      const restoredQuestions = {};
      sub.sections.forEach(s => {
        restoredQuestions[s.name] = s.questions.map(q => q.questionId);
      });
      setQuestions(restoredQuestions);
      
      const secIndex = EXAM_SECTIONS.findIndex(s => s.id === sub.currentSection);
      setCurrentSectionIndex(secIndex !== -1 ? secIndex : 0);
      
      setTimeLeft(EXAM_SECTIONS[secIndex !== -1 ? secIndex : 0].duration);
      setTotalTimeSpent(0);
      startTimer();
      startAutoSave();
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to initialize exam. Please refresh.');
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSectionAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
  };

  const startAutoSave = () => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(() => {
      syncProgress();
    }, 30000);
  };

  const syncProgress = async (nextSectionId = null) => {
    if (!submissionId) return;
    try {
      await examService.saveProgress({
        submissionId,
        sectionName: currentSection.id,
        answers,
        timeRemaining: timeLeft,
        nextSection: nextSectionId,
        timeTaken: totalTimeSpent
      });
    } catch (error) {
      console.error('Failed to sync progress:', error);
    }
  };

  const handleSectionAutoSubmit = () => {
    if (currentSectionIndex < EXAM_SECTIONS.length - 1) {
      goToNextSection();
    } else {
      finalizeExam();
    }
  };

  const goToNextSection = async () => {
    const nextIndex = currentSectionIndex + 1;
    const nextSection = EXAM_SECTIONS[nextIndex];
    
    await syncProgress(nextSection.id);
    
    setCurrentSectionIndex(nextIndex);
    setCurrentIndex(0);
    setTimeLeft(nextSection.duration);
    setShowSectionModal(false);
    startTimer();
  };

  const finalizeExam = async () => {
    setSubmitting(true);
    try {
      await syncProgress();
      const res = await examService.submitExam({
        submissionId,
        timeTaken: totalTimeSpent
      });
      navigate(`/results/${res.data._id}`);
    } catch (err) {
      alert('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId, answer) => {
    setAnswers({ ...answers, [qId]: answer });
  };

  const getLangKey = (id) => {
    switch(id) {
      case '71': return 'python';
      case '54': return 'cpp';
      case '62': return 'java';
      default: return 'python';
    }
  };

  const toggleMarkReview = (qId) => {
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const currentQ = questions[currentSection.id][currentIndex];
      const stdin = currentQ.test_cases?.[0]?.input || '';
      const langKey = getLangKey(languageId);
      const answerKey = `${currentQ._id}_${langKey}`;
      const sourceCode = answers[answerKey] || currentQ.code_templates?.[langKey] || '';
      const res = await examService.runCode({ 
        source_code: sourceCode, 
        language_id: languageId, 
        stdin 
      });
      setCodeOutput(res.stdout || res.stderr || res.compile_output || 'No output');
    } catch (err) {
      setCodeOutput('Error running code');
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-slate-400 animate-pulse font-mono tracking-widest text-xs uppercase text-center">Initializing Secure Environment...</p>
    </div>
  );

  const currentQuestion = questions[currentSection.id]?.[currentIndex];
  const isCoding = currentSection.id === 'coding';

  if (!currentQuestion) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      <AlertTriangle size={48} className="text-orange-500 mb-6 animate-bounce sm:w-16 sm:h-16" />
      <h1 className="text-2xl sm:text-3xl font-black mb-2 uppercase tracking-tighter">Section Data Missing</h1>
      <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium text-sm sm:text-base">We couldn't load the questions for {currentSection.name}. This can happen if the database seeding was incomplete or the connection timed out.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm">Retry Loading</button>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700 text-sm">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="bg-[#1e293b] text-white px-3 sm:px-4 flex justify-between items-center h-14 sm:h-16 shadow-xl z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <div className="hidden sm:flex items-center gap-3 border-r border-slate-700 pr-4 sm:pr-6 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">T</div>
            <span className="font-bold tracking-tight text-sm">NQT SIMULATOR</span>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center min-w-0">
            <span className="hidden sm:inline text-slate-400 text-xs uppercase font-bold tracking-widest">Section</span>
            <div className="bg-blue-600/20 text-blue-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border border-blue-500/30 truncate">
              {currentSection.name.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-lg sm:text-2xl shadow-inner transition-all ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-slate-800 text-green-400 border border-slate-700'}`}>
            <Clock size={18} className={`sm:w-6 sm:h-6 ${timeLeft < 300 ? 'animate-bounce' : ''}`} />
            {formatTime(timeLeft)}
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            aria-label="Toggle question palette"
          >
            {showSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>

          <div className="hidden sm:flex items-center gap-3 border-l border-slate-700 pl-4 sm:pl-6">
            <div className="text-right">
              <div className="text-sm font-bold leading-tight uppercase tracking-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-tight">Verified Candidate</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-600 flex items-center justify-center text-lg font-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Section Info Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-2 sm:py-3 flex justify-between items-center h-10 sm:h-12 shrink-0">
             <div className="flex items-center gap-2 sm:gap-4">
                <span className="bg-slate-200 text-slate-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">
                  Q {currentIndex + 1} / {questions[currentSection.id].length}
                </span>
                <div className="h-1 w-16 sm:w-32 bg-slate-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-500 transition-all duration-500" 
                     style={{ width: `${((currentIndex + 1) / questions[currentSection.id].length) * 100}%` }}
                   ></div>
                </div>
                <h3 className="hidden sm:block font-bold text-slate-400 text-xs uppercase tracking-widest">
                  {currentSection.type} Phase
                </h3>
             </div>
             <div className="hidden sm:flex items-center gap-1.5 grayscale opacity-50">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Secure Link Active</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 sm:mb-12">
                {currentQuestion.is_previous_nqt_question && (
                  <div className="mb-2 sm:mb-6 flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest border border-green-100 self-start animate-pulse w-fit">
                    <Award size={12} className="sm:w-3.5 sm:h-3.5" />
                    TCS NQT PREVIOUSLY ASKED
                  </div>
                )}
                <h2 className="text-base sm:text-2xl lg:text-[28px] font-black text-slate-800 leading-snug whitespace-pre-wrap">
                  {currentQuestion.question_text.replace('[TCS NQT PREVIOUSLY ASKED] ', '')}
                </h2>
              </div>

              {!isCoding ? (
                <div className="grid grid-cols-1 gap-2 sm:gap-4">
                  {currentQuestion.options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAnswerChange(currentQuestion._id, opt)}
                      className={`flex items-center p-3 sm:p-6 border-2 rounded-xl sm:rounded-2xl text-left transition-all duration-150 group active:scale-[0.98] ${answers[currentQuestion._id] === opt ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 mr-3 sm:mr-6 flex items-center justify-center font-black text-xs sm:text-base transition-all shrink-0 ${answers[currentQuestion._id] === opt ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-400 group-hover:border-slate-400'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-sm sm:text-lg lg:text-xl font-semibold ${answers[currentQuestion._id] === opt ? 'text-blue-900' : 'text-slate-700'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] border shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="bg-[#0f172a] p-3 sm:p-4 flex justify-between items-center">
                    <div className="flex gap-2 sm:gap-4 items-center">
                      <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-700">
                        <span className="hidden sm:inline text-[10px] font-black text-slate-500 uppercase">Lang</span>
                        <select 
                          value={languageId}
                          onChange={(e) => setLanguageId(e.target.value)}
                          className="bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none"
                        >
                          <option value="71">Python 3</option>
                          <option value="54">C++ 17</option>
                          <option value="62">Java 13</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-black transition-all disabled:opacity-50 uppercase tracking-wider sm:tracking-widest shadow-lg shadow-indigo-900/40"
                    >
                      {isRunning ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <Play size={14} fill="currentColor" />}
                      <span className="hidden xs:inline">Run</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-[#1e1e1e]">
                    <Editor
                      height="100%"
                      language={getLangKey(languageId)}
                      value={answers[`${currentQuestion._id}_${getLangKey(languageId)}`] || currentQuestion.code_templates?.[getLangKey(languageId)] || ''}
                      theme="vs-dark"
                      onChange={(val) => handleAnswerChange(`${currentQuestion._id}_${getLangKey(languageId)}`, val)}
                      options={{
                        fontSize: window.innerWidth < 640 ? 14 : 18,
                        fontFamily: 'JetBrains Mono, Menlo, monospace',
                        lineHeight: 1.6,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: 'on'
                      }}
                    />
                  </div>
                  <div className="h-32 sm:h-48 bg-[#020617] p-3 sm:p-6 font-mono text-xs sm:text-sm border-t border-slate-800 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-4">
                       <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1 h-3 bg-blue-500"></div> Output Terminal
                       </span>
                    </div>
                    <pre className="flex-1 overflow-y-auto text-emerald-400 text-xs sm:text-base leading-relaxed">{codeOutput || 'System ready. Waiting for execution command...'}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar — single row, always visible */}
          <footer className="bg-slate-50 border-t border-slate-200 px-2 sm:px-6 lg:px-8 py-2 sm:py-4 flex justify-between items-center shrink-0">
            <div className="flex gap-1.5 sm:gap-4">
              <button 
                onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 border-2 border-slate-200 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs text-slate-500 hover:bg-white hover:border-slate-400 transition-all disabled:opacity-10 uppercase tracking-wider"
              >
                <ChevronLeft size={14} className="sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Prev</span>
              </button>
              <button 
                onClick={() => toggleMarkReview(currentQuestion._id)}
                className={`flex items-center gap-1 sm:gap-3 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${markedForReview[currentQuestion._id] ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'border-2 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
              >
                <Flag size={14} className="sm:w-5 sm:h-5" fill={markedForReview[currentQuestion._id] ? 'currentColor' : 'none'} /> <span className="hidden xs:inline">Review</span>
              </button>
            </div>

            <div className="flex gap-2 sm:gap-6 items-center">
               <div className="hidden lg:block text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Action</div>
                  <div className="text-sm font-bold text-slate-700 italic">
                    {currentIndex < questions[currentSection.id].length - 1 ? 'Go to Next Question' : 'Section Completion'}
                  </div>
               </div>
               
               {currentIndex < questions[currentSection.id].length - 1 ? (
                 <button 
                   onClick={() => setCurrentIndex(currentIndex + 1)}
                   className="flex items-center gap-1.5 sm:gap-4 px-4 sm:px-8 lg:px-12 py-2.5 sm:py-4 bg-indigo-600 text-white rounded-lg sm:rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all uppercase tracking-wider text-xs sm:text-sm"
                 >
                   Next <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                 </button>
               ) : (
                 currentSectionIndex < EXAM_SECTIONS.length - 1 ? (
                  <button 
                    onClick={() => setShowSectionModal(true)}
                    className="flex items-center gap-1.5 sm:gap-4 px-4 sm:px-8 lg:px-12 py-2.5 sm:py-4 bg-emerald-600 text-white rounded-lg sm:rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all uppercase tracking-wider text-xs sm:text-sm"
                  >
                    Finish <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                 ) : (
                  <button 
                    onClick={finalizeExam}
                    disabled={submitting}
                    className="flex items-center gap-1.5 sm:gap-4 px-4 sm:px-8 lg:px-12 py-2.5 sm:py-4 bg-red-600 text-white rounded-lg sm:rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all uppercase tracking-wider text-xs sm:text-sm"
                  >
                    {submitting ? '...' : <><Send size={14} className="sm:w-5 sm:h-5" /> Submit</>}
                  </button>
                 )
               )}
            </div>
          </footer>
        </div>

        {/* Question Palette Drawer — hidden on mobile by default, toggle with button */}
        {/* Mobile overlay backdrop */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        <aside className={`
          fixed lg:static top-0 right-0 h-full z-30
          w-[300px] sm:w-[340px] lg:w-[380px]
          bg-slate-50 border-l border-slate-200 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile close button */}
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all z-10"
          >
            <PanelRightClose size={20} />
          </button>

          <div className="p-6 sm:p-8 lg:p-10 pt-14 lg:pt-10 overflow-y-auto flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-10 text-center">Question Palette</h3>
            
            <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              {questions[currentSection.id].map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => { setCurrentIndex(i); setShowSidebar(false); }}
                  className={`w-full aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-xs font-black transition-all duration-300 relative
                    ${currentIndex === i ? 'ring-2 sm:ring-4 ring-indigo-500 ring-offset-2 sm:ring-offset-4 scale-105 sm:scale-110 z-10 shadow-xl sm:shadow-2xl' : ''}
                    ${markedForReview[q._id] ? 'bg-amber-500 text-white' : 
                      answers[q._id] ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300'}
                  `}
                >
                  <span className="text-xs sm:text-sm">{i + 1}</span>
                  {markedForReview[q._id] && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center"><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-500 rounded-full"></div></div>}
                </button>
              ))}
            </div>

            <div className="mt-8 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm">
               <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {(
                        questions[currentSection.id]?.filter(q => {
                          if (currentSection.id === 'coding') {
                            return answers[`${q._id}_python`] || answers[`${q._id}_cpp`] || answers[`${q._id}_java`];
                          }
                          return !!answers[q._id];
                        }).length / 
                        questions[currentSection.id]?.length * 100
                      ).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-md sm:rounded-lg shadow-lg shadow-emerald-200"></div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Solved</span>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 rounded-md sm:rounded-lg shadow-lg shadow-amber-200"></div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Review</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-10 mt-auto shrink-0">
            <div className="bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 text-white overflow-hidden relative shadow-2xl border border-white/10">
              <div className="relative z-10">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/40 mb-2 sm:mb-3">Next Section</p>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-black mb-1 leading-tight tracking-tight">
                  {currentSectionIndex < EXAM_SECTIONS.length - 1 ? EXAM_SECTIONS[currentSectionIndex+1].name : 'Final Step'}
                </h4>
                <p className="text-[10px] sm:text-xs text-indigo-400 font-bold mb-3 sm:mb-6 italic">Section Lock Active</p>
                <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black bg-white/5 w-fit px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 uppercase tracking-wider sm:tracking-widest">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5 text-blue-500" /> {currentSectionIndex < EXAM_SECTIONS.length - 1 ? (EXAM_SECTIONS[currentSectionIndex+1].duration / 60) + 'm Limit' : 'Finalization'}
                </div>
              </div>
              <div className="absolute -right-8 sm:-right-12 -bottom-8 sm:-bottom-12 text-white/5 rotate-12">
                 <AlertTriangle size={140} className="sm:w-60 sm:h-60" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Section Jump Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 max-w-lg sm:max-w-2xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-100">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 rounded-xl sm:rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-6 sm:mb-10">
              <CheckCircle size={36} className="sm:w-12 sm:h-12" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 text-center mb-3 sm:mb-6 tracking-tighter">Submit Section?</h2>
            <p className="text-slate-500 text-center mb-6 sm:mb-12 text-sm sm:text-lg font-medium max-w-md mx-auto leading-relaxed">
              Confirm your submission for <span className="text-slate-900 font-black italic">{currentSection.name}</span>. 
              The system will <span className="text-indigo-600 font-black">permanently lock</span> this data.
            </p>
            
            <div className="bg-slate-50 rounded-xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-12 flex items-center justify-between border border-slate-100">
               <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 block">Next Section</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
                    {EXAM_SECTIONS[currentSectionIndex+1].name}
                  </div>
               </div>
               <div className="bg-white px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-center">
                  <div className="text-xl sm:text-2xl font-black text-indigo-600">{EXAM_SECTIONS[currentSectionIndex+1].duration / 60}</div>
                  <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Minutes</div>
               </div>
            </div>

            <div className="flex gap-3 sm:gap-6">
              <button 
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-4 sm:px-8 py-3 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] sm:text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={goToNextSection}
                className="flex-1 px-4 sm:px-8 py-3 sm:py-5 bg-indigo-600 text-white rounded-xl sm:rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all uppercase tracking-widest text-[10px] sm:text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
