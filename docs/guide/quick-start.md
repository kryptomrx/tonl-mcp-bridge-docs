# Quick Start

Get started with TONL in minutes.

## Basic Conversion

Convert JSON arrays to TONL:
```typescript
import { jsonToTonl, tonlToJson } from 'tonl-mcp-bridge';

const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
];

// Convert to TONL
const tonl = jsonToTonl(users, "users");
console.log(tonl);

// Convert back to JSON
const json = tonlToJson(tonl);
console.log(json);
```

## Token Statistics

Calculate token savings:
```typescript
import { calculateRealSavings } from 'tonl-mcp-bridge';

const jsonStr = JSON.stringify(users);
const tonlStr = jsonToTonl(users);

const stats = calculateRealSavings(jsonStr, tonlStr, 'gpt-5');

console.log(`Original: ${stats.originalTokens} tokens`);
console.log(`TONL: ${stats.compressedTokens} tokens`);
console.log(`Saved: ${stats.savedTokens} tokens`);
console.log(`Savings: ${stats.savingsPercent}%`);
```

## Database Integration

### SQLite (In-Memory)

Perfect for testing and prototyping:
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

const db = new SQLiteAdapter(':memory:');
await db.connect();

// Create table
await db.query(`
  CREATE TABLE users (id INT, name TEXT, age INT)
`);

// Insert data
await db.query(`
  INSERT INTO users VALUES (1, 'Alice', 25), (2, 'Bob', 30)
`);

// Query with TONL conversion and stats
const result = await db.queryWithStats(
  'SELECT * FROM users',
  'users',
  { model: 'gpt-5' }
);

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);

await db.disconnect();
```

### PostgreSQL

Production database integration:
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'admin',
  password: 'secret'
});

await db.connect();

const result = await db.queryWithStats(
  'SELECT * FROM orders WHERE status = $1',
  'orders',
  { model: 'gpt-5' }
);

console.log(`Retrieved ${result.rowCount} orders`);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);

await db.disconnect();
```

## CLI Usage

Convert files from command line:
```bash
# Single file
tonl convert data.json

# With statistics
tonl convert data.json -s

# Batch conversion
tonl batch "data/*.json" -s

# Watch mode
tonl watch "data/*.json"
```

## Next Steps

Learn more about:
- [TONL Format](/guide/tonl-format) - Format specification
- [Type System](/guide/type-system) - Type optimization
- [Database Adapters](/guide/sqlite) - Detailed adapter guides
- [API Reference](/api/core) - Complete API documentation