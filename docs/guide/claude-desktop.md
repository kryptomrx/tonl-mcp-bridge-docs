# Claude Desktop Integration

Connect TONL-MCP Bridge to Claude Desktop using the HTTP/SSE transport.

## Overview

Starting with v0.9.0, TONL-MCP Bridge uses HTTP/SSE transport instead of stdio. This requires a different configuration in Claude Desktop.

## Prerequisites

- Claude Desktop (latest version)
- TONL-MCP Bridge v0.9.0+
- MCP server running

## Step 1: Install TONL-MCP Bridge

```bash
npm install -g tonl-mcp-bridge
```

## Step 2: Start MCP Server

Start the server with authentication:

```bash
export TONL_AUTH_TOKEN=your-secure-token
npx tonl-mcp-server
```

Server starts on `http://localhost:3000`

Output:
```
🚀 TONL MCP Server listening on port 3000
   - SSE Stream: http://localhost:3000/mcp
   🔒 Security: Enabled (Bearer Token required)
```

**Keep this terminal running!**

## Step 3: Configure Claude Desktop

### macOS

Edit Claude Desktop config:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Windows

Edit Claude Desktop config:

```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### Configuration

Add TONL server to `mcpServers`:

```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer your-secure-token"
      }
    }
  }
}
```

**Replace `your-secure-token` with your actual token!**

## Step 4: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Start Claude Desktop again
3. Check MCP icon in bottom-right corner

## Step 5: Verify Connection

In Claude Desktop, the TONL server should appear in:
- MCP settings menu
- Server status indicator

Test by asking Claude:
```
"Can you convert this JSON to TONL format: [{"id": 1, "name": "Test"}]"
```

Claude should use the `convert_to_tonl` tool.

## Available Tools

Claude Desktop has access to three tools:

### 1. convert_to_tonl
Convert JSON/YAML to TONL format:
```
Convert this data to TONL: [{"id": 1, "name": "Alice"}]
```

### 2. parse_tonl
Parse TONL back to JSON:
```
Parse this TONL: data[1]{id:i32,name:str}: 1, Alice
```

### 3. calculate_savings
Calculate token savings:
```
Calculate token savings for converting this data to TONL: [...]
```

## Configuration Examples

### Basic (Local Development)

```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer dev-token-123"
      }
    }
  }
}
```

### Production (Remote Server)

```json
{
  "mcpServers": {
    "tonl": {
      "url": "https://tonl.example.com/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer prod-token-abc123"
      }
    }
  }
}
```

### Multiple Servers

```json
{
  "mcpServers": {
    "tonl-dev": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer dev-token"
      }
    },
    "tonl-prod": {
      "url": "https://tonl.example.com/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer prod-token"
      }
    }
  }
}
```

## Troubleshooting

### Connection Failed

**Check server is running:**
```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

Should return SSE event.

**Check firewall:**
```bash
# macOS
sudo lsof -i :3000

# Linux
sudo netstat -tlnp | grep 3000
```

### Authentication Failed

**Verify token in server logs:**
```bash
# Server should log auth attempts
# Check terminal where server is running
```

**Test token:**
```bash
# Should fail (401)
curl http://localhost:3000/mcp

# Should work
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

### Tools Not Appearing

**Restart Claude Desktop:**
1. Completely quit Claude Desktop
2. Wait 5 seconds
3. Restart

**Check config syntax:**
```bash
# Validate JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
```

### Server Disconnects

**Check server logs:**
Look for errors in terminal where server is running.

**Increase timeout (if needed):**
Server handles long-running connections automatically.

## Running as Background Service

### macOS (launchd)

Create `~/Library/LaunchAgents/com.tonl.mcp.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tonl.mcp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/usr/local/bin/tonl-mcp-server</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>TONL_AUTH_TOKEN</key>
        <string>your-secure-token</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/tonl-mcp.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/tonl-mcp-error.log</string>
</dict>
</plist>
```

Load service:

```bash
launchctl load ~/Library/LaunchAgents/com.tonl.mcp.plist
```

### Linux (systemd)

Create `/etc/systemd/system/tonl-mcp.service`:

```ini
[Unit]
Description=TONL MCP Server
After=network.target

[Service]
Type=simple
User=youruser
Environment="TONL_AUTH_TOKEN=your-secure-token"
ExecStart=/usr/local/bin/tonl-mcp-server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable tonl-mcp
sudo systemctl start tonl-mcp
sudo systemctl status tonl-mcp
```

### Windows (NSSM)

1. Download NSSM: https://nssm.cc/download
2. Install service:

```cmd
nssm install TONL-MCP "C:\Program Files\nodejs\node.exe" "C:\Users\YourUser\AppData\Roaming\npm\node_modules\tonl-mcp-bridge\dist\mcp\index.js"
nssm set TONL-MCP AppEnvironmentExtra TONL_AUTH_TOKEN=your-secure-token
nssm start TONL-MCP
```

## Security Best Practices

### Generate Secure Token

```bash
# Linux/macOS
openssl rand -base64 32

# Or use password manager
```

### Rotate Tokens Regularly

1. Generate new token
2. Update server environment
3. Restart server
4. Update Claude Desktop config
5. Restart Claude Desktop

### Use Environment Variables

Don't hardcode tokens in config files.

**macOS/Linux:**
```bash
export TONL_AUTH_TOKEN=$(cat ~/.tonl-token)
npx tonl-mcp-server
```

**Windows:**
```cmd
set /p TONL_AUTH_TOKEN=<C:\Users\YourUser\.tonl-token
npx tonl-mcp-server
```

## Docker Integration

If running server in Docker:

**Start container:**
```bash
docker run -d \
  --name tonl-server \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=your-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

**Claude Desktop config:**
```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer your-token"
      }
    }
  }
}
```

## Migration from stdio (v0.8.0)

If you were using v0.8.0 with stdio transport:

**Old config (v0.8.0):**
```json
{
  "mcpServers": {
    "tonl": {
      "command": "npx",
      "args": ["tonl-mcp-server"]
    }
  }
}
```

**New config (v0.9.0):**
```json
{
  "mcpServers": {
    "tonl": {
      "url": "http://localhost:3000/mcp",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer your-token"
      }
    }
  }
}
```

**Steps:**
1. Update to v0.9.0
2. Start server manually with token
3. Update Claude Desktop config
4. Restart Claude Desktop

## Next Steps

- [MCP Server Guide](./mcp-server.md) - Server configuration details
- [Docker Guide](./docker.md) - Docker deployment
- [Production Deployment](./deployment.md) - Production setup
- [Security Guide](./security.md) - Security best practices