# Types

TypeScript type definitions.

## Core Types

### TypeName

TONL type identifiers.
```typescript
type TypeName = 
  | 'i8'        // 8-bit integer
  | 'i16'       // 16-bit integer
  | 'i32'       // 32-bit integer
  | 'i64'       // 64-bit integer
  | 'f32'       // 32-bit float
  | 'f64'       // 64-bit float
  | 'str'       // String
  | 'bool'      // Boolean
  | 'date'      // Date (ISO 8601)
  | 'datetime'  // Datetime (ISO 8601)
  | 'null'      // Null value
  | 'obj'       // Nested object
  | 'arr';      // Array
```

### ModelName

Supported LLM models for tokenization.
```typescript
type ModelName = 
  | 'gpt-5'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-4-opus'
  | 'claude-4-sonnet'
  | 'claude-sonnet-4.5'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash';
```

---

## Conversion Types

### ConvertOptions

Options for JSON to TONL conversion.
```typescript
interface ConvertOptions {
  flattenNested?: boolean;
}
```

### TokenSavings

Token statistics.
```typescript
interface TokenSavings {
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercent: number;
}
```

---

## Database Types

### DatabaseConfig

SQL database configuration.
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}
```

### SQLiteConfig

SQLite configuration.
```typescript
interface SQLiteConfig {
  filename: string;
}
```

### QueryResult

Query execution result.
```typescript
interface QueryResult<T = unknown> {
  data: T[];
  rowCount: number;
}
```

### TonlResult

Query with TONL conversion.
```typescript
interface TonlResult {
  tonl: string;
  data: unknown[];
  rowCount: number;
}
```

### StatsResult

Query with token statistics.
```typescript
interface StatsResult {
  tonl: string;
  data: unknown[];
  rowCount: number;
  stats: {
    originalTokens: number;
    compressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  };
}
```

---

## Batch Types

### BatchQuery

Query definition for batch execution.
```typescript
interface BatchQuery {
  sql: string;
  name: string;
}
```

### BatchOptions

Options for batch operations.
```typescript
interface BatchOptions {
  model?: ModelName;
  parallel?: boolean;  // Default: true
}
```

### BatchTonlResult

Result for single query in batch.
```typescript
interface BatchTonlResult {
  tonl: string;
  rowCount: number;
  stats?: {
    originalTokens: number;
    compressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  };
}
```

### BatchStatsResult

Aggregate results for batch.
```typescript
interface BatchStatsResult {
  results: BatchTonlResult[];
  aggregate: {
    totalQueries: number;
    totalRows: number;
    totalOriginalTokens: number;
    totalCompressedTokens: number;
    savedTokens: number;
    savingsPercent: number;
  };
}
```

---

## Analysis Types

### QueryAnalysis

Query analysis result.
```typescript
interface QueryAnalysis {
  estimatedRows: number;
  estimatedJsonTokens: number;
  estimatedTonlTokens: number;
  potentialSavings: number;
  potentialSavingsPercent: number;
  recommendation: 'use-tonl' | 'use-json' | 'marginal';
  costImpact: string;
}
```

---

## Schema Types

### SchemaColumn

Database column definition.
```typescript
interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
}
```

### SchemaBaseline

Captured schema baseline.
```typescript
interface SchemaBaseline {
  tableName: string;
  columns: SchemaColumn[];
  rowCount: number;
  capturedAt: string;  // ISO 8601
}
```

### TypeChange

Schema type change.
```typescript
interface TypeChange {
  column: string;
  oldType: string;
  newType: string;
}
```

### SchemaDrift

Schema drift detection result.
```typescript
interface SchemaDrift {
  hasChanged: boolean;
  newColumns: string[];
  removedColumns: string[];
  typeChanges: TypeChange[];
  rowCountChange: number;
  savingsImpact: number;
  recommendation: string;
}
```

---

## Vector Types

### QdrantConfig

Qdrant configuration.
```typescript
interface QdrantConfig {
  url?: string;  // Default: 'http://localhost:6333'
}
```

### VectorPoint

Vector with payload.
```typescript
interface VectorPoint {
  id: number | string;
  vector: number[];
  payload?: Record<string, unknown>;
}
```

### VectorSearchOptions

Vector search configuration.
```typescript
interface VectorSearchOptions {
  limit?: number;
  scoreThreshold?: number;
  filter?: Filter;
  offset?: number;
  model?: ModelName;
}
```

### Filter

Payload filter for vector search.
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

### VectorSearchResult

Single search result.
```typescript
interface VectorSearchResult {
  id: number | string;
  score: number;
  payload?: Record<string, unknown>;
}
```

### VectorQueryResult

Vector search results.
```typescript
interface VectorQueryResult {
  data: VectorSearchResult[];
  rowCount: number;
}
```

### VectorTonlResult

Vector search with TONL.
```typescript
interface VectorTonlResult {
  tonl: string;
  rowCount: number;
}
```

### VectorStatsResult

Vector search with statistics.
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

---

## Error Types

### DatabaseError

Database operation error.
```typescript
class DatabaseError extends Error {
  query?: string;
  originalError?: unknown;
}
```

### TonlParseError

TONL parsing error.
```typescript
class TonlParseError extends Error {
  position?: number;
  line?: number;
}
```

---

## Usage Examples

### Type Guards
```typescript
function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

try {
  await db.query('SELECT * FROM users');
} catch (error) {
  if (isDatabaseError(error)) {
    console.error('Query failed:', error.query);
  }
}
```

### Generic Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const result = await db.query<User>('SELECT * FROM users');
result.data.forEach(user => {
  console.log(user.name); // Type-safe
});
```

### Type Assertions
```typescript
const result = await db.search('documents', vector);

interface DocPayload {
  title: string;
  category: string;
}

result.data.forEach(item => {
  const doc = item.payload as DocPayload;
  console.log(doc.title);
});
```