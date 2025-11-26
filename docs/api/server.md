# MCP Server API

HTTP/SSE Model Context Protocol server for TONL conversions.

## Overview

The MCP Server provides a standardized interface for LLM clients (like Claude Desktop) to access TONL conversion tools via HTTP/SSE transport.

**New in v0.9.0:**
- HTTP/SSE transport (replaces stdio)
- Bearer token authentication
- Session management
- Graceful shutdown

## Starting the Server

### Command Line

```bash
# Set authentication token
export TONL_AUTH_TOKEN=your-secure-token

# Start server
npx tonl-mcp-server
```

Server starts on `http://localhost:3000`

### Programmatic

```typescript
import { startHttpServer } from 'tonl-mcp-bridge/mcp';

const server = startHttpServer(3000);

// Server is now running
// Use standard Node.js server methods
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TONL_AUTH_TOKEN` | Yes* | - | Bearer token for authentication |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | production | Environment mode |

*Required in production. Development mode allows unauthenticated access if not set.

### Server Options

```typescript
interface ServerConfig {
  port?: number;           // Server port (default: 3000)
}
```

## Authentication

### Bearer Token

All requests must include Bearer token in Authorization header:

```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

### Security Modes

**Production Mode (Token Set):**
```bash
export TONL_AUTH_TOKEN=secret
npx tonl-mcp-server
# Output: 🔒 Security: Enabled (Bearer Token required)
```

**Development Mode (No Token):**
```bash
npx tonl-mcp-server
# Output: ⚠️ Security: Disabled (No TONL_AUTH_TOKEN set)
```

⚠️ **Warning:** Only use development mode locally!

## Endpoints

### SSE Stream

**Endpoint:** `GET /mcp`

**Authentication:** Required (Bearer token)

**Response:** Server-Sent Events stream

**Example:**
```bash
curl -H "Authorization: Bearer token" \
  http://localhost:3000/mcp

# Response:
# event: endpoint
# data: /mcp?sessionId=<uuid>
```

### Health Check

**Endpoint:** `GET /`

**Authentication:** Not required

**Response:** HTML or status page

**Example:**
```bash
curl http://localhost:3000/
# Status: 200 OK
```

## Available Tools

The server exposes three MCP tools:

### 1. convert_to_tonl

Convert JSON/YAML data to TONL format.

**Parameters:**
```typescript
{
  data: Array<Record<string, unknown>>;  // Data to convert
  name: string;                           // Collection name
  model?: string;                         // LLM model for stats
}
```

**Returns:**
```typescript
{
  tonl: string;                    // TONL formatted output
  stats?: {                        // Token statistics (if model provided)
    originalTokens: number;
    compressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  }
}
```

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "convert_to_tonl",
    "arguments": {
      "data": [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
      ],
      "name": "users",
      "model": "gpt-4"
    }
  },
  "id": 1
}
```

### 2. parse_tonl

Parse TONL format back to JSON.

**Parameters:**
```typescript
{
  tonl: string;  // TONL formatted string
}
```

**Returns:**
```typescript
{
  data: Array<Record<string, unknown>>;  // Parsed JSON data
}
```

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "parse_tonl",
    "arguments": {
      "tonl": "users[2]{id:i32,name:str}: 1, Alice\n2, Bob"
    }
  },
  "id": 2
}
```

### 3. calculate_savings

Calculate token savings between JSON and TONL.

**Parameters:**
```typescript
{
  jsonData: string;   // JSON formatted string
  tonlData: string;   // TONL formatted string
  model: string;      // LLM model name
}
```

**Returns:**
```typescript
{
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercent: number;
}
```

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "calculate_savings",
    "arguments": {
      "jsonData": "[{\"id\":1,\"name\":\"Alice\"}]",
      "tonlData": "users[1]{id:i32,name:str}: 1, Alice",
      "model": "gpt-4"
    }
  },
  "id": 3
}
```

## Session Management

### Session Creation

Server automatically creates sessions for each SSE connection:

```typescript
interface Session {
  id: string;        // UUID v4
  createdAt: Date;   // Session start time
}
```

### Session ID

Returned in SSE endpoint response:
```
event: endpoint
data: /mcp?sessionId=97d56d39-207f-4016-b3dc-d0b368d73203
```

## Transport Protocol

### Server-Sent Events (SSE)

The server uses SSE for bidirectional communication:

**Connection:**
```bash
curl -N -H "Authorization: Bearer token" \
  http://localhost:3000/mcp
```

**Message Format:**
```
event: <event-type>
data: <json-data>
```

**Supported Events:**
- `endpoint` - Session endpoint information
- `message` - Tool responses
- `error` - Error messages

## Error Handling

### Error Types

**Authentication Errors:**
```json
{
  "error": "Unauthorized: Missing Bearer token"
}
```
Status: 401

**Invalid Token:**
```json
{
  "error": "Forbidden: Invalid token"
}
```
Status: 403

**Tool Errors:**
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Conversion failed: Invalid schema"
  }]
}
```

### Error Response Format

All errors follow MCP error format:
```typescript
interface McpError {
  isError: true;
  content: Array<{
    type: 'text';
    text: string;
  }>;
}
```

## Graceful Shutdown

Server handles shutdown signals gracefully:

**Signals:**
- `SIGINT` (Ctrl+C)
- `SIGTERM` (Docker stop, systemd)

**Behavior:**
1. Stop accepting new connections
2. Wait for active requests (max 10s)
3. Close remaining connections (after 5s)
4. Exit cleanly

**Example:**
```bash
# Send SIGTERM
docker stop tonl-server

# Logs show:
# 🛑 Received SIGTERM. Shutting down gracefully...
# ✅ Server stopped cleanly.
```

## Rate Limiting

**v0.9.0:** Not implemented

**Future:** Will support configurable rate limits per token/IP.

## Payload Limits

**Maximum Request Size:** 50MB

Configured via Express middleware:
```typescript
app.use(express.json({ limit: '50mb' }));
```

## Health Checks

### Basic Health Check

```bash
curl http://localhost:3000/
# Status: 200 OK
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Client Integration

### Claude Desktop

See [Claude Desktop Integration](../guide/claude-desktop.md) for configuration.

### Custom Clients

Use MCP SDK:
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
});

await client.connect({
  url: 'http://localhost:3000/mcp',
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

// Call tools
const result = await client.callTool('convert_to_tonl', {
  data: [{ id: 1, name: 'Test' }],
  name: 'test'
});
```

## Production Deployment

### Docker

```bash
docker run -d \
  --name tonl-server \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=your-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Reverse Proxy

Use nginx for HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    location /mcp {
        proxy_pass http://localhost:3000/mcp;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
```

## Monitoring

### Server Logs

Default output:
```
🚀 TONL MCP Server listening on port 3000
   - SSE Stream: http://localhost:3000/mcp
   🔒 Security: Enabled (Bearer Token required)
💡 Press Ctrl+C to stop the server gracefully

-> New SSE connection: <session-id>
<- Connection closed: <session-id>
```

### Connection Tracking

Monitor active connections:
```bash
# Check server logs for connection count
docker logs tonl-server | grep "SSE connection"
```

## Debugging

### Enable Debug Logging

```bash
export DEBUG=tonl:*
npx tonl-mcp-server
```

### Test Tools Manually

```bash
# Test convert_to_tonl
curl -X POST \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "convert_to_tonl",
      "arguments": {
        "data": [{"id": 1}],
        "name": "test"
      }
    },
    "id": 1
  }' \
  http://localhost:3000/mcp
```

## API Versioning

**Current Version:** v0.9.0

**Breaking Changes:** See [CHANGELOG.md](https://github.com/kryptomrx/tonl-mcp-bridge/blob/main/CHANGELOG.md)

**Stability:** Production ready

## See Also

- [MCP Server Guide](../guide/mcp-server.md) - Configuration and setup
- [Claude Desktop Integration](../guide/claude-desktop.md) - Client setup
- [Docker Deployment](../guide/docker.md) - Container deployment
- [Production Deployment](../guide/deployment.md) - Production best practices