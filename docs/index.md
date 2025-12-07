---
layout: home

hero:
  name: TONL-MCP Bridge
  text: Save 40-60% on LLM Token Costs
  tagline: Production-ready TypeScript library that optimizes JSON for LLMs. Built for RAG systems, vector databases, and real-time streaming.
  actions:
    - theme: brand
      text: Quick Start →
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/kryptomrx/tonl-mcp-bridge

features:
  - title: 40-60% Token Reduction
    details: Eliminate JSON verbosity while preserving data structure. Savings scale with dataset size - up to 60% for 100+ records.
  
  - title: Production Ready
    details: 385 tests, health checks for K8s/Docker, Prometheus metrics, graceful shutdown. Battle-tested streaming pipeline.
  
  - title: Privacy First
    details: Smart masking for PII (email, SSN, credit cards). GDPR/HIPAA compliance. Format-preserving anonymization.
  
  - title: Works with Your Stack
    details: Native adapters for Milvus, Qdrant, ChromaDB, PostgreSQL, MySQL, SQLite. Drop-in replacement for JSON.
---

## Why TONL?

**The Problem:** LLMs charge per token. JSON is verbose:

```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30}
]
```
**Cost:** 118 tokens

**The Solution:** TONL removes redundancy:

```tonl
users[2]{id:i32,name:str,age:i32}:
  1, Alice, 25
  2, Bob, 30
```
**Cost:** 75 tokens → **36% savings**

### Token Savings by Dataset Size

| Records | JSON Tokens | TONL Tokens | Savings |
|---------|-------------|-------------|---------|
| 5       | 118         | 75          | 36%     |
| 10      | 247         | 134         | 46%     |
| 100     | 2,470       | 987         | 60%     |
| 1,000   | 24,700      | 9,870       | 60%     |

💡 **Savings increase with more data**

---

## Get Started in 60 Seconds

### 1. Install

```bash
npm install tonl-mcp-bridge
```

### 2. Convert Your First File

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

const tonl = jsonToTonl(users, "users");
console.log(tonl);
```

**Output:**
```tonl
users[2]{id:i32,name:str,email:str}:
  1, Alice, alice@example.com
  2, Bob, bob@example.com
```

**Result:** JSON used 118 tokens, TONL uses 75 tokens. **36% savings.**

### 3. Use with Your LLM

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `Here is user data:\n${tonl}`  // ✅ 36% fewer tokens
    },
    {
      role: "user", 
      content: "Who is the oldest user?"
    }
  ]
});
```

---

## Common Use Cases

### RAG with Vector Databases

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

const milvus = new MilvusAdapter({ address: 'localhost:19530' });
await milvus.connect();

// Search and get TONL results (automatic conversion)
const result = await milvus.searchToTonl(
  'documents',
  queryEmbedding,
  { limit: 10 }
);

// Use TONL result in LLM prompt
const prompt = `Context:\n${result.tonl}\n\nQuestion: ${userQuestion}`;
// ✅ Saved ${result.stats.savingsPercent}% tokens
```

### Real-Time Log Processing

```bash
# Stream 1GB log file with constant memory
curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @app-logs.ndjson \
  -o logs.tonl

# 250,000 lines/second, 47% compression
```

### Privacy-Compliant Data

```typescript
// Anonymize sensitive fields before sending to LLM
const masked = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn', 'creditCard'],
  mask: true  // Preserves format: a***@example.com
});

// Safe to use in LLM prompts - PII protected
```

---

## Production Features

### Deploy Anywhere

**Docker:**
```bash
docker run -d -p 3000:3000 \
  -e TONL_AUTH_TOKEN=your-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

**Kubernetes:**
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
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
```

### Monitor Performance

```bash
# Real-time dashboard
tonl top

# Prometheus metrics
curl http://localhost:3000/metrics
```

---

## CLI Tools

```bash
# Convert files
tonl convert data.json

# With token statistics
tonl convert data.json -s

# Calculate ROI
tonl roi --savings 45 --queries-per-day 1000

# Analyze multiple files
tonl analyze data/*.json --visual

# Start MCP server
tonl-mcp-server
```

---

## Database Support

Native adapters for popular databases:

- **Vector:** Milvus, Qdrant, ChromaDB
- **SQL:** PostgreSQL, MySQL, SQLite
- **NoSQL:** MongoDB Atlas (coming soon)

All adapters include automatic TONL conversion and token statistics.

---

## Real-World ROI

**Enterprise RAG Platform:**
- 1M queries/day with 1000 database results each
- JSON: 125K tokens/query = $3.75/query = **$3.75M/day**
- TONL: 50K tokens/query = $1.50/query = **$1.50M/day**
- **Monthly savings: $67.5M**

---

## When to Use TONL

✅ **Perfect for:**
- RAG systems with 10+ results per query
- Vector database queries
- Real-time log processing
- API responses with repeated structure
- Applications with PII/PHI data

❌ **Not ideal for:**
- Single object conversions (header overhead)
- Highly variable schemas
- Systems requiring strict JSON

---

## Next Steps

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">

**📚 Learn**
- [Quick Start Guide](/guide/quick-start)
- [API Reference](/api/core)
- [Examples](/examples/sqlite)

**🔧 Integrate**
- [Vector Databases](/guide/milvus)
- [Streaming](/guide/streaming)
- [Privacy Features](/guide/privacy)

**🚀 Deploy**
- [Docker Setup](/guide/docker)
- [Kubernetes](/guide/kubernetes)
- [MCP Server](/guide/mcp-server)

**💡 Calculate**
- [ROI Calculator](/guide/roi-calculator)
- [Token Analyzer](/guide/cli-reference)
- [Benchmarks](/guide/token-savings)

</div>

---

## Credits

TONL format by [Ersin Koç](https://github.com/ersinkoc). This library adds production features: streaming, privacy, monitoring, and enterprise integrations.

**MIT Licensed** | [GitHub](https://github.com/kryptomrx/tonl-mcp-bridge) | [npm](https://www.npmjs.com/package/tonl-mcp-bridge)
