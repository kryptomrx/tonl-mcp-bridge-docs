# Live MCP Monitoring

Real-time monitoring of your TONL MCP Server status directly in the Visual Dashboard.

## Overview

The Live MCP Monitoring feature (v1.0.0) provides real-time status updates about your TONL MCP Server connection. The monitor checks server health every 5 seconds and displays connection status, response time, and latency directly in the dashboard.

## Features

**Real-time Status**
- Live connection indicator (🟢 Online / 🔴 Offline / 🟡 Connecting)
- Response time measurement in milliseconds
- Automatic health checks every 5 seconds
- Non-blocking background updates

**Visual Indicators**
- Color-coded status (green/red/yellow)
- Response time in ms
- Last check timestamp
- Clean, minimal design

## How It Works

The monitor performs background health checks using the `/metrics` endpoint:

```typescript
fetch('http://localhost:3000/metrics')
  .then(response => {
    if (response.ok) {
      status = 'online';
      latency = Date.now() - startTime;
    }
  })
```

Updates happen every 5 seconds without blocking the UI.

## Usage

The MCP status appears automatically in the Visual Dashboard:

```bash
tonl analyze data.json --visual
```

**Dashboard Header:**
```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer                   MCP: 🟢 Online (45ms)    v1.0.0
```

## Status Indicators

### Online (🟢)
Server is responding to health checks:
```
MCP: 🟢 Online (45ms)
```
- Green indicator
- Response time displayed
- Server is operational

### Offline (🔴)
Server is not responding:
```
MCP: 🔴 Offline
```
- Red indicator
- No response time
- Check server status

### Connecting (🟡)
Initial health check in progress:
```
MCP: 🟡 Connecting...
```
- Yellow indicator
- First check pending
- Normal on dashboard start

## Server Configuration

### Default Server
The monitor checks `http://localhost:3000` by default.

### Custom Server
Set environment variable for custom server URL:

```bash
export TONL_MCP_URL=http://production-server:3000
tonl analyze data.json --visual
```

### Server Requirements

The MCP server must expose the `/metrics` endpoint:

```bash
# Start server
npm run mcp:start

# Verify endpoint
curl http://localhost:3000/metrics
```

## Latency Thresholds

Response time interpretation:

| Latency | Status | Description |
|---------|--------|-------------|
| 0-50ms | Excellent | Local server, optimal |
| 50-100ms | Good | Same network |
| 100-200ms | Fair | Remote server |
| 200ms+ | Slow | Network issues |
| N/A | Offline | Server down |

## Use Cases

### Development
Monitor server status during local development:

```bash
# Terminal 1: Start server
npm run mcp:start

# Terminal 2: Watch status
tonl analyze data.json --visual
```

Visual feedback confirms server is running.

### Production Monitoring
Check production server health:

```bash
TONL_MCP_URL=https://tonl.company.com tonl analyze data.json --visual
```

Quick verification of remote server status.

### Troubleshooting
Diagnose connectivity issues:

```bash
# Check if server is responding
tonl analyze data.json --visual

# If offline, verify server
curl http://localhost:3000/metrics
```

Real-time feedback helps identify problems quickly.

### Presentations
Show live system status during demos:

```bash
tonl analyze demo-data.json --visual
```

Live status indicator builds confidence in system reliability.

## Integration with Metrics

The live monitor uses the same Prometheus metrics endpoint:

```bash
# Metrics endpoint
GET http://localhost:3000/metrics

# Returns Prometheus format
tonl_conversion_requests_total{...} 42
tonl_tokens_saved_total{...} 15000
...
```

Successful health check confirms:
- Server is running
- Metrics are being collected
- API is accessible

## Performance

**Efficient Polling**
- 5-second interval (not aggressive)
- Async updates (non-blocking)
- Minimal network overhead (~1KB per check)

**Resource Usage**
- Negligible CPU impact
- Small memory footprint
- No UI blocking

## Troubleshooting

### Status Always Offline

**Check server is running:**
```bash
ps aux | grep node
```

**Verify metrics endpoint:**
```bash
curl http://localhost:3000/metrics
```

**Check firewall:**
```bash
# macOS
sudo pfctl -s rules | grep 3000

# Linux
sudo iptables -L | grep 3000
```

### High Latency

**Check network:**
```bash
ping localhost
```

**Verify server load:**
```bash
curl http://localhost:3000/metrics | grep process_cpu
```

**Check system resources:**
```bash
top -p $(pgrep node)
```

### Status Stuck on Connecting

**Check network connectivity:**
```bash
curl -I http://localhost:3000/metrics
```

**Verify URL configuration:**
```bash
echo $TONL_MCP_URL
```

**Check server logs:**
```bash
npm run mcp:start 2>&1 | tee server.log
```

## Best Practices

**Always Check Status**

Before analysis, verify server is online:
```bash
tonl analyze data.json --visual
# Check MCP indicator before proceeding
```

**Monitor During Long Sessions**

For extended analysis sessions, watch for status changes:
- Server restarts
- Network interruptions
- Resource exhaustion

**Use in CI/CD**

Skip visual dashboard in automated environments:
```bash
# CI/CD - use JSON output
tonl analyze data.json --format json

# Local development - use visual
tonl analyze data.json --visual
```

## Technical Details

### Health Check Logic

```typescript
async function checkHealth() {
  const startTime = Date.now();
  
  try {
    const response = await fetch(serverUrl + '/metrics');
    
    if (response.ok) {
      return {
        status: 'online',
        latency: Date.now() - startTime
      };
    }
  } catch (error) {
    return { status: 'offline' };
  }
}
```

### Update Interval

5-second interval chosen for:
- Balance between freshness and overhead
- Reasonable for manual monitoring
- Not aggressive for production servers

### Timeout Handling

Health checks timeout after 3 seconds:
```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 3000);

fetch(url, { signal: controller.signal });
```

## Future Enhancements

Planned improvements:
- Configurable check interval
- Detailed error messages
- Historical latency graph
- Multiple server monitoring
- Alert notifications

## See Also

- [Visual Dashboard](/guide/visual-dashboard) - Dashboard overview
- [MCP Server](/guide/mcp-server) - Server setup
- [Metrics](/guide/metrics) - Prometheus metrics
- [Deployment](/guide/deployment) - Production deployment
