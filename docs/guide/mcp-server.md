# MCP Server

The HTTP/SSE server provides remote access to TONL conversion through the Model Context Protocol.

## Starting the Server

```bash
npm install -g tonl-mcp-bridge
export TONL_AUTH_TOKEN=your-secure-token
npx tonl-mcp-server
```

The server listens on port 3000 by default.

## Authentication

Bearer token authentication is required when `TONL_AUTH_TOKEN` is set:

```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

Without authentication configured, the server runs in development mode.

## Available Tools

The server exposes three MCP tools:

### convert_to_tonl

Converts JSON data to TONL format.

**Parameters:**
- `data` (array|object) - Data to convert
- `name` (string) - Collection name (default: "data")
- `options` (object, optional):
  - `optimize` (boolean) - Enable type optimization
  - `flattenNested` (boolean) - Flatten nested objects
  - `includeStats` (boolean) - Include token statistics
  - `anonymize` (string[]) - Fields to redact

**Example:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "convert_to_tonl",
    "arguments": {
      "data": [{"id": 1, "name": "Alice"}],
      "name": "users",
      "options": {
        "includeStats": true
      }
    }
  }
}
```

### parse_tonl

Converts TONL format back to JSON.

**Parameters:**
- `tonl` (string) - TONL formatted string
- `validateSchema` (boolean) - Enable schema validation

### calculate_savings

Computes token savings between JSON and TONL.

**Parameters:**
- `jsonData` (string) - JSON formatted data
- `tonlData` (string) - TONL formatted data
- `model` (string) - Model for tokenization (default: "gpt-5")

Supported models: gpt-5, gpt-4o, claude-sonnet-4.5, gemini-2.5-pro

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `TONL_AUTH_TOKEN` - Authentication token
- `NODE_ENV` - Environment mode

### Graceful Shutdown

The server handles SIGTERM and SIGINT signals, closing active connections before exit.

## Deployment

### Docker

```bash
docker run -d \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  -e NODE_ENV=production \
  tonl-mcp-bridge:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  tonl-server:
    image: tonl-mcp-bridge:latest
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
    restart: unless-stopped
```

## Programmatic Usage

Start the server from code:

```typescript
import { startHttpServer } from 'tonl-mcp-bridge/mcp';

const server = startHttpServer(3000);

// Shutdown
server.close(() => {
  console.log('Server stopped');
});
```

## Security Considerations

- Always set `TONL_AUTH_TOKEN` in production
- Use HTTPS in production environments
- Rotate tokens periodically
- Monitor failed authentication attempts
- Set appropriate payload size limits

## Monitoring

The server logs all requests and includes security status in startup messages.

Connection attempts without valid tokens return 401 (missing) or 403 (invalid).