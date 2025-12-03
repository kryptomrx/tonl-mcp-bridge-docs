# CLI Reference

Complete reference for all TONL CLI commands (v1.0.0), options, and usage patterns.

## Installation

```bash
# Global installation (recommended)
npm install -g tonl-mcp-bridge

# Local project installation
npm install tonl-mcp-bridge
npx tonl --help
```

## Global Options

Available for all commands:

```bash
tonl --version          # Show version number
tonl --help            # Show help message
tonl <command> --help  # Show help for specific command
```

## Commands Overview

| Command | Purpose | Use Case |
|---------|---------|----------|
| `convert` | Convert files between formats | One-time file conversion |
| `analyze` | Analyze token usage & ROI | Business impact analysis |
| `roi` | Calculate ROI projections | Budget planning |
| `batch` | Convert multiple files | Bulk processing |
| `watch` | Auto-convert on file changes | Development workflow |
| `stream` | Stream NDJSON to TONL | Log processing & DevOps |

---

## `tonl convert`

Convert between JSON, YAML, and TONL formats.

**Usage:**
```bash
tonl convert <input> [output] [options]
```

**Arguments:**
- `input` - Input file path (required)
- `output` - Output file path (optional, auto-generated if not provided)

**Options:**
- `-s, --stats` - Show token savings statistics
- `-n, --name <n>` - Collection name for TONL output (default: "data")
- `-m, --model <model>` - Tokenizer model: gpt-5, claude-4, gemini-2.5 (default: "gpt-5")
- `-v, --validate` - Validate schema consistency

**Examples:**
```bash
# JSON to TONL
tonl convert data.json

# With custom collection name
tonl convert products.json --name products

# Show token statistics
tonl convert data.json --stats

# TONL to JSON
tonl convert data.tonl output.json

# TONL to YAML
tonl convert data.tonl output.yaml

# YAML to TONL
tonl convert config.yaml --name config
```

---

## `tonl analyze`

Analyze JSON files for token usage and cost savings with enterprise-grade dashboard.

**Usage:**
```bash
tonl analyze <input> [options]
```

**Arguments:**
- `input` - Input JSON file(s) (supports glob patterns)

**Options:**
- `-m, --model <model>` - LLM model (default: "gpt-4o")
  - OpenAI: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1`, `o1-mini`
  - Anthropic: `claude-opus-4`, `claude-sonnet-4`, `claude-sonnet-3.5`, `claude-haiku-4`
  - Google: `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`

- `-f, --format <type>` - Output format: text, json, markdown, csv (default: "text")
- `-c, --currency <code>` - Display currency: USD, EUR, GBP, JPY, CHF, CAD, AUD (default: "USD")
- `-r, --rate <number>` - Custom exchange rate
- `--visual` - Show visual dashboard UI with live MCP status
- `--export <file>` - Export results to CSV file
- `--summary` - Show business impact summary
- `--list-models` - List all available LLM models

**Examples:**
```bash
# Basic analysis
tonl analyze data.json

# Visual dashboard (v1.0.0 enterprise design)
tonl analyze data.json --visual

# Different output formats
tonl analyze data.json --format json
tonl analyze data.json --format markdown > report.md
tonl analyze data.json --format csv

# Multi-currency
tonl analyze data.json --currency EUR
tonl analyze data.json --currency JPY --visual

# Custom exchange rate
tonl analyze data.json --currency EUR --rate 0.95

# Export to CSV
tonl analyze data.json --export results.csv

# Batch analysis
tonl analyze data/*.json --format csv
tonl analyze "**/*.json" --export batch-results.csv

# Different models
tonl analyze data.json --model claude-sonnet-4
tonl analyze data.json --model gemini-2.0-flash --visual

# List available models
tonl analyze --list-models
```

**Visual Dashboard (v1.0.0):**
- Clean, Stripe-level enterprise design
- Responsive layout (auto-detects terminal width)
- Animated token counters
- Live MCP server status with latency
- Smart recommendations (STRONG ADOPT, HIGH PRIORITY, RECOMMENDED)
- Keyboard shortcuts (q: quit, e: export, s: screenshot)

**Output Formats:**

**Text (default):**
```
📊 Analysis for data.json
Model:           GPT-4o (OpenAI)
Token Usage:
  JSON:          477 tokens
  TONL:          255 tokens
  ✅ Saved:       222 tokens (46.5%)
Costs (per 1M requests):
  ❌ JSON:        $1192.50
  ✅ TONL:        $637.50
  💰 Savings:     $555.00 (46.5%)
```

**JSON:**
```json
[{
  "model": {"name": "GPT-4o", "provider": "OpenAI"},
  "jsonTokens": 477,
  "tonlTokens": 255,
  "savingsPercent": 46.5,
  "costs": {
    "json": {"per1M": 1192.5},
    "tonl": {"per1M": 637.5},
    "savings": {"per1M": 555}
  }
}]
```

**Markdown:**
```markdown
# 🚀 TONL ROI Analysis Report

## 📊 Analysis Summary
- **File:** `data.json`
- **Savings:** 46.5%

## 💰 Cost Analysis
| Metric | JSON | TONL | Savings |
|--------|------|------|----------|
| Per 1M | $1,192.50 | $637.50 | **$555.00** |
```

---

## `tonl stream`

Stream NDJSON logs to TONL format with constant memory usage.

**NEW in v1.0.0** - High-performance streaming for log processing.

**Usage:**
```bash
tonl stream [options]
```

**Options:**
- `-i, --input <file>` - Input file (default: stdin)
- `-o, --output <file>` - Output file (default: stdout)
- `-n, --name <n>` - Collection name (default: "data")
- `--skip-invalid` - Skip invalid JSON lines (default: true)
- `--stats` - Show statistics at end

**Examples:**
```bash
# From file
tonl stream -i logs.ndjson

# From stdin (pipe)
cat logs.ndjson | tonl stream

# Monitor live logs
tail -f /var/log/app.log | tonl stream --name app_logs > logs.tonl

# Docker logs
docker logs -f container_name | tonl stream --name docker_logs

# Kubernetes logs
kubectl logs -f pod-name | tonl stream --name k8s_logs

# With custom collection name
cat logs.ndjson | tonl stream --name server_logs

# Save to file
tonl stream -i input.ndjson -o output.tonl

# Show performance stats
tonl stream -i logs.ndjson --stats

# Process large archives
zcat huge-logs.ndjson.gz | tonl stream > compressed-logs.tonl

# Real-time processing
tail -f /var/log/app.log | tonl stream --name app --stats
```

**Input Format (NDJSON):**
```json
{"level":"info","message":"Server started","timestamp":"2025-12-03T19:00:00Z"}
{"level":"warn","message":"High memory usage","timestamp":"2025-12-03T19:01:00Z"}
{"level":"error","message":"Connection timeout","timestamp":"2025-12-03T19:02:00Z"}
```

**Output Format (TONL Stream Mode):**
```tonl
logs[]{level:str,message:str,timestamp:datetime}:
  info, "Server started", 2025-12-03T19:00:00Z
  warn, "High memory usage", 2025-12-03T19:01:00Z
  error, "Connection timeout", 2025-12-03T19:02:00Z
```

**Performance:**
- **Throughput:** 50K-100K lines/sec
- **Memory:** Constant ~10-50MB (any file size)
- **Streaming:** Real-time with backpressure handling
- **Scale:** Handles GB-sized log files

**Use Cases:**
- DevOps log archival
- Real-time log monitoring
- Container log processing (Docker, Kubernetes)
- CI/CD pipeline integration
- Cost optimization for log storage

**See also:** [Streaming Guide](/guide/streaming) for detailed documentation

---

## `tonl roi`

Calculate ROI projections from token savings.

**Usage:**
```bash
tonl roi [options]
```

**Options:**
- `-b, --tokens-before <n>` - Tokens before optimization (per query)
- `-a, --tokens-after <n>` - Tokens after optimization (per query)
- `-s, --savings <n>` - Savings percentage (e.g., 45 for 45%)
- `-q, --queries-per-day <n>` - Number of queries per day (required)
- `-m, --model <model>` - LLM model (default: "gpt-4o")
- `--json` - Output as JSON
- `--summary` - Show marketing summary
- `--list-models` - List available models

**Examples:**
```bash
# From savings percentage
tonl roi --savings 45 --queries-per-day 1000

# From exact token counts
tonl roi --tokens-before 1500 --tokens-after 750 --queries-per-day 5000

# Different model
tonl roi --savings 50 --queries-per-day 2000 --model claude-sonnet-4

# JSON output
tonl roi --savings 45 --queries-per-day 1000 --json > roi.json

# Marketing summary
tonl roi --savings 60 --queries-per-day 10000 --summary
```

---

## `tonl batch`

Convert multiple files at once.

**Usage:**
```bash
tonl batch <pattern> [options]
```

**Arguments:**
- `pattern` - File pattern (e.g., "*.json" or "data/*.json")

**Options:**
- `-n, --name <n>` - Collection name for TONL output (default: "data")
- `-o, --output-dir <dir>` - Output directory for converted files
- `-s, --stats` - Show conversion statistics

**Examples:**
```bash
# Convert all JSON files in current directory
tonl batch "*.json"

# Convert with custom collection name
tonl batch "products/*.json" --name products

# Output to specific directory
tonl batch "data/*.json" --output-dir converted/

# Show statistics
tonl batch "*.json" --stats
```

---

## `tonl watch`

Watch files for changes and auto-convert.

**Usage:**
```bash
tonl watch <pattern> [options]
```

**Arguments:**
- `pattern` - File pattern to watch (e.g., "*.json")

**Options:**
- `-n, --name <n>` - Collection name for TONL output (default: "data")
- `-o, --output-dir <dir>` - Output directory for converted files

**Examples:**
```bash
# Watch all JSON files
tonl watch "*.json"

# Watch specific directory
tonl watch "data/*.json"

# Custom output directory
tonl watch "src/*.json" --output-dir dist/
```

---

## Currency Codes

Supported currencies for `--currency` option:

| Code | Currency | Symbol |
|------|----------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| JPY | Japanese Yen | ¥ |
| CHF | Swiss Franc | CHF |
| CAD | Canadian Dollar | CA$ |
| AUD | Australian Dollar | A$ |

**Usage:**
```bash
tonl analyze data.json --currency EUR
tonl analyze data.json --currency JPY --visual
tonl analyze data.json --currency GBP --export uk-report.csv
```

---

## LLM Models

### List All Models

```bash
tonl analyze --list-models
tonl roi --list-models
```

### OpenAI

| Model | Code | Price/1M tokens |
|-------|------|----------------|
| GPT-4o | `gpt-4o` | $2.50 |
| GPT-4o Mini | `gpt-4o-mini` | $0.15 |
| GPT-4 Turbo | `gpt-4-turbo` | $10.00 |
| o1 | `o1` | $15.00 |
| o1 Mini | `o1-mini` | $3.00 |

### Anthropic

| Model | Code | Price/1M tokens |
|-------|------|----------------|
| Claude Opus 4 | `claude-opus-4` | $15.00 |
| Claude Sonnet 4 | `claude-sonnet-4` | $3.00 |
| Claude Sonnet 3.5 | `claude-sonnet-3.5` | $3.00 |
| Claude Haiku 4 | `claude-haiku-4` | $0.25 |

### Google

| Model | Code | Price/1M tokens |
|-------|------|----------------|
| Gemini 2.0 Flash | `gemini-2.0-flash` | $0.075 |
| Gemini 1.5 Pro | `gemini-1.5-pro` | $1.25 |
| Gemini 1.5 Flash | `gemini-1.5-flash` | $0.075 |

---

## Glob Patterns

TONL CLI supports glob patterns for batch processing:

```bash
# All JSON files in current directory
tonl analyze "*.json"

# All JSON files in subdirectories
tonl analyze "**/*.json"

# Specific pattern
tonl analyze "data/products-*.json"

# Multiple patterns (use shell expansion)
tonl analyze data/{products,users,orders}.json
```

**Note:** Quote patterns to prevent shell expansion:
```bash
# ✅ Good
tonl analyze "*.json"

# ❌ Bad (shell expands before TONL sees it)
tonl analyze *.json
```

---

## Exit Codes

- `0` - Success
- `1` - Error (file not found, invalid input, etc.)

**Usage in scripts:**
```bash
#!/bin/bash

if tonl analyze data.json --format json > results.json; then
  echo "Analysis successful"
else
  echo "Analysis failed"
  exit 1
fi
```

---

## Environment Variables

### `NODE_OPTIONS`

Increase memory for large files:

```bash
NODE_OPTIONS="--max-old-space-size=8192" tonl convert large-file.json
```

### `NO_COLOR`

Disable colored output (for CI/CD):

```bash
NO_COLOR=1 tonl analyze data.json
```

---

## Error Messages

TONL provides helpful error messages with suggestions:

### File Not Found
```bash
$ tonl analyze dat.json

❌ Error: File not found: dat.json

   Did you mean:
   • data.json
   • data-old.json

   Try: tonl analyze --help
```

### Invalid JSON
```bash
$ tonl analyze broken.json

❌ Error: Invalid JSON in broken.json

   Error near position 42
   Unexpected token } in JSON at position 42

   Common issues:
   • Missing quotes around strings
   • Trailing commas in objects/arrays
   • Unescaped special characters

   Tip: Validate your JSON at https://jsonlint.com
```

---

## Best Practices

### 1. Use Stream for Large Logs
```bash
# Don't use convert for logs (loads entire file)
tonl convert huge-logs.json  # ❌ High memory

# Use stream instead (constant memory)
cat huge-logs.ndjson | tonl stream  # ✅ Low memory
```

### 2. Use Glob Patterns for Batch Operations
```bash
tonl analyze "data/**/*.json" --export batch-results.csv
```

### 3. Pipe Output for Automation
```bash
tonl analyze data.json --format json | jq '.[] | .savingsPercent'
```

### 4. Redirect Output to Files
```bash
tonl analyze data.json --format markdown > ANALYSIS.md
tonl stream -i logs.ndjson -o logs.tonl
```

### 5. Use --visual for Presentations
```bash
tonl analyze demo.json --visual
```

### 6. Multi-Currency for Global Teams
```bash
# US report
tonl analyze data.json --currency USD --export us-report.csv

# EU report
tonl analyze data.json --currency EUR --export eu-report.csv
```

---

## v1.0.0 Features

**NEW in v1.0.0:**
- ✨ Enterprise-grade visual dashboard with live MCP status
- 🚀 High-performance log streaming (`tonl stream`)
- 📊 Prometheus metrics integration
- ⚡ Responsive layout (MacBook Air support)
- 🎨 Animated progress bars with token counting
- ⌨️ Keyboard shortcuts in dashboard (q, e, s)
- 🔄 Live MCP server latency tracking
- 📈 Smart recommendations (STRONG ADOPT, HIGH PRIORITY)

---

## Next Steps

- [Streaming Guide](/guide/streaming) - Log streaming documentation
- [Metrics Guide](/guide/metrics) - Prometheus monitoring
- [Visual Dashboard](/guide/visual-dashboard) - Dashboard features
- [ROI Calculator](/guide/roi-calculator) - Detailed ROI examples
- [Examples](/examples/) - Real-world use cases
- [CI/CD Integration](/guide/ci-cd-integration) - Automation guides
