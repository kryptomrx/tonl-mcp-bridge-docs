# Vector Adapters

API reference for vector database adapters.

## BaseVectorAdapter

Abstract base class for vector database adapters.

### Methods

#### connect

Connect to vector database.
```typescript
abstract connect(): Promise<void>
```

#### disconnect

Disconnect from vector database.
```typescript
abstract disconnect(): Promise<void>
```

#### isConnected

Check connection status.
```typescript
isConnected(): boolean
```

---

## QdrantAdapter

Qdrant vector database adapter.

### Constructor
```typescript
constructor(config?: QdrantConfig)
```

**Configuration:**
```typescript
interface QdrantConfig {
  url?: string;  // Default: 'http://localhost:6333'
}
```

### Example
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge';

const db = new QdrantAdapter({
  url: 'http://localhost:6333'
});

await db.connect();
```

---

### createCollection

Create vector collection.
```typescript
createCollection(
  collectionName: string,
  vectorSize: number
): Promise<void>
```

**Parameters:**

- `collectionName`: Name of collection
- `vectorSize`: Dimension of vectors

**Example:**
```typescript
// For OpenAI text-embedding-3-small (1536 dimensions)
await db.createCollection('documents', 1536);

// For sentence-transformers (384 dimensions)
await db.createCollection('embeddings', 384);
```

---

### deleteCollection

Delete collection.
```typescript
deleteCollection(collectionName: string): Promise<void>
```

**Example:**
```typescript
await db.deleteCollection('old_collection');
```

---

### upsert

Insert or update vectors.
```typescript
upsert(
  collectionName: string,
  points: VectorPoint[]
): Promise<void>
```

**Parameters:**
```typescript
interface VectorPoint {
  id: number | string;
  vector: number[];
  payload?: Record<string, unknown>;
}
```

**Example:**
```typescript
await db.upsert('documents', [
  {
    id: 1,
    vector: [0.1, 0.2, 0.3, ...], // 384 dimensions
    payload: {
      title: 'Getting Started',
      category: 'documentation',
      timestamp: Date.now()
    }
  },
  {
    id: 2,
    vector: [0.2, 0.3, 0.4, ...],
    payload: {
      title: 'Advanced Usage',
      category: 'documentation'
    }
  }
]);
```

---

### search

Search for similar vectors.
```typescript
search(
  collectionName: string,
  queryVector: number[],
  options?: VectorSearchOptions
): Promise<VectorQueryResult>
```

**Options:**
```typescript
interface VectorSearchOptions {
  limit?: number;           // Default: 10
  scoreThreshold?: number;  // Minimum similarity score
  filter?: Filter;          // Payload filter
  offset?: number;          // Pagination offset
}
```

**Filter Structure:**
```typescript
interface Filter {
  must?: Condition[];
  should?: Condition[];
  must_not?: Condition[];
}

interface Condition {
  key: string;
  match: {
    value: string | number | boolean;
  };
}
```

**Returns:**
```typescript
interface VectorQueryResult {
  data: VectorSearchResult[];
  rowCount: number;
}

interface VectorSearchResult {
  id: number | string;
  score: number;
  payload?: Record<string, unknown>;
}
```

**Example:**
```typescript
const queryVector = [0.15, 0.25, 0.35, ...];

const result = await db.search('documents', queryVector, {
  limit: 5,
  scoreThreshold: 0.7,
  filter: {
    must: [
      { key: 'category', match: { value: 'documentation' } }
    ]
  }
});

console.log(`Found ${result.rowCount} documents`);
result.data.forEach(item => {
  console.log(`ID: ${item.id}, Score: ${item.score}`);
  console.log(`Title: ${item.payload?.title}`);
});
```

---

### searchToTonl

Search and convert results to TONL.
```typescript
searchToTonl(
  collectionName: string,
  queryVector: number[],
  options?: VectorSearchOptions
): Promise<VectorTonlResult>
```

**Returns:**
```typescript
interface VectorTonlResult {
  tonl: string;
  rowCount: number;
}
```

**Example:**
```typescript
const result = await db.searchToTonl('documents', queryVector, {
  limit: 10
});

console.log(result.tonl);
// documents[10]{id:i8,score:f32,title:str,category:str}:
//   1, 0.95, Getting Started, documentation
//   2, 0.89, Advanced Usage, documentation
//   ...
```

---

### searchWithStats

Search with token statistics.
```typescript
searchWithStats(
  collectionName: string,
  queryVector: number[],
  options?: VectorSearchOptions & { model?: ModelName }
): Promise<VectorStatsResult>
```

**Returns:**
```typescript
interface VectorStatsResult {
  tonl: string;
  rowCount: number;
  stats: {
    originalTokens: number;
    compressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  };
}
```

**Example:**
```typescript
const result = await db.searchWithStats(
  'documents',
  queryVector,
  {
    limit: 10,
    model: 'gpt-5'
  }
);

console.log(`Found ${result.rowCount} documents`);
console.log(`Original: ${result.stats.originalTokens} tokens`);
console.log(`TONL: ${result.stats.compressedTokens} tokens`);
console.log(`Saved: ${result.stats.savingsPercent}%`);
```

---

## Complete RAG Example
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge';
import OpenAI from 'openai';

const openai = new OpenAI();
const db = new QdrantAdapter();
await db.connect();

// Create collection
await db.createCollection('knowledge_base', 1536);

// Index documents
const documents = [
  { id: 1, text: 'TONL reduces token costs...', category: 'overview' },
  { id: 2, text: 'Install with npm...', category: 'getting-started' }
];

for (const doc of documents) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: doc.text
  });
  
  await db.upsert('knowledge_base', [{
    id: doc.id,
    vector: embedding.data[0].embedding,
    payload: { text: doc.text, category: doc.category }
  }]);
}

// Search
async function search(query: string) {
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  const result = await db.searchWithStats(
    'knowledge_base',
    queryEmbedding.data[0].embedding,
    {
      limit: 5,
      scoreThreshold: 0.7,
      model: 'gpt-5'
    }
  );
  
  console.log(`Saved ${result.stats.savingsPercent}% tokens`);
  return result.tonl;
}

await db.disconnect();
```

---

## Pagination

Handle large result sets:
```typescript
const pageSize = 10;
let offset = 0;

while (true) {
  const result = await db.search('documents', queryVector, {
    limit: pageSize,
    offset: offset
  });
  
  if (result.rowCount === 0) break;
  
  // Process results
  console.log(`Page ${offset / pageSize + 1}: ${result.rowCount} items`);
  
  offset += pageSize;
}
```

---

## Error Handling
```typescript
try {
  await db.connect();
  await db.createCollection('test', 384);
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('Collection exists, continuing...');
  } else {
    throw error;
  }
}
```

---

## Type Safety

Use generics for type-safe payload:
```typescript
interface DocumentPayload {
  title: string;
  category: string;
  timestamp: number;
}

const result = await db.search('documents', queryVector);

result.data.forEach(item => {
  const payload = item.payload as DocumentPayload;
  console.log(payload.title); // Type-safe
});
```