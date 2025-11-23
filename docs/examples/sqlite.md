# SQLite Examples

Practical examples using SQLite adapter.

## In-Memory Database

Quick prototyping without external dependencies:
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

const db = new SQLiteAdapter(':memory:');
await db.connect();

// Create schema
await db.query(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    active BOOLEAN DEFAULT 1
  )
`);

// Insert data
await db.query(`
  INSERT INTO users (name, email, age, active) VALUES
    ('Alice Johnson', 'alice@example.com', 28, 1),
    ('Bob Smith', 'bob@example.com', 35, 1),
    ('Charlie Davis', 'charlie@example.com', 42, 0)
`);

// Query with TONL conversion
const result = await db.queryWithStats(
  'SELECT * FROM users WHERE active = 1',
  'users'
);

console.log(`Found ${result.rowCount} active users`);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);

await db.disconnect();
```

Output:
```
Found 2 active users
Saved 45.2% tokens
```

---

## File-Based Database

Persistent storage:
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

const db = new SQLiteAdapter('./myapp.db');
await db.connect();

// Check if table exists
const tables = await db.query(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='products'
`);

if (tables.rowCount === 0) {
  await db.query(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    )
  `);
}

// Insert product
await db.query(`
  INSERT INTO products (name, price, stock)
  VALUES ('Laptop', 999.99, 50)
`);

// Query
const result = await db.queryWithStats(
  'SELECT * FROM products WHERE stock > 0',
  'products'
);

console.log(result.tonl);

await db.disconnect();
```

---

## Batch Operations

Process multiple queries:
```typescript
const db = new SQLiteAdapter(':memory:');
await db.connect();

// Setup tables
await db.query('CREATE TABLE users (id INT, name TEXT)');
await db.query('CREATE TABLE orders (id INT, user_id INT, total REAL)');

await db.query("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob')");
await db.query("INSERT INTO orders VALUES (1, 1, 99.99), (2, 1, 149.50)");

// Batch query
const results = await db.batchQueryWithStats([
  { sql: 'SELECT * FROM users', name: 'users' },
  { sql: 'SELECT * FROM orders', name: 'orders' }
]);

console.log(`Total rows: ${results.aggregate.totalRows}`);
console.log(`Total saved: ${results.aggregate.savedTokens} tokens`);

await db.disconnect();
```

---

## Query Analysis

Analyze before execution:
```typescript
const db = new SQLiteAdapter('./data.db');
await db.connect();

const analysis = await db.analyzeQuery(
  'SELECT * FROM large_table',
  'data'
);

console.log(`Rows: ${analysis.estimatedRows}`);
console.log(`Savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Recommendation: ${analysis.recommendation}`);

if (analysis.recommendation === 'use-tonl') {
  const result = await db.queryToTonl(
    'SELECT * FROM large_table',
    'data'
  );
  console.log(result.tonl);
}

await db.disconnect();
```

---

## Schema Tracking

Monitor schema changes:
```typescript
const db = new SQLiteAdapter('./app.db');
await db.connect();

// Initial baseline
await db.trackSchema('users');

// Later, after changes
await db.query('ALTER TABLE users ADD COLUMN status TEXT DEFAULT "active"');

// Detect drift
const drift = await db.detectSchemaDrift('users');

if (drift.hasChanged) {
  console.log(`New columns: ${drift.newColumns.join(', ')}`);
  console.log(`Savings impact: ${drift.savingsImpact}%`);
  
  await db.updateSchemaBaseline('users');
}

await db.disconnect();
```

---

## Testing Setup

Use in-memory for tests:
```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { SQLiteAdapter } from 'tonl-mcp-bridge';

describe('User Service', () => {
  let db: SQLiteAdapter;

  beforeEach(async () => {
    db = new SQLiteAdapter(':memory:');
    await db.connect();
    
    await db.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
  });

  afterEach(async () => {
    await db.disconnect();
  });

  it('should create user', async () => {
    await db.query("INSERT INTO users (name) VALUES ('Alice')");
    
    const result = await db.query('SELECT * FROM users');
    expect(result.rowCount).toBe(1);
  });
});
```

---

## Transaction Example

Atomic operations:
```typescript
const db = new SQLiteAdapter('./transactions.db');
await db.connect();

try {
  await db.query('BEGIN TRANSACTION');
  
  await db.query(`
    INSERT INTO accounts (user_id, balance)
    VALUES (1, 1000.00)
  `);
  
  await db.query(`
    INSERT INTO transactions (account_id, amount)
    VALUES (1, -100.00)
  `);
  
  await db.query('COMMIT');
  console.log('Transaction successful');
} catch (error) {
  await db.query('ROLLBACK');
  console.error('Transaction failed:', error);
}

await db.disconnect();
```

---

## Performance Tips

### Use Prepared Statements
```typescript
// Efficient for repeated queries
const sql = 'SELECT * FROM users WHERE age > ?';
await db.query(sql);
```

### Batch Inserts
```typescript
await db.query('BEGIN TRANSACTION');

for (let i = 0; i < 1000; i++) {
  await db.query(
    'INSERT INTO users (name, age) VALUES (?, ?)',
    [`User${i}`, 20 + i % 50]
  );
}

await db.query('COMMIT');
```

### Create Indexes
```typescript
await db.query('CREATE INDEX idx_users_email ON users(email)');
await db.query('CREATE INDEX idx_users_active ON users(active)');
```

---

## Complete Application
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

class UserRepository {
  private db: SQLiteAdapter;

  constructor(filename: string) {
    this.db = new SQLiteAdapter(filename);
  }

  async connect() {
    await this.db.connect();
    await this.initSchema();
  }

  async disconnect() {
    await this.db.disconnect();
  }

  private async initSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(name: string, email: string) {
    await this.db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
  }

  async findAll() {
    return await this.db.queryWithStats(
      'SELECT * FROM users ORDER BY created_at DESC',
      'users'
    );
  }

  async findByEmail(email: string) {
    return await this.db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }
}

// Usage
const repo = new UserRepository('./users.db');
await repo.connect();

await repo.create('Alice', 'alice@example.com');
const users = await repo.findAll();

console.log(`Found ${users.rowCount} users`);
console.log(`Saved ${users.stats.savingsPercent}% tokens`);

await repo.disconnect();
```