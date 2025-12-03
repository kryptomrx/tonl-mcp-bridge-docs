# ROI Calculator & Analysis

The ROI Calculator and Analysis tools help you understand the real dollar savings from token optimization. Convert "30% savings" into concrete cost projections, export reports for stakeholders, and visualize savings with beautiful terminal dashboards.

## Why ROI Calculator?

- **Marketing Gold**: Show actual $ amounts instead of percentages
- **Visual Dashboard**: Beautiful terminal UI with React/Ink
- **Multiple Export Formats**: JSON, Markdown, CSV for any workflow
- **Multi-Currency Support**: USD, EUR, GBP, JPY, CHF, CAD, AUD
- **Zero Maintenance**: Pure math, no external dependencies
- **CI/CD Ready**: Perfect for GitHub Actions and automation

## What's New in v1.0.0

🎨 **Visual Dashboard** - React-powered terminal UI with:
- Rainbow gradient header
- Animated progress bars
- Cost comparison tables
- Real-time recommendations

📊 **Multiple Output Formats**:
- `--format json` - Machine-readable for CI/CD
- `--format markdown` - GitHub PR comments, documentation
- `--format csv` - Excel/Google Sheets
- `--visual` - Beautiful terminal dashboard

💱 **Multi-Currency Support**:
- Convert costs to 7 major currencies
- Custom exchange rates
- Smart formatting (JPY without decimals, etc.)

## Installation

No additional installation needed - included with tonl-mcp-bridge:

```bash
npm install -g tonl-mcp-bridge
```

## Quick Start

### Analyze a File with Visual Dashboard

```bash
tonl analyze data.json --visual
```

Output:
```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer                                    v1.0.0

 📊 Token Usage Analysis
 data.json
 
 JSON    ████████████████████████████████████████  477 tokens
 TONL    █████████████████████░░░░░░░░░░░░░░░░░░░  255 tokens (-46.5% ✅)

 💰 Cost Analysis (GPT-4o (OpenAI))
                     Per 1K         Per 1M
 ──────────────────────────────────────────────────
 JSON                $1.19          $1,192.50
 TONL                $0.64          $637.50
 ──────────────────────────────────────────────────
 💎 NET SAVINGS      $0.55          $555.00

 💡 Annual Savings @ 1K requests/day:
   $202.57/year

 ✅ Recommendation: STRONGLY USE TONL
```

### Export to Markdown for GitHub

```bash
tonl analyze data.json --format markdown > report.md
```

Creates a beautiful markdown report:

````markdown
# 🚀 TONL ROI Analysis Report

## 📊 Analysis Summary
- **File:** `data.json`
- **Model:** GPT-4o (OpenAI)
- **Savings:** 46.5%

## 💰 Cost Analysis
| Metric | JSON | TONL | Savings |
|--------|------|------|----------|
| Per 1M requests | $1,192.50 | $637.50 | **$555.00** |

### 💎 $202.57 per year savings @ 1K requests/day

✅ Recommendation: **STRONGLY USE TONL**
````

### Multi-Currency Analysis

```bash
# Convert to EUR
tonl analyze data.json --currency EUR --visual

# Custom exchange rate
tonl analyze data.json --currency EUR --rate 0.95

# Export CSV in GBP
tonl analyze data.json --currency GBP --export results.csv
```

## CLI Commands

### `tonl analyze` - File Analysis

Analyze actual JSON files to calculate token savings:

```bash
# Basic analysis
tonl analyze data.json

# Visual dashboard
tonl analyze data.json --visual

# Different output formats
tonl analyze data.json --format json
tonl analyze data.json --format markdown
tonl analyze data.json --format csv

# Multi-currency
tonl analyze data.json --currency EUR
tonl analyze data.json --currency JPY

# Export to file
tonl analyze data.json --export report.csv
tonl analyze data.json --format markdown > report.md

# Batch analysis
tonl analyze data/*.json --format csv

# Different models
tonl analyze data.json --model claude-3.5-sonnet --visual
```

**Options:**
- `-m, --model <model>` - LLM model (gpt-4o, claude-3.5-sonnet, gemini-2.0-flash)
- `-f, --format <type>` - Output format (text|json|markdown|csv)
- `-c, --currency <code>` - Currency (USD, EUR, GBP, JPY, CHF, CAD, AUD)
- `-r, --rate <number>` - Custom exchange rate
- `--visual` - Show visual dashboard UI
- `--export <file>` - Export to CSV file
- `--summary` - Show business impact summary
- `--list-models` - List available models

### `tonl roi` - ROI Calculator

Calculate projected savings from percentages:

```bash
# Calculate from savings percentage
tonl roi --savings 45 --queries-per-day 1000 --model gpt-4o

# With exact token counts
tonl roi \
  --tokens-before 1500 \
  --tokens-after 750 \
  --queries-per-day 5000 \
  --model claude-sonnet-4

# JSON output
tonl roi --savings 50 --queries-per-day 2000 --json

# Marketing summary
tonl roi --savings 60 --queries-per-day 10000 --summary
```

**Options:**
- `-b, --tokens-before <n>` - Tokens before optimization
- `-a, --tokens-after <n>` - Tokens after optimization
- `-s, --savings <n>` - Savings percentage (e.g., 45 for 45%)
- `-q, --queries-per-day <n>` - Number of queries per day
- `-m, --model <model>` - LLM model
- `--json` - Output as JSON
- `--summary` - Show marketing summary
- `--list-models` - List available models

## Output Formats

### Text (Default)

Human-readable output for terminal:

```bash
tonl analyze data.json
```

### JSON

Machine-readable for automation:

```bash
tonl analyze data.json --format json > results.json
```

```json
[
  {
    "model": {"name": "GPT-4o", "provider": "OpenAI"},
    "jsonTokens": 477,
    "tonlTokens": 255,
    "savingsPercent": 46.5,
    "costs": {
      "json": {"per1M": 1192.5},
      "tonl": {"per1M": 637.5},
      "savings": {"per1M": 555}
    }
  }
]
```

### Markdown

Perfect for documentation and GitHub:

```bash
tonl analyze data.json --format markdown > ANALYSIS.md
```

Use cases:
- GitHub PR comments
- Documentation sites
- Wiki pages
- Confluence/Notion

### CSV (Smart Enterprise Format)

12-column format optimized for business reporting:

```bash
tonl analyze data.json --format csv > report.csv
tonl analyze data.json --export report.csv
```

**Columns:**
1. **Context** (4): Timestamp, File, Model, Currency
2. **Hard Facts** (5): Original Tokens, TONL Tokens, Savings %, Cost per 1K (JSON), Cost per 1K (TONL)
3. **Money Shot** (3): Net Savings per 1M, Annual Savings @ 1K/day, Recommendation

Perfect for:
- Executive dashboards
- Budget planning
- Board presentations
- CFO reports

## Visual Dashboard

The `--visual` flag activates a beautiful React-powered terminal UI:

**Features:**
- 🌈 Rainbow gradient header
- 📊 Animated progress bars for token comparison
- 💰 Clean cost tables
- ✅ Color-coded recommendations
- 📈 Real-time updates

**When to use:**
- Live demos
- Sales presentations
- Team showcases
- "Wow factor" moments

**Example:**
```bash
# Single file
tonl analyze products.json --visual

# With currency
tonl analyze data.json --currency EUR --visual

# Different model
tonl analyze data.json --model claude-3.5-sonnet --visual
```

## Multi-Currency Support

Supported currencies:
- 🇺🇸 **USD** - US Dollar (default)
- 🇪🇺 **EUR** - Euro
- 🇬🇧 **GBP** - British Pound
- 🇯🇵 **JPY** - Japanese Yen
- 🇨🇭 **CHF** - Swiss Franc
- 🇨🇦 **CAD** - Canadian Dollar
- 🇦🇺 **AUD** - Australian Dollar

**Usage:**
```bash
# Default rates (updated regularly)
tonl analyze data.json --currency EUR

# Custom exchange rate
tonl analyze data.json --currency GBP --rate 0.79

# Visual dashboard in JPY
tonl analyze data.json --currency JPY --visual

# CSV export in CHF
tonl analyze data.json --currency CHF --export swiss-report.csv
```

**Smart Formatting:**
- JPY: No decimal places (¥1,193 instead of ¥1,192.50)
- Other currencies: 2 decimal places
- Currency symbols: $, €, £, ¥, CHF, CA$, A$

## Supported LLM Models

### OpenAI
- **gpt-4o**: $2.50/1M tokens
- **gpt-4o-mini**: $0.15/1M tokens  
- **gpt-4-turbo**: $10.00/1M tokens
- **o1**: $15.00/1M tokens
- **o1-mini**: $3.00/1M tokens

### Anthropic
- **claude-opus-4**: $15.00/1M tokens
- **claude-sonnet-4**: $3.00/1M tokens
- **claude-sonnet-3.5**: $3.00/1M tokens
- **claude-haiku-4**: $0.25/1M tokens

### Google
- **gemini-2.0-flash**: $0.075/1M tokens
- **gemini-1.5-pro**: $1.25/1M tokens
- **gemini-1.5-flash**: $0.075/1M tokens

*Pricing as of December 2024*

## CI/CD Integration

### GitHub Actions

Post analysis to PR comments:

```yaml
name: TONL Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install TONL
        run: npm install -g tonl-mcp-bridge
      
      - name: Analyze Changes
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
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: analysis
            });
```

### GitLab CI

```yaml
tonl-analysis:
  stage: test
  script:
    - npm install -g tonl-mcp-bridge
    - tonl analyze data/*.json --format markdown > analysis.md
  artifacts:
    paths:
      - analysis.md
```

### Jenkins

```groovy
stage('TONL Analysis') {
    steps {
        sh 'npm install -g tonl-mcp-bridge'
        sh 'tonl analyze data/*.json --format csv > report.csv'
        archiveArtifacts artifacts: 'report.csv'
    }
}
```

## Real-World Examples

### Example 1: E-Commerce Product Search

```bash
tonl analyze products.json --visual
```

**Scenario**: 5,000 product searches/day
**Result**: $6,862/year savings with GPT-4o

### Example 2: Customer Support Bot

```bash
tonl analyze faqs.json \
  --model gpt-4o-mini \
  --format markdown > support-analysis.md
```

**Scenario**: 10,000 FAQ queries/day
**Result**: $329/year savings

### Example 3: Enterprise RAG

```bash
tonl analyze documents/*.json \
  --model claude-sonnet-4 \
  --currency EUR \
  --export enterprise-report.csv
```

**Scenario**: 50,000 document queries/day
**Result**: €45,000/year savings

### Example 4: Batch Analysis for Report

```bash
# Analyze all data files
tonl analyze data/*.json --format csv > monthly-report.csv

# Generate markdown summary
tonl analyze data/*.json --format markdown > README.md
```

## Programmatic Usage

```typescript
import {
  calculateROI,
  formatROI,
  exportToCSV,
  listLLMModels
} from 'tonl-mcp-bridge/cli/commands/roi-calculator';
import { formatAsMarkdown, formatAsJSON } from 'tonl-mcp-bridge/cli/commands/formatters';

// Calculate ROI
const roi = calculateROI(1000, 550, 'gpt-4o');

// Format as markdown
const markdown = formatAsMarkdown([roi], 'USD');
fs.writeFileSync('report.md', markdown);

// Export to CSV
const csv = exportToCSV([roi], 'EUR', 0.92);
fs.writeFileSync('report.csv', csv);

// JSON output
const json = formatAsJSON([roi]);
console.log(json);
```

## Best Practices

### 1. Use Visual Dashboard for Demos
```bash
# Sales presentation
tonl analyze demo-data.json --visual

# Team showcase
tonl analyze production-sample.json --currency EUR --visual
```

### 2. Automate Reports
```bash
# Daily analysis
tonl analyze logs/*.json --format csv > "daily-$(date +%Y-%m-%d).csv"

# Weekly markdown report
tonl analyze data/*.json --format markdown > weekly-report.md
```

### 3. Multi-Format Export
```bash
# CSV for Excel
tonl analyze data.json --export financial.csv

# Markdown for docs
tonl analyze data.json --format markdown > SAVINGS.md

# JSON for automation
tonl analyze data.json --format json > metrics.json
```

### 4. Currency for Global Teams
```bash
# US team
tonl analyze data.json --currency USD --export us-report.csv

# EU team
tonl analyze data.json --currency EUR --export eu-report.csv

# APAC team
tonl analyze data.json --currency JPY --export jp-report.csv
```

## Troubleshooting

### File Not Found
```bash
# ❌ Typo
tonl analyze dat.json

# ✅ Shows suggestions
❌ Error: File not found: dat.json

   Did you mean:
   • data.json

   Try: tonl analyze --help
```

### Invalid JSON
```bash
# ❌ Malformed JSON
tonl analyze broken.json

# ✅ Helpful error message
❌ Error: Invalid JSON in broken.json

   Error near position 42
   Unexpected token } in JSON at position 42

   Common issues:
   • Missing quotes around strings
   • Trailing commas in objects/arrays
   • Unescaped special characters

   Tip: Validate your JSON at https://jsonlint.com
```

### Unknown Format
```bash
# ❌ Invalid format
tonl analyze data.json --format yaml

# ✅ Use valid format
tonl analyze data.json --format markdown
# Valid: text, json, markdown, csv
```

## Next Steps

- [CLI Reference](/guide/cli-reference) - Complete command documentation
- [Examples](/examples/) - More real-world scenarios
- [MongoDB Guide](/guide/mongodb) - Use with real query data
- [Token Savings](/guide/token-savings) - Understanding the math
