const { startServer } = require('habitica-mcp-server');
const http = require('http');

// Handle HTTP requests
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Habitica MCP Server Running');
}).listen(process.env.PORT || 3000);

// Start MCP server
startServer({
  userId: process.env.HABITICAUSERID,
  apiToken: process.env.HABITICAAPITOKEN
});

console.log('Server started');
