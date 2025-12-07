# Privacy & Anonymization Example

Complete examples for data anonymization with smart masking.

## Basic Anonymization

### Simple Redaction

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@company.com',
    ssn: '123-45-6789'
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@company.com',
    ssn: '987-65-4321'
  }
];

// Redact sensitive fields
const tonl = jsonToTonl(users, 'users', {
  anonymize: ['email', 'ssn']
});

console.log(tonl);
// users[2]{id:i32,name:str,email:str,ssn:str}:
//   1, "Alice Johnson", "[REDACTED]", "[REDACTED]"
//   2, "Bob Smith", "[REDACTED]", "[REDACTED]"
```

## Smart Masking

### Email Addresses

```typescript
const users = [
  { id: 1, email: 'alice@company.com' },
  { id: 2, email: 'bob.smith@enterprise.com' }
];

const masked = jsonToTonl(users, 'users', {
  anonymize: ['email'],
  mask: true  // Enable smart masking
});

console.log(masked);
// users[2]{id:i32,email:str}:
//   1, "a***@company.com"
//   2, "b***@enterprise.com"
```

### Credit Cards

```typescript
const payments = [
  {
    id: 'tx1',
    amount: 99.99,
    card: '4532-1234-5678-9010',
    cvv: '123'
  },
  {
    id: 'tx2',
    amount: 149.99,
    card: '5425-2334-3010-9299',
    cvv: '456'
  }
];

const masked = jsonToTonl(payments, 'payments', {
  anonymize: ['card', 'cvv'],
  mask: true
});

console.log(masked);
// payments[2]{id:str,amount:f32,card:str,cvv:str}:
//   tx1, 99.99, "****-****-****-9010", "[REDACTED]"
//   tx2, 149.99, "****-****-****-9299", "[REDACTED]"
```

### Social Security Numbers

```typescript
const employees = [
  { id: 1, name: 'Alice', ssn: '123-45-6789' },
  { id: 2, name: 'Bob', ssn: '987-65-4321' }
];

const masked = jsonToTonl(employees, 'employees', {
  anonymize: ['ssn'],
  mask: true
});

console.log(masked);
// employees[2]{id:i32,name:str,ssn:str}:
//   1, Alice, "***-**-6789"
//   2, Bob, "***-**-4321"
```

### Phone Numbers

```typescript
const contacts = [
  { name: 'Alice', phone: '555-123-4567' },
  { name: 'Bob', phone: '555-987-6543' }
];

const masked = jsonToTonl(contacts, 'contacts', {
  anonymize: ['phone'],
  mask: true
});

console.log(masked);
// contacts[2]{name:str,phone:str}:
//   Alice, "***-***-4567"
//   Bob, "***-***-6543"
```

## Nested Objects

### Dot-Notation Paths

```typescript
const users = [
  {
    id: 1,
    name: 'Alice',
    contact: {
      email: 'alice@company.com',
      phone: '555-123-4567'
    },
    billing: {
      card: '4532-1234-5678-9010',
      address: '123 Main St'
    }
  }
];

const masked = jsonToTonl(users, 'users', {
  anonymize: [
    'contact.email',
    'contact.phone',
    'billing.card'
  ],
  mask: true
});

console.log(masked);
// Nested fields are masked while preserving structure
```

### Deep Nesting

```typescript
const data = [
  {
    user: {
      profile: {
        personal: {
          ssn: '123-45-6789',
          email: 'alice@example.com'
        }
      }
    }
  }
];

const masked = jsonToTonl(data, 'data', {
  anonymize: [
    'user.profile.personal.ssn',
    'user.profile.personal.email'
  ],
  mask: true
});
```

## GDPR Compliance

### User Data Export

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

// GDPR Article 15: Right of Access
async function exportUserData(userId: string) {
  const userData = await db.getUserData(userId);
  
  // Anonymize other users' data in relationships
  const anonymized = jsonToTonl(userData.connections, 'connections', {
    anonymize: ['email', 'phone'],
    mask: true
  });
  
  return {
    user: userData.user,
    connections: anonymized
  };
}
```

### Data Minimization

```typescript
// GDPR Article 5: Data Minimization
const minimalData = users.map(user => ({
  id: user.id,
  role: user.role,
  // Exclude unnecessary personal data
}));

const tonl = jsonToTonl(minimalData, 'users');
```

### Right to Erasure

```typescript
// GDPR Article 17: Right to Erasure
async function anonymizeDeletedUser(userId: string) {
  const logs = await db.getAuditLogs(userId);
  
  // Keep logs but anonymize PII
  const anonymized = logs.map(log => ({
    ...log,
    email: '[DELETED]',
    name: '[DELETED]',
    ip: '[DELETED]'
  }));
  
  return jsonToTonl(anonymized, 'audit_logs');
}
```

## HIPAA Compliance

### Protected Health Information (PHI)

```typescript
const patients = [
  {
    id: 'P001',
    name: 'John Doe',
    ssn: '123-45-6789',
    diagnosis: 'Type 2 Diabetes',
    insurance: '123-45-ABC',
    doctor: 'Dr. Smith'
  }
];

// Anonymize all PHI except medical info
const hipaa = jsonToTonl(patients, 'patients', {
  anonymize: ['name', 'ssn', 'insurance'],
  mask: true
});

console.log(hipaa);
// Medical data preserved, identifiers masked
```

### De-identification

```typescript
// HIPAA Safe Harbor Method
const deidentified = patients.map(p => ({
  // Remove direct identifiers
  age_range: getAgeRange(p.age),  // 5-year buckets
  diagnosis: p.diagnosis,
  treatment: p.treatment,
  // Keep zip code first 3 digits only
  zip3: p.zipCode.substring(0, 3)
}));

const tonl = jsonToTonl(deidentified, 'research_data');
```

## Production Use Cases

### API Response Sanitization

```typescript
import express from 'express';
import { jsonToTonl } from 'tonl-mcp-bridge';

const app = express();

app.get('/api/users', async (req, res) => {
  const users = await db.getUsers();
  
  // Sanitize for public API
  const safe = jsonToTonl(users, 'users', {
    anonymize: ['email', 'phone', 'ssn', 'address'],
    mask: true
  });
  
  res.type('text/plain').send(safe);
});
```

### Log Sanitization

```typescript
import winston from 'winston';
import { jsonToTonl } from 'tonl-mcp-bridge';

const logger = winston.createLogger({
  format: winston.format.printf(info => {
    // Anonymize before logging
    if (info.user) {
      const safe = jsonToTonl([info.user], 'user', {
        anonymize: ['email', 'ip', 'sessionId'],
        mask: true
      });
      info.user = safe;
    }
    return JSON.stringify(info);
  }),
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

logger.info('User login', {
  user: { email: 'alice@example.com', ip: '192.168.1.1' }
});
// Logs with masked data
```

### Database Export

```typescript
async function exportForAnalytics() {
  const users = await db.getAllUsers();
  
  // Anonymize for data warehouse
  const anonymized = jsonToTonl(users, 'users', {
    anonymize: [
      'email',
      'phone',
      'ssn',
      'address.street',
      'payment.card'
    ],
    mask: true
  });
  
  await s3.upload('analytics/users.tonl', anonymized);
}
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { jsonToTonl } from 'tonl-mcp-bridge';

describe('Privacy', () => {
  it('should redact sensitive fields', () => {
    const data = [{ email: 'test@example.com' }];
    const result = jsonToTonl(data, 'users', {
      anonymize: ['email']
    });
    
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('test@example.com');
  });
  
  it('should mask email format', () => {
    const data = [{ email: 'alice@example.com' }];
    const result = jsonToTonl(data, 'users', {
      anonymize: ['email'],
      mask: true
    });
    
    expect(result).toMatch(/a\*\*\*@example\.com/);
  });
  
  it('should handle nested fields', () => {
    const data = [{
      user: { email: 'test@example.com' }
    }];
    const result = jsonToTonl(data, 'data', {
      anonymize: ['user.email'],
      mask: true
    });
    
    expect(result).toMatch(/t\*\*\*@example\.com/);
  });
});
```

## CLI Usage

```bash
# Anonymize file
tonl convert users.json --anonymize email,ssn

# With smart masking
tonl convert users.json --anonymize email,ssn --mask

# Multiple fields
tonl convert users.json \
  --anonymize email,ssn,phone,card \
  --mask
```

## Best Practices

### 1. Identify Sensitive Data

```typescript
// Common PII fields
const PII_FIELDS = [
  'email',
  'phone',
  'ssn',
  'passport',
  'drivers_license',
  'ip_address',
  'mac_address',
  'biometric_data'
];

// Financial data
const FINANCIAL_FIELDS = [
  'credit_card',
  'bank_account',
  'routing_number',
  'cvv',
  'pin'
];

// Health data (HIPAA)
const PHI_FIELDS = [
  'ssn',
  'medical_record_number',
  'health_plan_number',
  'diagnosis',
  'prescription'
];
```

### 2. Use Smart Masking

```typescript
// Preserve data utility
const masked = jsonToTonl(data, 'users', {
  anonymize: ['email', 'phone'],
  mask: true  // Better than full redaction
});

// Analysts can still see patterns:
// - Email domains
// - Phone area codes
// - Card types (Visa, Mastercard)
```

### 3. Document Decisions

```typescript
/**
 * Privacy Policy Implementation
 * 
 * Fields anonymized:
 * - email: Smart masked (preserves domain)
 * - ssn: Smart masked (shows last 4 digits)
 * - card: Smart masked (shows last 4 digits)
 * 
 * Rationale: GDPR Article 32 (Security of processing)
 * Last reviewed: 2024-12-07
 */
const anonymized = jsonToTonl(data, 'users', {
  anonymize: ['email', 'ssn', 'card'],
  mask: true
});
```

### 4. Test Thoroughly

```typescript
// Verify no PII leaks
function verifyAnonymization(result: string, piiFields: string[]) {
  piiFields.forEach(field => {
    if (result.includes(field)) {
      throw new Error(`PII leak detected: ${field}`);
    }
  });
}

const result = jsonToTonl(data, 'users', {
  anonymize: ['email'],
  mask: true
});

verifyAnonymization(result, ['alice@example.com']);
```

### 5. Audit Access

```typescript
// Log anonymization operations
logger.info('Data anonymized', {
  collection: 'users',
  fields: ['email', 'ssn'],
  mask: true,
  timestamp: new Date(),
  operator: req.user.id
});
```

## See Also

- [Privacy Guide](/guide/privacy) - Complete privacy guide
- [Privacy API](/api/privacy) - API reference
- [Core API](/api/core) - Basic conversion
- [Security](/guide/security) - Security best practices
