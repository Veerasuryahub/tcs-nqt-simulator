import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tcs-nqt-backend.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const examService = {
  getRandomQuestions: () => api.get('/questions/random'),
  getActiveSubmission: () => api.get('/exam/active'),
  startExam: () => api.post('/exam/start'),
  saveProgress: (data) => api.post('/exam/save-progress', data),
  submitExam: (data) => api.post('/exam/submit', data),
  runCode: (codeData) => api.post('/exam/run-code', codeData),
  getHistory: () => api.get('/exam/history'),
  getLeaderboard: () => api.get('/exam/leaderboard'),
};

export const adminService = {
  addQuestion: (data) => api.post('/admin/questions', data),
  getQuestions: () => api.get('/admin/questions'),
};

export default api;
