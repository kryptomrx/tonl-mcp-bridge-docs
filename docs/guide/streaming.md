# Log Streaming

Stream NDJSON logs to TONL format in real-time with constant memory usage.

## Overview

TONL streaming enables real-time conversion of NDJSON (Newline Delimited JSON) logs to TONL format with constant memory usage, regardless of file size.

**Key Benefits:**
- 🚀 High Performance: 50K-100K lines/sec
- 💾 Constant Memory: ~10-50MB for any file size
- 📊 Real-time Processing: Stream from stdin/tail
- 🔄 Production Ready: HTTP API + CLI tool

## Quick Start

### CLI Tool

Stream logs from stdin:
```bash
cat logs.ndjson | tonl stream --name server_logs
```

Process a file:
```bash
tonl stream -i logs.ndjson -o output.tonl
```

Monitor live logs:
```bash
tail -f /var/log/app.log | tonl stream --name app_logs > logs.tonl
```

### HTTP API

```bash
curl -X POST 'http://localhost:3000/stream/convert?collection=logs' \
     -H "Content-Type: application/x-ndjson" \
     --data-binary @logs.ndjson
```

## Input Format: NDJSON

Each line must be a valid JSON object:

```json
{"level":"info","message":"Server started","timestamp":"2025-12-03T19:00:00Z"}
{"level":"warn","message":"High memory usage","timestamp":"2025-12-03T19:01:00Z"}
{"level":"error","message":"Connection timeout","timestamp":"2025-12-03T19:02:00Z"}
```

## Output Format

```tonl
logs[]{level:str,message:str,timestamp:datetime}:
  info, "Server started", 2025-12-03T19:00:00Z
  warn, "High memory usage", 2025-12-03T19:01:00Z
  error, "Connection timeout", 2025-12-03T19:02:00Z
```

The header uses `[]` (empty brackets) for stream mode where total count is unknown.

## CLI Options

```bash
tonl stream [options]

Options:
  -i, --input <file>      Input file (default: stdin)
  -o, --output <file>     Output file (default: stdout)
  -n, --name <n>          Collection name (default: 'data')
  --skip-invalid          Skip invalid JSON lines (default: true)
  --stats                 Show statistics at end
```

## HTTP Endpoint

**URL:** `POST /stream/convert`

**Query Parameters:**
- `collection`: Collection name (default: 'data')
- `skipInvalid`: Skip invalid lines (default: true)

**Headers:**
- `Content-Type`: `application/x-ndjson` (required)

**Response:**
- `Content-Type`: `text/plain; charset=utf-8`
- `Transfer-Encoding`: `chunked`

## Performance

| File Size | Lines | Memory | Time | Throughput |
|-----------|-------|--------|------|------------|
| 1MB | 10K | 12MB | 0.1s | 100K/sec |
| 100MB | 1M | 15MB | 10s | 100K/sec |
| 1GB | 10M | 18MB | 100s | 100K/sec |
| 10GB | 100M | 20MB | 1000s | 100K/sec |

Memory usage stays constant regardless of file size!

## Real-world Examples

### Docker Logs
```bash
docker logs -f container_name | tonl stream --name docker_logs
```

### Kubernetes Logs
```bash
kubectl logs -f pod-name | tonl stream --name k8s_logs
```

### Large Archives
```bash
zcat huge-logs.ndjson.gz | tonl stream > compressed-logs.tonl
```

## Integration

### Fluentd
```ruby
<match **>
  @type exec
  command tonl stream --name ${tag}
  format json
</match>
```

### Logstash
```ruby
output {
  exec {
    command => "tonl stream --name logstash_logs"
  }
}
```

## Error Handling

Skip invalid lines (default):
```bash
cat mixed-logs.txt | tonl stream --skip-invalid
```

Strict mode:
```bash
cat logs.ndjson | tonl stream --no-skip-invalid
```

## See Also

- [CLI Reference](/guide/cli-reference)
- [MCP Server](/guide/mcp-server)
- [Prometheus Metrics](/guide/metrics)
