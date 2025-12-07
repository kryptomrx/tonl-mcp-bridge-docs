# Privacy API

Data anonymization and smart masking API for GDPR/HIPAA compliance.

## Overview

The Privacy API provides field-level data anonymization with smart masking capabilities. Preserves data format while hiding sensitive information.

## Basic Usage

```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const data = [
  { 
    id: 1, 
    name: 'Alice',
    email: 'alice@company.com',
    ssn: '123-45-6789',
    card: '4532-1234-5678-9010'
  }
];

// Smart masking (preserves format)
const masked = jsonToTonl(data, 'users', {
  anonymize: ['email', 'ssn', 'card'],
  mask: true
});

// Output:
// users[1]{id:i8,name:str,email:str,ssn:str,card:str}:
//   1, Alice, "a***@company.com", "***-**-6789", "****-****-****-9010"
```

## Options

```typescript
interface PrivacyOptions {
  anonymize?: string[];  // Fields to anonymize
  mask?: boolean;        // Smart masking (default: false)
}
```

## Masking Patterns

### Email
```
alice@company.com → a***@company.com
```

### SSN
```
123-45-6789 → ***-**-6789
```

### Credit Card
```
4532-1234-5678-9010 → ****-****-****-9010
```

### Phone
```
555-123-4567 → ***-***-4567
```

### Generic
```
HelloWorld → H***d
```

## Nested Objects

```typescript
const data = [{
  user: {
    email: 'alice@example.com',
    billing: {
      card: '4532-1234-5678-9010'
    }
  }
}];

const masked = jsonToTonl(data, 'users', {
  anonymize: ['user.email', 'user.billing.card'],
  mask: true
});
```

## Simple Redaction

```typescript
const redacted = jsonToTonl(data, 'users', {
  anonymize: ['email', 'ssn']
  // mask: false (default)
});

// Output:
// users[1]{id:i8,name:str,email:str,ssn:str}:
//   1, Alice, "[REDACTED]", "[REDACTED]"
```

## Functions

### anonymizeField

```typescript
function anonymizeField(value: any, mask: boolean): string
```

Anonymizes a single field value.

### anonymizeData

```typescript
function anonymizeData(
  data: any, 
  fields: string[], 
  mask: boolean
): any
```

Anonymizes multiple fields in data structure.

## See Also

- [Core API](/api/core) - Basic conversion
- [Privacy Guide](/guide/privacy) - Detailed usage guide
- [Compliance](/guide/privacy#compliance) - GDPR/HIPAA
