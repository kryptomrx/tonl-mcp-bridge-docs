# Batch Operations

Execute multiple queries in parallel with aggregate statistics.

## Overview

Batch operations allow you to execute multiple database queries simultaneously and get combined token statistics. This is more efficient than running queries sequentially.

## Basic Usage
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter(config);
await db.connect();

const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' },
  { sql: 'SELECT * FROM products', name: 'products' }
], { model: 'gpt-5' });

console.log(`Total queries: ${results.aggregate.totalQueries}`);
console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);
console.log(`Average savings: ${results.aggregate.savingsPercent}%`);

await db.disconnect();
```

## Result Structure

### Individual Results
```typescript
results.results.forEach((result, index) => {
  console.log(`Query ${index + 1}:`);
  console.log(`  Rows: ${result.rowCount}`);
  console.log(`  Saved: ${result.stats.savedTokens} tokens`);
  console.log(`  Savings: ${result.stats.savingsPercent}%`);
  console.log(`  TONL: ${result.tonl.substring(0, 100)}...`);
});
```

### Aggregate Statistics
```typescript
const agg = results.aggregate;

console.log(`Total queries executed: ${agg.totalQueries}`);
console.log(`Total rows returned: ${agg.totalRows}`);
console.log(`Original token count: ${agg.totalOriginalTokens}`);
console.log(`TONL token count: ${agg.totalCompressedTokens}`);
console.log(`Tokens saved: ${agg.savedTokens}`);
console.log(`Savings percentage: ${agg.savingsPercent}%`);
```

## Real-World Example

From production testing (PostgreSQL):
```typescript
const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users LIMIT 10', name: 'users' },
  { sql: 'SELECT * FROM products LIMIT 5', name: 'products' },
  { sql: 'SELECT * FROM orders LIMIT 10', name: 'orders' }
]);
```

Results:
- Total queries: 3
- Total rows: 25
- Original tokens: 937
- TONL tokens: 487
- Saved: 450 tokens (48%)

## Parallel Execution

Batch operations execute in parallel by default:
```typescript
// These run simultaneously
const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM large_table_1', name: 'table1' },
  { sql: 'SELECT * FROM large_table_2', name: 'table2' },
  { sql: 'SELECT * FROM large_table_3', name: 'table3' }
]);
```

Execution time: ~time of slowest query (not sum of all queries)

## Use Cases

### Dashboard Data Loading
```typescript
async function loadDashboard() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: 'SELECT COUNT(*) as total FROM users WHERE active = true',
      name: 'active_users'
    },
    {
      sql: `SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM orders 
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)`,
      name: 'weekly_orders'
    },
    {
      sql: 'SELECT SUM(amount) as revenue FROM orders WHERE status = ?',
      name: 'total_revenue'
    }
  ]);
  
  await db.disconnect();
  return results;
}
```

### Report Generation
```typescript
async function generateReport(date: string) {
  const db = new MySQLAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: `SELECT user_id, COUNT(*) as order_count 
            FROM orders 
            WHERE DATE(created_at) = ? 
            GROUP BY user_id 
            ORDER BY order_count DESC 
            LIMIT 10`,
      name: 'top_users'
    },
    {
      sql: `SELECT product_id, SUM(quantity) as total_sold 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE DATE(o.created_at) = ?
            GROUP BY product_id
            ORDER BY total_sold DESC
            LIMIT 10`,
      name: 'top_products'
    },
    {
      sql: `SELECT status, COUNT(*) as count 
            FROM orders 
            WHERE DATE(created_at) = ?
            GROUP BY status`,
      name: 'order_status'
    }
  ]);
  
  console.log(`Report generated with ${results.aggregate.savingsPercent}% token savings`);
  
  await db.disconnect();
  return results;
}
```

### Multi-Tenant Data Fetch
```typescript
async function getTenantData(tenantIds: number[]) {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const queries = tenantIds.map(id => ({
    sql: 'SELECT * FROM tenant_data WHERE tenant_id = ?',
    name: `tenant_${id}`
  }));
  
  const results = await db.batchQueryWithStats(queries);
  
  await db.disconnect();
  return results;
}
```

## Performance Characteristics

Batch operations are faster than sequential queries:

### Sequential
```typescript
// Total time: ~450ms
const users = await db.query('SELECT * FROM users');      // 150ms
const orders = await db.query('SELECT * FROM orders');    // 150ms
const products = await db.query('SELECT * FROM products'); // 150ms
```

### Batch
```typescript
// Total time: ~150ms (parallelized)
const results = await db.batchQuery([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' },
  { sql: 'SELECT * FROM products', name: 'products' }
]);
```

## Database Compatibility

Works with all SQL adapters:
- PostgreSQL
- MySQL
- SQLite

## Model Selection

Specify tokenizer model:
```typescript
const results = await db.batchQueryWithStats(queries, { 
  model: 'claude-4-opus' 
});
```

Available models:
- gpt-5
- gpt-4
- claude-4-opus
- claude-4-sonnet
- gemini-2.5-pro
- gemini-2.5-flash

## Error Handling

Individual query failures don't stop batch execution:
```typescript
try {
  const results = await db.batchQueryWithStats(queries);
} catch (error) {
  console.error('Batch execution failed:', error);
  // All queries failed
}
```

For partial failure handling:
```typescript
const results = await Promise.allSettled(
  queries.map(q => db.queryWithStats(q.sql, q.name))
);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Query ${index}: Success`);
  } else {
    console.error(`Query ${index}: Failed - ${result.reason}`);
  }
});
```

## Best Practices

1. **Group similar queries** for consistent performance
2. **Limit result sets** to avoid memory issues
3. **Use connection pooling** for high concurrency
4. **Monitor aggregate stats** to track savings
5. **Handle errors gracefully** for production systems

## Limitations

- All queries must use same database connection
- Memory usage scales with result set size
- Very large batches may exhaust connection pool
- Consider pagination for large datasets