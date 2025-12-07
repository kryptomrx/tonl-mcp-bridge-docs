# Live Monitoring with `tonl top`

Real-time server monitoring dashboard for TONL MCP Server. Like `htop` but for your TONL infrastructure.

## Overview

The `tonl top` command provides a live, terminal-based dashboard that displays real-time metrics from your TONL MCP Server. Monitor CPU, memory, conversions, token savings, and business impact in a single view.

## Quick Start

```bash
# Start server
export TONL_AUTH_TOKEN=your-token
npm run mcp:start

# In another terminal
tonl top
```

![Dashboard showing CPU 3.3%, RAM 32.9 MB, 156 conversions, 38k tokens saved]

## Features

### System Resources
- **CPU Usage**: Real-time percentage with color-coded bars
- **Memory (RSS)**: Actual process memory usage vs container limit (default 512MB)
- **Heap Usage**: Node.js heap percentage (shown as additional info)
- **Event Loop Lag**: Monitor for performance issues
- **Health Status**: 🟢 Online / 🔴 Degraded

### Live Activity
- **Active Streams**: Current SSE connections
- **Conversions**: Total, successful, and failed counts
- **Error Tracking**: By type (auth, validation, internal, stream)

### Business Impact
- **Tokens Saved**: Cumulative token savings
- **Cost Saved**: Estimated cost savings in USD
- **Avg Compression**: Average compression ratio across all operations

## Installation

```bash
npm install -g tonl-mcp-bridge
```

## Basic Usage

### Monitor Local Server

```bash
tonl top
```

Connects to `http://localhost:3000/metrics` by default.

### Monitor Remote Server

```bash
tonl top --url https://production.company.com/metrics
```

### With Authentication

```bash
# Via environment variable
export TONL_AUTH_TOKEN=your-secure-token
tonl top

# Via command line
tonl top --token your-secure-token
```

### Custom Refresh Rate

```bash
# Update every 2 seconds (default: 1s)
tonl top --interval 2000
```

## Command Options

```bash
tonl top [options]

Options:
  -u, --url <url>        Server metrics URL (default: http://localhost:3000/metrics)
  -i, --interval <ms>    Refresh interval in milliseconds (default: 1000)
  -t, --token <token>    Auth token (or use TONL_AUTH_TOKEN env var)
  --no-stream            Disable SSE streaming (use polling instead)
  -h, --help             Display help
```

## Dashboard Sections

### Header

```
TONL SERVER MONITOR  🟢 ONLINE  v1.0.0  •  http://localhost:3000/metrics  •  Uptime: 0h 12m
```

- Status indicator (🟢/🔴)
- Server version
- Server URL
- Uptime

### Resources

```
Resources:
CPU   [████░░░░░░░░░░░░░░░░]  3.3%
RAM   [███░░░░░░░░░░░░░░░░░]  93.0 MB  (Heap: 67%)
Lag   [2.1ms]  Healthy
```

**CPU Bar Colors:**
- Green: 0-50%
- Yellow: 50-80%
- Red: 80%+

**Memory Bar:**
- Shows RSS (Resident Set Size) - actual process memory
- Bar represents percentage of typical container limit (512MB)
- Heap percentage shown as additional context
- **Why RSS?** More accurate for operations/K8s resource planning
- **Heap %** high (80-95%) is normal - Node.js triggers GC automatically

**Memory Colors:**
- Green: 0-50% of 512MB (0-256MB)
- Yellow: 50-80% (256-410MB)
- Red: 80%+ (410MB+)

**Event Loop Lag:**
- Healthy: <100ms
- Slow: ≥100ms

### Live Activity

```
Live Activity:
👥 Active Streams:    1
⚡ Conversions:       156 total (156 ✓, 0 ✗)
🔥 Errors (total):    0
```

**Counters:**
- Active Streams: Current SSE connections
- Conversions: Success/failure breakdown
- Errors: Detailed by type when > 0

### Business Impact

```
Business Impact:
💰 Tokens Saved:      38,168
💵 Cost Saved:        $0.0954
📉 Avg Compression:   64.9%
```

**Metrics:**
- Tokens Saved: Cumulative since server start
- Cost Saved: Based on GPT-4o pricing ($2.50/1M tokens)
- Compression: Average ratio (lower = better compression)

## Live Streaming Mode

By default, `tonl top` uses SSE (Server-Sent Events) for real-time updates:

```bash
tonl top  # SSE streaming (recommended)
```

**Benefits:**
- Real-time updates (push-based)
- Lower latency
- More efficient than polling
- Works great over networks

### Polling Mode

Fallback to HTTP polling if SSE is unavailable:

```bash
tonl top --no-stream
```

Uses periodic HTTP requests instead of persistent connection.

## Authentication

### Development (No Auth)

```bash
# Server without token
npm run mcp:start

# Dashboard without token
tonl top
```

Server auto-generates session tokens.

### Production (With Auth)

```bash
# Server with token
export TONL_AUTH_TOKEN=your-secure-token
npm run mcp:start

# Dashboard with token
export TONL_AUTH_TOKEN=your-secure-token
tonl top
```

Or use CLI flag:

```bash
tonl top --token your-secure-token
```

## Configuration

### Environment Variables

```bash
# Server URL (if not default)
export TONL_SERVER_URL=https://production.company.com/metrics

# Auth token
export TONL_AUTH_TOKEN=your-secure-token

# Then simply
tonl top
```

### Rate Limiting

Server-side rate limiting is configurable:

```bash
# Disable rate limiting (development)
export TONL_RATE_LIMIT_ENABLED=false
npm run mcp:start

# Configure limits (production)
export TONL_RATE_LIMIT_ENABLED=true
export TONL_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
export TONL_RATE_LIMIT_MAX=100           # 100 requests
npm run mcp:start
```

**Note:** Rate limiting applies to `/stream/convert`, not `/metrics/live`.

## Use Cases

### 1. Development Monitoring

Monitor server during local development:

```bash
# Terminal 1: Server
npm run mcp:start

# Terminal 2: Dashboard
tonl top

# Terminal 3: Load testing
node load-test.js
```

Watch metrics update in real-time as you test.

### 2. Production Monitoring

Monitor remote production server:

```bash
tonl top --url https://tonl-prod.company.com/metrics --token $PROD_TOKEN
```

Keep dashboard open in dedicated terminal or tmux pane.

### 3. Performance Testing

Monitor server under load:

```bash
# Terminal 1: Server
npm run mcp:start

# Terminal 2: Dashboard
tonl top

# Terminal 3: Load test
for i in {1..1000}; do
  curl -X POST http://localhost:3000/stream/convert \
    -H "Content-Type: application/x-ndjson" \
    --data-binary @test.ndjson
done
```

Watch CPU, memory, and event loop lag.

### 4. Troubleshooting

Debug server issues:

```bash
tonl top
```

**Check for:**
- High CPU (>80%)
- Memory leaks (increasing heap)
- Event loop lag (>100ms)
- Error spikes
- Failed conversions

### 5. Team Collaboration

Share server status with team:

```bash
# In tmux or screen session
tonl top --url https://shared-server.company.com/metrics
```

Team members can view same dashboard.

## Metrics Explained

### CPU Percentage

Calculated from Prometheus counters:

```
CPU% = (cpu_delta / time_delta) * 100
```

Requires 2+ snapshots for calculation (shows 0% initially).

### Memory Percentage

**RSS (Resident Set Size):**
```
RSS = Actual process memory footprint
Bar% = (RSS / 512MB limit) * 100
```

**Why we show RSS instead of Heap:**
- RSS is what Kubernetes/Docker sees
- RSS is what counts against container limits
- RSS is stable and predictable
- Heap % can be 90%+ and still healthy (GC triggers automatically)

**Heap Percentage (shown for context):**
```
Heap% = (heap_used / heap_total) * 100
```
- High heap % (80-95%) is **NORMAL** and **HEALTHY**
- Node.js V8 engine triggers GC when needed
- Focus on RSS for operational decisions

**Example:**
```
RAM [███░░░░░░░] 93.0 MB (Heap: 95%)
     ^^^                    ^^^
     RSS: 18% of 512MB      Heap almost full - GC will run soon
     Green bar = healthy    This is normal!
```

### Event Loop Lag

Measured in milliseconds:

- **0-10ms**: Excellent
- **10-50ms**: Good
- **50-100ms**: Fair (warning)
- **100ms+**: Poor (server is struggling)

### Compression Ratio

```
Compression% = (1 - tonl_bytes / json_bytes) * 100
```

Higher percentage = better compression.

## Troubleshooting

### Dashboard Shows DEGRADED

**Possible causes:**
- High CPU usage (>80%)
- Event loop lag (>100ms)
- High RSS (>400MB for 512MB limit)

**Note:** High Heap % alone does NOT cause DEGRADED status - this is normal!

**Solutions:**
1. Check server logs for errors
2. Reduce concurrent requests
3. Scale horizontally (more replicas)
4. Optimize payload sizes
5. Check if RSS is growing continuously (memory leak)

### Connection Failed (401/403)

**Issue:** Authentication error

**Solutions:**
```bash
# Check token is set
echo $TONL_AUTH_TOKEN

# Use correct token
export TONL_AUTH_TOKEN=correct-token-here
tonl top
```

### No Data / Stuck on Loading

**Issue:** Server not responding

**Solutions:**
1. Check server is running: `ps aux | grep node`
2. Verify endpoint: `curl http://localhost:3000/metrics`
3. Check firewall settings
4. Try polling mode: `tonl top --no-stream`

### Metrics Not Updating

**Issue:** SSE stream disconnected

**Solutions:**
1. Check network stability
2. Restart dashboard: `Ctrl+C` then `tonl top`
3. Use polling mode: `tonl top --no-stream`

### High Error Count

**Issue:** Server reporting errors

**Check error types:**
- **Auth**: Wrong tokens
- **Validation**: Bad input data
- **Internal**: Server bugs
- **Stream**: Streaming failures

View server logs for details:
```bash
npm run mcp:start 2>&1 | tee server.log
```

## Performance

### Dashboard Overhead

- **CPU**: <1% typical
- **Memory**: ~50MB
- **Network**: ~1KB/second (SSE mode)

### Update Frequency

Default 1-second updates provide:
- Real-time feel
- Reasonable network usage
- Low server impact

Adjust for your needs:
```bash
tonl top --interval 5000  # Every 5 seconds
```

## Keyboard Shortcuts

- **Ctrl+C**: Exit dashboard
- **q**: Quit (if implemented)

## Integration

### With Prometheus

The dashboard reads Prometheus metrics exposed by the server:

```bash
# View raw metrics
curl http://localhost:3000/metrics
```

**Key metrics used:**
- `tonl_process_cpu_*`: CPU usage
- `tonl_nodejs_heap_size_*`: Memory
- `tonl_nodejs_eventloop_lag_*`: Event loop
- `tonl_tokens_saved_total`: Token savings
- `tonl_conversion_requests_total`: Conversions
- `tonl_errors_total`: Errors

### With Grafana

For advanced monitoring, import metrics to Grafana:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tonl'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

Use `tonl top` for quick checks, Grafana for dashboards.

## Best Practices

**Always Monitor Under Load**

Don't just check when things are working:
```bash
# Start monitoring BEFORE load testing
tonl top
# Then run load tests in another terminal
```

**Set Up Alerts**

For production, monitor continuously:
- Use Grafana alerts for CPU/memory thresholds
- Use `tonl top` for manual checks

**Keep Token Secure**

Never commit auth tokens:
```bash
# .env
TONL_AUTH_TOKEN=secret-token

# Use env file
source .env
tonl top
```

**Monitor Multiple Servers**

Use tmux/screen for multiple dashboards:
```bash
# Window 1: Production
tonl top --url https://prod.company.com/metrics

# Window 2: Staging
tonl top --url https://staging.company.com/metrics

# Window 3: Development
tonl top
```

## Examples

### Basic Local Monitoring

```bash
# Terminal 1
npm run mcp:start

# Terminal 2
tonl top
```

### Production Monitoring with Auth

```bash
export TONL_AUTH_TOKEN=$(vault read -field=token secret/tonl)
tonl top --url https://tonl-prod.company.com/metrics
```

### Custom Refresh Rate

```bash
# Every 500ms (high frequency)
tonl top --interval 500

# Every 5s (low frequency)
tonl top --interval 5000
```

### Polling Mode (No SSE)

```bash
tonl top --no-stream --interval 2000
```

## See Also

- [MCP Server Guide](/guide/mcp-server) - Server setup
- [Metrics Reference](/api/metrics) - All available metrics
- [Deployment](/guide/deployment) - Production deployment
- [Troubleshooting](/guide/troubleshooting) - Common issues
