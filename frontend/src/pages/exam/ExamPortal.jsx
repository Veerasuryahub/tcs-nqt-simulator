import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EXAM_SECTIONS } from '../../constants/sections';
import Editor from '@monaco-editor/react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Play, Send, AlertTriangle, Award } from 'lucide-react';

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
  
  // Coding states
  const [code, setCode] = useState('');
  const [languageId, setLanguageId] = useState('71'); // Python (3.8.1)
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  const currentSection = EXAM_SECTIONS[currentSectionIndex];

  useEffect(() => {
    checkActiveSession();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);
    };
  }, []);

  const checkActiveSession = async () => {
    try {
      const activeRes = await examService.getActiveSubmission();
      if (activeRes.data) {
        // Restore session
        const sub = activeRes.data;
        setSubmissionId(sub._id);
        
        // Reconstruct questions map
        const qMap = {};
        sub.sections.forEach(s => {
          qMap[s.name] = s.questions.map(q => q.questionId);
        });
        setQuestions(qMap);

        // Find current section
        const secIndex = EXAM_SECTIONS.findIndex(s => s.id === sub.currentSection);
        setCurrentSectionIndex(secIndex !== -1 ? secIndex : 0);
        
        // Rebuild questions map from populated sub.sections
        const restoredQuestions = {};
        sub.sections.forEach(s => {
          restoredQuestions[s.name] = s.questions.map(q => q.questionId);
        });
        setQuestions(restoredQuestions);
        
        // Restore answers
        const savedAnswers = {};
        sub.sections.forEach(s => {
          if (s.answers) {
            Object.assign(savedAnswers, s.answers);
          }
        });
        setAnswers(savedAnswers);

        // Restore time left for current section
        const currentSecData = sub.sections.find(s => s.name === sub.currentSection);
        setTimeLeft(currentSecData?.timeRemaining || EXAM_SECTIONS[secIndex].duration);
        setTotalTimeSpent(sub.timeTaken || 0);

        startTimer();
        startAutoSave();
        setLoading(false);
      } else {
        // Start fresh
        initExam();
      }
    } catch (err) {
      console.error(err);
      initExam();
    }
  };

  const initExam = async () => {
    try {
      const sRes = await examService.startExam();
      const sub = sRes.data;
      setSubmissionId(sub._id);
      
      // Reconstruct questions map from the backend response
      const restoredQuestions = {};
      sub.sections.forEach(s => {
        restoredQuestions[s.name] = s.questions.map(q => q.questionId);
      });
      setQuestions(restoredQuestions);
      
      setTimeLeft(EXAM_SECTIONS[0].duration);
      setTotalTimeSpent(0);
      startTimer();
      startAutoSave();
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to initialize exam. Please refresh.');
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
    }, 30000); // Sync every 30s
  };

  const syncProgress = async (nextSectionId = null) => {
    if (!submissionId) return;
    try {
      // Filter answers to only current section for the payload if needed, 
      // but backend handles Map.
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
    
    // Sync final data for current section and trigger next
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

  const toggleMarkReview = (qId) => {
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const currentQ = questions[currentSection.id][currentIndex];
      const stdin = currentQ.test_cases?.[0]?.input || '';
      const res = await examService.runCode({ 
        source_code: code, 
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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-slate-400 animate-pulse font-mono tracking-widest text-xs uppercase">Initializing Secure Environment...</p>
    </div>
  );

  const currentQuestion = questions[currentSection.id]?.[currentIndex];
  const isCoding = currentSection.id === 'coding';

  if (!currentQuestion) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center">
      <AlertTriangle size={64} className="text-orange-500 mb-6 animate-bounce" />
      <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Section Data Missing</h1>
      <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">We couldn't load the questions for {currentSection.name}. This can happen if the database seeding was incomplete or the connection timed out.</p>
      <div className="flex gap-4">
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all">Retry Loading</button>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="bg-[#1e293b] text-white p-4 flex justify-between items-center h-16 shadow-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">T</div>
            <span className="font-bold tracking-tight">NQT SIMULATOR 2026</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-widest">Section</span>
            <div className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/30">
              {currentSection.name.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className={`flex items-center gap-3 px-6 py-2 rounded-xl font-mono text-2xl shadow-inner transition-all ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-slate-800 text-green-400 border border-slate-700'}`}>
            <Clock size={24} className={timeLeft < 300 ? 'animate-bounce' : ''} />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Section Info Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 flex justify-between items-center h-12">
             <div className="flex items-center gap-4">
                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
                  Question {currentIndex + 1} / {questions[currentSection.id].length}
                </span>
                <div className="h-1 w-32 bg-slate-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-500 transition-all duration-500" 
                     style={{ width: `${((currentIndex + 1) / questions[currentSection.id].length) * 100}%` }}
                   ></div>
                </div>
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">
                  {currentSection.type} Phase
                </h3>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Secure Link Active</span>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                {currentQuestion.is_previous_nqt_question && (
                  <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-widest border border-green-100 self-start animate-pulse w-fit">
                    <Award size={14} />
                    TCS NQT PREVIOUSLY ASKED
                  </div>
                )}
                <h2 className="text-[28px] font-black text-slate-800 leading-tight whitespace-pre-wrap">
                  {currentQuestion.question_text.replace('[TCS NQT PREVIOUSLY ASKED] ', '')}
                </h2>
              </div>

              {!isCoding ? (
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAnswerChange(currentQuestion._id, opt)}
                      className={`flex items-center p-6 border-2 rounded-2xl text-left transition-all duration-150 group ${answers[currentQuestion._id] === opt ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl border-2 mr-6 flex items-center justify-center font-black transition-all ${answers[currentQuestion._id] === opt ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-400 group-hover:border-slate-400'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-xl font-semibold ${answers[currentQuestion._id] === opt ? 'text-blue-900' : 'text-slate-700'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-[600px] border shadow-2xl rounded-2xl overflow-hidden">
                  <div className="bg-[#0f172a] p-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Lang</span>
                        <select 
                          value={languageId}
                          onChange={(e) => setLanguageId(e.target.value)}
                          className="bg-transparent text-white text-sm font-bold focus:outline-none"
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
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-black transition-all disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-indigo-900/40"
                    >
                      {isRunning ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <Play size={16} fill="currentColor" />}
                      Execution
                    </button>
                  </div>
                  <div className="flex-1 bg-[#1e1e1e]">
                    <Editor
                      height="100%"
                      language={languageId === '71' ? 'python' : languageId === '54' ? 'cpp' : 'java'}
                      value={code || currentQuestion.code_templates?.[languageId === '71' ? 'python' : languageId === '54' ? 'cpp' : 'java'] || ''}
                      theme="vs-dark"
                      onChange={(val) => setCode(val)}
                      options={{
                        fontSize: 18,
                        fontFamily: 'JetBrains Mono, Menlo, monospace',
                        lineHeight: 1.6,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 24, bottom: 24 }
                      }}
                    />
                  </div>
                  <div className="h-48 bg-[#020617] p-6 font-mono text-sm border-t border-slate-800 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between text-slate-500 mb-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1 h-3 bg-blue-500"></div> Output Terminal
                       </span>
                    </div>
                    <pre className="flex-1 overflow-y-auto text-emerald-400 text-base leading-relaxed">{codeOutput || 'System ready. Waiting for execution command...'}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <footer className="bg-slate-50 border-t border-slate-200 p-8 flex justify-between items-center h-24">
            <div className="flex gap-4">
              <button 
                onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-3 px-8 py-3 border-2 border-slate-200 rounded-2xl font-black text-xs text-slate-500 hover:bg-white hover:border-slate-400 transition-all disabled:opacity-10 uppercase tracking-widest"
              >
                <ChevronLeft size={20} /> Prev Question
              </button>
              <button 
                onClick={() => toggleMarkReview(currentQuestion._id)}
                className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs transition-all uppercase tracking-widest ${markedForReview[currentQuestion._id] ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-lg shadow-amber-100' : 'border-2 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
              >
                <Flag size={20} fill={markedForReview[currentQuestion._id] ? 'currentColor' : 'none'} /> Review
              </button>
            </div>

            <div className="flex gap-6 items-center">
               <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Action</div>
                  <div className="text-sm font-bold text-slate-700 italic">
                    {currentIndex < questions[currentSection.id].length - 1 ? 'Go to Next Question' : 'Section Completion'}
                  </div>
               </div>
               
               {currentIndex < questions[currentSection.id].length - 1 ? (
                 <button 
                   onClick={() => setCurrentIndex(currentIndex + 1)}
                   className="flex items-center gap-4 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all uppercase tracking-widest text-sm"
                 >
                   Following <ChevronRight size={20} />
                 </button>
               ) : (
                 currentSectionIndex < EXAM_SECTIONS.length - 1 ? (
                  <button 
                    onClick={() => setShowSectionModal(true)}
                    className="flex items-center gap-4 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all uppercase tracking-widest text-sm"
                  >
                    Finish Section <ChevronRight size={20} />
                  </button>
                 ) : (
                  <button 
                    onClick={finalizeExam}
                    disabled={submitting}
                    className="flex items-center gap-4 px-12 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-2xl shadow-red-200 transition-all uppercase tracking-widest text-sm"
                  >
                    {submitting ? 'PROCESSING...' : <><Send size={20} /> Terminate Exam</>}
                  </button>
                 )
               )}
            </div>
          </footer>
        </div>

        {/* Question Palette Drawer */}
        <aside className="w-[400px] bg-slate-50 border-l border-slate-200 flex flex-col shadow-2xl relative z-10">
          <div className="p-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center">Security Palette Control</h3>
            
            <div className="grid grid-cols-5 gap-4">
              {questions[currentSection.id].map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center text-xs font-black transition-all duration-300 relative
                    ${currentIndex === i ? 'ring-4 ring-indigo-500 ring-offset-4 scale-110 z-10 rotate-3 shadow-2xl' : ''}
                    ${markedForReview[q._id] ? 'bg-amber-500 text-white' : 
                      answers[q._id] ? 'bg-emerald-500 text-white outline outline-2 outline-emerald-100 outline-offset-4' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300'}
                  `}
                >
                  <span className="text-sm">{i + 1}</span>
                  {markedForReview[q._id] && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div></div>}
                </button>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Metrics</span>
                    <span className="text-xs font-bold text-indigo-600">{(Object.keys(answers).length / questions[currentSection.id].length * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-200"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Solved</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-amber-500 rounded-lg shadow-lg shadow-amber-200"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Review</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-auto p-10">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative shadow-2xl border border-white/10">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Logical Sequence</p>
                <h4 className="text-2xl font-black mb-1 leading-tight tracking-tight">
                  {currentSectionIndex < EXAM_SECTIONS.length - 1 ? EXAM_SECTIONS[currentSectionIndex+1].name : 'Final Step'}
                </h4>
                <p className="text-xs text-indigo-400 font-bold mb-6 italic">Immutable Section Lock Active</p>
                <div className="flex items-center gap-3 text-[10px] font-black bg-white/5 w-fit px-5 py-2 rounded-2xl border border-white/10 uppercase tracking-widest">
                  <Clock size={14} className="text-blue-500" /> {currentSectionIndex < EXAM_SECTIONS.length - 1 ? (EXAM_SECTIONS[currentSectionIndex+1].duration / 60) + 'm Secure Limit' : 'Global Finalization'}
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 text-white/5 rotate-12">
                 <AlertTriangle size={240} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Section Jump Blocking Modal (Anti-Cheat) */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-16 max-w-2xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-10 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <CheckCircle size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-5xl font-black text-slate-900 text-center mb-6 tracking-tighter">Submit Section?</h2>
            <p className="text-slate-500 text-center mb-12 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Confirm your submission for <span className="text-slate-900 font-black italic">{currentSection.name}</span>. 
              The system will <span className="text-indigo-600 font-black">permanently lock</span> this data.
            </p>
            
            <div className="bg-slate-50 rounded-3xl p-8 mb-12 flex items-center justify-between border border-slate-100">
               <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Imminent Transition</span>
                  <div className="text-2xl font-black text-slate-800 tracking-tight">
                    {EXAM_SECTIONS[currentSectionIndex+1].name}
                  </div>
               </div>
               <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-indigo-600">{EXAM_SECTIONS[currentSectionIndex+1].duration / 60}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Minutes</div>
               </div>
            </div>

            <div className="flex gap-6">
              <button 
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-8 py-5 rounded-[1.5rem] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xs"
              >
                Declined
              </button>
              <button 
                onClick={goToNextSection}
                className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-3xl shadow-indigo-500/30 transition-all uppercase tracking-[0.2em] text-xs"
              >
                Authenticated
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
