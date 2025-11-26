# Claude Desktop Quick Start

Quick example: Connect TONL-MCP Bridge to Claude Desktop in 5 minutes.

## Prerequisites

- Claude Desktop installed
- Node.js 18+ installed

## Step 1: Install (1 minute)

```bash
npm install -g tonl-mcp-bridge
```

## Step 2: Generate Token (30 seconds)

```bash
# Generate secure token
openssl rand -base64 32

# Save output, e.g.:
# kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

## Step 3: Start Server (30 seconds)

```bash
export TONL_AUTH_TOKEN=kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
npx tonl-mcp-server
```

Expected output:
```
🚀 TONL MCP Server listening on port 3000
   - SSE Stream: http://localhost:3000/mcp
   🔒 Security: Enabled (Bearer Token required)
💡 Press Ctrl+C to stop the server gracefully
```

**Keep this terminal open!**

## Step 4: Configure Claude Desktop (2 minutes)

### macOS

```bash
# Edit config
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Windows

```bash
# Edit config
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### Add Configuration

```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n="
      }
    }
  }
}
```

**Replace token with your generated token!**

## Step 5: Restart Claude Desktop (1 minute)

1. Completely quit Claude Desktop
2. Wait 5 seconds
3. Restart Claude Desktop
4. Check MCP icon appears (bottom-right)

## Step 6: Test (1 minute)

Ask Claude:

> "Can you convert this JSON to TONL format: [{"id": 1, "name": "Alice", "age": 25}, {"id": 2, "name": "Bob", "age": 30}]"

Expected response:
```
users[2]{id:i32,name:str,age:i32}:
  1, Alice, 25
  2, Bob, 30

Token savings: 36.4%
```

## What You Can Do

### Convert to TONL

```
Convert this data to TONL:
[
  {"product": "Laptop", "price": 999, "stock": 50},
  {"product": "Mouse", "price": 25, "stock": 200}
]
```

### Parse from TONL

```
Parse this TONL to JSON:
products[2]{product:str,price:i32,stock:i32}:
  Laptop, 999, 50
  Mouse, 25, 200
```

### Calculate Savings

```
Calculate token savings if I convert this JSON to TONL:
[{"id": 1, "name": "Test"}]
```

## Troubleshooting

### Server Not Starting

Check Node.js version:
```bash
node --version
# Should be 18.0.0 or higher
```

### Connection Failed

Verify server is running:
```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

Should return SSE event.

### Tools Not Appearing

1. Verify config.json syntax (valid JSON)
2. Restart Claude Desktop completely
3. Check server logs for errors

### Authentication Failed

Test token:
```bash
# Should fail (401)
curl http://localhost:3000/mcp

# Should work
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

## Production Setup

For production deployment:

1. **Run as Service** - Use systemd/launchd
2. **Use Docker** - `docker run -d ghcr.io/kryptomrx/tonl-mcp-bridge`
3. **Add HTTPS** - Use nginx reverse proxy
4. **Rotate Tokens** - Change tokens regularly

See [Full Guide](../guide/claude-desktop.md) for details.

## Next Steps

- [Full Claude Desktop Guide](../guide/claude-desktop.md) - Complete setup
- [MCP Server Guide](../guide/mcp-server.md) - Server configuration
- [Docker Deployment](../guide/docker.md) - Container setup
- [Production Deployment](../guide/deployment.md) - Production best practices

## Example Output

When you ask Claude to convert data:

**Your Input:**
```
Convert to TONL: [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
```

**Claude's Response:**
```
users[2]{id:i32,name:str}:
  1, Alice
  2, Bob

This TONL format saves approximately 33% tokens compared to JSON.
```

## Common Use Cases

### 1. Database Results

```
I have this database result, convert to TONL:
[
  {"order_id": 1001, "customer": "Alice", "total": 99.99},
  {"order_id": 1002, "customer": "Bob", "total": 149.50}
]
```

### 2. API Responses

```
Convert this API response to TONL to save tokens:
[
  {"status": "success", "code": 200, "message": "OK"},
  {"status": "error", "code": 404, "message": "Not Found"}
]
```

### 3. Batch Data

```
I need to send this batch data to an LLM, optimize it:
[
  {"sensor": "temp", "value": 22.5, "unit": "C"},
  {"sensor": "humidity", "value": 65, "unit": "%"}
]
```

## Tips

**Token Savings:**
- More rows = higher savings
- Consistent schema = better compression
- Aim for 10+ rows for best results

**Performance:**
- Server handles 50MB payloads
- Fast conversions (<100ms)
- Supports concurrent requests

**Security:**
- Always use tokens in production
- Rotate tokens monthly
- Never commit tokens to git

## Success!

You now have TONL integration working with Claude Desktop! 🎉

The server will:
- Convert JSON ↔ TONL automatically
- Calculate token savings
- Handle authentication
- Run reliably

**Keep the server running** while using Claude Desktop.