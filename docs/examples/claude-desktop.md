# Claude Desktop Integration

Connect TONL-MCP Bridge to Claude Desktop for automatic JSON ↔ TONL conversion with 40-60% token savings.

## Quick Start (2 Minutes)

### Step 1: Install

```bash
npm install -g tonl-mcp-bridge
```

### Step 2: Configure Claude Desktop

**macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Add this configuration:**

```json
{
  "mcpServers": {
    "tonl": {
      "command": "npx",
      "args": ["-y", "tonl-mcp-stdio"]
    }
  }
}
```

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Restart
3. Look for MCP icon (🔌) in bottom-right corner

### Step 4: Test

Ask Claude:

> "Convert this JSON to TONL: [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]"

**Expected response:**
```tonl
users[2]{id:i32,name:str}:
  1, Alice
  2, Bob

Token savings: 36%
```

✅ **Done! TONL is now integrated with Claude Desktop.**

---

## Development Setup (Local Build)

If you're developing TONL locally:

```json
{
  "mcpServers": {
    "tonl": {
      "command": "node",
      "args": [
        "/absolute/path/to/tonl-mcp-bridge/dist/mcp/stdio.js"
      ]
    }
  }
}
```

**Example (macOS/Linux):**
```json
{
  "mcpServers": {
    "tonl": {
      "command": "node",
      "args": [
        "/Users/yourname/projects/tonl-mcp-bridge/dist/mcp/stdio.js"
      ]
    }
  }
}
```

**Example (Windows):**
```json
{
  "mcpServers": {
    "tonl": {
      "command": "node",
      "args": [
        "C:\\Users\\YourName\\projects\\tonl-mcp-bridge\\dist\\mcp\\stdio.js"
      ]
    }
  }
}
```

**Build first:**
```bash
cd /path/to/tonl-mcp-bridge
npm run build
```

---

## What You Can Do

### 1. Convert JSON to TONL

**Ask Claude:**
> Convert this to TONL: [{"product": "Laptop", "price": 999}, {"product": "Mouse", "price": 25}]

**Claude responds:**
```tonl
products[2]{product:str,price:i32}:
  Laptop, 999
  Mouse, 25

Saved 42% tokens
```

### 2. Parse TONL to JSON

**Ask Claude:**
> Parse this TONL: users[2]{id:i32,name:str}: 1,Alice 2,Bob

**Claude responds:**
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

### 3. Calculate Savings

**Ask Claude:**
> Calculate token savings for this data: [{"id": 1, "name": "Test"}]

**Claude responds:**
```
Original (JSON): 38 tokens
TONL format: 25 tokens
Savings: 13 tokens (34%)
```

---

## Common Use Cases

### RAG Database Results

```
I have these search results from my vector database:

[
  {"id": 1, "content": "How to deploy Kubernetes", "score": 0.95},
  {"id": 2, "content": "Docker best practices", "score": 0.89}
]

Convert to TONL to save tokens before sending to GPT-4.
```

### API Response Optimization

```
This API returned 100 user records. Convert to TONL to reduce 
token costs when analyzing with LLM:

[{"user_id": 1, "name": "Alice", "status": "active"}, ...]
```

### Log Analysis

```
Convert these application logs to TONL for efficient LLM analysis:

[
  {"timestamp": "2024-12-07T10:00:00Z", "level": "error", "message": "Connection timeout"},
  {"timestamp": "2024-12-07T10:01:00Z", "level": "warn", "message": "Retry attempt 1"}
]
```

---

## Troubleshooting

### Tools Not Showing Up

**Check MCP Status:**
1. Look for 🔌 icon in Claude Desktop (bottom-right)
2. Click icon to see connected servers
3. "tonl" should be listed

**If not listed:**
1. Verify config file syntax (valid JSON)
2. Check absolute paths (no ~, use full path)
3. Restart Claude Desktop completely (Quit, not just close)

### "Command not found" Error

**Global install:**
```bash
# Check if installed
which tonl-mcp-stdio

# If not found, reinstall
npm install -g tonl-mcp-bridge
```

**Local development:**
```bash
# Check file exists
ls /path/to/tonl-mcp-bridge/dist/mcp/stdio.js

# If not, rebuild
cd /path/to/tonl-mcp-bridge
npm run build
```

### "TONL Server Error"

**Check logs:**

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```bash
type %APPDATA%\Claude\logs\mcp*.log
```

### Configuration Not Loading

**Validate JSON:**
```bash
# macOS/Linux
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Should show formatted JSON, or error if invalid
```

**Common mistakes:**
- Missing commas between objects
- Trailing commas (not allowed in JSON)
- Wrong quotes (use " not ')
- Incorrect path separators (Windows: \\, Unix: /)

---

## Multiple MCP Servers

You can run TONL alongside other MCP servers:

```json
{
  "mcpServers": {
    "tonl": {
      "command": "npx",
      "args": ["-y", "tonl-mcp-stdio"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/Documents"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/mydb"
      ]
    }
  }
}
```

---

## Advanced Configuration

### Environment Variables

Pass environment variables to the MCP server:

```json
{
  "mcpServers": {
    "tonl": {
      "command": "node",
      "args": [
        "/path/to/tonl-mcp-bridge/dist/mcp/stdio.js"
      ],
      "env": {
        "DEBUG": "tonl:*",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Using npm Scripts

```json
{
  "mcpServers": {
    "tonl": {
      "command": "npm",
      "args": [
        "exec",
        "-c",
        "tonl-mcp-stdio"
      ],
      "cwd": "/path/to/tonl-mcp-bridge"
    }
  }
}
```

---

## Performance

- **Startup time:** <1 second
- **Conversion speed:** <10ms for typical datasets
- **Memory usage:** ~50MB
- **No network latency:** Direct stdio communication

---

## Security

### Local Only

The stdio MCP server:
- ✅ Runs locally on your machine
- ✅ No network ports opened
- ✅ No authentication needed (local process)
- ✅ Communicates via stdin/stdout only

### No Token Required

Unlike the HTTP server, stdio mode doesn't need authentication tokens because:
- Only Claude Desktop can communicate with it
- Process isolation provides security
- No remote access possible

---

## Remote Server Option

For team collaboration or remote deployments, use the HTTP server instead:

**1. Start HTTP server:**
```bash
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)
npx tonl-mcp-server
```

**2. Configure Claude Desktop:**
```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://your-server:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer your-token-here"
      }
    }
  }
}
```

See [MCP Server Guide](/guide/mcp-server) for HTTP deployment.

---

## Token Savings Examples

### Small Dataset (5 records)

**JSON:** 118 tokens  
**TONL:** 75 tokens  
**Savings:** 36%

### Medium Dataset (100 records)

**JSON:** 2,470 tokens  
**TONL:** 987 tokens  
**Savings:** 60%

### Large Dataset (1000 records)

**JSON:** 24,700 tokens  
**TONL:** 9,870 tokens  
**Savings:** 60%

💡 **Savings increase with dataset size**

---

## Next Steps

**Learn More:**
- [MCP Server Guide](/guide/mcp-server) - HTTP server setup
- [TONL Format](/guide/tonl-format) - Format specification
- [Token Savings](/guide/token-savings) - Optimization details

**Integration:**
- [Vector Databases](/guide/milvus) - RAG systems
- [Streaming](/guide/streaming) - Real-time processing
- [Privacy](/guide/privacy) - Data anonymization

**Deploy:**
- [Docker](/guide/docker) - Container deployment
- [Kubernetes](/guide/kubernetes) - Production scaling

---

## Support

**Issues:**
- GitHub: [Issues](https://github.com/kryptomrx/tonl-mcp-bridge/issues)
- Discussions: [GitHub Discussions](https://github.com/kryptomrx/tonl-mcp-bridge/discussions)

**Documentation:**
- Full Docs: [Documentation Site](https://tonl-mcp-bridge-docs.vercel.app/)
- Examples: [Example Repository](https://github.com/kryptomrx/tonl-mcp-bridge/tree/main/examples)

---

## Success! 🎉

You can now use TONL directly in Claude Desktop:
- ✅ Automatic JSON ↔ TONL conversion
- ✅ 40-60% token savings
- ✅ Real-time calculations
- ✅ Zero configuration needed

**Just ask Claude to convert your data!**
