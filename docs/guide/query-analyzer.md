# Query Analyzer

Analyze queries before execution to estimate token savings and costs.

## Overview

The Query Analyzer executes your query and provides detailed statistics about potential token savings, cost impact, and recommendations. This helps you make informed decisions about when to use TONL.

## Basic Usage
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter(config);
await db.connect();

const analysis = await db.analyzeQuery(
  'SELECT * FROM users',
  'users',
  { model: 'gpt-5' }
);

console.log(`Estimated rows: ${analysis.estimatedRows}`);
console.log(`JSON tokens: ${analysis.estimatedJsonTokens}`);
console.log(`TONL tokens: ${analysis.estimatedTonlTokens}`);
console.log(`Potential savings: ${analysis.potentialSavingsPercent}%`);
console.log(`Cost impact: ${analysis.costImpact} per call`);
console.log(`Recommendation: ${analysis.recommendation}`);

await db.disconnect();
```

## Analysis Result
```typescript
interface QueryAnalysis {
  estimatedRows: number;
  estimatedJsonTokens: number;
  estimatedTonlTokens: number;
  potentialSavings: number;
  potentialSavingsPercent: number;
  recommendation: 'use-tonl' | 'use-json' | 'marginal';
  costImpact: string;
}
```

## Recommendations

The analyzer provides three recommendation levels:

### use-tonl
Savings > 30%
```typescript
if (analysis.recommendation === 'use-tonl') {
  const result = await db.queryToTonl(sql, name);
  // Proceed with TONL conversion
}
```

### marginal
Savings 10-30%
```typescript
if (analysis.recommendation === 'marginal') {
  // Consider use case
  // May still be worthwhile for high-volume queries
}
```

### use-json
Savings < 10%
```typescript
if (analysis.recommendation === 'use-json') {
  const result = await db.query(sql);
  // Use standard JSON
}
```

## Real-World Example

From production PostgreSQL database:
```typescript
const analysis = await db.analyzeQuery(
  'SELECT * FROM users WHERE active = true',
  'users'
);
```

Output:
```
Estimated rows: 10
JSON tokens: 431
TONL tokens: 212
Potential savings: 219 tokens
Savings: 50.8%
Cost impact: $0.000657 per call
Recommendation: use-tonl
```

## Cost Calculation

Cost impact uses GPT-4 pricing ($3 per 1M input tokens):
```typescript
// For 219 tokens saved:
// 219 * $3 / 1,000,000 = $0.000657 per query
```

Monthly projections:

| Queries/Day | Monthly Savings |
|-------------|-----------------|
| 100         | $1.97           |
| 1,000       | $19.71          |
| 10,000      | $197.10         |
| 100,000     | $1,971.00       |

## Pre-Deployment Analysis

Analyze queries during development:
```typescript
const queries = [
  'SELECT * FROM users',
  'SELECT * FROM orders WHERE status = ?',
  'SELECT * FROM products WHERE stock > 0'
];

for (const sql of queries) {
  const analysis = await db.analyzeQuery(sql, 'data');
  
  console.log(`Query: ${sql}`);
  console.log(`Recommendation: ${analysis.recommendation}`);
  console.log(`Savings: ${analysis.potentialSavingsPercent}%`);
  console.log('---');
}
```

## Dynamic Query Selection

Use analysis to decide at runtime:
```typescript
async function smartQuery(sql: string, name: string) {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const analysis = await db.analyzeQuery(sql, name);
  
  let result;
  if (analysis.recommendation === 'use-tonl') {
    result = await db.queryWithStats(sql, name);
    console.log(`Used TONL, saved ${result.stats.savingsPercent}%`);
  } else {
    result = await db.query(sql);
    console.log('Used JSON (not enough savings)');
  }
  
  await db.disconnect();
  return result;
}
```

## Integration with Monitoring

Track analysis over time:
```typescript
const analysis = await db.analyzeQuery(sql, name);

// Log to monitoring system
logger.info('query_analysis', {
  query: sql,
  rows: analysis.estimatedRows,
  savings_percent: analysis.potentialSavingsPercent,
  recommendation: analysis.recommendation,
  cost_impact: analysis.costImpact
});

if (analysis.recommendation === 'use-json') {
  // Alert: Query no longer benefits from TONL
  alerting.warn('Low TONL savings detected', { query: sql });
}
```

## Model Selection

Analyze with different models:
```typescript
const models = ['gpt-5', 'claude-4-opus', 'gemini-2.5-pro'];

for (const model of models) {
  const analysis = await db.analyzeQuery(sql, name, { model });
  console.log(`${model}: ${analysis.potentialSavingsPercent}% savings`);
}
```

## Performance Impact

Analysis overhead:
- Executes the query once
- Performs token counting
- Minimal overhead (~10-20ms)

For frequently executed queries, cache analysis results:
```typescript
const analysisCache = new Map();

async function getCachedAnalysis(sql: string) {
  if (!analysisCache.has(sql)) {
    const analysis = await db.analyzeQuery(sql, 'data');
    analysisCache.set(sql, analysis);
  }
  return analysisCache.get(sql);
}
```

## Database Compatibility

Works with:
- PostgreSQL
- MySQL
- SQLite

## Best Practices

1. **Analyze during development** to understand query behavior
2. **Cache analysis results** for frequently used queries
3. **Monitor recommendations** in production
4. **Set thresholds** based on your cost sensitivity
5. **Review periodically** as data volumes change

## Limitations

- Executes the full query to get accurate row counts
- Token counts based on current data
- Recommendations assume consistent query patterns
- Does not account for schema changes over time

Use [Schema Drift Monitoring](/guide/schema-drift) to track changes.