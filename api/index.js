const axios = require('axios');

// Habitica API base URL
const API_URL = 'https://habitica.com/api/v3';

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'x-api-user': process.env.HABITICAUSERID || '',
    'x-api-key': process.env.HABITICAAPITOKEN || '',
    'Content-Type': 'application/json'
  }
});

// Export serverless function
module.exports = async (req, res) => {
  try {
    // Basic health check
    if (req.url === '/' || req.url === '/health') {
      return res.status(200).send('Habitica API is connected and ready');
    }
    
    // Parse request
    const { action, data } = req.body || {};
    
    if (!action) {
      return res.status(400).send({ error: 'Missing action parameter' });
    }
    
    // Handle different actions
    let result;
    switch (action) {
      case 'getTasks':
        const response = await api.get(`/tasks/user${data?.type ? `?type=${data.type}` : ''}`);
        result = response.data;
        break;
      case 'createTask':
        const createResponse = await api.post('/tasks/user', data);
        result = createResponse.data;
        break;
      case 'updateTask':
        const updateResponse = await api.put(`/tasks/${data?.taskId}`, data?.task);
        result = updateResponse.data;
        break;
      case 'deleteTask':
        const deleteResponse = await api.delete(`/tasks/${data?.taskId}`);
        result = deleteResponse.data;
        break;
      case 'scoreTask':
        const scoreResponse = await api.post(`/tasks/${data?.taskId}/score/${data?.direction || 'up'}`);
        result = scoreResponse.data;
        break;
      case 'getUserProfile':
        const userResponse = await api.get('/user');
        result = userResponse.data;
        break;
      default:
        return res.status(400).send({ error: `Unsupported action: ${action}` });
    }
    
    return res.status(200).send(result);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
};