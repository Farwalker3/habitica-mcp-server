import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createHabiticaMCPServer } from 'habitica-mcp-server';

// Load environment variables
const HABITICA_USER_ID = process.env.HABITICA_USER_ID;
const HABITICA_API_TOKEN = process.env.HABITICA_API_TOKEN;

// Validate required environment variables
if (!HABITICA_USER_ID || !HABITICA_API_TOKEN) {
  console.error('Error: HABITICA_USER_ID and HABITICA_API_TOKEN environment variables are required');
  process.exit(1);
}

// Initialize the MCP server
async function main() {
  try {
    console.log('Starting Habitica MCP Server...');

    // Create the Habitica MCP server instance
    const server = createHabiticaMCPServer({
      userId: HABITICA_USER_ID,
      apiToken: HABITICA_API_TOKEN,
    });

    // Set up stdio transport for MCP communication
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('Habitica MCP Server is running');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down Habitica MCP Server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down Habitica MCP Server...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start Habitica MCP Server:', error);
    process.exit(1);
  }
}

main();
