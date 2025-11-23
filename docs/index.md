---
layout: home

hero:
  name: TONL-MCP Bridge
  text: Database Adapters & Tooling
  tagline: Reduce LLM token costs by 30-60% with production-ready database integration
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kryptomrx/tonl-mcp-bridge

features:
  - title: Token Efficiency
    details: Compact format that reduces token usage for structured data by 30-60% while maintaining full data fidelity.
  
  - title: Database Integration
    details: Built-in adapters for PostgreSQL, MySQL, SQLite, and Qdrant. Query and convert in one step.
  
  - title: Query Analysis
    details: Analyze queries before execution to estimate token savings and costs. Smart recommendations included.
  
  - title: Schema Monitoring
    details: Track schema changes and their impact on token savings. Automatic recommendations for optimization.
  
  - title: Batch Operations
    details: Execute multiple queries in parallel with aggregate statistics. 48% savings on multi-query workflows.
  
  - title: Production Ready
    details: 162 tests, TypeScript support, and real tokenizer integration. Used in production systems.
---

## Quick Example
```typescript
import { SQLiteAdapter } from 'tonl-mcp-bridge';

const db = new SQLiteAdapter(':memory:');
await db.connect();

const result = await db.queryWithStats('SELECT * FROM users', 'users');
console.log(`Saved ${result.stats.savingsPercent}% tokens`);
// Output: Saved 50.8% tokens
```

## Installation
```bash
npm install tonl-mcp-bridge
```

## When to Use TONL

**Best for:**
- RAG systems with database queries
- Bulk data transmission to LLMs
- Production systems where token costs matter

**Not for:**
- Single objects (header overhead)
- Inconsistent schemas
- Systems that need standard JSON output

---

## Credits

TONL format specification by [Ersin Koç](https://github.com/ersinkoc) - [TONL Project](https://github.com/tonl-dev/tonl).

This project extends the format with database adapters, MCP integration, and production tooling.