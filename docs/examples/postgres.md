# PostgreSQL Examples

Production examples with PostgreSQL.

## Basic Connection
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter({
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  database: 'myapp',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

await db.connect();

const result = await db.queryWithStats(
  'SELECT * FROM users WHERE active = true',
  'users'
);

console.log(`Retrieved ${result.rowCount} users`);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);

await db.disconnect();
```

---

## Production Setup
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 20,                    // Connection pool size
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000
});

await db.connect();

// Verify connection
if (db.isConnected()) {
  console.log('Database connected');
}
```

---

## Parameterized Queries

Prevent SQL injection:
```typescript
const userId = 123;
const status = 'pending';

const result = await db.queryWithStats(
  'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
  'orders',
  { model: 'gpt-5' }
);

console.log(result.tonl);
```

---

## Batch Operations

Execute multiple queries efficiently:
```typescript
const results = await db.batchQueryWithStats([
  {
    sql: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL \'7 days\'',
    name: 'recent_users'
  },
  {
    sql: 'SELECT * FROM orders WHERE status = \'pending\'',
    name: 'pending_orders'
  },
  {
    sql: 'SELECT * FROM products WHERE stock < 10',
    name: 'low_stock'
  }
]);

console.log(`Total queries: ${results.aggregate.totalQueries}`);
console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);

results.results.forEach((r, i) => {
  console.log(`Query ${i + 1}: ${r.rowCount} rows, ${r.stats?.savingsPercent}% saved`);
});
```

---

## Query Analysis

Pre-execution cost analysis:
```typescript
const sql = `
  SELECT u.*, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.created_at > $1
  GROUP BY u.id
`;

const analysis = await db.analyzeQuery(sql, 'users');

console.log(`Estimated rows: ${analysis.estimatedRows}`);
console.log(`Potential savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Cost per call: ${analysis.costImpact}`);
console.log(`Recommendation: ${analysis.recommendation}`);

if (analysis.recommendation === 'use-tonl') {
  const result = await db.queryToTonl(sql, 'users');
}
```

---

## Schema Monitoring

Track production schema changes:
```typescript
// Daily schema check
async function checkSchema() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const tables = ['users', 'orders', 'products'];
  
  for (const table of tables) {
    const drift = await db.detectSchemaDrift(table);
    
    if (drift.hasChanged) {
      console.log(`[${table}] Schema changed`);
      console.log(`  New columns: ${drift.newColumns}`);
      console.log(`  Removed: ${drift.removedColumns}`);
      console.log(`  Impact: ${drift.savingsImpact}%`);
      
      if (Math.abs(drift.savingsImpact) > 10) {
        await sendAlert({
          table,
          impact: drift.savingsImpact,
          recommendation: drift.recommendation
        });
      }
      
      await db.updateSchemaBaseline(table);
    }
  }
  
  await db.disconnect();
}

// Run daily
setInterval(checkSchema, 24 * 60 * 60 * 1000);
```

---

## RAG System Integration
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';
import OpenAI from 'openai';

const openai = new OpenAI();
const db = new PostgresAdapter(config);

async function ragQuery(question: string) {
  await db.connect();
  
  // Search relevant documents
  const result = await db.queryWithStats(
    `SELECT id, content, metadata
     FROM documents
     WHERE content ILIKE $1
     ORDER BY relevance DESC
     LIMIT 5`,
    'documents',
    { model: 'gpt-5' }
  );
  
  console.log(`Retrieved ${result.rowCount} documents`);
  console.log(`Saved ${result.stats.savedTokens} tokens`);
  
  // Use TONL context in prompt
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Answer based on this context:\n' + result.tonl
      },
      {
        role: 'user',
        content: question
      }
    ]
  });
  
  await db.disconnect();
  return completion.choices[0].message.content;
}
```

---

## Transaction Management
```typescript
const db = new PostgresAdapter(config);
await db.connect();

try {
  await db.query('BEGIN');
  
  await db.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [100, 1]
  );
  
  await db.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [100, 2]
  );
  
  await db.query(
    'INSERT INTO transactions (from_account, to_account, amount) VALUES ($1, $2, $3)',
    [1, 2, 100]
  );
  
  await db.query('COMMIT');
  console.log('Transaction completed');
} catch (error) {
  await db.query('ROLLBACK');
  console.error('Transaction failed:', error);
}

await db.disconnect();
```

---

## Pagination

Handle large result sets:
```typescript
const pageSize = 100;
let offset = 0;

while (true) {
  const result = await db.queryWithStats(
    `SELECT * FROM logs
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    'logs',
    { model: 'gpt-5' }
  );
  
  if (result.rowCount === 0) break;
  
  console.log(`Page ${offset / pageSize + 1}: ${result.rowCount} rows`);
  console.log(`Saved: ${result.stats.savingsPercent}%`);
  
  offset += pageSize;
}
```

---

## Error Handling
```typescript
import { DatabaseError } from 'tonl-mcp-bridge';

try {
  await db.connect();
  const result = await db.query('SELECT * FROM users');
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
    console.error('Query:', error.query);
    
    if (error.originalError) {
      console.error('Original:', error.originalError);
    }
  } else {
    console.error('Unexpected error:', error);
  }
} finally {
  await db.disconnect();
}
```

---

## Connection Pooling
```typescript
// Shared connection pool
const db = new PostgresAdapter({
  ...config,
  max: 50,  // 50 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

await db.connect();

// Concurrent requests use pool
await Promise.all([
  db.query('SELECT * FROM users'),
  db.query('SELECT * FROM orders'),
  db.query('SELECT * FROM products')
]);

await db.disconnect();
```