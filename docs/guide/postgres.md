# PostgreSQL

Production-grade PostgreSQL adapter with connection pooling.

## Installation

Install PostgreSQL driver:
```bash
npm install pg
npm install tonl-mcp-bridge
```

## Configuration
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'admin',
  password: 'your-password'
});

await db.connect();
```

## Connection Pooling

Built-in connection pooling (10 connections default):
```typescript
const db = new PostgresAdapter({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'admin',
  password: 'password',
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

## Query Execution

### Parameterized Queries
```typescript
const result = await db.query(
  'SELECT * FROM users WHERE age > $1 AND status = $2',
  [25, 'active']
);
```

### With TONL Conversion
```typescript
const result = await db.queryWithStats(
  'SELECT * FROM orders WHERE created_at > $1',
  'orders',
  { model: 'gpt-5' }
);

console.log(`Retrieved ${result.rowCount} orders`);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

## Batch Operations

Process multiple queries efficiently:
```typescript
const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' },
  { sql: 'SELECT * FROM products', name: 'products' }
], { model: 'gpt-5' });

console.log(`Total queries: ${results.aggregate.totalQueries}`);
console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);
console.log(`Average savings: ${results.aggregate.savingsPercent}%`);
```

## Query Analysis

Analyze before execution:
```typescript
const analysis = await db.analyzeQuery(
  'SELECT * FROM large_table',
  'data'
);

console.log(`Estimated rows: ${analysis.estimatedRows}`);
console.log(`JSON tokens: ${analysis.estimatedJsonTokens}`);
console.log(`TONL tokens: ${analysis.estimatedTonlTokens}`);
console.log(`Savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Cost impact: ${analysis.costImpact}`);

if (analysis.recommendation === 'use-tonl') {
  const result = await db.queryToTonl(sql, name);
}
```

## Schema Monitoring

Track production schema changes:
```typescript
// Initial baseline
await db.trackSchema('users');

// Daily check
const drift = await db.detectSchemaDrift('users');

if (drift.hasChanged) {
  console.log(`Schema drift detected on users table`);
  console.log(`New columns: ${drift.newColumns.join(', ')}`);
  console.log(`Removed: ${drift.removedColumns.join(', ')}`);
  console.log(`Savings impact: ${drift.savingsImpact}%`);
  
  if (Math.abs(drift.savingsImpact) > 10) {
    // Alert team
    console.warn(drift.recommendation);
  }
  
  await db.updateSchemaBaseline('users');
}
```

## Production Examples

### RAG System Integration
```typescript
async function retrieveContext(query: string) {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  try {
    const result = await db.queryWithStats(
      `SELECT id, content, metadata 
       FROM documents 
       WHERE content ILIKE $1 
       LIMIT 10`,
      'documents'
    );
    
    return {
      context: result.tonl,
      tokensSaved: result.stats.savedTokens
    };
  } finally {
    await db.disconnect();
  }
}
```

### Analytics Pipeline
```typescript
async function dailyReport() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: `SELECT * FROM daily_stats 
            WHERE date = CURRENT_DATE`,
      name: 'daily_stats'
    },
    {
      sql: `SELECT * FROM user_activity 
            WHERE date = CURRENT_DATE`,
      name: 'user_activity'
    }
  ]);
  
  console.log(`Report cost: ${results.aggregate.savedTokens} tokens saved`);
  
  await db.disconnect();
}
```

## Connection Management

### Automatic Reconnection

The adapter handles connection drops automatically.

### Graceful Shutdown
```typescript
process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});
```

### Health Checks
```typescript
if (db.isConnected()) {
  // Database ready
}
```

## Best Practices

1. **Use connection pooling** for concurrent requests
2. **Parameterize queries** to prevent SQL injection
3. **Monitor schema drift** in production
4. **Analyze queries** before deploying
5. **Close connections** properly
6. **Use transactions** for multi-step operations

## Performance Tuning

### Indexes
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### Query Optimization
```typescript
// Inefficient
const all = await db.query('SELECT * FROM users');

// Efficient
const needed = await db.query(
  'SELECT id, name, email FROM users WHERE active = true'
);
```

### Batch Size
```typescript
// Process in chunks
const limit = 100;
const offset = 0;

const result = await db.queryWithStats(
  `SELECT * FROM logs 
   ORDER BY created_at DESC 
   LIMIT ${limit} OFFSET ${offset}`,
  'logs'
);
```

## Troubleshooting

### Connection Timeout
Increase timeout:
```typescript
connectionTimeoutMillis: 5000
```

### Pool Exhaustion
Increase pool size:
```typescript
max: 30
```

### Slow Queries
Use query analysis:
```typescript
const analysis = await db.analyzeQuery(sql);
if (analysis.estimatedRows > 10000) {
  // Consider pagination
}
```