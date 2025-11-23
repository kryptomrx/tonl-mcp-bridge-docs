# SQL Adapters

API reference for SQL database adapters.

## BaseAdapter

Abstract base class for all database adapters.

### Methods

#### connect

Connect to database.
```typescript
abstract connect(): Promise<void>
```

#### disconnect

Disconnect from database.
```typescript
abstract disconnect(): Promise<void>
```

#### query

Execute SQL query.
```typescript
query<T = unknown>(sql: string): Promise<QueryResult<T>>
```

**Returns:**
```typescript
interface QueryResult<T = unknown> {
  data: T[];
  rowCount: number;
}
```

#### queryToTonl

Execute query and convert to TONL.
```typescript
queryToTonl(sql: string, name?: string): Promise<TonlResult>
```

**Returns:**
```typescript
interface TonlResult {
  tonl: string;
  data: unknown[];
  rowCount: number;
}
```

#### queryWithStats

Execute query with token statistics.
```typescript
queryWithStats(
  sql: string,
  name?: string,
  options?: { model?: ModelName }
): Promise<StatsResult>
```

**Returns:**
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

#### batchQuery

Execute multiple queries in parallel.
```typescript
batchQuery(queries: BatchQuery[]): Promise<QueryResult[]>
```

**Parameters:**
```typescript
interface BatchQuery {
  sql: string;
  name: string;
}
```

#### batchQueryWithStats

Execute batch with aggregate statistics.
```typescript
batchQueryWithStats(
  queries: BatchQuery[],
  options?: BatchOptions
): Promise<BatchStatsResult>
```

**Returns:**
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

#### analyzeQuery

Analyze query before execution.
```typescript
analyzeQuery(
  sql: string,
  name?: string,
  options?: { model?: ModelName }
): Promise<QueryAnalysis>
```

**Returns:**
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

#### trackSchema

Capture schema baseline.
```typescript
trackSchema(tableName: string): Promise<void>
```

#### detectSchemaDrift

Detect schema changes.
```typescript
detectSchemaDrift(tableName: string): Promise<SchemaDrift>
```

**Returns:**
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

#### updateSchemaBaseline

Update schema baseline.
```typescript
updateSchemaBaseline(tableName: string): Promise<void>
```

#### isConnected

Check connection status.
```typescript
isConnected(): boolean
```

---

## PostgresAdapter

PostgreSQL database adapter.

### Constructor
```typescript
constructor(config: DatabaseConfig)
```

**Configuration:**
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;                    // Pool size (default: 10)
  idleTimeoutMillis?: number;      // Idle timeout (default: 30000)
  connectionTimeoutMillis?: number; // Connection timeout (default: 2000)
}
```

### Example
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'admin',
  password: 'secret',
  max: 20
});

await db.connect();
const result = await db.queryWithStats('SELECT * FROM users', 'users');
await db.disconnect();
```

---

## MySQLAdapter

MySQL and MariaDB database adapter.

### Constructor
```typescript
constructor(config: DatabaseConfig)
```

**Configuration:**
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionLimit?: number;     // Pool size (default: 10)
  queueLimit?: number;          // Queue limit (default: 0)
  waitForConnections?: boolean; // Wait for connections (default: true)
}
```

### Example
```typescript
import { MySQLAdapter } from 'tonl-mcp-bridge';

const db = new MySQLAdapter({
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  user: 'admin',
  password: 'secret'
});

await db.connect();
const result = await db.queryWithStats('SELECT * FROM orders', 'orders');
await db.disconnect();
```

---

## SQLiteAdapter

SQLite database adapter.

### Constructor
```typescript
constructor(filename: string | SQLiteConfig)
```

**Simple:**
```typescript
const db = new SQLiteAdapter(':memory:');
const db = new SQLiteAdapter('./myapp.db');
```

**With Config:**
```typescript
interface SQLiteConfig {
  filename: string;
}
```

### Example
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

// In-memory
const db = new SQLiteAdapter(':memory:');
await db.connect();

// File-based
const dbFile = new SQLiteAdapter('./data.db');
await dbFile.connect();

const result = await db.queryWithStats('SELECT * FROM products', 'products');
await db.disconnect();
```

---

## Error Handling

All adapters throw `DatabaseError` on failures:
```typescript
import { DatabaseError } from 'tonl-mcp-bridge';

try {
  await db.connect();
  const result = await db.query('SELECT * FROM users');
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
    console.error('Query:', error.query);
  }
}
```

---

## Type Safety

All methods support generic types:
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