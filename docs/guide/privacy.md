# Data Privacy & Anonymization

**New in v1.0.0:** Smart masking, nested object support, and enterprise-ready privacy features.

Field-level anonymization for sensitive data before sending to LLMs.

## Quick Start

### Basic Redaction

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

// Redact with [REDACTED]
const tonl = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn']
});
```

Output:
```tonl
users[1]{id:i8,name:str,email:str,ssn:str,salary:i32}:
  1, Alice, "[REDACTED]", "[REDACTED]", 85000
```

### Smart Masking (New in v1.0.0)

```typescript
// Smart masking preserves format context
const tonl = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn'],
  mask: true  // Enable smart masking
});
```

Output:
```tonl
users[1]{id:i8,name:str,email:str,ssn:str,salary:i32}:
  1, Alice, "a***@company.com", "***-**-6789", 85000
```

## Smart Masking (v1.0.0)

Smart masking preserves data format context while hiding sensitive information. Perfect for demos, testing, and debugging.

### Email Masking

```typescript
const data = [{ email: 'alice@example.com' }];

const tonl = jsonToTonl(data, 'users', {
  anonymize: ['email'],
  mask: true
});
// Output: a***@example.com
```

**Pattern:** First character + `***` + `@` + full domain

### SSN Masking

```typescript
const data = [{ ssn: '123-45-6789' }];

const tonl = jsonToTonl(data, 'records', {
  anonymize: ['ssn'],
  mask: true
});
// Output: ***-**-6789
```

**Pattern:** `***-**-` + last 4 digits

### Credit Card Masking

```typescript
const data = [{ card: '4532-1234-5678-9010' }];

const tonl = jsonToTonl(data, 'payments', {
  anonymize: ['card'],
  mask: true
});
// Output: ****-****-****-9010
```

**Pattern:** `****-****-****-` + last 4 digits

### Phone Number Masking

```typescript
const data = [{ phone: '+1-555-123-4567' }];

const tonl = jsonToTonl(data, 'contacts', {
  anonymize: ['phone'],
  mask: true
});
// Output: ***-***-4567
```

**Pattern:** `***-***-` + last 4 digits

### Generic String Masking

```typescript
const data = [{ username: 'alice_wonderland' }];

const tonl = jsonToTonl(data, 'accounts', {
  anonymize: ['username'],
  mask: true
});
// Output: a***d
```

**Pattern:** First char + `***` + last char

## Nested Object Support (v1.0.0)

### Anonymize Nested Fields

```typescript
const data = [
  {
    id: 1,
    user: {
      name: 'Alice',
      email: 'alice@secret.com',
      profile: {
        ssn: '123-45-6789'
      }
    }
  }
];

// Anonymize at any depth
const tonl = jsonToTonl(data, 'records', {
  anonymize: ['email', 'ssn']  // Matches anywhere in object tree
});
```

### Nested Path Notation

```typescript
// Target specific nested paths
const tonl = jsonToTonl(data, 'records', {
  anonymize: ['user.email', 'user.profile.ssn']
});
```

### With Flattening

```typescript
const data = [
  { id: 1, user: { email: 'secret@test.com', name: 'Alice' } }
];

// Flatten first, then anonymize
const tonl = jsonToTonl(data, 'users', {
  flattenNested: true,
  anonymize: ['user_email']  // Flattened key name
});
```

## How It Works

The anonymization feature (v1.0.0):
1. **Preprocessing:** Anonymizes data before TONL conversion
2. **Deep cloning:** No side effects on original data
3. **Smart detection:** Pattern-based masking for common formats
4. **Nested support:** Works with deeply nested objects
5. **Performance:** O(1) field lookup using Set-based matching

### Processing Pipeline

```
Raw Data → Flatten (optional) → Anonymize → Build TONL → Output
```

## Use Cases

### GDPR Compliance

Redact personally identifiable information:

```typescript
const tonl = jsonToTonl(customers, 'customers', {
  anonymize: ['email', 'phone', 'address', 'passport_number', 'credit_card']
});
```

### Healthcare Data (HIPAA)

Protect patient information with smart masking:

```typescript
const tonl = jsonToTonl(patients, 'patients', {
  anonymize: ['ssn', 'medical_record_number'],
  mask: true  // Show last 4 digits
});

// Output:
// ssn: "***-**-6789"
// medical_record_number: "M***5"
```

### Financial Data

Mask sensitive financial information with format preservation:

```typescript
const tonl = jsonToTonl(transactions, 'transactions', {
  anonymize: ['card_number', 'account_number'],
  mask: true
});

// Output:
// card_number: "****-****-****-9010"
// account_number: "1***0"
```

## Advanced Features

### Privacy Core Functions

Direct access to privacy functions:

```typescript
import { anonymizeData, maskFields, redactFields } from 'tonl-mcp-bridge/core/privacy';

// Smart masking
const masked = maskFields(data, ['email', 'ssn']);

// Simple redaction
const redacted = redactFields(data, ['password']);

// Full control
const anonymized = anonymizeData(data, {
  fields: ['email', 'ssn'],
  mode: 'mask'  // or 'redact'
});
```

### No Side Effects

All privacy functions deep clone data:

```typescript
const original = [{ email: 'test@example.com' }];
const anonymized = maskFields(original, ['email']);

// Original unchanged
console.log(original[0].email);  // 'test@example.com'
console.log(anonymized[0].email); // 't***@example.com'
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

- Smart masking works best with standardized formats (SSN, email, credit cards)
- Custom formats may fall back to generic masking (first + last char)
- Original field names remain visible in schema
- Null and undefined values are preserved (not anonymized)

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

**Use smart masking for demos and testing:**
```typescript
const isDev = process.env.NODE_ENV === 'development';

const tonl = jsonToTonl(data, 'users', {
  anonymize: SENSITIVE_FIELDS,
  mask: isDev  // Show format context in dev, full redaction in prod
});
```

**Combine nested paths with field matching:**
```typescript
const tonl = jsonToTonl(data, 'records', {
  anonymize: [
    'password',          // Matches at any depth
    'user.email',        // Specific nested path
    'billing.card'       // Another specific path
  ]
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

## Compliance Notes

This feature assists with data protection requirements but does not guarantee compliance. Always:

- Review applicable regulations (GDPR, HIPAA, etc.)
- Implement appropriate access controls
- Maintain audit logs
- Consult legal counsel for compliance requirements
- Consider encryption at rest and in transit
