---
layout: home

hero:
  name: TONL-MCP Bridge
  text: Database Adapters & Tooling
  tagline: Reduce LLM token costs by 30-60% with production-ready database integration, visual analytics, and multi-format reporting
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kryptomrx/tonl-mcp-bridge

features:
  - title: Visual Analytics
    details: Beautiful terminal dashboard powered by React/Ink. Animated progress bars, cost tables, and real-time recommendations for demos and presentations.
  
  - title: Multiple Export Formats
    details: Export analysis to JSON for automation, Markdown for documentation, or CSV for executive reporting. Perfect for CI/CD pipelines and stakeholder reports.
  
  - title: Multi-Currency Support
    details: Display costs in USD, EUR, GBP, JPY, CHF, CAD, or AUD with custom exchange rates. Generate regional reports for global teams.
  
  - title: ROI Calculator
    details: Calculate real dollar savings from token optimization. Supports GPT-4o, Claude 4, and Gemini pricing. Convert percentage savings to annual cost projections.
  
  - title: Vector Database Support
    details: Native adapters for MongoDB Atlas, Pinecone, Weaviate, Qdrant, and Milvus. Semantic search with automatic TONL conversion and savings calculation.
  
  - title: Token Efficiency
    details: Compact format reduces token usage for structured data by 30-60% while maintaining full data fidelity. Nested objects provide additional savings.
  
  - title: SQL Database Integration
    details: Built-in adapters for PostgreSQL, MySQL, and SQLite. Query and convert in one step with automatic type detection and optimization.
  
  - title: Batch Operations
    details: Execute multiple queries in parallel with aggregate statistics. Analyze entire directories with glob pattern support.
  
  - title: Production Ready
    details: 196+ tests, TypeScript support, and real tokenizer integration. Used in production systems with optional peer dependencies.
---

## Visual Dashboard

```bash
tonl analyze data.json --visual
```

```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer                                    v1.0.0

 Token Usage Analysis
 JSON    ████████████████████████████████████████  477 tokens
 TONL    █████████████████████░░░░░░░░░░░░░░░░░░░  255 tokens (-46.5%)

 Cost Analysis (GPT-4o)
                     Per 1K         Per 1M
 ──────────────────────────────────────────────────
 JSON                $1.19          $1,192.50
 TONL                $0.64          $637.50
 ──────────────────────────────────────────────────
 NET SAVINGS         $0.55          $555.00

 Annual Savings @ 1K requests/day: $202.57/year
 Recommendation: STRONGLY USE TONL
```

## Multiple Export Formats

```bash
# JSON for automation
tonl analyze data.json --format json > results.json

# Markdown for GitHub PR comments
tonl analyze data.json --format markdown > ANALYSIS.md

# CSV for Excel and executive reports
tonl analyze data.json --format csv > report.csv

# Smart Enterprise CSV with 12 columns
tonl analyze data.json --export executive-report.csv
```

## Multi-Currency Analysis

```bash
# Display costs in Euros
tonl analyze data.json --currency EUR --visual

# Japanese Yen with custom rate
tonl analyze data.json --currency JPY --rate 149.5

# British Pounds for UK stakeholders
tonl analyze data.json --currency GBP --export uk-report.csv
```

## ROI Calculator

```bash
# Calculate savings from percentage
tonl roi --savings 45 --queries-per-day 1000 --model gpt-4o

# Output:
# MONTHLY SAVINGS: $33.75/month
# ANNUAL SAVINGS: $410.63/year
```

## CI/CD Integration

Perfect for GitHub Actions, GitLab CI, Jenkins:

```yaml
- name: Token Analysis
  run: |
    tonl analyze data/*.json --format markdown > analysis.md

- name: Comment PR
  uses: actions/github-script@v6
  with:
    script: |
      const fs = require('fs');
      const analysis = fs.readFileSync('analysis.md', 'utf8');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        body: analysis
      });
```

## Vector Search Example

```typescript
import { MongoDBAdapter } from 'tonl-mcp-bridge';

const db = new MongoDBAdapter({
  uri: 'mongodb://localhost:27017',
  database: 'mydb'
});

await db.connect();

// Search with automatic TONL conversion and savings calculation
const result = await db.searchWithStats('products', embedding, {
  limit: 10
});

console.log(result.tonl);
console.log(`Saved ${result.stats.savingsPercent}% tokens`);

await db.disconnect();
```

## Installation

```bash
# Global CLI installation
npm install -g tonl-mcp-bridge

# Project installation
npm install tonl-mcp-bridge

# Optional: Install vector database drivers as needed
npm install mongodb                        # For MongoDB Atlas
npm install @pinecone-database/pinecone   # For Pinecone
npm install weaviate-client                # For Weaviate
```

## When to Use TONL

**Optimal Use Cases:**
- RAG systems with database or vector search
- Bulk data transmission to LLMs
- Production systems where token costs matter
- Applications with nested JSON structures
- Executive reporting and budget planning
- CI/CD pipelines with cost tracking

**Not Recommended:**
- Single objects (header overhead approximately 25 tokens)
- Inconsistent schemas
- Systems requiring standard JSON output

---

## What's New in v1.0.0

### Visual Analytics Dashboard
Beautiful terminal UI powered by React and Ink. Features animated progress bars, rainbow gradient headers, color-coded cost tables, and automated recommendations. Perfect for sales demos, team showcases, and executive presentations.

### Multiple Export Formats
Export analysis to JSON for automation, Markdown for GitHub PR comments and documentation, or CSV for executive reporting. Smart Enterprise CSV format includes 12 columns optimized for financial analysis and budget planning.

### Multi-Currency Support
Display costs in seven major currencies: USD, EUR, GBP, JPY, CHF, CAD, AUD. Custom exchange rates supported. Smart formatting adapts to currency conventions (JPY without decimals, proper symbols).

### Better Error Messages
Fuzzy file matching with "Did you mean?" suggestions. Helpful JSON parse errors with common issue hints. Clear validation messages that guide users to solutions.

### Enhanced Vector Database Adapters
Production-ready MongoDB Atlas, Pinecone, Weaviate, Qdrant, and Milvus integrations. All adapters include `searchWithStats()` for immediate ROI analysis alongside search results.

### CLI Improvements
Glob pattern support for batch operations. Helpful error messages with smart suggestions. Progress indicators for large file operations. CI/CD friendly output modes with proper exit codes.

---

## Use Cases

**Sales & Marketing**
Generate visual dashboards for client demos. Export executive summaries for decision makers. Create compelling presentations with real dollar savings.

**Engineering Teams**
Automate token analysis in pull requests. Track cost optimization progress over time. Validate savings thresholds in CI/CD pipelines.

**Finance & Operations**
Multi-currency budget reports for global organizations. Annual savings projections for planning cycles. Executive dashboards for board presentations.

**Global Teams**
Regional reports in local currencies. Automated analysis for distributed teams. Consistent cost tracking across time zones.

---

## Credits

TONL format specification by [Ersin Koç](https://github.com/ersinkoc) - [TONL Project](https://github.com/tonl-dev/tonl).

This project extends the format with database adapters, MCP integration, visual analytics, and production tooling.
