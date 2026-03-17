import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Plus, Database, Trash2, Edit } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500">Manage questions and system content</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={20} /> Add New Question
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-800 font-medium truncate max-w-xs">{q.question_text}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase">{q.section}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      q.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                      q.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button className="text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                      <button className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                <textarea 
                  required
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Section</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Options</label>
                {newQuestion.options.map((opt, i) => (
                  <input 
                    key={i}
                    required
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Correct Answer</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the correct option here"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100"
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
