# Milvus Integration

Milvus adapter for vector similarity search with automatic TONL conversion.

## Connection

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

const milvus = new MilvusAdapter({
  address: 'localhost:19530',
  username: 'root',
  password: 'milvus'
});

await milvus.connect();
```

## Configuration Options

- `address` (string) - Milvus server address
- `username` (string, optional) - Authentication username
- `password` (string, optional) - Authentication password
- `ssl` (boolean, optional) - Enable SSL/TLS
- `token` (string, optional) - API token

## Creating Collections

```typescript
await milvus.createCollection(
  'documents',
  1536,  // dimension
  'L2'   // metric type: L2, IP, or COSINE
);
```

## Inserting Data

```typescript
const vectors = [
  {
    vector: [0.1, 0.2, ...], // 1536 dimensions
    text: 'Document content',
    metadata: { source: 'file.pdf', page: 1 }
  }
];

await milvus.insert('documents', vectors);
```

## Vector Search

### Basic Search

```typescript
const results = await milvus.search(
  'documents',
  queryVector,
  {
    limit: 10,
    filter: 'metadata["source"] == "file.pdf"'
  }
);
```

### Search with TONL Conversion

```typescript
const result = await milvus.searchToTonl(
  'documents',
  queryVector,
  { limit: 10 }
);

console.log(result.tonl);
console.log(`Token savings: ${result.stats.savingsPercent}%`);
```

### Search with Statistics

```typescript
const result = await milvus.searchWithStats(
  'documents',
  queryVector,
  {
    limit: 10,
    model: 'gpt-4'
  }
);

console.log(result.stats.originalTokens);
console.log(result.stats.compressedTokens);
console.log(result.stats.savingsPercent);
```

## Search Options

- `limit` (number) - Maximum results (default: 10)
- `filter` (string) - Filter expression
- `outputFields` (string[]) - Fields to return (default: all)
- `consistencyLevel` (string) - Consistency level:
  - `"Strong"` - Highest consistency
  - `"Bounded"` - Bounded staleness
  - `"Session"` - Session consistency (default)
  - `"Eventually"` - Eventual consistency

## Filter Expressions

Milvus uses Boolean expressions for filtering:

```typescript
// Exact match
filter: 'metadata["category"] == "technical"'

// Numeric comparison
filter: 'score > 0.8'

// Logical operators
filter: 'category == "technical" && score > 0.8'

// IN operator
filter: 'category in ["technical", "product"]'
```

## Error Handling

```typescript
try {
  await milvus.connect();
  const results = await milvus.search('collection', vector);
} catch (error) {
  console.error('Milvus operation failed:', error.message);
} finally {
  await milvus.disconnect();
}
```

## Connection Management

```typescript
// Check connection status
if (milvus.isConnected()) {
  // Perform operations
}

// Disconnect
await milvus.disconnect();
```

## Performance Considerations

- Use appropriate consistency levels based on requirements
- Batch insert operations for better throughput
- Filter at query time when possible
- Consider index types for different use cases

## Example: RAG Pipeline

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

async function search(query: string) {
  const milvus = new MilvusAdapter({
    address: 'localhost:19530'
  });
  
  await milvus.connect();
  
  // Get query embedding (using your embedding model)
  const queryVector = await getEmbedding(query);
  
  // Search with TONL conversion
  const result = await milvus.searchToTonl(
    'documents',
    queryVector,
    { limit: 5 }
  );
  
  // Use compressed results in LLM prompt
  const prompt = `Context:\n${result.tonl}\n\nQuestion: ${query}`;
  
  await milvus.disconnect();
  
  return { prompt, stats: result.stats };
}
```

## Compatibility

Requires Milvus 2.3 or later. Tested with:
- Milvus 2.3.x
- Milvus 2.4.x

Uses `@zilliz/milvus2-sdk-node` for communication.