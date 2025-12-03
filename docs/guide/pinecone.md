# Pinecone

Pinecone is a fully managed vector database service optimized for similarity search at scale. The TONL-MCP Bridge Pinecone adapter provides seamless integration with TONL conversion.

## Installation

```bash
npm install tonl-mcp-bridge @pinecone-database/pinecone
```

## Basic Usage

```typescript
import { PineconeAdapter } from 'tonl-mcp-bridge';

const adapter = new PineconeAdapter({
  apiKey: process.env.PINECONE_API_KEY
});

await adapter.connect();

// Search and convert to TONL
const results = await adapter.search('my-index', embedding, {
  limit: 10,
  includeMetadata: true
});

// With statistics
const { tonl, stats } = await adapter.searchWithStats('my-index', embedding, {
  limit: 10,
  model: 'gpt-4o'
});

console.log(`Saved ${stats.savingsPercent}% tokens`);
console.log(`Cost savings: $${stats.costSavings}/query`);

await adapter.disconnect();
```

## Configuration

```typescript
const adapter = new PineconeAdapter({
  apiKey: 'your-api-key',
  environment: 'us-east-1',  // Optional
  indexHost: 'custom-host'   // Optional
});
```

## Search Options

```typescript
await adapter.search('index-name', embedding, {
  limit: 10,
  includeMetadata: true,   // Include metadata in results
  includeValues: false,    // Include vectors in results
  namespace: 'prod',       // Search specific namespace
  filter: {                // Metadata filtering
    category: { $eq: 'electronics' }
  }
});
```

## Pinecone Setup

1. **Create Index** on [Pinecone Console](https://app.pinecone.io/)

2. **Configure Index**:
   - Dimensions: Match your embedding model (e.g., 1536 for OpenAI)
   - Metric: cosine, euclidean, or dotproduct
   - Pod Type: Choose based on scale

3. **Insert Vectors**:
```typescript
// Use Pinecone SDK directly for upserts
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index('my-index');

await index.upsert([{
  id: 'vec1',
  values: [0.1, 0.2, ...],
  metadata: { title: 'Product 1', category: 'electronics' }
}]);

// Then search with TONL adapter
const adapter = new PineconeAdapter({ apiKey: process.env.PINECONE_API_KEY });
const results = await adapter.searchToTonl('my-index', queryEmbedding);
```

## Best Practices

1. **Use Namespaces** for multi-tenancy
2. **Filter metadata** to reduce search space
3. **Monitor p99 latency** with Pinecone metrics
4. **Use pod-based indexes** for production

## Next Steps

- [API Reference](/api/vector) - Full API documentation
- [MongoDB Guide](/guide/mongodb) - Compare with MongoDB
- [ROI Calculator](/guide/roi-calculator) - Calculate savings
