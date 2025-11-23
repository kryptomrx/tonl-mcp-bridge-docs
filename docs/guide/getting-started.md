# Getting Started

TONL (Token-Optimized Natural Language) is a compact data format designed to reduce token usage in LLM context windows by 30-60% while preserving full data fidelity.

## Overview

When transmitting structured data to Large Language Models, standard formats like JSON can be inefficient. TONL optimizes this by:

- Eliminating redundant keys in object arrays
- Using compact type notation
- Optimizing numeric types automatically
- Maintaining bidirectional conversion

## Basic Concept

Traditional JSON:
```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30},
  {"id": 3, "name": "Charlie", "age": 35}
]
```

TONL equivalent:
```
users[3]{id:i8,name:str,age:i8}:
  1, Alice, 25
  2, Bob, 30
  3, Charlie, 35
```

Token comparison:
- JSON: 56 tokens
- TONL: 37 tokens
- Savings: 33.9%

## When to Use TONL

TONL is most effective for:

**Optimal Use Cases:**
- Datasets with 10+ similar objects
- RAG systems querying databases
- Repeated API calls with structured responses
- Production systems with high token costs

**Not Recommended:**
- Single objects (header overhead)
- Highly inconsistent schemas
- Systems requiring standard JSON compatibility
- Small datasets (< 5 objects)

## Performance Characteristics

| Dataset Size | Token Savings | Recommendation |
|--------------|---------------|----------------|
| 1 object     | -27.8%        | Use JSON       |
| 2 objects    | 33.9%         | Marginal       |
| 10 objects   | 41.1%         | Use TONL       |
| 100 objects  | 48.2%         | Use TONL       |
| 1000 objects | 50.0%         | Use TONL       |

## Next Steps

- [Installation](/guide/installation) - Install and configure
- [Quick Start](/guide/quick-start) - Build your first integration
- [TONL Format](/guide/tonl-format) - Understand the format specification