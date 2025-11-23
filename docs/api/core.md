# Core API

Core conversion functions for JSON and YAML.

## jsonToTonl

Convert JSON array to TONL format.
```typescript
function jsonToTonl(
  data: Record<string, unknown>[],
  name?: string,
  options?: ConvertOptions
): string
```

### Parameters

- `data`: Array of objects with consistent schema
- `name`: Collection name (default: "data")
- `options`: Conversion options

### Options
```typescript
interface ConvertOptions {
  flattenNested?: boolean;  // Flatten nested objects (default: false)
}
```

### Returns

TONL formatted string.

### Example
```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
];

const tonl = jsonToTonl(users, "users");
console.log(tonl);
// users[2]{id:i8,name:str,age:i8}:
//   1, Alice, 25
//   2, Bob, 30
```

### With Options
```typescript
const data = [{
  id: 1,
  user: { name: "Alice", email: "alice@example.com" }
}];

// Flatten nested objects
const tonl = jsonToTonl(data, 'data', { flattenNested: true });
// data[1]{id:i8,user_name:str,user_email:str}:
//   1, Alice, alice@example.com
```

### Throws

- `Error`: If data is not an array
- `Error`: If schema validation fails
- `Error`: If objects have inconsistent schemas

---

## tonlToJson

Parse TONL back to JSON.
```typescript
function tonlToJson(tonl: string): Record<string, unknown>[]
```

### Parameters

- `tonl`: TONL formatted string

### Returns

Array of objects.

### Example
```typescript
import { tonlToJson } from 'tonl-mcp-bridge';

const tonl = `users[2]{id:i8,name:str,age:i8}:
  1, Alice, 25
  2, Bob, 30`;

const json = tonlToJson(tonl);
console.log(json);
// [
//   { id: 1, name: "Alice", age: 25 },
//   { id: 2, name: "Bob", age: 30 }
// ]
```

### Throws

- `TonlParseError`: If format is invalid
- `TonlParseError`: If schema is malformed
- `TonlParseError`: If data rows are inconsistent

---

## calculateRealSavings

Calculate token savings using real tokenizer.
```typescript
function calculateRealSavings(
  jsonStr: string,
  tonlStr: string,
  model: ModelName
): TokenSavings
```

### Parameters

- `jsonStr`: JSON formatted string
- `tonlStr`: TONL formatted string
- `model`: LLM model name for tokenization

### Model Names
```typescript
type ModelName = 
  | 'gpt-5'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-4-opus'
  | 'claude-4-sonnet'
  | 'claude-sonnet-4.5'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash';
```

### Returns
```typescript
interface TokenSavings {
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercent: number;
}
```

### Example
```typescript
import { jsonToTonl, calculateRealSavings } from 'tonl-mcp-bridge';

const data = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
];

const jsonStr = JSON.stringify(data);
const tonlStr = jsonToTonl(data);

const savings = calculateRealSavings(jsonStr, tonlStr, 'gpt-5');

console.log(`Original: ${savings.originalTokens} tokens`);
console.log(`TONL: ${savings.compressedTokens} tokens`);
console.log(`Saved: ${savings.savedTokens} tokens`);
console.log(`Savings: ${savings.savingsPercent}%`);
```

---

## yamlToTonl

Convert YAML to TONL format.
```typescript
function yamlToTonl(
  yaml: string,
  name?: string
): string
```

### Parameters

- `yaml`: YAML formatted string
- `name`: Collection name (default: "data")

### Returns

TONL formatted string.

### Example
```typescript
import { yamlToTonl } from 'tonl-mcp-bridge';

const yaml = `
- id: 1
  name: Alice
  age: 25
- id: 2
  name: Bob
  age: 30
`;

const tonl = yamlToTonl(yaml, 'users');
```

---

## tonlToYaml

Convert TONL to YAML format.
```typescript
function tonlToYaml(tonl: string): string
```

### Parameters

- `tonl`: TONL formatted string

### Returns

YAML formatted string.

### Example
```typescript
import { tonlToYaml } from 'tonl-mcp-bridge';

const tonl = `users[2]{id:i8,name:str,age:i8}:
  1, Alice, 25
  2, Bob, 30`;

const yaml = tonlToYaml(tonl);
console.log(yaml);
// - id: 1
//   name: Alice
//   age: 25
// - id: 2
//   name: Bob
//   age: 30
```

---

## detectType

Detect optimal TONL type for a value.
```typescript
function detectType(value: unknown): TypeName
```

### Parameters

- `value`: Any JavaScript value

### Returns
```typescript
type TypeName = 
  | 'i8' | 'i16' | 'i32' | 'i64'
  | 'f32' | 'f64'
  | 'str' | 'bool'
  | 'date' | 'datetime'
  | 'null' | 'obj' | 'arr';
```

### Example
```typescript
import { detectType } from 'tonl-mcp-bridge';

console.log(detectType(42));           // 'i8'
console.log(detectType(1000));         // 'i16'
console.log(detectType(3.14));         // 'f32'
console.log(detectType("hello"));      // 'str'
console.log(detectType(true));         // 'bool'
console.log(detectType(null));         // 'null'
console.log(detectType([1, 2, 3]));    // 'arr'
console.log(detectType({ a: 1 }));     // 'obj'
```

---

## detectObjectSchema

Detect schema for array of objects.
```typescript
function detectObjectSchema(
  data: Record<string, unknown>[]
): Map<string, TypeName>
```

### Parameters

- `data`: Array of objects

### Returns

Map of column names to types.

### Example
```typescript
import { detectObjectSchema } from 'tonl-mcp-bridge';

const data = [
  { id: 1, name: "Alice", age: 25, active: true },
  { id: 2, name: "Bob", age: 30, active: false }
];

const schema = detectObjectSchema(data);

for (const [column, type] of schema) {
  console.log(`${column}: ${type}`);
}
// id: i8
// name: str
// age: i8
// active: bool
```

---

## estimateTokens

Estimate token count (approximate).
```typescript
function estimateTokens(text: string): number
```

### Parameters

- `text`: Text to analyze

### Returns

Estimated token count.

### Note

This is a rough estimate. Use `calculateRealSavings` for accurate counts.

### Example
```typescript
import { estimateTokens } from 'tonl-mcp-bridge';

const text = "Hello world";
const estimate = estimateTokens(text);
console.log(`~${estimate} tokens`);
```

---

## calculateSavings

Calculate estimated savings (approximate).
```typescript
function calculateSavings(
  jsonStr: string,
  tonlStr: string
): {
  jsonTokens: number;
  tonlTokens: number;
  savedTokens: number;
  savingsPercent: number;
}
```

### Note

This provides estimates. Use `calculateRealSavings` for production.

### Example
```typescript
import { calculateSavings } from 'tonl-mcp-bridge';

const savings = calculateSavings(jsonStr, tonlStr);
console.log(`Estimated savings: ${savings.savingsPercent}%`);
```