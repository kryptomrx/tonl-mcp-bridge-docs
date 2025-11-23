# SQLite

SQLite adapter for in-memory and file-based databases.

## Overview

The SQLite adapter provides the fastest way to get started with TONL. No external database server required.

## Installation

SQLite support is built-in:
```bash
npm install tonl-mcp-bridge
```

No additional drivers needed.

## Basic Usage

### In-Memory Database
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

const db = new SQLiteAdapter(':memory:');
await db.connect();

await db.query(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER
  )
`);

await db.query(`
  INSERT INTO users (name, age) VALUES 
    ('Alice', 25),
    ('Bob', 30)
`);

const result = await db.queryWithStats(
  'SELECT * FROM users',
  'users'
);

console.log(result.tonl);
console.log(`Rows: ${result.rowCount}`);
console.log(`Savings: ${result.stats.savingsPercent}%`);

await db.disconnect();
```

### File-Based Database
```typescript
const db = new SQLiteAdapter('./myapp.db');
await db.connect();

// Database persists to disk
await db.query('CREATE TABLE IF NOT EXISTS products ...');
```

## Connection Options
```typescript
const db = new SQLiteAdapter({
  filename: './data.db',
  // Optional: SQLite connection options
});
```

## Query Methods

### Basic Query
```typescript
const result = await db.query('SELECT * FROM users');
console.log(result.data);      // Array of objects
console.log(result.rowCount);  // Number of rows
```

### With TONL Conversion
```typescript
const result = await db.queryToTonl(
  'SELECT * FROM users',
  'users'
);
console.log(result.tonl);      // TONL string
console.log(result.rowCount);
```

### With Statistics
```typescript
const result = await db.queryWithStats(
  'SELECT * FROM users',
  'users',
  { model: 'gpt-5' }
);

console.log(result.stats.originalTokens);
console.log(result.stats.compressedTokens);
console.log(result.stats.savingsPercent);
```

## Batch Operations

Execute multiple queries:
```typescript
const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' }
], { model: 'gpt-5' });

console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);
```

## Query Analysis

Estimate savings before execution:
```typescript
const analysis = await db.analyzeQuery(
  'SELECT * FROM products',
  'products'
);

console.log(`Estimated rows: ${analysis.estimatedRows}`);
console.log(`Potential savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Recommendation: ${analysis.recommendation}`);
```

## Schema Monitoring

Track schema changes:
```typescript
// Capture baseline
await db.trackSchema('users');

// Later, after schema changes
const drift = await db.detectSchemaDrift('users');

if (drift.hasChanged) {
  console.log(`New columns: ${drift.newColumns}`);
  console.log(`Savings impact: ${drift.savingsImpact}%`);
  
  if (drift.savingsImpact > 10) {
    await db.updateSchemaBaseline('users');
  }
}
```

## Use Cases

### Prototyping
In-memory databases for quick testing:
```typescript
const db = new SQLiteAdapter(':memory:');
await db.connect();
// Fast iteration, no cleanup needed
```

### Local Development
File-based persistence:
```typescript
const db = new SQLiteAdapter('./dev.db');
await db.connect();
// Data persists between runs
```

### Embedded Applications
Lightweight storage:
```typescript
const db = new SQLiteAdapter('./app-data.db');
// No server overhead
// Single file deployment
```

## Performance

SQLite is fast for:
- Development and testing
- Small to medium datasets (< 1M rows)
- Read-heavy workloads
- Single-user applications

Limitations:
- No concurrent writes
- Limited scalability
- Not suitable for distributed systems

## Best Practices

1. **Use transactions for bulk inserts**
```typescript
await db.query('BEGIN TRANSACTION');
// Multiple inserts
await db.query('COMMIT');
```

2. **Create indexes for frequent queries**
```typescript
await db.query('CREATE INDEX idx_user_email ON users(email)');
```

3. **Close connections properly**
```typescript
try {
  // Database operations
} finally {
  await db.disconnect();
}
```

4. **Use prepared statements for repeated queries**
```typescript
const sql = 'SELECT * FROM users WHERE age > ? AND active = ?';
await db.query(sql);  // Parameters handled by adapter
```

## Examples

Complete working example:
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

async function main() {
  const db = new SQLiteAdapter(':memory:');
  await db.connect();

  await db.query(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      price REAL,
      stock INTEGER
    )
  `);

  await db.query(`
    INSERT INTO products VALUES
      (1, 'Laptop', 999.99, 50),
      (2, 'Mouse', 29.99, 200),
      (3, 'Keyboard', 79.99, 150)
  `);

  const result = await db.queryWithStats(
    'SELECT * FROM products WHERE stock > 0',
    'products'
  );

  console.log(result.tonl);
  console.log(`Saved ${result.stats.savingsPercent}% tokens`);

  await db.disconnect();
}

main();
```

## Troubleshooting

### Database Locked
SQLite allows only one writer at a time. Ensure proper connection handling.

### File Permissions
Check write permissions for file-based databases:
```bash
ls -la myapp.db
```

### Memory Constraints
In-memory databases consume RAM. For large datasets, use file-based storage.