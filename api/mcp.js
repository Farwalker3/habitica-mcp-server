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

// Define models
const models = {
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

// Define functions
const functionHandlers = {
  getTasks: async ({ type }) => {
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
  },
  createTask: async ({ text, type, notes, priority }) => {
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
  },
  completeTask: async ({ taskId }) => {
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
  },
  uncompleteTask: async ({ taskId }) => {
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
  },
  deleteTask: async ({ taskId }) => {
    try {
      await habiticaApi.delete(`/tasks/${taskId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  },
  getUserProfile: async () => {
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
};

// Define the schema
const schema = {
  type: 'mcp',
  version: '1',
  models,
  functions: {
    getTasks: {
      description: "Get the user's tasks",
      parameters: {
        type: { type: "string", description: "Task type filter (todos, dailys, habits, rewards)" }
      },
      returns: {
        type: "array",
        items: { $ref: "#/models/Task" },
        description: "List of tasks"
      }
    },
    createTask: {
      description: "Create a new task",
      parameters: {
        text: { type: "string", description: "Task title" },
        type: { type: "string", description: "Task type (todo, habit, daily, reward)" },
        notes: { type: "string", description: "Task notes/description" },
        priority: { type: "number", description: "Task priority/difficulty" }
      },
      returns: { $ref: "#/models/Task", description: "The created task" }
    },
    completeTask: {
      description: "Complete a task",
      parameters: {
        taskId: { type: "string", description: "The task ID" }
      },
      returns: { $ref: "#/models/Task", description: "The updated task" }
    },
    uncompleteTask: {
      description: "Uncomplete a task",
      parameters: {
        taskId: { type: "string", description: "The task ID" }
      },
      returns: { $ref: "#/models/Task", description: "The updated task" }
    },
    deleteTask: {
      description: "Delete a task",
      parameters: {
        taskId: { type: "string", description: "The task ID" }
      },
      returns: { type: "boolean", description: "Whether the deletion was successful" }
    },
    getUserProfile: {
      description: "Get the user's profile",
      parameters: {},
      returns: { $ref: "#/models/User", description: "The user's profile" }
    }
  }
};

// Handle JSON-RPC requests
async function handleJsonRpc(req, res) {
  const jsonRpc = req.body;

  // Validate JSON-RPC request
  if (!jsonRpc || !jsonRpc.jsonrpc || jsonRpc.jsonrpc !== '2.0' || !jsonRpc.method) {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: jsonRpc?.id || null
    });
  }

  // Process JSON-RPC request
  try {
    // Handle method calls
    if (jsonRpc.method === 'tools/list') {
      // List all available functions
      return res.status(200).json({
        jsonrpc: '2.0',
        result: Object.keys(schema.functions).map(name => ({
          name,
          description: schema.functions[name].description,
          parameters: schema.functions[name].parameters,
          returns: schema.functions[name].returns
        })),
        id: jsonRpc.id
      });
    } else if (jsonRpc.method === 'tools/call') {
      // Call a specific function
      const { name, parameters } = jsonRpc.params;
      
      // Check if function exists
      if (!functionHandlers[name]) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Function '${name}' not found` },
          id: jsonRpc.id
        });
      }
      
      // Call function handler
      const result = await functionHandlers[name](parameters || {});
      
      return res.status(200).json({
        jsonrpc: '2.0',
        result,
        id: jsonRpc.id
      });
    } else if (jsonRpc.method === 'schema') {
      // Return schema
      return res.status(200).json({
        jsonrpc: '2.0',
        result: schema,
        id: jsonRpc.id
      });
    } else if (jsonRpc.method === 'initialize') {
      // Initialize session
      return res.status(200).json({
        jsonrpc: '2.0',
        result: {
          status: 'initialized',
          schema_url: `${getBaseUrl(req)}/schema`
        },
        id: jsonRpc.id
      });
    } else {
      // Method not found
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method '${jsonRpc.method}' not found` },
        id: jsonRpc.id
      });
    }
  } catch (error) {
    console.error('Error processing JSON-RPC request:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: error.message || 'Internal error' },
      id: jsonRpc.id
    });
  }
}

// Helper to get base URL
function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

// Main handler
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
  if (req.url === '/' || req.url === '/mcp' || req.url.startsWith('/mcp?')) {
    if (req.method === 'GET') {
      // Server-sent events setup for MCP
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Send initial event to establish connection
      res.write(`data: ${JSON.stringify({ type: 'connection_established' })}\n\n`);
      
      // Keep connection open
      const interval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
      }, 30000);
      
      // Handle connection close
      res.on('close', () => {
        clearInterval(interval);
        res.end();
      });
      
      return; // Keep connection open
    } else if (req.method === 'POST') {
      // Handle JSON-RPC requests
      return await handleJsonRpc(req, res);
    }
  }
  
  // Schema endpoint
  if (req.url === '/schema' || req.url === '/schema/') {
    return res.status(200).json(schema);
  }
  
  // Not found
  return res.status(404).json({ error: 'Not found' });
};
