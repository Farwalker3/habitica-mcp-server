# Habitica MCP Server

A Model Context Protocol (MCP) server for Habitica integration, deployable on Vercel.

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

3. **Run the server**:
   ```bash
   npm start
   ```

4. **Test the deployment**:
   ```bash
   curl http://localhost:3000
   ```

## Usage

Once deployed, the server will be accessible at your Vercel deployment URL. The MCP server will connect to Habitica using your provided credentials.

## Support

For issues or questions, please open an issue in the GitHub repository.
