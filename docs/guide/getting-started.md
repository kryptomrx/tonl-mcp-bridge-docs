# Getting Started

TONL (Token-Optimized Natural Language) is a compact data format designed to reduce token usage in LLM context windows by 30-60% while preserving full data fidelity.

## What's New in v1.0.0

**Visual Analytics Dashboard** - Terminal UI powered by React/Ink for real-time analysis  
**Multiple Export Formats** - JSON, Markdown, and CSV outputs for any workflow  
**Multi-Currency Support** - Cost analysis in USD, EUR, GBP, JPY, CHF, CAD, AUD  
**Enhanced Vector Adapters** - Production-ready MongoDB, Pinecone, Weaviate, Qdrant, Milvus  
**Improved CLI** - Smart error messages, glob patterns, CI/CD integration

## Quick Example

Analyze a file with the visual dashboard:

```bash
tonl analyze data.json --visual
```

Export analysis for GitHub PR comments:

```bash
tonl analyze data.json --format markdown > report.md
```

Generate executive CSV report:

```bash
tonl analyze data.json --export financial-report.csv
```

## Overview

Standard data formats like JSON can be inefficient when transmitting structured data to Large Language Models. TONL optimizes this by:

- Eliminating redundant keys in object arrays
- Using compact type notation
- Automatically optimizing numeric types
- Maintaining bidirectional conversion

The result is 30-60% token reduction with complete data fidelity, plus professional analytics and reporting tools.

## Basic Concept

**Traditional JSON:**
```json
[
  {"id": 1, "name": "Alice", "age": 25, "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "age": 30, "email": "bob@example.com"},
  {"id": 3, "name": "Charlie", "age": 35, "email": "charlie@example.com"}
]
```

**TONL equivalent:**
```
users[3]{id:i8,name:str,age:i8,email:str}:
  1, Alice, 25, alice@example.com
  2, Bob, 30, bob@example.com
  3, Charlie, 35, charlie@example.com
```

**Token comparison:**
- JSON: 89 tokens
- TONL: 48 tokens  
- Savings: 46.1%

**Cost impact at 1M requests with GPT-4o:**
- JSON: $222.50
- TONL: $120.00
- Annual savings at 1K/day: $37.41/year

## Installation

### Global CLI Installation

```bash
npm install -g tonl-mcp-bridge
```

After installation, the `tonl` command is available globally.

### Project Installation

```bash
npm install tonl-mcp-bridge
```

Use with `npx tonl` or import directly in your code.

### Optional Dependencies

Install vector database drivers as needed:

```bash
# MongoDB Atlas
npm install mongodb

# Pinecone
npm install @pinecone-database/pinecone

# Weaviate
npm install weaviate-client

# Qdrant
npm install @qdrant/js-client-rest

# Milvus
npm install @zilliz/milvus2-sdk-node
```

These are optional peer dependencies. Only install what you need for your specific database integrations.

## First Steps

### Step 1: Analyze a File

Create a sample JSON file:

```bash
echo '[{"id":1,"name":"Alice","age":25},{"id":2,"name":"Bob","age":30}]' > data.json
```

Analyze with the visual dashboard:

```bash
tonl analyze data.json --visual
```

Or export to different formats:

```bash
# Markdown for documentation
tonl analyze data.json --format markdown

# JSON for automation
tonl analyze data.json --format json

# CSV for spreadsheets
tonl analyze data.json --format csv
```

### Step 2: Convert Files

Convert JSON to TONL:

```bash
tonl convert data.json
```

With token statistics:

```bash
tonl convert data.json --stats
```

Convert back to JSON:

```bash
tonl convert data.tonl output.json
```

### Step 3: Calculate ROI

Calculate projected savings for your use case:

```bash
tonl roi --savings 45 --queries-per-day 1000 --model gpt-4o
```

Output shows daily, monthly, and annual savings with token usage breakdown.

### Step 4: Programmatic Usage

```typescript
import { jsonToTonl, calculateRealSavings } from 'tonl-mcp-bridge';

const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
];

// Convert to TONL
const tonl = jsonToTonl(users, "users");

// Calculate savings
const stats = calculateRealSavings(
  JSON.stringify(users),
  tonl,
  'gpt-5'
);

console.log(`Saved ${stats.savingsPercent}% tokens`);
// Output: Saved 33.9% tokens
```

## When to Use TONL

### Optimal Use Cases

**RAG Systems**
- Vector database queries returning multiple documents
- 10-100+ results per query
- Repeated queries with similar structure
- Expected savings: 40-60%

**API Integration**
- Bulk data transmission to LLMs
- Multiple API calls with structured responses
- Consistent schema across calls
- Expected savings: 35-55%

**Production Systems**
- High query volume (1000+ queries/day)
- Significant token costs
- Need for infrastructure cost reduction
- Measurable ROI with real dollar savings

**Analytics & Reporting**
- Export analysis to stakeholders
- Multi-currency reporting for global teams
- CI/CD integration for automated cost tracking
- Professional presentation of savings data

### Not Recommended

**Single Objects**
- Header overhead approximately 25 tokens
- Break-even point at 5-10 objects minimum
- Standard JSON is more efficient

**Inconsistent Schemas**
- Different fields per object
- Highly variable optional nested objects
- Frequently changing schemas

**Standard JSON Required**
- Third-party APIs expecting JSON format
- Legacy systems with strict requirements
- Real-time browser consumption without preprocessing

## Performance Characteristics

| Dataset Size | Base Savings | With Nesting | Recommendation |
|--------------|--------------|--------------|----------------|
| 1 object     | -27.8%       | -27.8%       | Use JSON |
| 2 objects    | 33.9%        | 40-45%       | Marginal benefit |
| 10 objects   | 41.1%        | 45-55%       | Use TONL |
| 100 objects  | 48.2%        | 55-65%       | Use TONL |
| 1000 objects | 50.0%        | 60-70%       | Use TONL |

Nested objects provide an additional 10-20% savings due to type optimization across hierarchical structures.

## Real-World Examples

### Example 1: E-Commerce Product Search

**Scenario:** 5,000 product searches per day, 10 products per result

```bash
tonl analyze products.json --visual
```

**Results:**
- Token savings: 48%
- Cost per 1M requests: $1,192.50 → $619.50
- Annual savings: $209.14

### Example 2: Customer Support RAG

**Scenario:** 10,000 FAQ queries per day, 5 documents per result

```bash
tonl analyze faq-documents.json \
  --model gpt-4o-mini \
  --format markdown > analysis.md
```

**Results:**
- Token savings: 42%
- Cost per 1M requests: $71.25 → $41.33
- Annual savings: $109.35

### Example 3: Enterprise Document Search

**Scenario:** 50,000 queries per day, 20 documents per result

```bash
tonl analyze enterprise-docs.json \
  --model claude-sonnet-4 \
  --currency EUR \
  --export report.csv
```

**Results:**
- Token savings: 52%
- Cost per 1M requests: €3,000 → €1,440
- Annual savings: €56,940

## CLI Quick Reference

```bash
# File Analysis
tonl analyze <file> [--visual] [--format json|markdown|csv]

# File Conversion
tonl convert <input> [output] [--stats]

# ROI Calculator
tonl roi --savings <n> --queries-per-day <n> [--model <model>]

# Batch Operations
tonl batch "*.json" [--stats]

# Watch Mode
tonl watch "*.json"
```

See the [CLI Reference](/guide/cli-reference) for complete documentation.

## Integration Guides

### Vector Databases

- [MongoDB Atlas](/guide/mongodb) - Vector search with TONL conversion
- [Pinecone](/guide/pinecone) - Serverless vector database
- [Weaviate](/guide/weaviate) - Cloud and self-hosted options
- [Qdrant](/guide/qdrant) - High-performance vector search
- [Milvus](/guide/milvus) - Open-source vector database

### SQL Databases

- [PostgreSQL](/guide/postgres) - Production SQL integration
- [MySQL](/guide/mysql) - Popular SQL database
- [SQLite](/guide/sqlite) - Embedded database

### Analytics & Reporting

- [ROI Calculator](/guide/roi-calculator) - Detailed cost analysis
- [CLI Reference](/guide/cli-reference) - Complete command documentation

## Architecture Patterns

### Pattern 1: RAG with Vector Database

```typescript
import { MongoDBAdapter } from 'tonl-mcp-bridge';

const db = new MongoDBAdapter({ 
  uri: 'mongodb://localhost:27017',
  database: 'mydb'
});

await db.connect();

// Search with automatic TONL conversion
const { tonl, stats } = await db.searchWithStats(
  'documents',
  embedding,
  { limit: 10 }
);

// Use in LLM prompt
const prompt = `Based on these documents:\n${tonl}\n\nAnswer: ...`;

console.log(`Saved ${stats.savingsPercent}% tokens`);
// Output: Saved 52% tokens

await db.disconnect();
```

### Pattern 2: Batch Analysis

```bash
# Analyze entire project
tonl analyze "src/data/**/*.json" --format csv > project-analysis.csv
```

Results can be uploaded to Google Sheets or sent to stakeholders for review.

### Pattern 3: CI/CD Cost Tracking

```yaml
# .github/workflows/token-analysis.yml
name: Token Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install TONL
        run: npm install -g tonl-mcp-bridge
      
      - name: Analyze Token Costs
        run: |
          tonl analyze "fixtures/**/*.json" \
            --format markdown > analysis.md
      
      - name: Comment PR
        run: gh pr comment ${{ github.event.number }} -F analysis.md
```

## Next Steps

### Learn the Basics
- [Quick Start](/guide/quick-start) - Build your first integration
- [TONL Format](/guide/tonl-format) - Format specification
- [CLI Reference](/guide/cli-reference) - Complete CLI documentation

### Choose Your Integration
- [Vector Databases](/guide/mongodb) - For RAG systems
- [SQL Databases](/guide/postgres) - For traditional databases

### Advanced Topics
- [Type System](/guide/type-system) - Numeric type optimization
- [Schema Drift](/guide/schema-drift) - Handling schema changes
- [Token Savings](/guide/token-savings) - Detailed savings calculations

### Production Deployment
- [Privacy](/guide/privacy) - Data handling best practices
- [Deployment](/guide/deployment) - Production deployment guide
- [Batch Operations](/guide/batch) - Large-scale processing

## Community & Support

**GitHub:** [tonl-mcp-bridge](https://github.com/kryptomrx/tonl-mcp-bridge)  
**Issues:** [Report bugs](https://github.com/kryptomrx/tonl-mcp-bridge/issues)  
**Discussions:** [Ask questions](https://github.com/kryptomrx/tonl-mcp-bridge/discussions)

## Credits

TONL format specification by [Ersin Koç](https://github.com/ersinkoc).

This project extends TONL with production tooling, database adapters, and visual analytics.
