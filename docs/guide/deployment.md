# Production Deployment

Best practices for deploying TONL-MCP Bridge in production environments.

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Authentication token generated
- [ ] HTTPS/TLS configured (reverse proxy)
- [ ] Monitoring setup
- [ ] Backup strategy defined
- [ ] Resource limits set
- [ ] Testing completed

## Security Configuration

### Authentication

Generate secure token:

```bash
# Linux/macOS
openssl rand -base64 32

# Or use a password manager
# Example output: kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

Set as environment variable:

```bash
export TONL_AUTH_TOKEN=kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

### HTTPS Setup

Use reverse proxy (nginx example):

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Pass through Authorization header
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Environment Variables

Never hardcode secrets. Use environment variables:

```bash
# .env file (never commit this!)
TONL_AUTH_TOKEN=your-secure-token
NODE_ENV=production
PORT=3000
```

Load with Docker:

```bash
docker run -d \
  --env-file .env \
  -p 3000:3000 \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

Or docker-compose:

```yaml
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    env_file:
      - .env
```

## Resource Management

### Memory Limits

Set appropriate limits:

```bash
docker run -d \
  --memory="512m" \
  --memory-swap="1g" \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

docker-compose:

```yaml
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### CPU Limits

Prevent CPU exhaustion:

```bash
docker run -d \
  --cpus="1.0" \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

## Monitoring

### Health Checks

Docker health check:

```yaml
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Manual check:

```bash
curl http://localhost:3000/
# Should return 200 OK
```

### Log Monitoring

View logs:

```bash
# Docker
docker logs -f tonl-server

# docker-compose
docker-compose logs -f tonl-server

# Last 100 lines
docker logs --tail 100 tonl-server
```

Log to file:

```bash
docker logs tonl-server > /var/log/tonl-server.log 2>&1
```

### Container Stats

Monitor resource usage:

```bash
docker stats tonl-server
```

Output:
```
CONTAINER    CPU %     MEM USAGE / LIMIT     NET I/O
tonl-server  2.5%      128MB / 512MB         1.2MB / 890kB
```

## Restart Policies

### Always Restart

```bash
docker run -d \
  --restart always \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Unless Stopped

Recommended for production:

```bash
docker run -d \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### On Failure

Restart only on crash:

```bash
docker run -d \
  --restart on-failure:3 \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

## Scaling

### Horizontal Scaling

Run multiple instances behind load balancer:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - tonl-1
      - tonl-2
      - tonl-3

  tonl-1:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
    expose:
      - "3000"

  tonl-2:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
    expose:
      - "3000"

  tonl-3:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
    expose:
      - "3000"
```

nginx load balancer:

```nginx
upstream tonl_backend {
    least_conn;
    server tonl-1:3000;
    server tonl-2:3000;
    server tonl-3:3000;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://tonl_backend;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
    }
}
```

### Vertical Scaling

Increase resources for single instance:

```yaml
services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 4G
        reservations:
          cpus: '2.0'
          memory: 2G
```

## Graceful Shutdown

Server handles SIGTERM/SIGINT gracefully:

```bash
# Stop container
docker stop tonl-server

# Logs show:
# 🛑 Received SIGTERM. Shutting down gracefully...
# ✅ Server stopped cleanly.
```

Configure timeout:

```bash
docker stop --time 30 tonl-server
```

## Backup & Recovery

### Configuration Backup

Backup environment file:

```bash
# Backup
cp .env .env.backup.$(date +%Y%m%d)

# Encrypt backup
gpg -c .env.backup.$(date +%Y%m%d)
```

### Container State

Export container:

```bash
docker export tonl-server > tonl-server-backup.tar
```

Import:

```bash
docker import tonl-server-backup.tar
```

## Update Strategy

### Rolling Update

1. Pull new image:

```bash
docker pull ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

2. Stop old container:

```bash
docker stop tonl-server
```

3. Remove old container:

```bash
docker rm tonl-server
```

4. Start new container:

```bash
docker run -d \
  --name tonl-server \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN} \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Blue-Green Deployment

Run both versions:

```bash
# Start new version (green)
docker run -d \
  --name tonl-green \
  -p 3001:3000 \
  -e TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN} \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest

# Test new version
curl -H "Authorization: Bearer ${TONL_AUTH_TOKEN}" \
  http://localhost:3001/mcp

# Switch traffic (update nginx)
# Stop old version (blue)
docker stop tonl-blue
docker rm tonl-blue
```

## Troubleshooting

### Check Container Status

```bash
docker ps -a | grep tonl-server
```

### View Detailed Logs

```bash
docker logs --timestamps tonl-server
```

### Inspect Container

```bash
docker inspect tonl-server
```

### Execute Commands in Container

```bash
# Check environment
docker exec tonl-server printenv

# Check user
docker exec tonl-server whoami

# Check network
docker exec tonl-server netstat -tlnp
```

### Performance Issues

Check resource usage:

```bash
docker stats tonl-server
```

If high CPU:
- Increase CPU limits
- Scale horizontally
- Check for infinite loops in requests

If high memory:
- Increase memory limits
- Check for memory leaks
- Review payload sizes

### Connection Issues

Test connectivity:

```bash
# From host
curl http://localhost:3000/

# From another container
docker run --rm --network container:tonl-server \
  curlimages/curl:latest \
  curl http://localhost:3000/
```

### Authentication Issues

Verify token:

```bash
docker exec tonl-server printenv | grep TONL_AUTH_TOKEN
```

Test auth:

```bash
# Should fail (401)
curl http://localhost:3000/mcp

# Should succeed
curl -H "Authorization: Bearer ${TONL_AUTH_TOKEN}" \
  http://localhost:3000/mcp
```

## Security Hardening

### Read-Only Root Filesystem

```bash
docker run -d \
  --read-only \
  --tmpfs /tmp \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Drop Capabilities

```bash
docker run -d \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Security Options

```bash
docker run -d \
  --security-opt=no-new-privileges:true \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            docker pull ghcr.io/kryptomrx/tonl-mcp-bridge:latest
            docker stop tonl-server || true
            docker rm tonl-server || true
            docker run -d \
              --name tonl-server \
              --restart unless-stopped \
              -p 3000:3000 \
              -e TONL_AUTH_TOKEN=${{ secrets.TONL_AUTH_TOKEN }} \
              ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

## Next Steps

- [Docker Guide](./docker.md) - Docker deployment details
- [MCP Server Guide](./mcp-server.md) - MCP server configuration
- [Monitoring](./monitoring.md) - Advanced monitoring setup
- [Security](./security.md) - Security best practices