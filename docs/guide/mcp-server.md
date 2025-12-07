# MCP Server Guide

TONL-MCP Bridge provides two MCP server modes:

1. **stdio** - Direct integration with Claude Desktop (recommended for local use)
2. **HTTP/SSE** - Remote server for team collaboration, Docker, Kubernetes

## Choose Your Mode

### stdio Mode (Local)

**Use when:**
- Running Claude Desktop locally
- Single user
- No network needed
- Fastest performance

**Pros:**
- ✅ No authentication needed
- ✅ No network ports
- ✅ Fastest (<1ms latency)
- ✅ Auto-starts with Claude

**Cons:**
- ❌ Local only (no remote access)
- ❌ One user at a time

### HTTP/SSE Mode (Remote)

**Use when:**
- Team collaboration needed
- Docker/Kubernetes deployment
- Remote access required
- Multiple clients

**Pros:**
- ✅ Remote access
- ✅ Multiple clients
- ✅ Production monitoring
- ✅ Load balancing ready

**Cons:**
- ❌ Requires authentication
- ❌ Network dependency
- ❌ More complex setup

---

## stdio Mode Setup

### Quick Start

**Install:**
```bash
npm install -g tonl-mcp-bridge
```

**Configure Claude Desktop:**

**macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Configuration:**
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

**Restart Claude Desktop** and you're done!

### Development Setup

For local development:

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

**Build first:**
```bash
cd /path/to/tonl-mcp-bridge
npm run build
```

### Environment Variables

```json
{
  "mcpServers": {
    "tonl": {
      "command": "node",
      "args": ["/path/to/stdio.js"],
      "env": {
        "DEBUG": "tonl:*",
        "NODE_ENV": "development"
      }
    }
  }
}
```

---

## HTTP/SSE Mode Setup

### Quick Start

**1. Generate Token:**
```bash
openssl rand -hex 32
# Output: kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

**2. Start Server:**
```bash
export TONL_AUTH_TOKEN=kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
npx tonl-mcp-server
```

**Output:**
```
🚀 TONL MCP Server listening on port 3000
   - SSE Stream: http://localhost:3000/mcp
   - Health: http://localhost:3000/health
   🔒 Security: Enabled (Bearer Token required)
```

**3. Configure Client:**
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

### Environment Variables

```bash
PORT=3000                    # Server port
TONL_AUTH_TOKEN=<token>      # Required for production
NODE_ENV=production          # Environment
DEBUG=tonl:*                 # Debug logging
```

### Auto-Generated Tokens (Development)

For development, tokens are auto-generated if not set:

```bash
npx tonl-mcp-server
# ⚠️ Security: Development mode (Auto-generated session tokens)
# Token: 3c92afcc-ee69-4d1d-b7e0-39ba92c0443a
# 💡 Set TONL_AUTH_TOKEN for production use
```

**⚠️ Auto-generated tokens are valid ONLY for the current session!**

---

## Available Tools

Both modes expose the same three MCP tools:

### 1. convert_to_tonl

Convert JSON data to TONL format.

**Parameters:**
```typescript
{
  data: any[];                    // Data to convert
  name: string;                   // Collection name
  options?: {
    optimize?: boolean;           // Type optimization
    flattenNested?: boolean;      // Flatten objects
    includeStats?: boolean;       // Include statistics
    anonymize?: string[];         // Fields to anonymize
  }
}
```

**Example:**
```json
{
  "data": [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30}
  ],
  "name": "users",
  "options": {
    "includeStats": true
  }
}
```

**Response:**
```json
{
  "tonl": "users[2]{id:i32,name:str,age:i32}:\n  1, Alice, 25\n  2, Bob, 30",
  "stats": {
    "originalTokens": 118,
    "compressedTokens": 75,
    "savedTokens": 43,
    "savingsPercent": 36.4
  }
}
```

### 2. parse_tonl

Convert TONL back to JSON.

**Parameters:**
```typescript
{
  tonl: string;                   // TONL formatted string
  validateSchema?: boolean;       // Validate schema
}
```

**Example:**
```json
{
  "tonl": "users[2]{id:i32,name:str}:\n  1, Alice\n  2, Bob"
}
```

**Response:**
```json
{
  "json": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

### 3. calculate_savings

Calculate token savings between JSON and TONL.

**Parameters:**
```typescript
{
  jsonData: string;               // JSON formatted data
  tonlData: string;               // TONL formatted data
  model?: string;                 // Tokenizer model
}
```

**Supported models:**
- `gpt-5` (default)
- `gpt-4o`, `gpt-4o-mini`
- `claude-opus-4.5`, `claude-sonnet-4.5`
- `gemini-2.5-pro`, `gemini-2.5-flash`

**Example:**
```json
{
  "jsonData": "[{\"id\":1,\"name\":\"Alice\"}]",
  "tonlData": "users[1]{id:i32,name:str}:\n  1, Alice",
  "model": "gpt-4o"
}
```

**Response:**
```json
{
  "originalTokens": 38,
  "compressedTokens": 25,
  "savedTokens": 13,
  "savingsPercent": 34.2,
  "model": "gpt-4o"
}
```

---

## HTTP Endpoints

The HTTP server provides additional endpoints:

### Health Checks

**GET /health** - Liveness probe
```bash
curl http://localhost:3000/health
# {"status":"healthy","uptime":3600,"timestamp":"2024-12-07T18:00:00.000Z"}
```

**GET /ready** - Readiness probe
```bash
curl http://localhost:3000/ready
# {"status":"ready","timestamp":"2024-12-07T18:00:00.000Z"}
```

### Metrics

**GET /metrics** - Prometheus metrics
```bash
curl http://localhost:3000/metrics
# HELP tonl_conversions_total Total number of conversions
# TYPE tonl_conversions_total counter
# tonl_conversions_total{direction="json_to_tonl"} 42
```

**GET /metrics/live** - Live metrics stream (requires auth)
```bash
curl -N -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/metrics/live
# data: {"type":"metrics","timestamp":1701972000000,"data":"..."}
```

### Streaming

**POST /stream/convert** - Stream NDJSON to TONL
```bash
curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @logs.ndjson
```

**Query parameters:**
- `collection` - Collection name (default: "data")
- `skipInvalid` - Skip invalid JSON lines (default: true)

---

## Docker Deployment

### Basic Docker

```bash
docker run -d \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=$(openssl rand -hex 32) \
  -e NODE_ENV=production \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

**Start:**
```bash
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)
docker-compose up -d
```

---

## Kubernetes Deployment

### Basic Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  template:
    metadata:
      labels:
        app: tonl-mcp-bridge
    spec:
      containers:
      - name: tonl-server
        image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
        ports:
        - containerPort: 3000
        env:
        - name: TONL_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: tonl-secrets
              key: auth-token
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: tonl-mcp-bridge
spec:
  selector:
    app: tonl-mcp-bridge
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

**Create secret:**
```bash
kubectl create secret generic tonl-secrets \
  --from-literal=auth-token=$(openssl rand -hex 32)
```

**Deploy:**
```bash
kubectl apply -f deployment.yaml
```

See [Kubernetes Guide](/guide/kubernetes) for complete setup.

---

## Security

### Authentication

**Production (required):**
```bash
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)
```

**Development (optional):**
```bash
# Auto-generates session tokens
npx tonl-mcp-server
```

### Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to `/stream/convert` endpoint
- Returns 429 when exceeded

### Security Headers

Helmet middleware enabled by default:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 0
- Strict-Transport-Security (HTTPS only)

### Best Practices

1. **Always use tokens in production**
2. **Rotate tokens monthly**
3. **Use HTTPS for remote access**
4. **Monitor failed auth attempts**
5. **Set resource limits (Docker/K8s)**
6. **Enable Prometheus metrics**
7. **Configure health checks**

---

## Monitoring

### Prometheus Metrics

**Business metrics:**
- `tonl_token_savings_total` - Total tokens saved
- `tonl_compression_ratio` - Compression efficiency
- `tonl_conversions_total` - Total conversions

**Operational metrics:**
- `tonl_http_requests_total` - Request count
- `tonl_http_request_duration_seconds` - Request latency
- `tonl_active_connections` - Active SSE connections
- `tonl_errors_total` - Error count

**System metrics:**
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_used_bytes` - Heap usage

### Grafana Dashboard

Import dashboard from:
```
https://grafana.com/dashboards/tonl-mcp-bridge
```

Or create custom dashboard with:
- Request rate graph
- Token savings graph
- Error rate graph
- Response time histogram

---

## Troubleshooting

### stdio Mode

**Tools not appearing:**
1. Check config.json syntax
2. Verify absolute paths
3. Restart Claude Desktop
4. Check logs: `~/Library/Logs/Claude/mcp*.log`

**Command not found:**
```bash
# Global install
npm install -g tonl-mcp-bridge

# Verify
which tonl-mcp-stdio
```

### HTTP Mode

**Connection refused:**
```bash
# Check server is running
curl http://localhost:3000/health

# Check port
lsof -i :3000
```

**Authentication failed:**
```bash
# Verify token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/mcp
```

**High latency:**
- Check network connectivity
- Monitor with `/metrics` endpoint
- Review Prometheus graphs
- Check Docker/K8s resource limits

---

## Performance

**stdio Mode:**
- Startup: <1 second
- Latency: <1ms
- Memory: ~50MB
- No network overhead

**HTTP Mode:**
- Startup: <2 seconds
- Latency: 5-20ms (local), 50-200ms (remote)
- Memory: ~100MB
- Network dependent

**Recommendations:**
- Use stdio for local Claude Desktop
- Use HTTP for team/production deployments
- Scale horizontally (K8s replicas)
- Enable Prometheus monitoring

---

## Next Steps

**Integration:**
- [Claude Desktop](/examples/claude-desktop) - Quick start
- [Docker Deployment](/guide/docker) - Container setup
- [Kubernetes](/guide/kubernetes) - Production scaling

**Features:**
- [Streaming](/guide/streaming) - Real-time processing
- [Privacy](/guide/privacy) - Data anonymization
- [Monitoring](/guide/live-monitoring) - Live dashboard

**API:**
- [Core API](/api/core) - Library usage
- [Streaming API](/api/streaming) - Stream processing
- [Server API](/api/server) - HTTP endpoints
