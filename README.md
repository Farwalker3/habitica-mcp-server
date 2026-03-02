# Habitica MCP Server

This is a Model Context Protocol (MCP) server for Habitica. It allows integration with Poke and other MCP-compatible assistants.

## MCP Protocol

The MCP protocol requires the following endpoints:

- `/schema` - Returns the schema definition of models and functions
- `/function/{functionName}` - Executes a function defined in the schema

## Available Functions

- `getTasks` - Get user tasks (todos, dailies, habits, rewards)
- `createTask` - Create a new task
- `completeTask` - Mark a task as complete
- `uncompleteTask` - Mark a task as incomplete
- `deleteTask` - Delete a task
- `getUserProfile` - Get the user's Habitica profile

## Setup

1. Deploy to Vercel
2. Set environment variables:
   - HABITICAUSERID - Your Habitica user ID
   - HABITICAAPITOKEN - Your Habitica API token

## Integration with Poke

In Poke, go to:
1. Settings > Connections > Integrations > New Integration
2. Name: habitica
3. Server URL: https://[your-vercel-app-url]
4. API Key: Leave blank (we use environment variables)
5. Connect
