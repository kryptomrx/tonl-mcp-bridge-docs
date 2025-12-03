# MongoDB Atlas Vector Search

MongoDB Atlas provides native vector search capabilities combined with traditional document storage. The TONL-MCP Bridge MongoDB adapter offers advanced features including hybrid search, nested object detection, and ROI calculation.

## Why MongoDB?

- **Most Loved Vector Database** 2024 & 2025 (IDC Research)
- **74% adoption plan** for AI workflows
- **Already installed** by millions of developers
- **Native JSON support** = highest token savings (>60% with nested objects)
- **Zero new dependencies** for most users

## Installation

```bash
npm install tonl-mcp-bridge mongodb
```

## Basic Usage

```typescript
import { MongoDBAdapter } from 'tonl-mcp-bridge';

const adapter = new MongoDBAdapter({
  uri: 'mongodb://localhost:27017',
  database: 'myapp',
  options: {
    maxPoolSize: 10
  }
});

await adapter.connect();

// Vector search
const results = await adapter.search('products', embedding, {
  limit: 10,
  numCandidates: 100
});

await adapter.disconnect();
```

## Advanced Features

### 1. Nested Object Auto-Detection

MongoDB's nested JSON structure can save additional tokens:

```typescript
const { results, tonl, stats } = await adapter.searchWithStats(
  'products',
  embedding,
  { limit: 10 }
);

console.log(`Base savings: ${stats.savingsPercentage}%`);
console.log(`Nested savings: +${stats.nestedAnalysis.additionalSavings}%`);
console.log(`Total: ${stats.totalSavings}%`);

// Example output:
// Base savings: 45%
// Nested savings: +15%
// Total: 60%
```

### 2. Hybrid Search (Vector + Text)

Combine vector similarity with text search:

```typescript
const results = await adapter.hybridSearch('articles', {
  vector: embedding,
  textQuery: 'machine learning',
  vectorWeight: 0.7,  // 70% vector
  textWeight: 0.3,    // 30% text
  limit: 10
});

// Each result includes hybridScore
results.forEach(doc => {
  console.log(`${doc.title}: ${doc.hybridScore}`);
});
```

### 3. Collection Templates

Instant setup with pre-configured templates:

```typescript
// Available templates:
// - 'rag-documents': RAG applications (1536 dims)
// - 'product-catalog': E-commerce search (768 dims)
// - 'user-profiles': User preference matching (512 dims)
// - 'semantic-cache': LLM response caching (1536 dims)

await adapter.createFromTemplate('my_documents', 'rag-documents');

// Template creates:
// - Vector index with optimal settings
// - Filter indexes for common queries
// - Field definitions
```

### 4. Smart Index Recommendations

Analyze your data and get optimization suggestions:

```typescript
const recommendations = await adapter.suggestIndexes('products');

recommendations.forEach(rec => {
  console.log(`${rec.field}: ${rec.type}`);
  console.log(`  Reason: ${rec.reason}`);
  console.log(`  Speedup: ${rec.estimatedSpeedup}`);
});

// Example output:
// embedding: vector
//   Reason: Detected vector field - enable semantic search
//   Speedup: 10-100x faster than full scan
// category: filter
//   Reason: Low cardinality field - good for grouping/filtering
//   Speedup: 3-10x faster queries
```

### 5. Real-Time Cost Calculator

Convert token savings to actual dollars:

```typescript
const { results, tonl, stats } = await adapter.searchWithStats(
  'products',
  embedding
);

const costs = adapter.calculateMonthlyCost(
  stats,
  1000,  // queries per day
  3.0    // cost per 1M tokens (GPT-4o)
);

console.log(costs.monthlySavings);  // "$33.75/month"
console.log(costs.annualSavings);   // "$405.00/year"
```

### 6. Batch Insert with Progress

Insert large datasets efficiently:

```typescript
const documents = [...]; // Your documents

await adapter.insertBatch(
  'products',
  documents,
  (percent) => {
    console.log(`Progress: ${percent}%`);
  },
  { batchSize: 1000 }
);
```

### 7. Query Performance Tracking

Monitor query performance:

```typescript
// Queries are automatically tracked
await adapter.search('products', embedding);
await adapter.search('articles', embedding);

const stats = adapter.getQueryStats();

stats.forEach((stat, collection) => {
  console.log(`${collection}:`);
  console.log(`  Queries: ${stat.count}`);
  console.log(`  Avg time: ${stat.avgTime}ms`);
});

// Slow queries (>1000ms) trigger automatic warnings
```

### 8. Collection Analyzer

Get insights about your collection:

```typescript
const analysis = await adapter.analyzeCollection('products');

console.log('Vector fields:', analysis.vectorFields);
console.log('Text fields:', analysis.textFields);
console.log('Metadata fields:', analysis.metadataFields);
console.log('Estimated TONL savings:', analysis.estimatedSavings + '%');
console.log('Recommended indexes:', analysis.indexRecommendations);
```

## Configuration Options

```typescript
const adapter = new MongoDBAdapter({
  uri: 'mongodb+srv://user:pass@cluster.mongodb.net',
  database: 'mydb',
  options: {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true
  },
  maxRetries: 3,      // Connection retry attempts
  batchSize: 1000     // Default batch size for inserts
});
```

## Search Options

```typescript
await adapter.search('collection', embedding, {
  limit: 10,
  numCandidates: 100,    // Candidates to consider (higher = more accurate)
  indexName: 'vector_index',
  vectorPath: 'embedding',
  exact: false,          // Use ENN (exact) instead of ANN
  preFilter: {           // Pre-filter documents
    category: 'electronics'
  },
  select: ['title', 'price']  // Only return specific fields
});
```

## MongoDB Atlas Setup

1. **Create Cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Vector Index**:
```javascript
{
  "fields": [{
    "type": "vector",
    "path": "embedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

3. **Insert Documents**:
```typescript
await adapter.insert('products', [
  {
    title: "Product 1",
    description: "...",
    embedding: [0.1, 0.2, ...],
    category: "electronics",
    price: 99.99
  }
]);
```

## Best Practices

### 1. Index Strategy
- Always create vector indexes before querying
- Add filter indexes for frequently queried fields
- Use templates for common patterns

### 2. Query Optimization
- Set `numCandidates` to 10-20x your `limit`
- Use pre-filtering to reduce search space
- Monitor slow queries with performance tracking

### 3. Batch Operations
- Use `insertBatch()` for large datasets
- Set appropriate batch sizes (1000 is good default)
- Track progress for long operations

### 4. Connection Management
- Reuse adapter instances across queries
- Use connection pooling (configured in options)
- Call `disconnect()` on shutdown

## MongoDB vs Other Vector DBs

| Feature | MongoDB | Pinecone | Weaviate | Qdrant |
|---------|---------|----------|----------|--------|
| Nested Objects | ✅ Native | ❌ Flat | ❌ Flat | ❌ Flat |
| Hybrid Search | ✅ Built-in | ❌ No | ✅ Yes | ❌ No |
| Already Installed | ✅ Millions | ❌ New | ❌ New | ❌ New |
| Token Savings | >60% | ~35% | ~35% | ~35% |
| Learning Curve | ✅ Low | Medium | Medium | Medium |

## Performance Tips

1. **Increase numCandidates** for better accuracy (but slower):
```typescript
{ numCandidates: limit * 20 }  // More accurate
{ numCandidates: limit * 10 }  // Balanced (default)
{ numCandidates: limit * 5 }   // Faster
```

2. **Use exact search** for small datasets:
```typescript
{ exact: true }  // ENN instead of ANN
```

3. **Pre-filter aggressively**:
```typescript
{ preFilter: { category: 'X', inStock: true } }
```

4. **Monitor with tracking**:
```typescript
adapter.getQueryStats()
adapter.clearQueryStats()  // Reset tracking
```

## Next Steps

- [ROI Calculator Guide](/guide/roi-calculator) - Calculate cost savings
- [API Reference](/api/vector) - Full API documentation
- [Examples](/examples/mongodb) - More code examples
