# Health Checks

Production-ready health check endpoints for Kubernetes and Docker orchestration.

## Overview

TONL-MCP Bridge v1.0.0 includes dedicated health check endpoints designed for container orchestration platforms. These endpoints enable:

- Kubernetes liveness and readiness probes
- Docker HEALTHCHECK instructions
- Load balancer health monitoring
- Zero-downtime deployments
- Automated failover

## Endpoints

### Liveness Probe: `/health`

Indicates if the server process is running and healthy.

**Purpose:**
- Kubernetes uses this to restart unhealthy pods
- Docker uses this to mark containers as unhealthy
- Load balancers use this to remove unhealthy instances

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "timestamp": "2025-12-07T19:00:00.000Z"
}
```

**Characteristics:**
- Response time: < 1ms
- No external dependencies
- Always returns 200 OK if process is running
- No authentication required

**Example:**
```bash
curl http://localhost:3000/health

# Expected: 200 OK
# {
#   "status": "healthy",
#   "uptime": 125.3,
#   "timestamp": "2025-12-07T19:02:05.000Z"
# }
```

### Readiness Probe: `/ready`

Indicates if the server is ready to accept traffic.

**Purpose:**
- Kubernetes uses this to route traffic only to ready pods
- Ensures server has completed initialization
- Can be extended to check database connections (future)

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-12-07T19:00:00.000Z"
}
```

**Characteristics:**
- Response time: < 1ms
- Returns 200 OK when ready for traffic
- Returns 503 Service Unavailable during startup (future)
- No authentication required

**Example:**
```bash
curl http://localhost:3000/ready

# Expected: 200 OK
# {
#   "status": "ready",
#   "timestamp": "2025-12-07T19:02:05.000Z"
# }
```

## Kubernetes Configuration

### Deployment with Health Checks

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  template:
    metadata:
      labels:
        app: tonl-mcp-bridge
    spec:
      containers:
      - name: tonl-server
        image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
        ports:
        - name: http
          containerPort: 3000
        env:
        - name: TONL_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: tonl-secrets
              key: auth-token
        
        # Liveness probe
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness probe
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Probe Configuration Best Practices

**Liveness Probe:**
- `initialDelaySeconds: 10` - Wait 10s after container start
- `periodSeconds: 30` - Check every 30 seconds
- `timeoutSeconds: 5` - Fail if no response in 5s
- `failureThreshold: 3` - Restart after 3 consecutive failures

**Readiness Probe:**
- `initialDelaySeconds: 5` - Start checking after 5s
- `periodSeconds: 10` - Check every 10 seconds
- `timeoutSeconds: 3` - Fail if no response in 3s
- `failureThreshold: 3` - Mark unready after 3 failures

## Docker Configuration

### Dockerfile with HEALTHCHECK

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/mcp/index.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

## Load Balancer Configuration

### nginx

```nginx
upstream tonl_backend {
    server localhost:3000 max_fails=3 fail_timeout=30s;
    server localhost:3001 max_fails=3 fail_timeout=30s;
    server localhost:3002 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.example.com;

    # Health check endpoint (no logging)
    location /health {
        proxy_pass http://tonl_backend/health;
        access_log off;
        proxy_connect_timeout 3s;
        proxy_read_timeout 3s;
    }

    # Application endpoints
    location / {
        proxy_pass http://tonl_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        
        # Health check for this backend
        health_check interval=10s fails=3 passes=2 uri=/health;
    }
}
```

### HAProxy

```haproxy
backend tonl_servers
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    
    server tonl1 localhost:3000 check inter 10s fall 3 rise 2
    server tonl2 localhost:3001 check inter 10s fall 3 rise 2
    server tonl3 localhost:3002 check inter 10s fall 3 rise 2
```

## Monitoring & Alerting

### Prometheus Alerts

```yaml
groups:
- name: tonl_health
  interval: 30s
  rules:
  - alert: TonlServerDown
    expr: up{job="tonl-mcp-bridge"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "TONL server {{ $labels.instance }} is down"
      description: "Instance {{ $labels.instance }} has been down for more than 1 minute"

  - alert: TonlServerUnhealthy
    expr: probe_success{job="tonl-health"} == 0
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "TONL server {{ $labels.instance }} health check failing"
      description: "Health check failing for {{ $labels.instance }}"
```

### Blackbox Exporter

```yaml
modules:
  http_tonl_health:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      preferred_ip_protocol: ip4
```

## Testing Health Checks

### Manual Testing

```bash
# Test liveness
curl -f http://localhost:3000/health
echo $?  # Should be 0

# Test readiness
curl -f http://localhost:3000/ready
echo $?  # Should be 0

# Test with timeout
timeout 5s curl http://localhost:3000/health

# Load test health endpoint
ab -n 1000 -c 10 http://localhost:3000/health
```

### Automated Testing

```bash
# Health check in CI/CD
#!/bin/bash
MAX_RETRIES=30
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf http://localhost:3000/health > /dev/null; then
    echo "Server is healthy"
    exit 0
  fi
  echo "Waiting for server... ($i/$MAX_RETRIES)"
  sleep $RETRY_DELAY
done

echo "Server failed to become healthy"
exit 1
```

### Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startHttpServer } from '../src/mcp/server.js';

describe('Health Check Endpoints', () => {
  let server;
  let port = 3000;

  beforeAll(() => {
    server = startHttpServer(port);
  });

  afterAll(() => {
    server.close();
  });

  it('should return 200 OK for /health', async () => {
    const response = await fetch(`http://localhost:${port}/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
  });

  it('should return 200 OK for /ready', async () => {
    const response = await fetch(`http://localhost:${port}/ready`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ready');
    expect(data).toHaveProperty('timestamp');
  });

  it('should respond quickly (< 100ms)', async () => {
    const start = Date.now();
    await fetch(`http://localhost:${port}/health`);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
});
```

## Troubleshooting

### Health Check Failing

**Symptom:** Health check returns non-200 status or times out

**Possible causes:**
1. Server not started
2. Port not accessible
3. Firewall blocking requests
4. Server overloaded

**Solutions:**
```bash
# Check if server is running
ps aux | grep tonl

# Check port binding
netstat -an | grep 3000

# Test locally
curl -v http://localhost:3000/health

# Check logs
docker logs tonl-server
kubectl logs deployment/tonl-mcp-bridge
```

### Kubernetes Pod Restart Loop

**Symptom:** Pods continuously restart

**Possible causes:**
1. Liveness probe too aggressive
2. Server startup time > initialDelaySeconds
3. Application crash during startup

**Solutions:**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check logs before crash
kubectl logs <pod-name> --previous

# Increase initialDelaySeconds
# Edit deployment:
livenessProbe:
  initialDelaySeconds: 30  # Increase from 10
```

### Load Balancer Not Routing Traffic

**Symptom:** No traffic reaching backend servers

**Possible causes:**
1. Readiness probe failing
2. All backends marked unhealthy
3. Incorrect health check path

**Solutions:**
```bash
# Check backend status
kubectl get pods -l app=tonl-mcp-bridge

# Test health check directly
kubectl port-forward pod/<pod-name> 3000:3000
curl http://localhost:3000/ready

# Check load balancer config
kubectl describe service tonl-mcp-bridge
```

## Best Practices

### Probe Configuration

1. **Separate Liveness and Readiness**
   - Liveness: Process health only
   - Readiness: Ready to serve traffic

2. **Appropriate Timeouts**
   - Liveness: Longer intervals (30s)
   - Readiness: Shorter intervals (10s)

3. **Startup Period**
   - Use `startupProbe` for slow-starting apps
   - Or increase `initialDelaySeconds`

4. **Failure Threshold**
   - 3 failures is usually appropriate
   - Balance between sensitivity and stability

### Performance

1. **Lightweight Checks**
   - No external dependencies
   - No database queries
   - Fast response (< 1ms)

2. **No Authentication**
   - Health checks should not require auth
   - Simplifies monitoring

3. **Caching**
   - Consider caching health status
   - Useful for expensive checks

### Monitoring

1. **Track Check Success Rate**
   - Alert on declining success rate
   - Indicates infrastructure issues

2. **Response Time Metrics**
   - Track P50, P95, P99
   - Alert on degradation

3. **Failure Patterns**
   - Correlate with deployments
   - Identify systemic issues

## See Also

- [MCP Server](/guide/mcp-server) - Server configuration
- [Kubernetes Deployment](/guide/kubernetes) - K8s setup
- [Docker Deployment](/guide/docker) - Container configuration
- [Production Deployment](/guide/deployment) - Best practices
- [Live Monitoring](/guide/live-monitoring) - Metrics dashboard
