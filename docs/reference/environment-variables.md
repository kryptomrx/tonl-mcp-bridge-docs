# Environment Variables

Complete reference for configuring TONL-MCP Bridge via environment variables.

## Quick Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `TONL_AUTH_TOKEN` | None | Authentication token |
| `PORT` | `3000` | Server port |
| `TONL_RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `TONL_RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15min) |
| `TONL_RATE_LIMIT_MAX` | `100` | Max requests per window |
| `TONL_SERVER_URL` | `http://localhost:3000/metrics` | Default server URL for CLI |

## Complete Documentation

See individual sections for detailed configuration options and examples.

- [MCP Server Guide](/guide/mcp-server#configuration)
- [Security Guide](/guide/security)
- [Live Monitoring](/guide/live-monitoring)
