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

### File Analysis

Analyze JSON files for token savings:
```bash
# Basic analysis
tonl analyze data.json

# Visual dashboard
tonl analyze data.json --visual

# Different formats
tonl analyze data.json --format json
tonl analyze data.json --format markdown > report.md
tonl analyze data.json --format csv

# Multi-currency
tonl analyze data.json --currency EUR
tonl analyze data.json --currency JPY --visual

# Export to CSV
tonl analyze data.json --export results.csv

# Batch analysis
tonl analyze "data/*.json" --format csv
```

### File Conversion

Convert files between formats:
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

### ROI Calculator

Calculate cost savings:
```bash
# From percentage
tonl roi --savings 45 --queries-per-day 1000 --model gpt-4o

# From exact tokens
tonl roi --tokens-before 1500 --tokens-after 750 --queries-per-day 5000

# JSON output
tonl roi --savings 50 --queries-per-day 2000 --json

# Marketing summary
tonl roi --savings 60 --queries-per-day 10000 --summary
```

## Next Steps

Learn more about:
- [TONL Format](/guide/tonl-format) - Format specification
- [Type System](/guide/type-system) - Type optimization
- [Database Adapters](/guide/sqlite) - Detailed adapter guides
- [API Reference](/api/core) - Complete API documentation