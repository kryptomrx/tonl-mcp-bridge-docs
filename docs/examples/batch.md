# Batch Query Examples

Efficient multi-query execution with aggregate statistics.

## Basic Batch Execution
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter(config);
await db.connect();

const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' },
  { sql: 'SELECT * FROM products', name: 'products' }
], { model: 'gpt-5' });

console.log(`Executed ${results.aggregate.totalQueries} queries`);
console.log(`Retrieved ${results.aggregate.totalRows} rows`);
console.log(`Saved ${results.aggregate.savedTokens} tokens`);
console.log(`Average savings: ${results.aggregate.savingsPercent}%`);

await db.disconnect();
```

Output:
```
Executed 3 queries
Retrieved 25 rows
Saved 450 tokens
Average savings: 48%
```

---

## Dashboard Data Loading

Load multiple widgets in parallel:
```typescript
async function loadDashboard(userId: number) {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: `SELECT COUNT(*) as total, 
                   SUM(amount) as revenue
            FROM orders 
            WHERE user_id = $1 AND status = 'completed'`,
      name: 'order_stats'
    },
    {
      sql: `SELECT DATE(created_at) as date, 
                   COUNT(*) as count
            FROM orders
            WHERE user_id = $1 
              AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date`,
      name: 'daily_orders'
    },
    {
      sql: `SELECT product_id, 
                   COUNT(*) as purchase_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = $1
            GROUP BY product_id
            ORDER BY purchase_count DESC
            LIMIT 5`,
      name: 'top_products'
    }
  ]);
  
  console.log(`Dashboard loaded: ${results.aggregate.savingsPercent}% token savings`);
  
  await db.disconnect();
  return results;
}
```

---

## Analytics Report

Generate comprehensive reports:
```typescript
async function generateWeeklyReport() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const results = await db.batchQueryWithStats([
    {
      sql: `SELECT COUNT(*) as new_users
            FROM users
            WHERE created_at >= $1`,
      name: 'new_users'
    },
    {
      sql: `SELECT status, COUNT(*) as count
            FROM orders
            WHERE created_at >= $1
            GROUP BY status`,
      name: 'order_status'
    },
    {
      sql: `SELECT DATE(created_at) as date,
                   SUM(amount) as revenue
            FROM orders
            WHERE created_at >= $1
              AND status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY date`,
      name: 'daily_revenue'
    },
    {
      sql: `SELECT category,
                   COUNT(*) as sales,
                   SUM(amount) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= $1
            GROUP BY category
            ORDER BY revenue DESC`,
      name: 'category_performance'
    }
  ]);
  
  console.log('Weekly Report Generated');
  console.log(`Total data points: ${results.aggregate.totalRows}`);
  console.log(`Token efficiency: ${results.aggregate.savingsPercent}%`);
  console.log(`Cost saved: ${results.aggregate.savedTokens} tokens`);
  
  await db.disconnect();
  return results;
}
```

---

## Multi-Tenant Data Fetch

Query data for multiple tenants:
```typescript
async function getTenantAnalytics(tenantIds: number[]) {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const queries = tenantIds.map(id => ({
    sql: `SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(amount) as total_revenue
          FROM orders
          WHERE tenant_id = ${id}
            AND created_at > NOW() - INTERVAL '30 days'`,
    name: `tenant_${id}`
  }));
  
  const results = await db.batchQueryWithStats(queries);
  
  console.log(`Analyzed ${tenantIds.length} tenants`);
  console.log(`Aggregate savings: ${results.aggregate.savingsPercent}%`);
  
  await db.disconnect();
  return results;
}

// Usage
const analytics = await getTenantAnalytics([101, 102, 103, 104, 105]);
```

---

## Performance Comparison

Compare sequential vs batch:
```typescript
import { performance } from 'perf_hooks';

const db = new PostgresAdapter(config);
await db.connect();

// Sequential execution
console.log('Sequential execution:');
const start1 = performance.now();

const users = await db.queryWithStats('SELECT * FROM users', 'users');
const orders = await db.queryWithStats('SELECT * FROM orders', 'orders');
const products = await db.queryWithStats('SELECT * FROM products', 'products');

const end1 = performance.now();
console.log(`Time: ${(end1 - start1).toFixed(2)}ms`);
console.log(`Total rows: ${users.rowCount + orders.rowCount + products.rowCount}`);

// Batch execution
console.log('\nBatch execution:');
const start2 = performance.now();

const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' },
  { sql: 'SELECT * FROM products', name: 'products' }
]);

const end2 = performance.now();
console.log(`Time: ${(end2 - start2).toFixed(2)}ms`);
console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Speedup: ${((end1 - start1) / (end2 - start2)).toFixed(2)}x`);

await db.disconnect();
```

Output:
```
Sequential execution:
Time: 450.23ms
Total rows: 25

Batch execution:
Time: 152.45ms
Total rows: 25
Speedup: 2.95x
```

---

## Error Handling

Handle individual query failures:
```typescript
async function safeBatchQuery() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const queries = [
    { sql: 'SELECT * FROM users', name: 'users' },
    { sql: 'SELECT * FROM invalid_table', name: 'error' },
    { sql: 'SELECT * FROM products', name: 'products' }
  ];
  
  try {
    const results = await db.batchQueryWithStats(queries);
    console.log('All queries succeeded');
  } catch (error) {
    console.error('Batch failed:', error.message);
    
    // Execute individually to identify failure
    for (const query of queries) {
      try {
        await db.queryWithStats(query.sql, query.name);
        console.log(`✓ ${query.name}`);
      } catch (err) {
        console.error(`✗ ${query.name}: ${err.message}`);
      }
    }
  }
  
  await db.disconnect();
}
```

---

## Conditional Execution

Execute based on analysis:
```typescript
async function smartBatch() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const queries = [
    { sql: 'SELECT * FROM large_table_1', name: 'table1' },
    { sql: 'SELECT * FROM large_table_2', name: 'table2' },
    { sql: 'SELECT * FROM large_table_3', name: 'table3' }
  ];
  
  // Analyze each query first
  const analyses = await Promise.all(
    queries.map(q => db.analyzeQuery(q.sql, q.name))
  );
  
  // Filter to queries that benefit from TONL
  const worthwhile = queries.filter((q, i) => 
    analyses[i].recommendation === 'use-tonl'
  );
  
  console.log(`Executing ${worthwhile.length} of ${queries.length} with TONL`);
  
  const results = await db.batchQueryWithStats(worthwhile);
  
  await db.disconnect();
  return results;
}
```

---

## Scheduled Jobs

Daily aggregation job:
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily aggregation...');
  
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const results = await db.batchQueryWithStats([
    {
      sql: `INSERT INTO daily_stats (date, metric, value)
            SELECT CURRENT_DATE, 'total_orders', COUNT(*)
            FROM orders
            WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`,
      name: 'orders_count'
    },
    {
      sql: `INSERT INTO daily_stats (date, metric, value)
            SELECT CURRENT_DATE, 'total_revenue', SUM(amount)
            FROM orders
            WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
              AND status = 'completed'`,
      name: 'revenue_sum'
    },
    {
      sql: `INSERT INTO daily_stats (date, metric, value)
            SELECT CURRENT_DATE, 'new_users', COUNT(*)
            FROM users
            WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`,
      name: 'users_count'
    }
  ]);
  
  console.log(`Aggregation complete: ${results.aggregate.totalRows} records`);
  
  await db.disconnect();
});
```

---

## API Endpoint

Express API with batch queries:
```typescript
import express from 'express';
import { PostgresAdapter } from 'tonl-mcp-bridge';

const app = express();
const db = new PostgresAdapter(config);

app.get('/api/dashboard/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  try {
    const results = await db.batchQueryWithStats([
      {
        sql: 'SELECT * FROM user_profile WHERE id = $1',
        name: 'profile'
      },
      {
        sql: 'SELECT * FROM user_orders WHERE user_id = $1 LIMIT 10',
        name: 'recent_orders'
      },
      {
        sql: 'SELECT * FROM user_notifications WHERE user_id = $1 AND read = false',
        name: 'unread_notifications'
      }
    ]);
    
    res.json({
      data: results.results,
      stats: {
        queries: results.aggregate.totalQueries,
        rows: results.aggregate.totalRows,
        tokensSaved: results.aggregate.savedTokens,
        savingsPercent: results.aggregate.savingsPercent
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, async () => {
  await db.connect();
  console.log('Server running on port 3000');
});
```