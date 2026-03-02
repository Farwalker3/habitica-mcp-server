const { HabiticaApi } = require('habitica-api-client');

// Initialize Habitica client
const api = new HabiticaApi({
  userId: process.env.HABITICAUSERID || '',
  apiToken: process.env.HABITICAAPITOKEN || ''
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
        result = await api.getTasks(data?.type);
        break;
      case 'createTask':
        result = await api.createTask(data);
        break;
      case 'updateTask':
        result = await api.updateTask(data?.taskId, data?.task);
        break;
      case 'deleteTask':
        result = await api.deleteTask(data?.taskId);
        break;
      case 'scoreTask':
        result = await api.scoreTask(data?.taskId, data?.direction);
        break;
      case 'getUserProfile':
        result = await api.getUser();
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