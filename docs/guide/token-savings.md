# Token Savings

Understanding how TONL reduces token usage.

## How Savings Work

Traditional JSON repeats keys for every object:
```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30},
  {"id": 3, "name": "Charlie", "age": 35}
]
```

TONL declares schema once:
```
users[3]{id:i8,name:str,age:i8}:
  1, Alice, 25
  2, Bob, 30
  3, Charlie, 35
```

## Savings by Dataset Size

| Objects | JSON Tokens | TONL Tokens | Saved | Percentage |
|---------|-------------|-------------|-------|------------|
| 1       | 18          | 23          | -5    | -27.8%     |
| 2       | 56          | 37          | 19    | 33.9%      |
| 5       | 140         | 87          | 53    | 37.9%      |
| 10      | 280         | 165         | 115   | 41.1%      |
| 50      | 1,400       | 765         | 635   | 45.4%      |
| 100     | 2,800       | 1,450       | 1,350 | 48.2%      |
| 1,000   | 28,000      | 14,000      | 14,000| 50.0%      |

*Benchmarked with GPT-5 tokenizer on user dataset*

## Real-World Example

PostgreSQL query returning 10 user records:
```sql
SELECT id, name, email, age, active, created_at 
FROM users 
LIMIT 10;
```

Results:
- JSON: 431 tokens
- TONL: 212 tokens
- Saved: 219 tokens (50.8%)

## Cost Impact

At GPT-4 pricing ($3 per 1M input tokens):

### Daily Usage
| Queries/Day | JSON Cost | TONL Cost | Savings/Day |
|-------------|-----------|-----------|-------------|
| 100         | $0.13     | $0.06     | $0.07       |
| 1,000       | $1.29     | $0.64     | $0.65       |
| 10,000      | $12.90    | $6.36     | $6.54       |

### Monthly Savings
| Queries/Day | Monthly Savings |
|-------------|-----------------|
| 100         | $2.10           |
| 1,000       | $19.50          |
| 10,000      | $195.00         |
| 100,000     | $1,950.00       |

## Factors Affecting Savings

### Positive Factors
1. **Large datasets**: More objects = better savings
2. **Many columns**: More keys to eliminate
3. **Simple types**: Compact type notation
4. **Consistent schema**: No variations

### Negative Factors
1. **Single objects**: Header overhead
2. **Few columns**: Less redundancy to remove
3. **Nested structures**: Additional complexity
4. **Inconsistent data**: Schema variations

## Optimization Strategies

### 1. Batch Similar Queries

Instead of:
```typescript
// 3 separate queries
await db.query('SELECT * FROM users WHERE id = 1');
await db.query('SELECT * FROM users WHERE id = 2');
await db.query('SELECT * FROM users WHERE id = 3');
```

Use:
```typescript
// Single batch query
await db.query('SELECT * FROM users WHERE id IN (1, 2, 3)');
```

### 2. Select Only Needed Columns
```typescript
// Less efficient
SELECT * FROM orders;

// More efficient
SELECT id, customer_id, total, status FROM orders;
```

### 3. Use Query Analyzer
```typescript
const analysis = await db.analyzeQuery(
  'SELECT * FROM products',
  'products'
);

if (analysis.recommendation === 'use-tonl') {
  // Proceed with TONL conversion
} else {
  // Use standard JSON
}
```

### 4. Monitor Schema Drift
```typescript
await db.trackSchema('users');

// Later
const drift = await db.detectSchemaDrift('users');
if (drift.savingsImpact < -10) {
  console.warn('Schema change reduced savings');
}
```

## When to Skip TONL

TONL may not be beneficial when:

1. **Single object results**: Header overhead exceeds savings
2. **Very small datasets** (< 5 objects): Marginal benefit
3. **Highly dynamic schemas**: Frequent changes
4. **Compatibility required**: Receiving system needs JSON

Use the Query Analyzer to make informed decisions:
```typescript
const analysis = await db.analyzeQuery(sql, name);
console.log(analysis.recommendation);
// 'use-json', 'marginal', or 'use-tonl'
```

## Measuring Savings

### Real-time Analysis
```typescript
const stats = await db.queryWithStats(sql, name, { 
  model: 'gpt-5' 
});

console.log(`Original: ${stats.stats.originalTokens}`);
console.log(`TONL: ${stats.stats.compressedTokens}`);
console.log(`Saved: ${stats.stats.savedTokens}`);
console.log(`Percentage: ${stats.stats.savingsPercent}%`);
```

### Batch Aggregate
```typescript
const result = await db.batchQueryWithStats(queries, { 
  model: 'gpt-5' 
});

console.log(`Total saved: ${result.aggregate.savedTokens}`);
console.log(`Average: ${result.aggregate.savingsPercent}%`);
```

## Model Compatibility

Token counts vary by model:

| Model | Tokenizer | Compatible |
|-------|-----------|------------|
| GPT-5 | o200k_base | Yes |
| GPT-4 | cl100k_base | Yes |
| Claude 4 | claude | Yes |
| Gemini 2.5 | gemini | Yes |

TONL uses real tokenizers for accurate measurements.