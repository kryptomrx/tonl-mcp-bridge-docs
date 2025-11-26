# Data Privacy

Field-level anonymization for sensitive data before sending to LLMs.

## Basic Usage

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@company.com',
    ssn: '123-45-6789',
    salary: 85000
  }
];

const tonl = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn']
});
```

Output:
```tonl
users[1]{id:i32,name:str,email:str,ssn:str,salary:i32}:
  1, Alice, "[REDACTED]", "[REDACTED]", 85000
```

## How It Works

The anonymization feature:
1. Accepts an array of field names to redact
2. Replaces values with `"[REDACTED]"` in the output
3. Preserves schema and structure
4. Works with any data type

Implementation uses Set-based lookup for O(1) performance.

## Use Cases

### GDPR Compliance

Redact personally identifiable information:

```typescript
const tonl = jsonToTonl(customers, 'customers', {
  anonymize: [
    'email',
    'phone',
    'address',
    'passport_number',
    'credit_card'
  ]
});
```

### Healthcare Data (HIPAA)

Protect patient information:

```typescript
const tonl = jsonToTonl(patients, 'patients', {
  anonymize: [
    'name',
    'ssn',
    'medical_record_number',
    'phone',
    'email',
    'address'
  ]
});
```

### Financial Data

Mask sensitive financial information:

```typescript
const tonl = jsonToTonl(transactions, 'transactions', {
  anonymize: [
    'account_number',
    'routing_number',
    'card_number',
    'cvv'
  ]
});
```

## Partial Anonymization

Redact only some fields while keeping others:

```typescript
const users = [
  {
    id: 1,
    department: 'Engineering',
    email: 'user@company.com',
    salary: 120000
  }
];

// Keep department and ID, redact email and salary
const tonl = jsonToTonl(users, 'users', {
  anonymize: ['email', 'salary']
});

// Result preserves department and ID
```

## Combining with Vector Search

Anonymize results from vector databases:

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';

const milvus = new MilvusAdapter(config);
await milvus.connect();

const results = await milvus.search('users', queryVector);

// Convert with anonymization
const tonl = jsonToTonl(results.data, 'results', {
  anonymize: ['email', 'phone', 'ssn']
});
```

## Performance

Anonymization uses Set-based field lookup, providing O(1) time complexity for field checks.

For large datasets:
```typescript
const sensitiveFields = ['email', 'ssn', 'phone'];
const tonl = jsonToTonl(largeDataset, 'data', {
  anonymize: sensitiveFields
});
// Efficient even with 10,000+ records
```

## Limitations

- Only works at field level (not partial field values)
- All instances of the field are redacted
- Original field names remain visible in schema
- Works with top-level fields only (nested fields require flattening)

## Best Practices

**Define field lists centrally:**
```typescript
const SENSITIVE_FIELDS = [
  'email',
  'ssn',
  'phone',
  'address'
];

const tonl = jsonToTonl(data, 'users', {
  anonymize: SENSITIVE_FIELDS
});
```

**Audit anonymization:**
```typescript
function auditAnonymization(data: any[], fields: string[]) {
  const allFields = Object.keys(data[0] || {});
  const unanonymized = allFields.filter(f => !fields.includes(f));
  console.log('Unanonymized fields:', unanonymized);
}
```

**Combine with access controls:**
```typescript
function getAnonymizedData(userRole: string) {
  const sensitiveFields = 
    userRole === 'admin' ? [] :
    userRole === 'manager' ? ['ssn'] :
    ['ssn', 'salary', 'email'];
  
  return jsonToTonl(data, 'users', {
    anonymize: sensitiveFields
  });
}
```

## Verification

Verify anonymization worked:

```typescript
const tonl = jsonToTonl(data, 'users', {
  anonymize: ['email']
});

// Check that email values are redacted
if (!tonl.includes('@')) {
  console.log('Email successfully anonymized');
}
```

## Compliance Notes

This feature assists with data protection requirements but does not guarantee compliance. Always:

- Review applicable regulations (GDPR, HIPAA, etc.)
- Implement appropriate access controls
- Maintain audit logs
- Consult legal counsel for compliance requirements
- Consider encryption at rest and in transit