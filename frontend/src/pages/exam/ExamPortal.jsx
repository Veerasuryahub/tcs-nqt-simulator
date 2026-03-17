import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Editor from '@monaco-editor/react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Play, Send } from 'lucide-react';

const SECTIONS = ['numerical', 'reasoning', 'verbal', 'programming_logic', 'coding'];

const ExamPortal = () => {
  const [questions, setQuestions] = useState(null);
  const [currentSection, setCurrentSection] = useState('numerical');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 180 minutes
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [languageId, setLanguageId] = useState('71'); // Python (3.8.1)
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await examService.getRandomQuestions();
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load questions. Please try again.');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId, answer) => {
    setAnswers({ ...answers, [qId]: answer });
  };

  const toggleMarkReview = (qId) => {
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
  };

  const handleNext = () => {
    if (currentIndex < questions[currentSection].length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const nextSectionIndex = SECTIONS.indexOf(currentSection) + 1;
      if (nextSectionIndex < SECTIONS.length) {
        setCurrentSection(SECTIONS[nextSectionIndex]);
        setCurrentIndex(0);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      const prevSectionIndex = SECTIONS.indexOf(currentSection) - 1;
      if (prevSectionIndex >= 0) {
        setCurrentSection(SECTIONS[prevSectionIndex]);
        setCurrentIndex(questions[SECTIONS[prevSectionIndex]].length - 1);
      }
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const currentQ = questions[currentSection][currentIndex];
      const stdin = currentQ.test_cases[0]?.input || '';
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

  const handleSubmit = async () => {
    // Logic to calculate scores
    let finalSections = SECTIONS.map(s => {
      const sectionQs = questions[s];
      let correct = 0;
      let wrong = 0;
      sectionQs.forEach(q => {
        if (answers[q._id] === q.correct_answer) correct++;
        else if (answers[q._id]) wrong++;
      });
      return {
        name: s,
        score: correct * 2, // 2 points per correct answer
        totalQuestions: sectionQs.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        accuracy: (correct / sectionQs.length) * 100
      };
    });

    const totalScore = finalSections.reduce((acc, curr) => acc + curr.score, 0);
    const totalAccuracy = finalSections.reduce((acc, curr) => acc + curr.accuracy, 0) / SECTIONS.length;

    try {
      const res = await examService.submitExam({
        sections: finalSections,
        totalScore,
        totalAccuracy,
        timeTaken: 180 * 60 - timeLeft
      });
      navigate(`/results/${res.data._id}`);
    } catch (err) {
      alert('Failed to submit exam. Please try again.');
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const currentQuestion = questions[currentSection][currentIndex];
  const isCoding = currentSection === 'coding';

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-tcs-dark text-white p-4 flex justify-between items-center h-16 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg border-r border-slate-600 pr-4">TCS NQT MOCK TEST</div>
          <div className="flex gap-2">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setCurrentSection(s); setCurrentIndex(0); }}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentSection === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {s.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-1 rounded-full font-mono text-xl ${timeLeft < 600 ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>
          <div className="text-sm">
            <div className="font-semibold">{user?.name}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Question */}
        <div className={`flex-1 overflow-y-auto p-8 border-r border-slate-200 bg-white`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {questions[currentSection].length}
              </span>
              <span className="text-slate-400 text-xs">Difficulty: {currentQuestion.difficulty}</span>
            </div>

            <h2 className="text-xl font-medium text-slate-800 mb-8 whitespace-pre-wrap">
              {currentQuestion.question_text}
            </h2>

            {!isCoding ? (
              <div className="space-y-4">
                {currentQuestion.options.map((opt, i) => (
                  <label 
                    key={i}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 ${answers[currentQuestion._id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      className="hidden"
                      checked={answers[currentQuestion._id] === opt}
                      onChange={() => handleAnswerChange(currentQuestion._id, opt)}
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${answers[currentQuestion._id] === opt ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                      {answers[currentQuestion._id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-[500px]">
                <div className="flex gap-2 mb-2">
                  <select 
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                    className="p-1 text-sm border rounded bg-slate-50"
                  >
                    <option value="71">Python (3.8.1)</option>
                    <option value="54">C++ (GCC 9.2.0)</option>
                    <option value="62">Java (OpenJDK 13.0.1)</option>
                  </select>
                </div>
                <div className="flex-1 border rounded overflow-hidden">
                  <Editor
                    height="100%"
                    language={languageId === '71' ? 'python' : languageId === '54' ? 'cpp' : 'java'}
                    value={code || currentQuestion.code_templates?.[languageId === '71' ? 'python' : languageId === '54' ? 'cpp' : 'java'] || ''}
                    theme="vs-dark"
                    onChange={(val) => setCode(val)}
                  />
                </div>
                <div className="mt-4 p-4 bg-slate-900 rounded-lg text-green-400 font-mono text-sm h-32 overflow-y-auto">
                   <div className="text-slate-500 border-b border-slate-700 pb-1 mb-2">Output:</div>
                   <pre>{codeOutput}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Palette */}
        <div className="w-80 bg-slate-50 p-6 flex flex-col border-l border-slate-200">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions[currentSection].map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-all
                    ${currentIndex === i ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    ${markedForReview[q._id] ? 'bg-purple-500 text-white' : 
                      answers[q._id] ? 'bg-green-500 text-white' : 'bg-white border text-slate-400'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-3">
             <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-xs mb-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Answered</div>
                <div className="flex items-center gap-2 text-xs mb-2"><div className="w-3 h-3 bg-purple-500 rounded"></div> For Review</div>
                <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-white border rounded"></div> Not Answered</div>
             </div>

             <button 
               onClick={() => toggleMarkReview(currentQuestion._id)}
               className="w-full flex items-center justify-center gap-2 p-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
             >
               <Flag size={18} /> {markedForReview[currentQuestion._id] ? 'Unmark Review' : 'Mark for Review'}
             </button>

             {isCoding && (
               <button 
                 onClick={handleRunCode}
                 disabled={isRunning}
                 className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
               >
                 {isRunning ? 'Running...' : <><Play size={18} /> Run Code</>}
               </button>
             )}

             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={handlePrev}
                 className="flex items-center justify-center gap-1 p-3 border rounded-lg hover:bg-white transition-colors"
               >
                 <ChevronLeft size={18} /> Prev
               </button>
               <button 
                 onClick={handleNext}
                 className="flex items-center justify-center gap-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Next <ChevronRight size={18} />
               </button>
             </div>

             <button 
               onClick={handleSubmit}
               className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100 mt-4"
             >
               <Send size={18} /> SUBMIT EXAM
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;
