# Visual Dashboard

The Visual Dashboard provides a clean, enterprise-grade terminal interface for analyzing TONL token savings. Built with React and Ink, it renders professional analytics directly in your terminal.

## Overview

The visual dashboard (v1.0.0) features a modern, Stripe-level design with responsive layouts, animated metrics, and live MCP server status.

## Features

**Enterprise Design**
- Clean, minimal layout inspired by Stripe/Vercel dashboards
- Responsive design (auto-detects terminal width)
- Compact mode for screens <100 cols (MacBook Air support)
- Animated progress bars with smooth token counting
- Live MCP status indicator with latency tracking

**Professional Presentation**
- Metric cards showing key stats at-a-glance
- Thin progress bars (━ character) for elegant look
- Smart recommendations (STRONG ADOPT, HIGH PRIORITY, RECOMMENDED)
- Dynamic version from package.json (always current)
- Keyboard shortcuts (q: quit, e: export CSV, s: screenshot)

**Real-time Monitoring**
- Live MCP server status with latency (updates every 5s)
- Response time display
- Connection status indicator
- Current date display

## Basic Usage

### Single File Analysis

```bash
tonl analyze data.json --visual
```

This displays a full dashboard with:
- Header with TONL branding
- Token usage comparison with progress bars
- Cost analysis table
- Annual savings projection
- Recommendation

### With Different Models

```bash
# Analyze with Claude
tonl analyze data.json --model claude-sonnet-4 --visual

# Analyze with Gemini
tonl analyze data.json --model gemini-2.0-flash --visual

# Analyze with GPT-4o Mini
tonl analyze data.json --model gpt-4o-mini --visual
```

### Multi-Currency Display

```bash
# Display costs in Euros
tonl analyze data.json --currency EUR --visual

# Display costs in Japanese Yen
tonl analyze data.json --currency JPY --visual

# Display costs in British Pounds
tonl analyze data.json --currency GBP --visual
```

## Dashboard Components

### Header Section

The header displays the TONL logo in ASCII art with a rainbow gradient effect, along with the analyzer title and current version number.

```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer                                    v1.0.0
```

### Token Usage Analysis

Visual progress bars show the token count comparison:

```
 📊 Token Usage Analysis
 data.json
 
 JSON    ████████████████████████████████████████  477 tokens
 TONL    █████████████████████░░░░░░░░░░░░░░░░░░░  255 tokens (-46.5%)
```

The bars scale to 40 characters maximum, with filled blocks representing usage and empty blocks showing available capacity. The percentage savings appears beside the TONL bar with a checkmark indicator.

### Cost Analysis Table

Structured table comparing costs at different scales:

```
 💰 Cost Analysis (GPT-4o)
                     Per 1K         Per 1M
 ──────────────────────────────────────────────────
 JSON                $1.19          $1,192.50
 TONL                $0.64          $637.50
 ──────────────────────────────────────────────────
 💎 NET SAVINGS      $0.55          $555.00
```

Colors indicate cost levels:
- Red text for JSON costs
- Green text for TONL costs  
- Cyan bold for savings

### Annual Savings Projection

Calculates projected savings at 1,000 requests per day:

```
 💡 Annual Savings @ 1K requests/day:
   $202.57/year
```

This projection helps quantify the business impact of token optimization.

### Recommendation Engine

Automated recommendation based on savings percentage:

```
 Recommendation: STRONG ADOPT
```

**Recommendation Levels (v1.0.0):**
- **Savings ≥40%:** "STRONG ADOPT" (green)
- **Savings 30-40%:** "HIGH PRIORITY" (cyan)
- **Savings 10-30%:** "RECOMMENDED" (yellow)
- **Savings <10%:** "CONSIDER" (gray)

### Keyboard Shortcuts

- `q` or `ESC`: Quit dashboard
- `e`: Export to CSV
- `s`: Take screenshot

### Responsive Layout

The dashboard automatically adapts to your terminal width:

**Full Mode (>100 cols):**
- Split-view: 60% performance, 40% cost impact
- 3 metric cards at top
- Detailed progress bars

**Compact Mode (<100 cols):**
- Single column layout
- Essential metrics only
- Optimized for MacBook Air 13"

## Use Cases

### Sales Presentations

The visual dashboard is ideal for demonstrating value to potential clients:

```bash
# Prepare demo data
tonl analyze client-sample.json --visual

# Show in different currencies for international clients
tonl analyze client-sample.json --currency EUR --visual
```

The animated interface creates engagement and makes abstract token savings tangible.

### Team Demonstrations

Show your engineering team the impact of TONL adoption:

```bash
# Compare different models
tonl analyze production-sample.json --model gpt-4o --visual
tonl analyze production-sample.json --model claude-sonnet-4 --visual
```

Side-by-side comparisons help teams understand cost variations across providers.

### Executive Reviews

Present cost reduction initiatives with clear metrics:

```bash
# Generate executive-friendly visualization
tonl analyze quarterly-data.json --currency USD --visual
```

The dashboard's professional appearance suits boardroom presentations and budget discussions.

### Live Workshops

Use during training sessions to illustrate token optimization concepts:

```bash
# Show before optimization
tonl analyze unoptimized-data.json --visual

# Show after optimization
tonl analyze optimized-data.json --visual
```

Real-time visualization helps participants understand the immediate impact of structural changes.

## Technical Details

### Implementation

The dashboard uses React components rendered to the terminal via Ink:

- **Header.tsx** - Rainbow gradient ASCII art
- **TokenBar.tsx** - Progress bar components with percentage display
- **CostTable.tsx** - Structured cost comparison table
- **AnalysisDashboard.tsx** - Main layout coordinator

All components use Unicode box-drawing characters and ANSI color codes for professional rendering across terminal types.

### Requirements

The visual dashboard requires:
- Node.js 14 or higher
- Terminal with Unicode support
- ANSI color support (most modern terminals)

Works on:
- macOS Terminal and iTerm2
- Linux terminal emulators (GNOME Terminal, Konsole, etc.)
- Windows Terminal
- VS Code integrated terminal

### Performance

Dashboard rendering is instantaneous for files up to 10MB. Larger files may show a brief delay during JSON parsing but render immediately once data is loaded.

## Limitations

**Single File Only**

The visual dashboard currently supports single file analysis:

```bash
# Supported
tonl analyze data.json --visual

# Not supported
tonl analyze *.json --visual
```

For batch analysis, use other output formats and generate summary reports.

**Terminal Requirements**

Some older terminals may not support all Unicode characters or ANSI colors. In such cases, use standard text output:

```bash
tonl analyze data.json  # Default text output
```

**No Interactive Features**

The dashboard is presentation-only and does not support interactive navigation or drill-down. For detailed analysis, use JSON or Markdown exports:

```bash
tonl analyze data.json --format json > detailed-analysis.json
```

## Comparison with Other Formats

| Feature | Visual Dashboard | JSON | Markdown | CSV |
|---------|-----------------|------|----------|-----|
| Human readable | Excellent | Poor | Good | Fair |
| Machine parseable | No | Yes | Partial | Yes |
| Presentation quality | Excellent | Poor | Good | Poor |
| CI/CD integration | Poor | Excellent | Good | Good |
| Stakeholder reports | Excellent | Poor | Excellent | Good |
| Real-time feedback | Yes | No | No | No |

The visual dashboard excels at presentation and immediate feedback. For automation and detailed analysis, combine with other output formats.

## Best Practices

**Use for Live Demos**

The dashboard is designed for interactive sessions:

```bash
# During client calls
tonl analyze demo-data.json --visual

# In team meetings  
tonl analyze sprint-data.json --visual
```

**Combine with Other Outputs**

Generate multiple formats for different audiences:

```bash
# Visual for live presentation
tonl analyze data.json --visual

# Markdown for email follow-up
tonl analyze data.json --format markdown > follow-up.md

# CSV for detailed analysis
tonl analyze data.json --export analysis.csv
```

**Screen Recording**

Record terminal sessions for asynchronous sharing:

```bash
# Use terminal recording tools
asciinema rec tonl-demo.cast
tonl analyze data.json --visual
# Press Ctrl+D to stop recording
```

Share recordings with teams who cannot attend live demos.

## Troubleshooting

**Colors Not Displaying**

If colors appear as garbled text, your terminal may not support ANSI:

```bash
# Disable colors
NO_COLOR=1 tonl analyze data.json
```

**Unicode Characters Broken**

If box-drawing characters appear incorrect:

```bash
# Use standard text output
tonl analyze data.json --format text
```

**Dashboard Not Appearing**

Verify you are using the `--visual` flag:

```bash
# Correct
tonl analyze data.json --visual

# Incorrect (shows standard output)
tonl analyze data.json
```

## Next Steps

- [CLI Reference](/guide/cli-reference) - Complete command documentation
- [ROI Calculator](/guide/roi-calculator) - Detailed analysis features
- [Multiple Output Formats](/guide/output-formats) - Export options
