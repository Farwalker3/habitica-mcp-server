// This file explains how to use the API from external tools like Poke

/*
API Usage:

Endpoint: https://your-vercel-url.vercel.app

Method: POST
Content-Type: application/json

Request Format:
{
  "action": "actionName",  // One of: getTasks, createTask, updateTask, deleteTask, scoreTask, getUserProfile
  "data": {
    // Parameters for the action
  }
}

Example Requests:

1. Get Tasks:
{
  "action": "getTasks",
  "data": {
    "type": "todos"  // Optional: todos, dailys, habits, rewards
  }
}

2. Create Task:
{
  "action": "createTask",
  "data": {
    "text": "Task name",
    "type": "todo",
    "notes": "Description",
    "priority": 1
  }
}

3. Score Task (complete/check off):
{
  "action": "scoreTask",
  "data": {
    "taskId": "task-id-here",
    "direction": "up"  // "up" to complete, "down" to un-complete
  }
}

4. Get User Profile:
{
  "action": "getUserProfile"
}
*/