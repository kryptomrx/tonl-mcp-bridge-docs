# MySQL

Enterprise MySQL and MariaDB adapter with connection pooling.

## Installation

Install MySQL driver:
```bash
npm install mysql2
npm install tonl-mcp-bridge
```

## Configuration
```typescript
import { MySQLAdapter } from 'tonl-mcp-bridge';

const db = new MySQLAdapter({
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  user: 'admin',
  password: 'your-password'
});

await db.connect();
```

## Connection Pooling

Default pool configuration:
```typescript
const db = new MySQLAdapter({
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  user: 'admin',
  password: 'password',
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true
});
```

## Query Execution

### Basic Queries
```typescript
const result = await db.query(
  'SELECT * FROM users WHERE status = ? AND age > ?',
  ['active', 25]
);

console.log(`Found ${result.rowCount} users`);
```

### With TONL Conversion
```typescript
const result = await db.queryWithStats(
  'SELECT * FROM orders WHERE created_at >= ?',
  'orders',
  { model: 'gpt-5' }
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
```

## Batch Operations

Execute multiple queries:
```typescript
const results = await db.batchQueryWithStats([
  { 
    sql: 'SELECT * FROM users WHERE active = 1', 
    name: 'active_users' 
  },
  { 
    sql: 'SELECT * FROM orders WHERE status = "pending"', 
    name: 'pending_orders' 
  },
  { 
    sql: 'SELECT * FROM products WHERE stock > 0', 
    name: 'available_products' 
  }
], { model: 'gpt-5' });

console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);
```

## Query Analysis

Pre-execution analysis:
```typescript
const analysis = await db.analyzeQuery(
  'SELECT * FROM transactions WHERE date >= CURDATE()',
  'transactions'
);

console.log(`Estimated rows: ${analysis.estimatedRows}`);
console.log(`Potential savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Cost per call: ${analysis.costImpact}`);

if (analysis.recommendation === 'use-tonl') {
  const result = await db.queryToTonl(sql, name);
}
```

## Schema Monitoring

Track schema changes:
```typescript
await db.trackSchema('users');

const drift = await db.detectSchemaDrift('users');

if (drift.hasChanged) {
  console.log(`New columns: ${drift.newColumns}`);
  console.log(`Removed columns: ${drift.removedColumns}`);
  console.log(`Type changes: ${JSON.stringify(drift.typeChanges)}`);
  console.log(`Savings impact: ${drift.savingsImpact}%`);
  
  await db.updateSchemaBaseline('users');
}
```

## Production Examples

### E-commerce Integration
```typescript
async function getOrderDetails(orderId: number) {
  const db = new MySQLAdapter(config);
  await db.connect();
  
  try {
    const result = await db.queryWithStats(
      `SELECT o.*, oi.*, p.name as product_name
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = ?`,
      'order_details'
    );
    
    return {
      data: result.tonl,
      saved: result.stats.savedTokens
    };
  } finally {
    await db.disconnect();
  }
}
```

### Analytics Query
```typescript
async function getDailySummary(date: string) {
  const db = new MySQLAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: `SELECT COUNT(*) as total, SUM(amount) as revenue
            FROM orders
            WHERE DATE(created_at) = ?`,
      name: 'revenue'
    },
    {
      sql: `SELECT user_id, COUNT(*) as order_count
            FROM orders
            WHERE DATE(created_at) = ?
            GROUP BY user_id
            ORDER BY order_count DESC
            LIMIT 10`,
      name: 'top_customers'
    }
  ]);
  
  await db.disconnect();
  return results;
}
```

## MariaDB Compatibility

The adapter works with MariaDB:
```typescript
const db = new MySQLAdapter({
  host: 'mariadb-server',
  port: 3306,
  database: 'myapp',
  user: 'admin',
  password: 'password'
});
```

Tested with:
- MySQL 5.7+
- MySQL 8.0+
- MariaDB 10.3+

## Connection Management

### Automatic Reconnection

The adapter handles connection drops.

### Connection State
```typescript
if (db.isConnected()) {
  // Ready to execute queries
}
```

### Graceful Shutdown
```typescript
process.on('SIGINT', async () => {
  await db.disconnect();
  process.exit(0);
});
```

## Best Practices

1. **Use placeholders** for parameters
```typescript
// Good
db.query('SELECT * FROM users WHERE id = ?', [userId]);

// Bad
db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

2. **Limit result sets**
```typescript
db.query('SELECT * FROM logs ORDER BY created_at DESC LIMIT 100');
```

3. **Create indexes**
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

4. **Monitor query performance**
```typescript
const analysis = await db.analyzeQuery(sql);
if (analysis.estimatedRows > 1000) {
  console.warn('Large result set, consider pagination');
}
```

5. **Use transactions**
```typescript
await db.query('START TRANSACTION');
try {
  await db.query('INSERT INTO orders ...');
  await db.query('UPDATE inventory ...');
  await db.query('COMMIT');
} catch (error) {
  await db.query('ROLLBACK');
  throw error;
}
```

## Performance Tuning

### Query Optimization
```typescript
// Inefficient
SELECT * FROM orders;

// Efficient
SELECT id, user_id, total, status FROM orders WHERE status = 'active';
```

### Index Usage
```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 123;
```

### Connection Pool Size
```typescript
// High traffic
connectionLimit: 50

// Low traffic
connectionLimit: 10
```

## Troubleshooting

### Too Many Connections

Increase pool limit or reduce connection lifetime:
```typescript
connectionLimit: 20,
idleTimeout: 60000
```

### Slow Queries

Enable query logging:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Charset Issues

Specify charset:
```typescript
const db = new MySQLAdapter({
  ...config,
  charset: 'utf8mb4'
});
```

### Timezone Handling
```typescript
const db = new MySQLAdapter({
  ...config,
  timezone: 'Z'
});
```