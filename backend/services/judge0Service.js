const axios = require('axios');

const judge0Api = axios.create({
  baseURL: process.env.JUDGE0_API_URL,
  headers: {
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
    'Content-Type': 'application/json'
  }
});

const executeCode = async (source_code, language_id, stdin) => {
  try {
    const response = await judge0Api.post('/submissions?base64_encoded=false&wait=true', {
      source_code,
      language_id,
      stdin
    });
    return response.data;
  } catch (error) {
    console.error('Judge0 Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { executeCode };
