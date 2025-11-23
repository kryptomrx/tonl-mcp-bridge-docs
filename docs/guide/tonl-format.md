# TONL Format

Understanding the TONL format specification.

## Structure

A TONL document consists of three parts:
```
collection_name[count]{schema}: data
```

1. **Header**: Collection name and count
2. **Schema**: Type definitions for columns
3. **Data**: Comma-separated values

## Header

Format: `name[count]`
```
users[3]
```

- `users`: Collection name
- `3`: Number of objects

## Schema

Format: `{column:type,column:type,...}`
```
{id:i8,name:str,age:i8}
```

Types are optimized based on data:
- `i8`: 8-bit integer (-128 to 127)
- `i16`: 16-bit integer (-32,768 to 32,767)
- `i32`: 32-bit integer
- `str`: String
- `bool`: Boolean
- `f32`: 32-bit float
- `f64`: 64-bit float

## Data Rows

Each row on a new line, comma-separated:
```
1, Alice, 25
2, Bob, 30
3, Charlie, 35
```

## Complete Example
```
users[3]{id:i8,name:str,age:i8}:
  1, Alice, 25
  2, Bob, 30
  3, Charlie, 35
```

Equivalent JSON:
```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30},
  {"id": 3, "name": "Charlie", "age": 35}
]
```

## Nested Objects

Nested objects are preserved:
```
users[1]{id:i8,profile:obj}:
  1, {name:Alice,email:alice@example.com}
```

Or flatten with option:
```typescript
jsonToTonl(data, 'users', { flattenNested: true });
```

Result:
```
users[1]{id:i8,profile_name:str,profile_email:str}:
  1, Alice, alice@example.com
```

## Arrays

Arrays are preserved as values:
```
users[1]{id:i8,tags:arr}:
  1, [developer,typescript]
```

## Special Values

- `null`: Represents null values
- Empty strings: Preserved as-is
- Booleans: `true` or `false`

## Parsing Rules

When parsing TONL back to JSON:

1. Schema defines output structure
2. Types are converted automatically
3. Nested structures are restored
4. Arrays are reconstructed

## Validation

TONL validates:
- Schema consistency across all objects
- Type compatibility
- Data integrity
- Row count matches header

## Limitations

- All objects must have consistent schema
- Column order must remain stable
- No circular references in nested objects
- Maximum row count: determined by memory