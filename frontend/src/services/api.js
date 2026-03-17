import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
