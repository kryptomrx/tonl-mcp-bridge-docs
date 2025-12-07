# Quick Start

Get started with TONL in 5 minutes. Choose your path based on your use case.

## Choose Your Starting Point

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">

**🚀 Just Getting Started?**
Start here if you're new to TONL
→ [Basic Conversion](#basic-conversion)

**💾 Using a Database?**
RAG systems, vector stores
→ [Database Integration](#database-integration)

**📊 Processing Logs?**
Real-time streaming
→ [Streaming](#streaming)

**🔒 Need Privacy?**
PII/PHI anonymization
→ [Privacy & Compliance](#privacy-compliance)

**⚡ Want CLI Tools?**
File conversion, analysis
→ [CLI Usage](#cli-usage)

**🐳 Ready to Deploy?**
Production deployment
→ [MCP Server](#mcp-server)

</div>

---

## Basic Conversion

### Your First Conversion

```typescript
import { jsonToTonl, tonlToJson } from 'tonl-mcp-bridge';

const users = [
  { id: 1, name: "Alice", age: 25, email: "alice@example.com" },
  { id: 2, name: "Bob", age: 30, email: "bob@example.com" }
];

// Convert to TONL
const tonl = jsonToTonl(users, "users");
console.log(tonl);
// users[2]{id:i32,name:str,age:i32,email:str}:
//   1, Alice, 25, alice@example.com
//   2, Bob, 30, bob@example.com

// Convert back to JSON
const json = tonlToJson(tonl);
console.log(json); // Original array restored
```

### With LLM (OpenAI Example)

```typescript
import OpenAI from 'openai';
import { jsonToTonl } from 'tonl-mcp-bridge';

const openai = new OpenAI();

// Your data
const products = await db.query('SELECT * FROM products LIMIT 100');

// Convert to TONL (saves 40-60% tokens)
const tonl = jsonToTonl(products, 'products');

// Use in prompt
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `Product catalog:\n${tonl}`
    },
    {
      role: "user",
      content: "Which products are under $50?"
    }
  ]
});
```

**✅ Result:** Same answer, 40-60% fewer tokens, lower cost.

---

## Database Integration

### RAG with Vector Databases

**Milvus:**
```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

const milvus = new MilvusAdapter({
  address: 'localhost:19530'
});

await milvus.connect();

// Search with automatic TONL conversion
const result = await milvus.searchToTonl(
  'documents',
  queryEmbedding,
  { limit: 10 }
);

console.log(result.tonl); // Ready for LLM
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

**Qdrant:**
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge/sdk/vector';

const qdrant = new QdrantAdapter({
  host: 'localhost',
  port: 6333
});

await qdrant.connect();

const result = await qdrant.searchToTonl(
  'knowledge_base',
  queryVector,
  { limit: 5 }
);
```

**ChromaDB:**
```typescript
import { ChromaAdapter } from 'tonl-mcp-bridge/sdk/vector';

const chroma = new ChromaAdapter({
  host: 'localhost',
  port: 8000
});

await chroma.connect();

const result = await chroma.searchToTonl(
  'documents',
  embedding,
  { limit: 10 }
);
```

### SQL Databases

**PostgreSQL:**
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge/sdk/sql';

const db = new PostgresAdapter({
  host: 'localhost',
  database: 'myapp',
  user: 'admin',
  password: 'secret'
});

await db.connect();

const result = await db.queryToTonl(
  'SELECT * FROM orders WHERE date > $1',
  'orders',
  ['2024-01-01']
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

**SQLite (In-Memory):**
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge/sdk/sql';

const db = new SQLiteAdapter(':memory:');
await db.connect();

// Perfect for testing/prototyping
const result = await db.queryToTonl(
  'SELECT * FROM users',
  'users'
);
```

---

## Streaming

### Real-Time Log Processing

**Stream 1GB+ files with constant memory:**

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

await pipeline(
  createReadStream('app-logs.ndjson'),      // Input
  new NdjsonParse({ skipInvalid: true }),   // Parse NDJSON
  new TonlTransform({ collectionName: 'logs' }), // Convert to TONL
  createWriteStream('logs.tonl')            // Output
);

// 250,000 lines/second
// Constant memory (processes line-by-line)
// 47% compression maintained
```

### HTTP Streaming Endpoint

**Server side:**
```bash
# Start MCP server
tonl-mcp-server
```

**Client side:**
```bash
# Stream via HTTP
curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @huge-file.ndjson \
  -o output.tonl

# Process 10GB file without loading into memory
```

### Docker Logs Example

```bash
# Stream Docker container logs
docker logs -f mycontainer 2>&1 | \
  jq -c '. | {timestamp, level, message}' | \
  curl -X POST http://localhost:3000/stream/convert \
    -H "Content-Type: application/x-ndjson" \
    --data-binary @- > container-logs.tonl
```

---

## Privacy & Compliance

### Smart Masking (Format-Preserving)

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@company.com',
    ssn: '123-45-6789',
    card: '4532-1234-5678-9010'
  }
];

// Smart masking preserves format
const masked = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn', 'card'],
  mask: true
});

console.log(masked);
// users[1]{id:i32,name:str,email:str,ssn:str,card:str}:
//   1, "Alice Johnson", "a***@company.com", "***-**-6789", "****-****-****-9010"
```

### Simple Redaction

```typescript
const redacted = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn', 'card']
  // mask: false (default)
});

// Output: [REDACTED] for all anonymized fields
```

### Nested Objects

```typescript
const data = [{
  user: {
    profile: {
      email: 'alice@example.com',
      billing: {
        card: '4532-1234-5678-9010'
      }
    }
  }
}];

// Use dot-notation paths
const safe = jsonToTonl(data, 'users', {
  anonymize: [
    'user.profile.email',
    'user.profile.billing.card'
  ],
  mask: true
});
```

### GDPR/HIPAA Example

```typescript
// Anonymize before sending to LLM
const patientData = await db.query('SELECT * FROM patients');

const anonymized = jsonToTonl(patientData, 'patients', {
  anonymize: [
    'name',
    'ssn',
    'email',
    'phone',
    'address',
    'insurance_id'
  ],
  mask: true
});

// Safe to use in LLM prompts - PII protected
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: `Patient data (anonymized):\n${anonymized}`
  }]
});
```

---

## CLI Usage

### File Conversion

```bash
# Convert single file
tonl convert data.json

# With token statistics
tonl convert data.json -s

# Anonymize fields
tonl convert users.json --anonymize email,ssn --mask

# Custom collection name
tonl convert orders.json --name orders

# Specify output
tonl convert input.json output.tonl
```

### Analyze Token Usage

```bash
# Visual dashboard (interactive)
tonl analyze data.json --visual

# Generate report
tonl analyze data.json --format markdown > report.md
tonl analyze data.json --format csv > results.csv

# Batch analysis
tonl analyze data/*.json --format json

# Different currencies
tonl analyze data.json --currency EUR --visual
```

### Calculate ROI

```bash
# From percentage
tonl roi --savings 45 --queries-per-day 1000

# From exact tokens
tonl roi --tokens-before 1500 --tokens-after 750 --queries-per-day 5000

# Different models
tonl roi --savings 50 --queries-per-day 2000 --model claude-4

# Marketing summary
tonl roi --savings 60 --queries-per-day 10000 --summary
```

### Batch Operations

```bash
# Convert multiple files
tonl batch "data/*.json" -s

# Watch for changes
tonl watch "data/*.json" --name events

# Stream from stdin
cat logs.ndjson | tonl stream > output.tonl
```

### Monitor Server

```bash
# Real-time dashboard (like htop)
tonl top

# Monitor remote server
tonl top --url https://api.production.com

# Custom refresh interval
tonl top --interval 5000
```

---

## MCP Server

### Start Server

**Development (auto-generates session tokens):**
```bash
tonl-mcp-server
# ⚠️  Security: Development mode (Auto-generated session tokens)
# 💡 Set TONL_AUTH_TOKEN for production use
```

**Production (with authentication):**
```bash
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)
tonl-mcp-server
# 🔒 Security: Enabled (Bearer Token required)
```

### Docker Deployment

```bash
docker run -d \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=your-secure-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
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
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
```

### Available Endpoints

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3000/ready

# Prometheus metrics
curl http://localhost:3000/metrics

# Live monitoring (requires auth)
curl -N -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/metrics/live

# Streaming conversion
curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @logs.ndjson
```

---

## Common Patterns

### RAG Pipeline (Complete Example)

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';
import { OpenAI } from 'openai';

const milvus = new MilvusAdapter({ address: 'localhost:19530' });
const openai = new OpenAI();

await milvus.connect();

async function search(query: string) {
  // 1. Create embedding
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  
  // 2. Search vector DB (automatic TONL conversion)
  const result = await milvus.searchToTonl(
    'knowledge_base',
    embedding.data[0].embedding,
    { limit: 5 }
  );
  
  console.log(`Token savings: ${result.stats.savingsPercent}%`);
  
  // 3. Use TONL in LLM prompt
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Context:\n${result.tonl}`
      },
      {
        role: 'user',
        content: query
      }
    ]
  });
  
  return completion.choices[0].message.content;
}

const answer = await search('How do I deploy to Kubernetes?');
console.log(answer);
```

### Privacy-First RAG

```typescript
// Combine vector search with privacy
const result = await milvus.searchToTonl(
  'user_documents',
  embedding,
  { limit: 10 }
);

// Anonymize before sending to LLM
const safe = jsonToTonl(result.data, 'context', {
  anonymize: ['email', 'phone', 'ssn', 'address'],
  mask: true
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'system',
    content: `Context (PII anonymized):\n${safe}`
  }]
});
```

---

## Next Steps

**Learn More:**
- [TONL Format](/guide/tonl-format) - Format specification
- [Type System](/guide/type-system) - How type optimization works
- [Token Savings](/guide/token-savings) - Deep dive into savings

**Integration Guides:**
- [Vector Databases](/guide/milvus) - Milvus, Qdrant, ChromaDB
- [SQL Databases](/guide/postgres) - PostgreSQL, MySQL, SQLite
- [Streaming](/guide/streaming) - Real-time processing
- [Privacy](/guide/privacy) - GDPR/HIPAA compliance

**Production:**
- [Docker Deployment](/guide/docker)
- [Kubernetes](/guide/kubernetes)
- [Security Best Practices](/guide/security)
- [Monitoring](/guide/live-monitoring)

**API Reference:**
- [Core API](/api/core)
- [Streaming API](/api/streaming)
- [Privacy API](/api/privacy)
- [Vector Adapters](/api/vector)

---

## Need Help?

- **GitHub:** [Issues & Discussions](https://github.com/kryptomrx/tonl-mcp-bridge/issues)
- **Documentation:** [Full Docs](https://tonl-mcp-bridge-docs.vercel.app/)
- **Examples:** [Real-World Examples](/examples/sqlite)
- **CLI Help:** `tonl help`
