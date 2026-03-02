const axios = require('axios');

// Habitica API base URL
const API_URL = 'https://habitica.com/api/v3';

// Create axios instance with auth headers
const habiticaApi = axios.create({
  baseURL: API_URL,
  headers: {
    'x-api-user': process.env.HABITICAUSERID || '',
    'x-api-key': process.env.HABITICAAPITOKEN || '',
    'Content-Type': 'application/json'
  }
});

// MCP models definition
const models = {
  // Task model
  Task: {
    description: "A Habitica task (todo, habit, daily, or reward)",
    fields: {
      id: { type: "string", description: "The task ID" },
      text: { type: "string", description: "The task title" },
      notes: { type: "string", description: "The task notes/description" },
      type: { type: "string", description: "The task type (todo, habit, daily, reward)" },
      completed: { type: "boolean", description: "Whether the task is completed" },
      priority: { type: "number", description: "The task priority/difficulty" }
    }
  },
  // User model
  User: {
    description: "A Habitica user profile",
    fields: {
      id: { type: "string", description: "The user ID" },
      username: { type: "string", description: "The user's username" },
      hp: { type: "number", description: "The user's health points" },
      mp: { type: "number", description: "The user's mana points" },
      exp: { type: "number", description: "The user's experience points" },
      gold: { type: "number", description: "The user's gold" },
      level: { type: "number", description: "The user's level" }
    }
  }
};

// MCP functions definition
const functions = {
  // Get tasks
  getTasks: {
    description: "Get the user's tasks",
    parameters: {
      type: { type: "string", description: "Task type filter (todos, dailys, habits, rewards)" }
    },
    returns: {
      type: "array",
      items: { $ref: "#/models/Task" },
      description: "List of tasks"
    },
    handler: async ({ type }) => {
      try {
        const response = await habiticaApi.get(`/tasks/user${type ? `?type=${type}` : ''}`);
        return response.data.data.map(task => ({
          id: task.id,
          text: task.text,
          notes: task.notes || '',
          type: task.type,
          completed: task.completed || false,
          priority: task.priority || 1
        }));
      } catch (error) {
        throw new Error(`Failed to get tasks: ${error.message}`);
      }
    }
  },
  
  // Create task
  createTask: {
    description: "Create a new task",
    parameters: {
      text: { type: "string", description: "Task title" },
      type: { type: "string", description: "Task type (todo, habit, daily, reward)" },
      notes: { type: "string", description: "Task notes/description" },
      priority: { type: "number", description: "Task priority/difficulty" }
    },
    returns: { $ref: "#/models/Task", description: "The created task" },
    handler: async ({ text, type, notes, priority }) => {
      try {
        const taskData = {
          text,
          type: type || 'todo',
          notes: notes || '',
          priority: priority || 1
        };
        
        const response = await habiticaApi.post('/tasks/user', taskData);
        const task = response.data.data;
        
        return {
          id: task.id,
          text: task.text,
          notes: task.notes || '',
          type: task.type,
          completed: task.completed || false,
          priority: task.priority || 1
        };
      } catch (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }
    }
  },
  
  // Complete task
  completeTask: {
    description: "Complete a task",
    parameters: {
      taskId: { type: "string", description: "The task ID" }
    },
    returns: { $ref: "#/models/Task", description: "The updated task" },
    handler: async ({ taskId }) => {
      try {
        const response = await habiticaApi.post(`/tasks/${taskId}/score/up`);
        const task = response.data.data;
        
        return {
          id: task.id,
          text: task.text,
          notes: task.notes || '',
          type: task.type,
          completed: true,
          priority: task.priority || 1
        };
      } catch (error) {
        throw new Error(`Failed to complete task: ${error.message}`);
      }
    }
  },
  
  // Uncomplete task
  uncompleteTask: {
    description: "Uncomplete a task",
    parameters: {
      taskId: { type: "string", description: "The task ID" }
    },
    returns: { $ref: "#/models/Task", description: "The updated task" },
    handler: async ({ taskId }) => {
      try {
        const response = await habiticaApi.post(`/tasks/${taskId}/score/down`);
        const task = response.data.data;
        
        return {
          id: task.id,
          text: task.text,
          notes: task.notes || '',
          type: task.type,
          completed: false,
          priority: task.priority || 1
        };
      } catch (error) {
        throw new Error(`Failed to uncomplete task: ${error.message}`);
      }
    }
  },
  
  // Delete task
  deleteTask: {
    description: "Delete a task",
    parameters: {
      taskId: { type: "string", description: "The task ID" }
    },
    returns: { type: "boolean", description: "Whether the deletion was successful" },
    handler: async ({ taskId }) => {
      try {
        await habiticaApi.delete(`/tasks/${taskId}`);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete task: ${error.message}`);
      }
    }
  },
  
  // Get user profile
  getUserProfile: {
    description: "Get the user's profile",
    parameters: {},
    returns: { $ref: "#/models/User", description: "The user's profile" },
    handler: async () => {
      try {
        const response = await habiticaApi.get('/user');
        const user = response.data.data;
        
        return {
          id: user.id,
          username: user.auth?.local?.username || 'User',
          hp: user.stats.hp,
          mp: user.stats.mp,
          exp: user.stats.exp,
          gold: user.stats.gp,
          level: user.stats.lvl
        };
      } catch (error) {
        throw new Error(`Failed to get user profile: ${error.message}`);
      }
    }
  }
};

// Export MCP server function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Health check
  if (req.url === '/' || req.url === '/health') {
    return res.status(200).send('Habitica MCP Server is running');
  }
  
  // MCP Schema endpoint
  if (req.url === '/schema' || req.url === '/schema/') {
    return res.status(200).json({
      type: 'mcp',
      version: '1',
      models,
      functions
    });
  }
  
  // MCP Function endpoint
  if (req.url.startsWith('/function/')) {
    try {
      // Parse function name from URL
      const functionName = req.url.split('/function/')[1].split('/')[0];
      
      // Check if function exists
      if (!functions[functionName] || !functions[functionName].handler) {
        return res.status(404).json({ error: `Function '${functionName}' not found` });
      }
      
      // Parse request body
      let params = {};
      if (req.method === 'POST' && req.body) {
        params = req.body;
      }
      
      // Call function handler
      const result = await functions[functionName].handler(params);
      
      // Return result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error calling function:', error);
      return res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  }
  
  // Not found
  return res.status(404).json({ error: 'Not found' });
};
