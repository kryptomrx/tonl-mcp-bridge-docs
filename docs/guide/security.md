# Security

Comprehensive security configuration for production deployments.

## Overview

TONL-MCP Bridge v1.0.0 includes multiple security layers:
- Bearer token authentication
- Auto-generated session tokens
- Rate limiting
- Security headers (Helmet)
- CORS configuration
- Graceful shutdown
- Input validation

## Authentication

### Bearer Token (Production)

Recommended for production deployments:

```bash
# Generate secure token
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)

# Start server
npx tonl-mcp-server
```

**Security features:**
- 256-bit entropy (32 bytes hex)
- Required for `/mcp` and `/metrics/live` endpoints
- Environment variable only (not in code)
- Rotatable without code changes

**Example:**
```bash
# Client request
curl -H "Authorization: Bearer $TONL_AUTH_TOKEN" \
  http://localhost:3000/mcp
```

### Session Tokens (Development)

Auto-generated tokens for development:

```bash
# Start without token
npx tonl-mcp-server

# Output:
# ⚠️  Security: Development mode (Auto-generated session tokens)
# 💡 Set TONL_AUTH_TOKEN for production use
```

**Security features:**
- Automatically generated per session
- UUID + timestamp format
- 1-hour expiry
- Automatic cleanup
- Session-scoped (not persistent)

**Behavior:**
- Generated on first connection
- Sent via SSE `session-token` event
- Validated on subsequent requests
- Cleaned up on disconnect

**Example server log:**
```
🔑 Generated session token for abc-123-def (valid for 1 hour)
```

### Authentication Endpoints

**Authenticated:**
- `/mcp` - MCP protocol endpoint
- `/metrics/live` - Live metrics stream

**Public (No Auth):**
- `/health` - Liveness probe
- `/ready` - Readiness probe
- `/metrics` - Prometheus metrics
- `/stream/convert` - Streaming conversion (with rate limiting)

## Rate Limiting

### Configuration

Built-in rate limiting using `express-rate-limit`:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,     // Return rate limit info
  legacyHeaders: false,
});
```

### Headers

Response includes rate limit information:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1670346000
```

### Endpoints

**Rate limited:**
- `/stream/convert` - 100 requests / 15 minutes per IP

**Not rate limited:**
- `/health`, `/ready` - Health checks
- `/metrics` - Prometheus scraping
- `/mcp` - Authenticated endpoint

### Custom Configuration

Create custom rate limiter:

```typescript
import rateLimit from 'express-rate-limit';

// Stricter limits for streaming
const streamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Stream rate limit exceeded'
});

app.post('/stream/convert', streamLimiter, handler);
```

### IP-based Limits

Rate limiting is per IP address:
- Uses `req.ip` from Express
- Respects `X-Forwarded-For` header
- Works behind proxies (configure trust proxy)

## Security Headers

### Helmet Configuration

Enabled by default with SSE-compatible settings:

```typescript
app.use(helmet({
  contentSecurityPolicy: false,    // SSE needs this disabled
  crossOriginEmbedderPolicy: false // SSE compatibility
}));
```

### Headers Included

**X-Content-Type-Options: nosniff**
- Prevents MIME type sniffing
- Blocks execution of incorrect MIME types

**X-Frame-Options: SAMEORIGIN**
- Prevents clickjacking
- Allows framing from same origin only

**X-XSS-Protection: 0**
- Disabled (modern CSP is better)
- Prevents legacy XSS filter issues

**Strict-Transport-Security** (HTTPS only)
- Forces HTTPS connections
- Prevents protocol downgrade attacks

### Custom Headers

Add custom security headers:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

## CORS Configuration

### Default Behavior

CORS not explicitly configured - uses Express defaults:
- Same-origin requests allowed
- Cross-origin requests blocked by default

### Enable CORS

For cross-origin requests:

```typescript
import cors from 'cors';

// Allow specific origin
app.use(cors({
  origin: 'https://app.example.com',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

// Allow multiple origins
const allowedOrigins = [
  'https://app.example.com',
  'https://dashboard.example.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### Preflight Requests

Handle OPTIONS requests:

```typescript
app.options('*', cors());  // Enable pre-flight
```

## Input Validation

### Request Size Limits

```typescript
app.use(express.json({ limit: '50mb' }));
```

**Prevents:**
- Memory exhaustion attacks
- Excessive payload processing

**Customize:**
```typescript
// Smaller limit for specific routes
app.post('/api/data', 
  express.json({ limit: '1mb' }),
  handler
);
```

### Content-Type Validation

Streaming endpoint validates content type:

```typescript
const contentType = req.headers['content-type'];
if (contentType && 
    !contentType.includes('ndjson') && 
    !contentType.includes('json')) {
  res.status(400).json({
    error: 'Invalid Content-Type',
    expected: 'application/x-ndjson or application/json'
  });
  return;
}
```

### Parameter Validation

Query parameters are validated:

```typescript
const collectionName = (req.query.collection as string) || 'data';
const skipInvalid = req.query.skipInvalid !== 'false';

// Sanitize collection name
if (!/^[a-zA-Z0-9_-]+$/.test(collectionName)) {
  res.status(400).json({ error: 'Invalid collection name' });
  return;
}
```

## Secrets Management

### Environment Variables

Never commit secrets to code:

```bash
# .env (DO NOT COMMIT)
TONL_AUTH_TOKEN=your-secure-token-here
PORT=3000
NODE_ENV=production
```

### Kubernetes Secrets

```bash
# Create secret
kubectl create secret generic tonl-secrets \
  --from-literal=auth-token=$(openssl rand -hex 32)

# Use in deployment
env:
- name: TONL_AUTH_TOKEN
  valueFrom:
    secretKeyRef:
      name: tonl-secrets
      key: auth-token
```

### Docker Secrets

```bash
# Create secret file
echo "my-secret-token" | docker secret create tonl_token -

# Use in compose
services:
  tonl:
    secrets:
      - tonl_token
    environment:
      TONL_AUTH_TOKEN_FILE: /run/secrets/tonl_token

secrets:
  tonl_token:
    external: true
```

### AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName: string) {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return response.SecretString;
}

const token = await getSecret('tonl/auth-token');
```

### HashiCorp Vault

```bash
# Store secret
vault kv put secret/tonl auth-token="my-secret-token"

# Retrieve in app
export TONL_AUTH_TOKEN=$(vault kv get -field=auth-token secret/tonl)
```

## Network Security

### Reverse Proxy (nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 443/tcp  # HTTPS
ufw allow 22/tcp   # SSH
ufw deny 3000/tcp  # Block direct access to app
ufw enable

# AWS Security Group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### VPC Configuration (AWS)

```yaml
# Private subnet for app
Resources:
  AppSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: false  # Private

  # NAT Gateway for outbound
  NATGateway:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt EIP.AllocationId
      SubnetId: !Ref PublicSubnet

  # Security group
  AppSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: TONL app security group
      VpcId: !Ref VPC
      SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 3000
        ToPort: 3000
        SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
```

## Monitoring & Alerts

### Failed Authentication Attempts

Monitor `tonl_conversion_errors_total{type="auth"}`:

```yaml
# Prometheus alert
- alert: HighAuthFailureRate
  expr: rate(tonl_conversion_errors_total{type="auth"}[5m]) > 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High authentication failure rate
    description: More than 10 auth failures per second
```

### Rate Limit Violations

Monitor rate limit hits:

```typescript
// Add custom metric
const rateLimitCounter = new promClient.Counter({
  name: 'tonl_rate_limit_hits_total',
  help: 'Total rate limit violations',
  labelNames: ['endpoint', 'ip']
});

// Track in middleware
app.use((req, res, next) => {
  if (res.statusCode === 429) {
    rateLimitCounter.inc({
      endpoint: req.path,
      ip: req.ip
    });
  }
  next();
});
```

### Security Audit Log

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'security-audit.log',
      level: 'warn'
    })
  ]
});

// Log security events
app.use((req, res, next) => {
  if (req.path === '/mcp' && !req.headers.authorization) {
    securityLogger.warn('Unauthorized access attempt', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
  next();
});
```

## Security Checklist

### Production Deployment

- [ ] Set `TONL_AUTH_TOKEN` (not auto-generated)
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up firewall rules
- [ ] Use secrets manager
- [ ] Enable audit logging
- [ ] Configure monitoring alerts
- [ ] Set resource limits
- [ ] Enable network policies (K8s)
- [ ] Configure RBAC (K8s)
- [ ] Regular security updates
- [ ] Backup and disaster recovery

### Development

- [ ] Use auto-generated tokens (OK for dev)
- [ ] No HTTPS required (localhost)
- [ ] Rate limiting optional
- [ ] Test with different IPs
- [ ] Validate error messages
- [ ] Check logs for security events

## Security Best Practices

1. **Use Strong Tokens**
   - Minimum 256 bits entropy
   - Generate with cryptographic RNG
   - Rotate regularly

2. **Enable All Security Layers**
   - Authentication
   - Rate limiting
   - Security headers
   - Input validation

3. **Monitor Everything**
   - Authentication failures
   - Rate limit violations
   - Unusual traffic patterns
   - Error rates

4. **Keep Updated**
   - Regular dependency updates
   - Security patches
   - Monitor CVEs

5. **Principle of Least Privilege**
   - Minimal IAM permissions
   - Restricted network access
   - Read-only file systems (where possible)

6. **Defense in Depth**
   - Multiple security layers
   - Fail securely
   - Assume breach mentality

## Vulnerability Reporting

Found a security issue? Please report responsibly:

1. **DO NOT** create public GitHub issues
2. Email: security@example.com (replace with actual)
3. Include:
   - Vulnerability description
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (if any)

We'll respond within 48 hours.

## See Also

- [Health Checks](/guide/health-checks) - Health monitoring
- [Kubernetes Deployment](/guide/kubernetes) - K8s security
- [Docker Deployment](/guide/docker) - Container security
- [MCP Server](/guide/mcp-server) - Server configuration
- [Production Deployment](/guide/deployment) - Best practices
