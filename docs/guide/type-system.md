# Type System

TONL automatically selects optimal types to minimize token usage.

## Automatic Type Detection

TONL analyzes your data and selects the smallest type that can safely represent each value:
```typescript
{ id: 1 }         // i8  (1 byte)
{ id: 1000 }      // i16 (2 bytes)
{ id: 100000 }    // i32 (4 bytes)
{ price: 19.99 }  // f32 (4 bytes)
```

## Integer Types

### i8 (8-bit Integer)
- Range: -128 to 127
- Use case: Small counters, status codes, ages
- Token cost: Lowest

### i16 (16-bit Integer)
- Range: -32,768 to 32,767
- Use case: Product IDs, page numbers
- Token cost: Low

### i32 (32-bit Integer)
- Range: -2,147,483,648 to 2,147,483,647
- Use case: Large IDs, timestamps
- Token cost: Medium

### i64 (64-bit Integer)
- Range: ±9 quintillion
- Use case: Large database IDs, precise timestamps
- Token cost: Higher

## Float Types

### f32 (32-bit Float)
- Precision: ~7 decimal digits
- Use case: Prices, percentages, measurements
- Token cost: Medium

### f64 (64-bit Float)
- Precision: ~15 decimal digits
- Use case: Scientific calculations, coordinates
- Token cost: Higher

## String Type

### str
- Variable length
- UTF-8 encoding
- Handles all text data
- Token cost: Based on length

## Boolean Type

### bool
- Values: `true` or `false`
- Most compact representation
- Token cost: Minimal

## Special Types

### null
- Represents absence of value
- Preserved in conversion
- Token cost: Minimal

### date
- ISO 8601 format
- Example: `2025-01-15`
- Automatic detection

### datetime
- ISO 8601 with time
- Example: `2025-01-15T14:30:00Z`
- Automatic detection

### obj (Object)
- Nested objects
- Can be flattened
- Token cost: Variable

### arr (Array)
- Preserved as-is
- Elements can be any type
- Token cost: Based on contents

## Type Selection Logic

TONL determines types using this process:

1. **Sample Analysis**: Examines all values in column
2. **Range Detection**: Finds min/max for numbers
3. **Type Selection**: Chooses smallest safe type
4. **Validation**: Ensures all values fit

## Type Optimization Example

Consider this data:
```json
[
  {"count": 5, "price": 29.99},
  {"count": 120, "price": 149.50},
  {"count": 3, "price": 9.99}
]
```

TONL selects:
- `count`: i8 (max value 120 fits in i8)
- `price`: f32 (decimal precision needed)

Result:
```
items[3]{count:i8,price:f32}:
  5, 29.99
  120, 149.50
  3, 9.99
```

## Manual Type Override

While TONL optimizes automatically, you can influence behavior:
```typescript
// Force larger type if values might grow
const data = [{ id: 100 }];  // Would be i8

// Add hint for future growth
const dataWithHint = [
  { id: 100 },
  { id: 32000 }  // Forces i16
];
```

## Type Safety

TONL guarantees:
- No data loss during conversion
- Type consistency across all rows
- Automatic validation
- Round-trip fidelity

## Performance Impact

Type selection affects:

**Token Usage:**
- Smaller types = fewer tokens
- Optimal selection crucial for savings

**Processing Speed:**
- Type detection is fast (<5ms for 1000 objects)
- Caching minimizes overhead

**Memory:**
- Minimal impact
- Schema stored once per collection

## Best Practices

1. **Consistent Data**: Keep values within predictable ranges
2. **Schema Stability**: Avoid frequent type changes
3. **Batch Processing**: Process similar objects together
4. **Type Awareness**: Understand your data ranges