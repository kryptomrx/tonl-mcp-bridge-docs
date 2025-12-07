# ChromaDB Integration

Native TONL support for ChromaDB vector database.

## Overview

ChromaDB is an open-source embedding database focused on simplicity and developer experience. The TONL-MCP Bridge provides native integration with automatic TONL conversion for search results.

**Features:**
- Collection discovery and management
- Vector similarity search with TONL conversion
- Metadata filtering
- Local and cloud deployments
- Built-in token statistics

## Installation

```bash
# Install ChromaDB peer dependency
npm install chromadb

# Or globally with CLI
npm install -g tonl-mcp-bridge chromadb
```

## Quick Start

```typescript
import { ChromaAdapter } from 'tonl-mcp-bridge/sdk/vector';

const chroma = new ChromaAdapter({
  host: 'localhost',
  port: 8000
});

await chroma.connect();

// Search with TONL conversion
const result = await chroma.searchToTonl(
  'documents',
  queryEmbedding,
  { limit: 10 }
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

## Configuration

### Constructor Options

```typescript
interface ChromaAdapterConfig {
  host?: string;     // Default: 'localhost'
  port?: number;     // Default: 8000
  ssl?: boolean;     // Default: false
  auth?: {
    provider: 'token' | 'basic';
    credentials: string | { username: string; password: string };
  };
}
```

### Examples

**Local ChromaDB:**
```typescript
const chroma = new ChromaAdapter({
  host: 'localhost',
  port: 8000
});
```

**Cloud Deployment:**
```typescript
const chroma = new ChromaAdapter({
  host: 'api.trychroma.com',
  port: 443,
  ssl: true,
  auth: {
    provider: 'token',
    credentials: process.env.CHROMA_API_KEY
  }
});
```

**Docker:**
```typescript
const chroma = new ChromaAdapter({
  host: 'chroma',  // Docker service name
  port: 8000
});
```

## Core Operations

### Connect

```typescript
await chroma.connect();
```

### List Collections

```typescript
const collections = await chroma.listCollections();

console.log(collections);
// ['documents', 'products', 'users']
```

### Create Collection

```typescript
await chroma.createCollection('documents', {
  metadata: {
    description: 'Document embeddings',
    created: new Date().toISOString()
  }
});
```

### Get Collection Info

```typescript
const info = await chroma.getCollectionInfo('documents');

console.log(info);
// {
//   name: 'documents',
//   metadata: { ... },
//   count: 1000
// }
```

### Delete Collection

```typescript
await chroma.deleteCollection('documents');
```

## Vector Search

### Basic Search

```typescript
const results = await chroma.search(
  'documents',
  queryEmbedding,
  { limit: 10 }
);

console.log(results);
// [
//   {
//     id: 'doc1',
//     distance: 0.85,
//     metadata: { title: 'Getting Started' },
//     document: 'This is a guide...'
//   },
//   ...
// ]
```

### Search with TONL Conversion

```typescript
const result = await chroma.searchToTonl(
  'documents',
  queryEmbedding,
  { 
    limit: 10,
    collectionName: 'search_results'
  }
);

console.log(result.tonl);
// search_results[10]{id:str,distance:f32,title:str,document:str}:
//   doc1, 0.85, "Getting Started", "This is a guide..."
//   ...

console.log(result.stats);
// {
//   originalTokens: 500,
//   compressedTokens: 275,
//   savedTokens: 225,
//   savingsPercent: 45.0
// }
```

### Search Options

```typescript
interface SearchOptions {
  limit?: number;              // Number of results (default: 10)
  where?: Record<string, any>; // Metadata filter
  whereDocument?: Record<string, any>; // Document filter
  include?: ('documents' | 'metadatas' | 'distances')[];
}
```

### Metadata Filtering

```typescript
const results = await chroma.searchToTonl(
  'documents',
  queryEmbedding,
  {
    limit: 5,
    where: {
      category: 'tutorial',
      published: { $gte: '2024-01-01' }
    }
  }
);
```

### Document Filtering

```typescript
const results = await chroma.searchToTonl(
  'documents',
  queryEmbedding,
  {
    limit: 5,
    whereDocument: {
      $contains: 'kubernetes'
    }
  }
);
```

## Insert Documents

### Add Single Document

```typescript
await chroma.add('documents', {
  id: 'doc1',
  embedding: [0.1, 0.2, 0.3, ...],
  metadata: {
    title: 'Getting Started',
    category: 'tutorial',
    published: '2024-01-01'
  },
  document: 'This is a guide to getting started...'
});
```

### Add Multiple Documents

```typescript
await chroma.addBatch('documents', [
  {
    id: 'doc1',
    embedding: [...],
    metadata: { title: 'Guide 1' },
    document: 'Content 1'
  },
  {
    id: 'doc2',
    embedding: [...],
    metadata: { title: 'Guide 2' },
    document: 'Content 2'
  }
]);
```

## Update & Delete

### Update Document

```typescript
await chroma.update('documents', 'doc1', {
  metadata: { category: 'advanced' },
  document: 'Updated content...'
});
```

### Delete Documents

```typescript
// Delete by ID
await chroma.delete('documents', ['doc1', 'doc2']);

// Delete by metadata
await chroma.delete('documents', {
  where: { category: 'draft' }
});
```

## Complete Example

### RAG Pipeline with ChromaDB

```typescript
import { ChromaAdapter } from 'tonl-mcp-bridge/sdk/vector';
import { OpenAI } from 'openai';

const chroma = new ChromaAdapter({
  host: 'localhost',
  port: 8000
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

await chroma.connect();

// 1. Create embeddings for query
async function search(query: string) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  
  const queryEmbedding = embedding.data[0].embedding;
  
  // 2. Search ChromaDB with TONL conversion
  const result = await chroma.searchToTonl(
    'knowledge_base',
    queryEmbedding,
    { 
      limit: 5,
      collectionName: 'context'
    }
  );
  
  // 3. Use TONL context with LLM
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Answer using this context:\n${result.tonl}`
      },
      {
        role: 'user',
        content: query
      }
    ]
  });
  
  console.log(`Token savings: ${result.stats.savingsPercent}%`);
  console.log(`Answer: ${completion.choices[0].message.content}`);
}

await search('How do I deploy to Kubernetes?');
```

## Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'
services:
  chromadb:
    image: ghcr.io/chroma-core/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER=chromadb.auth.token.TokenConfigServerAuthCredentialsProvider
      - CHROMA_SERVER_AUTH_CREDENTIALS=your-token
      - CHROMA_SERVER_AUTH_TOKEN_TRANSPORT_HEADER=X-Chroma-Token

  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    ports:
      - "3000:3000"
    environment:
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
    depends_on:
      - chromadb

volumes:
  chroma-data:
```

## Performance Optimization

### Batch Operations

```typescript
// Insert in batches for better performance
const batchSize = 100;
for (let i = 0; i < documents.length; i += batchSize) {
  const batch = documents.slice(i, i + batchSize);
  await chroma.addBatch('documents', batch);
}
```

### Connection Pooling

```typescript
// Reuse adapter instance
const chroma = new ChromaAdapter({ host: 'localhost' });
await chroma.connect();

// Use for multiple operations
await chroma.search(...);
await chroma.search(...);
await chroma.search(...);

// Close when done
await chroma.disconnect();
```

### Index Optimization

ChromaDB automatically optimizes indices, but you can:

```typescript
// Create collection with specific distance metric
await chroma.createCollection('documents', {
  metadata: {
    'hnsw:space': 'cosine'  // or 'l2', 'ip'
  }
});
```

## Monitoring

### Track Token Savings

```typescript
let totalSavings = 0;
let queryCount = 0;

async function searchWithTracking(query: string, embedding: number[]) {
  const result = await chroma.searchToTonl('documents', embedding, { limit: 10 });
  
  totalSavings += result.stats.savingsPercent;
  queryCount++;
  
  const avgSavings = totalSavings / queryCount;
  console.log(`Average token savings: ${avgSavings.toFixed(2)}%`);
  
  return result;
}
```

### Performance Metrics

```typescript
async function searchWithMetrics(query: string, embedding: number[]) {
  const start = Date.now();
  
  const result = await chroma.searchToTonl('documents', embedding, { limit: 10 });
  
  const duration = Date.now() - start;
  
  console.log({
    duration: `${duration}ms`,
    results: result.tonl.split('\n').length - 1,
    tokensSaved: result.stats.savedTokens,
    compressionRatio: result.stats.savingsPercent
  });
  
  return result;
}
```

## Troubleshooting

### Connection Issues

```typescript
try {
  await chroma.connect();
} catch (error) {
  console.error('Connection failed:', error.message);
  // Check:
  // 1. ChromaDB is running
  // 2. Host/port are correct
  // 3. Network connectivity
  // 4. Authentication credentials
}
```

### Empty Results

```typescript
const results = await chroma.search('documents', embedding, { limit: 10 });

if (results.length === 0) {
  // Check:
  // 1. Collection exists
  const collections = await chroma.listCollections();
  console.log('Available collections:', collections);
  
  // 2. Collection has documents
  const info = await chroma.getCollectionInfo('documents');
  console.log('Document count:', info.count);
  
  // 3. Embedding dimension matches
  // 4. Search filters are not too restrictive
}
```

### Performance Issues

```bash
# Check ChromaDB logs
docker logs chromadb

# Monitor resource usage
docker stats chromadb

# Check collection size
curl http://localhost:8000/api/v1/collections/documents
```

## Best Practices

1. **Use Batch Operations**
   - Insert multiple documents at once
   - Reduces network overhead

2. **Filter Wisely**
   - Use metadata filters to reduce search space
   - Balance between accuracy and performance

3. **Monitor Token Savings**
   - Track savings per query
   - Identify optimization opportunities

4. **Connection Management**
   - Reuse adapter instances
   - Close connections when done

5. **Collection Design**
   - Separate collections by use case
   - Use meaningful metadata

6. **Error Handling**
   - Always wrap operations in try-catch
   - Implement retry logic for transient failures

## See Also

- [Milvus Integration](/guide/milvus) - Alternative vector DB
- [Qdrant Integration](/guide/qdrant) - Hybrid search
- [Vector Adapters API](/api/vector) - API reference
- [Privacy & Compliance](/guide/privacy) - Data anonymization
- [Streaming](/guide/streaming) - Large dataset processing
