# Prometheus Metrics

Monitor your TONL MCP Server with Prometheus metrics for production observability.

## Overview

The TONL MCP Server exposes Prometheus metrics at `/metrics` endpoint for monitoring:
- Token savings and cost metrics
- Conversion performance metrics
- Server health and connections
- Data processing volumes

## Quick Start

### Access Metrics

```bash
curl http://localhost:3000/metrics
```

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'tonl-mcp-bridge'
    static_configs:
      - targets: ['localhost:3000']
    scrape_interval: 15s
```

### Docker Compose Stack

Use the provided monitoring stack:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:
- TONL MCP Server (port 3000)
- Prometheus (port 9090)
- Grafana (port 3001)

## Available Metrics

### Business Metrics (ROI)

**Token Savings**
```promql
tonl_tokens_saved_total{model="gpt-4o"}
```
Total tokens saved since server start.

**Cost Savings**
```promql
tonl_estimated_cost_savings_usd{model="gpt-4o"}
```
Estimated cost savings in USD.

**Compression Ratio**
```promql
tonl_compression_ratio{model="gpt-4o"}
```
TONL size / JSON size (lower is better).

**Conversion Requests**
```promql
tonl_conversion_requests_total{operation="json_to_tonl",status="success"}
```
Total conversion requests by operation and status.

### Operational Metrics (DevOps)

**Conversion Duration**
```promql
tonl_conversion_duration_seconds{operation="json_to_tonl"}
```
Processing time histogram.

**Active Connections**
```promql
tonl_active_connections
```
Current SSE connections.

**Data Size**
```promql
tonl_data_size_bytes{type="json_input"}
tonl_data_size_bytes{type="tonl_output"}
```
Bytes processed by type.

### System Metrics

Standard Node.js metrics with `tonl_` prefix:
- `tonl_process_cpu_seconds_total`
- `tonl_nodejs_heap_size_total_bytes`
- `tonl_nodejs_eventloop_lag_seconds`

## Grafana Dashboard

Import the pre-built dashboard:

1. Open Grafana at http://localhost:3001
2. Login (admin/admin)
3. Import dashboard from `grafana-dashboard.json`

### Dashboard Panels

**Row 1: Business Impact**
- Cost Savings (USD)
- Tokens Saved
- Compression Ratio
- Active Connections

**Row 2: Performance**
- Requests per Second
- Conversion Latency (p95, p50)

**Row 3: Operations**
- Requests by Model
- Requests by Operation
- Error Rate

**Row 4: Infrastructure**
- Data Size Distribution
- Memory Usage
- CPU Usage

## Query Examples

### Cost Savings Rate
```promql
rate(tonl_estimated_cost_savings_usd[5m])
```

### Throughput
```promql
rate(tonl_conversion_requests_total[1m])
```

### Error Rate
```promql
rate(tonl_conversion_requests_total{status="error"}[5m])
/ 
rate(tonl_conversion_requests_total[5m])
```

### P95 Latency
```promql
histogram_quantile(0.95, 
  rate(tonl_conversion_duration_seconds_bucket[5m])
)
```

### Compression Efficiency
```promql
avg(tonl_compression_ratio{model="gpt-4o"})
```

## Alerting Rules

### High Error Rate
```yaml
- alert: HighConversionErrorRate
  expr: |
    rate(tonl_conversion_requests_total{status="error"}[5m])
    / 
    rate(tonl_conversion_requests_total[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High conversion error rate"
```

### High Latency
```yaml
- alert: HighConversionLatency
  expr: |
    histogram_quantile(0.95,
      rate(tonl_conversion_duration_seconds_bucket[5m])
    ) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Conversion latency above 1s"
```

### Memory Usage
```yaml
- alert: HighMemoryUsage
  expr: |
    tonl_nodejs_heap_size_used_bytes
    / 
    tonl_nodejs_heap_size_total_bytes > 0.9
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Memory usage above 90%"
```

## Model Pricing

Tracked models with pricing per 1M tokens:

| Model | Provider | Price/1M |
|-------|----------|----------|
| gpt-4o | OpenAI | $2.50 |
| gpt-4o-mini | OpenAI | $0.15 |
| claude-sonnet-4 | Anthropic | $3.00 |
| claude-opus-4 | Anthropic | $15.00 |
| gemini-2.0-flash | Google | $0.075 |

## Security

The `/metrics` endpoint is public by default. Protect in production:

### Firewall
```bash
# Allow only from Prometheus server
iptables -A INPUT -p tcp --dport 3000 -s 10.0.1.100 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j DROP
```

### Reverse Proxy (nginx)
```nginx
location /metrics {
    allow 10.0.1.0/24;  # Prometheus network
    deny all;
    proxy_pass http://localhost:3000;
}
```

## Troubleshooting

### Metrics not updating
Check server logs for errors in metric recording.

### High memory usage
Memory should stay constant (~50-100MB). If growing, check for memory leaks.

### Missing metrics
Ensure server version is 1.0.0+. Restart server if needed.

## See Also

- [MCP Server](/guide/mcp-server)
- [Deployment](/guide/deployment)
- [Docker](/guide/docker)
