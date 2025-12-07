# Commands Reference

Complete command reference for all TONL-MCP Bridge operations. See the main project's [COMMANDS.md](https://github.com/kryptomrx/tonl-mcp-bridge/blob/main/COMMANDS.md) for the authoritative reference.

## Quick Access

```bash
# Show comprehensive commands
tonl help

# Command-specific help
tonl convert --help
tonl analyze --help
tonl roi --help
tonl top --help
```

## Most Common Commands

### File Conversion

```bash
# Convert JSON to TONL
tonl convert data.json

# With statistics
tonl convert data.json -s

# Anonymize sensitive fields
tonl convert users.json --anonymize email,ssn --mask
```

### Live Monitoring

```bash
# Monitor local server
tonl top

# Monitor production server
tonl top --url https://api.production.com
```

### Server Operations

```bash
# Start MCP server
export TONL_AUTH_TOKEN=your-token
tonl-mcp-server

# Health checks
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### Analysis & ROI

```bash
# Analyze file
tonl analyze data.json --visual

# Calculate ROI
tonl roi --savings 45 --queries-per-day 1000
```

## Full Documentation

For complete command documentation including:
- All CLI commands and options
- Server endpoints and API
- Docker and Kubernetes commands
- Environment variables
- Programmatic API usage
- Troubleshooting commands

See: [COMMANDS.md](https://github.com/kryptomrx/tonl-mcp-bridge/blob/main/COMMANDS.md)

## CLI Help System

The `tonl help` command provides access to comprehensive documentation:

```bash
# General help
tonl help

# Command help
tonl help convert
tonl convert --help
```

## Categories

### File Operations
- `convert` - Convert between JSON/YAML/TONL
- `batch` - Convert multiple files
- `watch` - Auto-convert on file changes
- `stream` - Stream NDJSON to TONL

### Analysis
- `analyze` - Token usage analysis
- `roi` - ROI calculation

### Monitoring
- `top` - Live server monitoring

### Server
- `tonl-mcp-server` - Start MCP server

## Common Options

```bash
-s, --stats              # Show statistics
-n, --name <name>        # Collection name
-m, --model <model>      # LLM model
--anonymize <fields>     # Anonymize fields
--mask                   # Smart masking
--url <url>              # Server URL
--visual                 # Visual dashboard
```

## Getting Help

```bash
# General help
tonl --help

# Version
tonl --version

# GitHub
open https://github.com/kryptomrx/tonl-mcp-bridge

# Documentation
open https://tonl-mcp-bridge-docs.vercel.app/
```

## Next Steps

- [Streaming Pipeline](/guide/streaming) - Real-time conversion
- [Privacy & Compliance](/guide/privacy) - Data anonymization
- [Live Monitoring](/guide/live-monitoring) - Server metrics
- [MCP Server](/guide/mcp-server) - Production deployment
