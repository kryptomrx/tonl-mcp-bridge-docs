# Schema Drift Monitoring

Track schema changes and their impact on token savings.

## Overview

Schema Drift Monitoring detects when your database schema changes and calculates how those changes affect TONL token savings. This helps you maintain optimal performance in production.

## Basic Usage
```typescript
import { PostgresAdapter } from 'tonl-mcp-bridge';

const db = new PostgresAdapter(config);
await db.connect();

// Capture baseline
await db.trackSchema('users');

// Later, detect changes
const drift = await db.detectSchemaDrift('users');

console.log(`Schema changed: ${drift.hasChanged}`);
console.log(`New columns: ${drift.newColumns}`);
console.log(`Removed columns: ${drift.removedColumns}`);
console.log(`Type changes: ${JSON.stringify(drift.typeChanges)}`);
console.log(`Savings impact: ${drift.savingsImpact}%`);
console.log(`Recommendation: ${drift.recommendation}`);

await db.disconnect();
```

## Drift Detection

### Schema Baseline

Track your current schema:
```typescript
await db.trackSchema('users');
await db.trackSchema('orders');
await db.trackSchema('products');
```

Baselines are stored in `.tonl-schemas/` directory as JSON files.

### Detect Changes
```typescript
const drift = await db.detectSchemaDrift('users');

if (drift.hasChanged) {
  console.log('Schema has changed since baseline');
}
```

## Drift Result Structure
```typescript
interface SchemaDrift {
  hasChanged: boolean;
  newColumns: string[];
  removedColumns: string[];
  typeChanges: TypeChange[];
  rowCountChange: number;
  savingsImpact: number;
  recommendation: string;
}
```

## Real-World Example

From production testing:
```typescript
// Initial baseline
await db.trackSchema('users');

// Add column to users table
await db.query('ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT \'active\'');

// Detect drift
const drift = await db.detectSchemaDrift('users');
```

Output:
```
Has changed: true
New columns: ['status']
Removed columns: []
Type changes: []
Row count change: 0
Savings impact: 50.3%
Recommendation: Schema change improved savings. Update baseline.
```

## Type Changes

Detect when column types change:
```typescript
// Baseline: age is INTEGER
await db.trackSchema('users');

// Change type
await db.query('ALTER TABLE users ALTER COLUMN age TYPE BIGINT');

// Detect
const drift = await db.detectSchemaDrift('users');

console.log(drift.typeChanges);
// [{ column: 'age', oldType: 'number', newType: 'number' }]
```

## Savings Impact

Understand how changes affect token usage:

### Positive Impact

Adding columns increases savings:
```typescript
// Adding a column
Savings impact: +50.3%
Recommendation: Schema change improved savings. Update baseline.
```

### Negative Impact

Removing columns reduces savings:
```typescript
// Removing columns
Savings impact: -15.2%
Recommendation: Schema change reduced savings significantly. Consider optimization.
```

### Neutral Impact

Minor changes:
```typescript
// Type changes without size impact
Savings impact: +2.1%
Recommendation: Schema changed but savings impact is minimal.
```

## Production Integration

### Automated Monitoring
```typescript
async function monitorSchemas() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  const tables = ['users', 'orders', 'products'];
  
  for (const table of tables) {
    try {
      const drift = await db.detectSchemaDrift(table);
      
      if (drift.hasChanged) {
        console.log(`[${table}] Schema drift detected`);
        console.log(`  New columns: ${drift.newColumns.join(', ')}`);
        console.log(`  Removed columns: ${drift.removedColumns.join(', ')}`);
        console.log(`  Impact: ${drift.savingsImpact}%`);
        
        if (Math.abs(drift.savingsImpact) > 10) {
          // Alert team
          await sendAlert({
            table,
            drift,
            severity: 'high'
          });
        }
        
        // Update baseline
        await db.updateSchemaBaseline(table);
      }
    } catch (error) {
      console.error(`Failed to check drift for ${table}:`, error);
    }
  }
  
  await db.disconnect();
}

// Run daily
setInterval(monitorSchemas, 24 * 60 * 60 * 1000);
```

### CI/CD Integration
```typescript
// In your migration script
async function runMigration() {
  const db = new PostgresAdapter(config);
  await db.connect();
  
  // Track before migration
  await db.trackSchema('users');
  
  // Run migration
  await db.query('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false');
  
  // Check impact
  const drift = await db.detectSchemaDrift('users');
  
  console.log(`Migration impact: ${drift.savingsImpact}%`);
  
  if (drift.savingsImpact < -20) {
    console.warn('Migration significantly reduced token savings');
  }
  
  // Update baseline
  await db.updateSchemaBaseline('users');
  
  await db.disconnect();
}
```

## Baseline Management

### Update Baseline

After confirming changes:
```typescript
await db.updateSchemaBaseline('users');
```

### Re-baseline Multiple Tables
```typescript
const tables = ['users', 'orders', 'products'];

for (const table of tables) {
  await db.trackSchema(table);
}
```

### Delete Baseline

Manual cleanup:
```bash
rm .tonl-schemas/users.json
```

## Storage

Baselines are stored as JSON:
```json
{
  "tableName": "users",
  "columns": [
    {"name": "id", "type": "number", "nullable": false},
    {"name": "name", "type": "string", "nullable": false},
    {"name": "age", "type": "number", "nullable": true}
  ],
  "rowCount": 10,
  "capturedAt": "2025-01-15T10:30:00.000Z"
}
```

Location: `.tonl-schemas/[table_name].json`

Add to `.gitignore`:
```
.tonl-schemas/
```

## Use Cases

### Migration Safety

Validate migrations don't hurt performance:
```typescript
// Before migration
await db.trackSchema('users');

// After migration
const drift = await db.detectSchemaDrift('users');

if (drift.savingsImpact < -10) {
  throw new Error('Migration reduced token savings too much');
}
```

### Performance Regression Detection
```typescript
const drift = await db.detectSchemaDrift('orders');

if (drift.savingsImpact < -15) {
  logger.warn('Token savings degraded', {
    table: 'orders',
    impact: drift.savingsImpact,
    recommendation: drift.recommendation
  });
}
```

### Capacity Planning
```typescript
const drift = await db.detectSchemaDrift('users');

console.log(`Row count change: ${drift.rowCountChange}`);
console.log(`Current savings: ${drift.savingsImpact}%`);

// Predict future costs based on growth
```

## Database Compatibility

Works with:
- PostgreSQL
- MySQL
- SQLite

## Best Practices

1. **Track baselines** after schema changes
2. **Monitor regularly** in production
3. **Alert on significant changes** (> 10% impact)
4. **Update baselines** after validation
5. **Include in CI/CD** pipeline

## Limitations

- Requires baseline to exist
- Detects structural changes only
- Does not track data distribution changes
- Storage grows with number of tracked tables
- Not suitable for frequently changing schemas

## Error Handling
```typescript
try {
  const drift = await db.detectSchemaDrift('users');
} catch (error) {
  if (error.message.includes('No baseline found')) {
    // Create baseline first
    await db.trackSchema('users');
  } else {
    throw error;
  }
}
```

## Performance

Drift detection overhead:
- Baseline load: < 1ms
- Schema query: 10-50ms (depending on database)
- Comparison: < 5ms
- Total: 15-60ms

Minimal impact on production systems.