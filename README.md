# Habitica MCP Server

A Model Context Protocol (MCP) server for Habitica integration, deployable on Vercel.

## Project Structure

```
habitica-mcp-server/
├── api/
│   └── index.js          # Vercel serverless function
├── api.js                # Habitica API client wrapper
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Deployment Instructions

### Deploy to Vercel

1. **Fork or clone this repository**

2. **Install Vercel CLI** (optional for local testing):
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New" → "Project"
   - Import the `habitica-mcp-server` repository
   - Configure environment variables (see below)
   - Click "Deploy"

### Environment Variables

You must configure the following environment variables in your Vercel project settings:

- `HABITICAUSERID`: Your Habitica User ID
- `HABITICAAPITOKEN`: Your Habitica API Token

To find these credentials:
1. Log in to [Habitica](https://habitica.com)
2. Go to Settings → API
3. Copy your User ID and API Token

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export HABITICAUSERID=your-user-id
   export HABITICAAPITOKEN=your-api-token
   ```

3. **Run the server locally with Vercel CLI**:
   ```bash
   vercel dev
   ```

4. **Test the deployment**:
   ```bash
   curl http://localhost:3000
   ```

## Usage

Once deployed, the server will be accessible at your Vercel deployment URL. The MCP server will connect to Habitica using your provided credentials.

## API Integration with Poke and Other Tools

This server exposes a REST API that can be integrated with tools like Poke, Shortcuts, or any HTTP client.

### Endpoint

Your Vercel deployment URL: `https://your-project-name.vercel.app`

### API Actions

The API accepts POST requests with JSON payloads in the following format:

```json
{
  "action": "actionName",
  "data": {
    // Action-specific parameters
  }
}
```

### Available Actions

#### 1. Get Tasks
Retrieve your Habitica tasks.

```json
{
  "action": "getTasks",
  "data": {
    "type": "todos"  // Optional: todos, dailys, habits, rewards
  }
}
```

#### 2. Create Task
Create a new task in Habitica.

```json
{
  "action": "createTask",
  "data": {
    "text": "Task name",
    "type": "todo",
    "notes": "Description",
    "priority": 1
  }
}
```

#### 3. Score Task
Complete or uncomplete a task.

```json
{
  "action": "scoreTask",
  "data": {
    "taskId": "your-task-id",
    "direction": "up"  // "up" to complete, "down" to uncomplete
  }
}
```

#### 4. Update Task
Update an existing task.

```json
{
  "action": "updateTask",
  "data": {
    "taskId": "your-task-id",
    "task": {
      "text": "Updated task name",
      "notes": "Updated description"
    }
  }
}
```

#### 5. Delete Task
Delete a task.

```json
{
  "action": "deleteTask",
  "data": {
    "taskId": "your-task-id"
  }
}
```

#### 6. Get User Profile
Retrieve your Habitica user profile.

```json
{
  "action": "getUserProfile"
}
```

### Using with Poke

To integrate with Poke:

1. **Open Poke** and create a new action
2. **Set the URL** to your Vercel deployment URL
3. **Set Method** to POST
4. **Add Header**: `Content-Type: application/json`
5. **Add Body** with the JSON payload for your desired action
6. **Test** the action to verify it works
7. **Save** and use in your workflows

### Example: Creating a Task from Poke

```
URL: https://your-project-name.vercel.app
Method: POST
Headers: Content-Type: application/json
Body:
{
  "action": "createTask",
  "data": {
    "text": "New task from Poke",
    "type": "todo",
    "notes": "Created via API",
    "priority": 1
  }
}
```

### Example: Completing a Task from Poke

```
URL: https://your-project-name.vercel.app
Method: POST
Headers: Content-Type: application/json
Body:
{
  "action": "scoreTask",
  "data": {
    "taskId": "abc123",
    "direction": "up"
  }
}
```

### Health Check

You can verify the server is running by visiting the root URL or `/health` endpoint:

```bash
curl https://your-project-name.vercel.app/health
```

This will return: `Habitica API is connected and ready`

## Support

For issues or questions, please open an issue in the GitHub repository.

For more details on API usage, see the `api.js` file in this repository.