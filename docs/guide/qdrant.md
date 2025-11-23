# Qdrant

Vector database adapter for RAG systems and semantic search.

## Installation

Start Qdrant server:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

Install TONL:
```bash
npm install tonl-mcp-bridge
```

## Configuration
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge';

const db = new QdrantAdapter({
  url: 'http://localhost:6333'
});

await db.connect();
```

## Collection Management

### Create Collection
```typescript
await db.createCollection('documents', 384);
```

Vector dimensions must match your embedding model:
- OpenAI text-embedding-3-small: 1536
- OpenAI text-embedding-3-large: 3072
- Cohere embed-english-v3.0: 1024
- Custom models: varies

### Delete Collection
```typescript
await db.deleteCollection('documents');
```

## Vector Operations

### Insert Vectors
```typescript
const embeddings = await generateEmbeddings(text);

await db.upsert('documents', [
  {
    id: 1,
    vector: embeddings,
    payload: {
      title: 'Introduction to TONL',
      category: 'documentation',
      timestamp: Date.now()
    }
  }
]);
```

### Search Vectors
```typescript
const queryEmbedding = await generateEmbeddings(query);

const result = await db.search(
  'documents',
  queryEmbedding,
  {
    limit: 10,
    scoreThreshold: 0.7
  }
);

console.log(`Found ${result.rowCount} documents`);
```

### Search with TONL Conversion
```typescript
const result = await db.searchWithStats(
  'documents',
  queryEmbedding,
  {
    limit: 10,
    model: 'gpt-5'
  }
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

## Filtering

Filter by payload:
```typescript
const result = await db.search(
  'documents',
  queryEmbedding,
  {
    limit: 10,
    filter: {
      must: [
        { key: 'category', match: { value: 'documentation' } }
      ]
    }
  }
);
```

Complex filters:
```typescript
filter: {
  must: [
    { key: 'category', match: { value: 'technical' } },
    { key: 'status', match: { value: 'published' } }
  ],
  should: [
    { key: 'priority', match: { value: 'high' } }
  ]
}
```

## RAG Integration Example
```typescript
import OpenAI from 'openai';
import { QdrantAdapter } from 'tonl-mcp-bridge';

async function ragQuery(userQuestion: string) {
  const openai = new OpenAI();
  const db = new QdrantAdapter({ url: 'http://localhost:6333' });
  await db.connect();
  
  // Generate query embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userQuestion
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // Search similar documents
  const result = await db.searchWithStats(
    'knowledge_base',
    queryEmbedding,
    {
      limit: 5,
      scoreThreshold: 0.75,
      model: 'gpt-5'
    }
  );
  
  console.log(`Retrieved ${result.rowCount} documents`);
  console.log(`Saved ${result.stats.savedTokens} tokens`);
  
  // Use TONL-formatted context in prompt
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Answer based on this context:\n' + result.tonl
      },
      {
        role: 'user',
        content: userQuestion
      }
    ]
  });
  
  await db.disconnect();
  return completion.choices[0].message.content;
}
```

## Embedding Models

### OpenAI
```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

async function embed(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}
```

### Cohere
```typescript
import cohere from 'cohere-ai';

cohere.init(process.env.COHERE_API_KEY);

async function embed(text: string) {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0'
  });
  return response.body.embeddings[0];
}
```

### Local Models

Use sentence-transformers or similar:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(['Your text here'])
```

## Performance

Qdrant performance characteristics:

- Search latency: < 10ms for 100k vectors
- Throughput: 1000+ searches/sec
- Memory: ~4 bytes per dimension per vector
- Disk: Optional persistence

For 1M vectors (384 dimensions):
- Memory: ~1.5 GB
- Search time: 10-20ms

## Best Practices

1. **Match dimensions** to your embedding model
2. **Use filters** to narrow search space
3. **Set score threshold** to filter low-quality results
4. **Batch inserts** for better performance
5. **Monitor collection size** and optimize

## Production Deployment

### Docker Compose
```yaml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant-data:/qdrant/storage
    environment:
      - QDRANT_ALLOW_RECOVERY=true

volumes:
  qdrant-data:
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        volumeMounts:
        - name: storage
          mountPath: /qdrant/storage
```

## Monitoring

Check collection info:
```typescript
const info = await db.getCollectionInfo('documents');
console.log(`Vectors: ${info.vectors_count}`);
console.log(`Segments: ${info.segments_count}`);
```

## Troubleshooting

### Connection Refused

Verify Qdrant is running:
```bash
curl http://localhost:6333/healthz
```

### Dimension Mismatch

Ensure vector dimensions match collection:
```typescript
// Collection: 384 dimensions
// Vector must be 384 dimensions
```

### Slow Searches

Increase HNSW parameters when creating collection:
```typescript
await db.createCollection('documents', 384, {
  hnsw: {
    m: 16,
    ef_construct: 100
  }
});
```

### Out of Memory

Reduce collection size or increase RAM:
```bash
docker run -m 8g qdrant/qdrant
```