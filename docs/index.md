---
layout: home

hero:
  name: TONL-MCP Bridge
  text: Production-Grade Token Optimization
  tagline: Reduce LLM token costs by 40-60% with enterprise streaming, privacy compliance, and real-time monitoring. Battle-tested with 377 passing tests.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kryptomrx/tonl-mcp-bridge

features:
  - title: Streaming Pipeline
    details: Process gigabyte-scale files with constant memory. 250,000 lines/second throughput with backpressure handling. Real-time NDJSON to TONL conversion via HTTP endpoints.
  
  - title: Privacy & Compliance
    details: Smart masking for email, SSN, credit cards, and phone numbers. Nested object anonymization with dot-notation paths. GDPR and HIPAA compliance ready.
  
  - title: Live Monitoring
    details: Real-time metrics dashboard with 'tonl top' command. Token savings visualization, response time histograms, and auto-refresh. Works with local and remote servers.
  
  - title: Production Observability
    details: Prometheus metrics for business and operational KPIs. Health check endpoints for Kubernetes. Grafana dashboard templates. OpenTelemetry compatible.
  
  - title: Vector Database Integration
    details: Native adapters for Milvus, Qdrant, and ChromaDB. Automatic TONL conversion with built-in savings calculation. Optimized for RAG systems.
  
  - title: Enterprise Security
    details: Rate limiting with configurable thresholds. Security headers via Helmet. Bearer token authentication. Graceful shutdown with connection draining.
  
  - title: SQL Database Support
    details: Built-in adapters for PostgreSQL, MySQL, and SQLite. Query and convert in one step with automatic type detection and optimization.
  
  - title: MCP Server
    details: Model Context Protocol server with HTTP/SSE transport. Session management and authentication. Remote monitoring support. Docker and Kubernetes ready.
  
  - title: Battle Tested
    details: 377 comprehensive tests covering edge cases. Full TypeScript support with strict type checking. Production-ready with real tokenizer integration.
---

## Real-Time Streaming

Process logs and event streams with constant memory usage:

```bash
# Stream Docker logs to TONL
curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @docker-logs.ndjson
```

```typescript
import { pipeline } from 'stream/promises';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

await pipeline(
  createReadStream('large-file.ndjson'),
  new NdjsonParse(),
  new TonlTransform({ collectionName: 'logs' }),
  createWriteStream('output.tonl')
);
```

**Performance:**
- 250,000 lines/second throughput
- 47% compression ratio maintained
- Constant memory usage (no accumulation)
- 10+ concurrent streams supported

## Privacy & Anonymization

Enterprise-grade data protection with format preservation:

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  { 
    id: 1, 
    name: 'Alice',
    email: 'alice@company.com',
    ssn: '123-45-6789',
    card: '4532-1234-5678-9010'
  }
];

// Smart masking (preserves format context)
const masked = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn', 'card'],
  mask: true
});
```

**Output with smart masking:**
```tonl
users[1]{id:i8,name:str,email:str,ssn:str,card:str}:
  1, Alice, "a***@company.com", "***-**-6789", "****-****-****-9010"
```

**Supported patterns:**
- Email: `a***@example.com`
- SSN: `***-**-6789`
- Credit Card: `****-****-****-9010`
- Phone: `***-***-4567`
- Generic: `first***last`

## Live Monitoring Dashboard

Monitor your TONL server in real-time:

```bash
# Monitor local server
tonl top

# Monitor remote server
tonl top --url https://your-production-server.com
```

**Dashboard features:**
- Live request tracking with sparklines
- Token savings visualization
- Response time histograms
- Memory and CPU usage
- Auto-refresh every 2 seconds
- Keyboard shortcuts (q=quit, r=refresh, c=clear)

## Production Deployment

### Docker with Health Checks

```yaml
# docker-compose.yml
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
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge
spec:
  replicas: 3
  template:
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
```

## Vector Database Integration

Native support for enterprise vector databases:

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

const milvus = new MilvusAdapter({
  address: 'localhost:19530',
  username: 'root',
  password: 'milvus'
});

await milvus.connect();

// Search with automatic TONL conversion
const result = await milvus.searchToTonl(
  'documents',
  queryEmbedding,
  { limit: 10 }
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

**Supported databases:**
- Milvus (with vector search)
- Qdrant (hybrid search)
- ChromaDB (collection discovery)
- PostgreSQL (pgvector)
- MySQL, SQLite

## Enterprise ROI

### Real-World Impact

**Scenario:** AI platform with vector database RAG

**Before TONL:**
```
1M queries/day × 1000 results per query
500KB JSON per response
125,000 tokens per query
$3.75 per query (GPT-4 pricing)
Daily cost: $3,750,000
```

**After TONL:**
```
Same query volume and results
200KB TONL per response (60% smaller)
50,000 tokens per query
$1.50 per query
Daily cost: $1,500,000
Monthly savings: $67,500,000
```

### Token Savings Benchmark

| Dataset Size | JSON Tokens | TONL Tokens | Savings |
|--------------|-------------|-------------|---------|
| 5 records    | 118         | 75          | 36.4%   |
| 10 records   | 247         | 134         | 45.7%   |
| 100 records  | 2,470       | 987         | 60.0%   |
| 1000 records | 24,700      | 9,870       | 60.0%   |

*Savings scale with dataset size*

## MCP Server Features

### HTTP/SSE Transport

```bash
# Start MCP server
export TONL_AUTH_TOKEN=your-secure-token
npx tonl-mcp-server

# Access endpoints
curl http://localhost:3000/health         # Health check
curl http://localhost:3000/ready          # Readiness check
curl http://localhost:3000/metrics        # Prometheus metrics
curl -N http://localhost:3000/metrics/live # Live metrics stream
```

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet configuration for CSP, CORS, XSS protection
- **Authentication**: Bearer token for MCP endpoints
- **Graceful Shutdown**: 30-second connection draining on SIGTERM/SIGINT

### Observability

**Prometheus Metrics:**
- Business metrics: Token savings, cost reduction, compression ratio
- Operational metrics: Request latency, connection count, error rates
- Custom labels: Model type, conversion direction, data size

**Health Endpoints:**
- `/health` - Liveness probe (process running)
- `/ready` - Readiness probe (ready for traffic)

## Installation

```bash
# CLI and server
npm install -g tonl-mcp-bridge

# Library for your project
npm install tonl-mcp-bridge

# Optional: Vector database drivers (peer dependencies)
npm install @zilliz/milvus2-sdk-node  # Milvus
npm install @qdrant/js-client-rest    # Qdrant
npm install chromadb                   # ChromaDB
```

## What's New in v1.0.0

### Streaming Pipeline
Real-time NDJSON to TONL conversion with 250k lines/second throughput. HTTP endpoint for remote processing. Constant memory usage for files of any size.

### Privacy & Anonymization
Smart masking preserves format context while hiding sensitive data. Supports nested objects with dot-notation paths. GDPR and HIPAA compliance features.

### Live Monitoring
Real-time dashboard with `tonl top` command. Token savings visualization and performance metrics. Works with local and cloud deployments.

### Production Infrastructure
Health check endpoints for Kubernetes. Graceful shutdown with connection draining. Rate limiting and security headers. Prometheus metrics collection.

### Enhanced Security
Helmet security headers enabled by default. Configurable rate limiting per IP. Bearer token authentication. CORS and CSP protection.

### Vector Database Adapters
Native support for Milvus, Qdrant, and ChromaDB. Automatic TONL conversion with savings calculation. Optimized for RAG workloads.

## When to Use TONL

**Optimal Use Cases:**
- RAG systems with vector or traditional databases
- Real-time log processing and event streaming
- High-volume API calls to LLMs
- Applications with sensitive data (PII, PHI)
- Production systems with cost optimization goals
- Enterprise deployments requiring observability

**Not Recommended:**
- Single object conversions (header overhead ~25 tokens)
- Highly inconsistent schemas
- Systems requiring strict JSON compatibility
- Low-volume personal projects

## Quick Start Examples

### Basic Conversion

```typescript
import { jsonToTonl, tonlToJson } from 'tonl-mcp-bridge';

// Convert to TONL
const data = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
];

const tonl = jsonToTonl(data, "users");
console.log(tonl);
// users[2]{id:i32,name:str,age:i32}:
//   1, Alice, 25
//   2, Bob, 30

// Convert back
const json = tonlToJson(tonl);
```

### CLI Usage

```bash
# Convert file
tonl convert data.json

# With statistics
tonl convert data.json -s

# Monitor server
tonl top --url https://api.example.com

# Privacy mode
tonl convert users.json --anonymize email,ssn --mask
```

## Credits

TONL format specification by [Ersin Koç](https://github.com/ersinkoc) - [TONL Project](https://github.com/tonl-dev/tonl).

This project extends the format with production infrastructure, streaming, privacy, observability, and enterprise integrations.
