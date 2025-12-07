# MCP Server API

Production-grade HTTP/SSE Model Context Protocol server for TONL conversions.

## Overview

The MCP Server provides a standardized interface for LLM clients to access TONL conversion tools via HTTP/SSE transport. Includes streaming endpoints, health checks, and comprehensive observability.

**New in v1.0.0:**
- Health check endpoints (`/health`, `/ready`)
- Streaming pipeline endpoint (`/stream/convert`)
- Prometheus metrics (`/metrics`, `/metrics/live`)
- Rate limiting and security headers
- Graceful shutdown with connection draining
- 16 new health check tests

**v0.9.0 Features:**
- HTTP/SSE transport
- Bearer token authentication
- Session management

## Starting the Server

### Command Line

```bash
# Set authentication token
export TONL_AUTH_TOKEN=your-secure-token

# Start server
npx tonl-mcp-server
```

Output:
```
🚀 TONL MCP Server listening on port 3000
   - SSE Stream: http://localhost:3000/mcp
   - Log Stream: http://localhost:3000/stream/convert
   - Metrics: http://localhost:3000/metrics
   - Live Monitor: http://localhost:3000/metrics/live
   - Health: http://localhost:3000/health
   - Ready: http://localhost:3000/ready
   🔒 Security: Enabled (Bearer Token required for /mcp)
```

### Programmatic

```typescript
import { startHttpServer, shutdown } from 'tonl-mcp-bridge/mcp';

const server = startHttpServer(3000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TONL_AUTH_TOKEN` | Recommended* | - | Bearer token for MCP endpoints |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | production | Environment mode |

*Required for MCP endpoints in production. Other endpoints (health, metrics, streaming) work without authentication.

## Endpoints

### Health Check (Liveness Probe)

**Endpoint:** `GET /health`

**Authentication:** Not required

**Purpose:** Kubernetes/Docker liveness probe

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "timestamp": "2024-12-06T19:00:00.000Z"
}
```

**Performance:**
- Response time: < 1ms
- No external dependencies
- Always returns 200 OK if server is running

**Example:**
```bash
curl http://localhost:3000/health

# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
```

### Readiness Check (Readiness Probe)

**Endpoint:** `GET /ready`

**Authentication:** Not required

**Purpose:** Kubernetes/Docker readiness probe

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-12-06T19:00:00.000Z"
}
```

**Behavior:**
- Returns 200 OK when server is ready for traffic
- Returns 503 Service Unavailable during startup (future enhancement)
- Can be extended to check database connections

**Example:**
```bash
curl http://localhost:3000/ready

# Kubernetes readiness probe
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Prometheus Metrics

**Endpoint:** `GET /metrics`

**Authentication:** Not required

**Purpose:** Metrics scraping by Prometheus

**Response:** Prometheus text format

**Metrics included:**
- `tonl_conversions_total` - Total conversions by type
- `tonl_token_savings_total` - Token savings by model
- `tonl_compression_ratio` - Compression ratio by model
- `tonl_data_size_bytes` - Data size by type
- `tonl_conversion_errors_total` - Errors by type
- `tonl_active_connections` - Current active connections
- `tonl_build_info` - Build version information

**Example:**
```bash
curl http://localhost:3000/metrics

# Prometheus scrape config
scrape_configs:
  - job_name: 'tonl-mcp-bridge'
    static_configs:
      - targets: ['localhost:3000']
```

### Live Metrics Stream (SSE)

**Endpoint:** `GET /metrics/live`

**Authentication:** Required (Bearer token)

**Purpose:** Real-time monitoring for `tonl top` command

**Response:** Server-Sent Events stream

**Data format:**
```json
{
  "type": "metrics",
  "timestamp": 1670345600000,
  "data": "<prometheus-metrics-text>"
}
```

**Example:**
```bash
# Manual streaming
curl -N -H "Authorization: Bearer token" \
  http://localhost:3000/metrics/live

# Using tonl top
tonl top --url http://localhost:3000
```

### Streaming Conversion

**Endpoint:** `POST /stream/convert`

**Authentication:** Not required

**Purpose:** Real-time NDJSON to TONL conversion

**Headers:**
```
Content-Type: application/x-ndjson
```

**Query Parameters:**
- `collection` (optional): Collection name (default: 'data')
- `skipInvalid` (optional): Skip invalid JSON lines (default: true)

**Request Body:** NDJSON stream

**Response:** TONL stream (text/plain)

**Rate Limiting:** 100 requests per 15 minutes per IP

**Performance:**
- Throughput: 250,000 lines/second
- Memory: Constant (independent of file size)
- Compression: 47% average

**Example:**
```bash
# Stream Docker logs
curl -X POST http://localhost:3000/stream/convert?collection=logs \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @docker-logs.ndjson

# With streaming output
cat large-file.ndjson | \
  curl -X POST http://localhost:3000/stream/convert \
    -H "Content-Type: application/x-ndjson" \
    --data-binary @-
```

### MCP SSE Stream

**Endpoint:** `GET /mcp`

**Authentication:** Required (Bearer token)

**Response:** Server-Sent Events stream

**Example:**
```bash
curl -N -H "Authorization: Bearer token" \
  http://localhost:3000/mcp

# Response:
# event: endpoint
# data: /mcp?sessionId=<uuid>
```

## Security Features

### Rate Limiting

**Configuration:**
- Window: 15 minutes
- Max requests per IP: 100
- Applies to: `/stream/convert` endpoint

**Response when limit exceeded:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```
Status: 429 Too Many Requests

**Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1670346000
```

### Security Headers (Helmet)

**Enabled by default:**
- `Content-Security-Policy` (disabled for SSE compatibility)
- `Cross-Origin-Embedder-Policy` (disabled for SSE)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0` (modern browsers use CSP)

**Custom configuration:**
```typescript
import helmet from 'helmet';
import { startHttpServer } from 'tonl-mcp-bridge/mcp';

// Helmet is already configured internally
const server = startHttpServer(3000);
```

### Bearer Token Authentication

**Applies to:** `/mcp` and `/metrics/live` endpoints

**Header format:**
```
Authorization: Bearer <your-token>
```

**Error responses:**

**Missing token:**
```json
{ "error": "Unauthorized: Missing Bearer token" }
```
Status: 401

**Invalid token:**
```json
{ "error": "Forbidden: Invalid token" }
```
Status: 403

## Available MCP Tools

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
  stats?: {                        // Token statistics
    originalTokens: number;
    compressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  }
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

## Graceful Shutdown

**Signals handled:**
- `SIGTERM` - Docker stop, Kubernetes termination
- `SIGINT` - Ctrl+C, manual interrupt

**Shutdown sequence:**
1. Stop accepting new connections
2. Wait for active requests to complete (max 30 seconds)
3. Close remaining connections
4. Exit cleanly

**Example logs:**
```
SIGTERM received
🛑 Shutting down gracefully...
Waiting for 3 active connections...
✅ Server shut down successfully
```

**Programmatic shutdown:**
```typescript
import { shutdown } from 'tonl-mcp-bridge/mcp';

// Trigger graceful shutdown
await shutdown();
```

## Production Deployment

### Docker with Health Checks

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
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge
  labels:
    app: tonl-mcp-bridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  template:
    metadata:
      labels:
        app: tonl-mcp-bridge
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: tonl-server
        image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
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
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
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
  labels:
    app: tonl-mcp-bridge
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: tonl-mcp-bridge
---
apiVersion: v1
kind: Secret
metadata:
  name: tonl-secrets
type: Opaque
stringData:
  auth-token: "your-secure-token-here"
```

### Load Balancer Configuration (nginx)

```nginx
upstream tonl_backend {
    server localhost:3000 max_fails=3 fail_timeout=30s;
    server localhost:3001 max_fails=3 fail_timeout=30s;
    server localhost:3002 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    # Health check endpoint
    location /health {
        proxy_pass http://tonl_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        access_log off;
    }

    # MCP endpoint (SSE)
    location /mcp {
        proxy_pass http://tonl_backend/mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';
        proxy_set_header Authorization $http_authorization;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }

    # Streaming endpoint
    location /stream/convert {
        proxy_pass http://tonl_backend/stream/convert;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_request_buffering off;
        client_max_body_size 100m;
    }

    # Metrics endpoint
    location /metrics {
        proxy_pass http://tonl_backend/metrics;
        access_log off;
        allow 10.0.0.0/8;  # Internal network only
        deny all;
    }
}
```

## Monitoring & Observability

### Prometheus Integration

**Scrape configuration:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tonl-mcp-bridge'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

**Key metrics to monitor:**
- `tonl_active_connections` - Alert if > 100
- `tonl_conversion_errors_total` - Alert on rate increase
- `tonl_token_savings_total` - Track business value
- `tonl_compression_ratio` - Monitor efficiency

### Grafana Dashboard

**Import dashboard:**
```bash
# Dashboard ID: Coming soon
# Or use metrics directly
```

**Key panels:**
- Active connections (gauge)
- Token savings over time (graph)
- Conversion rate (counter)
- Error rate (graph)
- P95 latency (heatmap)

### Logging

**Structured logs:**
```json
{
  "timestamp": "2024-12-06T19:00:00.000Z",
  "level": "info",
  "event": "stream_completed",
  "lines": 10000,
  "bytesIn": 718889,
  "bytesOut": 588914,
  "duration": 0.05
}
```

**Log aggregation:**
- Compatible with ELK, Splunk, Datadog
- JSON format for easy parsing
- Structured fields for filtering

## Testing

### Health Check Tests

```bash
# Test liveness
curl -f http://localhost:3000/health || exit 1

# Test readiness
curl -f http://localhost:3000/ready || exit 1

# Test with timeout
timeout 5s curl http://localhost:3000/health
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/health

# Using k6
k6 run load-test.js
```

### Integration Tests

Run the test suite:
```bash
npm test

# Health check tests
npm test tests/health-checks.test.ts
```

## Troubleshooting

### Common Issues

**Health check fails:**
```bash
# Check if server is running
curl http://localhost:3000/health

# Check logs
docker logs tonl-server

# Verify port is open
netstat -an | grep 3000
```

**Rate limit exceeded:**
```bash
# Check current limits
curl -I http://localhost:3000/stream/convert

# Response headers show:
# RateLimit-Remaining: 0
# Retry-After: 900
```

**Authentication errors:**
```bash
# Verify token is set
echo $TONL_AUTH_TOKEN

# Test with curl
curl -H "Authorization: Bearer $TONL_AUTH_TOKEN" \
  http://localhost:3000/mcp
```

## API Versioning

**Current Version:** v1.0.0

**Breaking Changes:** See [CHANGELOG.md](https://github.com/kryptomrx/tonl-mcp-bridge/blob/main/CHANGELOG.md)

**Stability:** Production ready

## See Also

- [MCP Server Guide](../guide/mcp-server.md) - Configuration and setup
- [Streaming Guide](../guide/streaming.md) - Streaming pipeline details
- [Privacy Guide](../guide/privacy.md) - Anonymization features
- [Deployment Guide](../guide/deployment.md) - Production best practices
- [Monitoring Guide](../guide/live-monitoring.md) - Observability setup
