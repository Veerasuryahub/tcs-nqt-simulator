import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Plus, Database, Trash2, Edit, X } from 'lucide-react';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    section: 'numerical',
    difficulty: 'medium',
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await adminService.getQuestions();
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await adminService.addQuestion(newQuestion);
      setShowAddModal(false);
      fetchQuestions();
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        section: 'numerical',
        difficulty: 'medium',
        explanation: ''
      });
    } catch (err) {
      alert('Failed to add question');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 text-sm sm:text-base">Manage questions and system content</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> Add New Question
          </button>
        </div>

        {/* Mobile card view for questions */}
        <div className="block sm:hidden space-y-3">
          {questions.map((q) => (
            <div key={q._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-800 font-medium mb-3 line-clamp-2">{q.question_text}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">{q.section}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    q.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                    q.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Question</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm text-slate-800 font-medium truncate max-w-xs">{q.question_text}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase">{q.section}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        q.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                        q.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex gap-3">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                        <button className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Database size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No questions yet. Add your first question above.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[100]">
          <div className="bg-white rounded-t-2xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Add New Question</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddQuestion} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">Question Text</label>
                <textarea 
                  required
                  className="w-full p-3 sm:p-4 bg-slate-50 border rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                  rows="3"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">Section</label>
                  <select 
                    className="w-full p-3 sm:p-4 bg-slate-50 border rounded-xl sm:rounded-2xl outline-none text-sm sm:text-base"
                    value={newQuestion.section}
                    onChange={(e) => setNewQuestion({...newQuestion, section: e.target.value})}
                  >
                    <option value="numerical">Numerical Ability</option>
                    <option value="reasoning">Reasoning Ability</option>
                    <option value="verbal">Verbal Ability</option>
                    <option value="programming_logic">Programming Logic</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">Difficulty</label>
                  <select 
                    className="w-full p-3 sm:p-4 bg-slate-50 border rounded-xl sm:rounded-2xl outline-none text-sm sm:text-base"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <label className="block text-sm font-bold text-slate-700">Options</label>
                {newQuestion.options.map((opt, i) => (
                  <input 
                    key={i}
                    required
                    className="w-full p-3 sm:p-4 bg-slate-50 border rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...newQuestion.options];
                      newOpts[i] = e.target.value;
                      setNewQuestion({...newQuestion, options: newOpts});
                    }}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">Correct Answer</label>
                <input 
                  required
                  className="w-full p-3 sm:p-4 bg-slate-50 border rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Paste the correct option here"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                />
              </div>

              <div className="flex gap-3 sm:gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 sm:py-4 bg-slate-100 text-slate-700 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 text-sm sm:text-base"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
