# Docker Deployment

Run TONL-MCP Bridge in Docker for production deployments.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose (optional)

## Quick Start

Pull and run the official image:

```bash
docker pull ghcr.io/kryptomrx/tonl-mcp-bridge:latest

docker run -d \
  --name tonl-server \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=your-secure-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

Test the server:

```bash
curl -H "Authorization: Bearer your-secure-token" \
  http://localhost:3000/mcp
```

Expected response:
```
event: endpoint
data: /mcp?sessionId=<uuid>
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TONL_AUTH_TOKEN` | Yes* | - | Bearer token for authentication |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | production | Environment mode |

*Required in production. If not set, security is disabled.

## Docker Run Options

### Basic Usage

```bash
docker run -d \
  --name tonl-server \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=my-secret-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Custom Port

```bash
docker run -d \
  --name tonl-server \
  -p 8080:3000 \
  -e TONL_AUTH_TOKEN=my-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

Server runs on port 3000 internally, exposed as 8080 externally.

### With Restart Policy

```bash
docker run -d \
  --name tonl-server \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=my-token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Development Mode (No Auth)

```bash
docker run -d \
  --name tonl-dev \
  -p 3000:3000 \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

⚠️ **Warning:** Only for local development. Auth is disabled.

## Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    container_name: tonl-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
```

Create `.env` file:

```bash
TONL_AUTH_TOKEN=your-secure-token-here
```

Start:

```bash
docker-compose up -d
```

Check logs:

```bash
docker-compose logs -f tonl-server
```

Stop:

```bash
docker-compose down
```

## Container Management

### View Logs

```bash
docker logs tonl-server

# Follow logs
docker logs -f tonl-server

# Last 100 lines
docker logs --tail 100 tonl-server
```

### Check Status

```bash
docker ps | grep tonl-server
```

### Restart Container

```bash
docker restart tonl-server
```

### Stop Container

```bash
docker stop tonl-server
```

Triggers graceful shutdown:
```
🛑 Received SIGTERM. Shutting down gracefully...
✅ Server stopped cleanly.
```

### Remove Container

```bash
docker rm tonl-server
```

## Production Configuration

Recommended docker-compose.yml for production:

```yaml
version: '3.8'

services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    container_name: tonl-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Security

### Authentication

Always set `TONL_AUTH_TOKEN` in production:

```bash
# Generate secure token
openssl rand -base64 32

# Use in docker run
docker run -d \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=<generated-token> \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### HTTPS/TLS

Use reverse proxy (nginx, Caddy) for HTTPS:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - tonl-server

  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
    expose:
      - "3000"
```

nginx.conf example:

```nginx
upstream tonl {
    server tonl-server:3000;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://tonl;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
    }
}
```

### Non-Root User

Container runs as non-root user `tonl` (UID 1000) by default.

Verify:

```bash
docker exec tonl-server whoami
# Output: tonl
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker logs tonl-server
```

Common issues:
- Port 3000 already in use
- Invalid environment variables
- Image pull failed

### Port Already in Use

Use different port:

```bash
docker run -d -p 3001:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Authentication Fails

Verify token is set:

```bash
docker exec tonl-server printenv | grep TONL_AUTH_TOKEN
```

Test with curl:

```bash
# Should fail (401)
curl http://localhost:3000/mcp

# Should work (200)
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/mcp
```

### High Memory Usage

Set memory limits:

```bash
docker run -d \
  --memory="256m" \
  --memory-swap="512m" \
  -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

### Container Stops Unexpectedly

Check exit code:

```bash
docker inspect tonl-server | grep ExitCode
```

Check system resources:

```bash
docker stats tonl-server
```

## Image Versions

Available tags:

- `latest` - Latest stable release
- `v0.9.0` - Specific version
- `0.9` - Minor version
- `0` - Major version

Pull specific version:

```bash
docker pull ghcr.io/kryptomrx/tonl-mcp-bridge:v0.9.0
```

## Building from Source

Clone repository:

```bash
git clone https://github.com/kryptomrx/tonl-mcp-bridge.git
cd tonl-mcp-bridge
```

Build image:

```bash
docker build -t tonl-local .
```

Run:

```bash
docker run -d -p 3000:3000 \
  -e TONL_AUTH_TOKEN=token \
  tonl-local
```

## Multi-Container Setup

Example with Milvus vector database:

```yaml
version: '3.8'

services:
  tonl-server:
    image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
    container_name: tonl-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - TONL_AUTH_TOKEN=${TONL_AUTH_TOKEN}
      - NODE_ENV=production
    depends_on:
      - milvus
    networks:
      - tonl-network

  milvus:
    image: milvusdb/milvus:latest
    container_name: milvus
    restart: unless-stopped
    ports:
      - "19530:19530"
    environment:
      - ETCD_ENDPOINTS=etcd:2379
      - MINIO_ADDRESS=minio:9000
    networks:
      - tonl-network

  etcd:
    image: quay.io/coreos/etcd:latest
    container_name: etcd
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
    networks:
      - tonl-network

  minio:
    image: minio/minio:latest
    container_name: minio
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: minio server /minio_data
    networks:
      - tonl-network

networks:
  tonl-network:
    driver: bridge
```

Start all services:

```bash
docker-compose up -d
```

## Next Steps

- [MCP Server Guide](./mcp-server.md) - Using the MCP server
- [Production Deployment](./deployment.md) - Production best practices
- [Milvus Integration](./milvus.md) - Connect to Milvus
- [Security Guide](./security.md) - Secure your deployment