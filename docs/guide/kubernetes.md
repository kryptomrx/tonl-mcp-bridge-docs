# Kubernetes Deployment

Production-grade Kubernetes deployment guide for TONL-MCP Bridge.

## Overview

Deploy TONL-MCP Bridge on Kubernetes with:
- High availability (3+ replicas)
- Auto-scaling (HPA)
- Health checks and monitoring
- Secrets management
- Resource limits
- Zero-downtime deployments

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Docker image: `ghcr.io/kryptomrx/tonl-mcp-bridge:latest`

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace tonl-system
kubectl config set-context --current --namespace=tonl-system
```

### 2. Create Secret

```bash
# Generate secure token
export TONL_AUTH_TOKEN=$(openssl rand -hex 32)

# Create secret
kubectl create secret generic tonl-secrets \
  --from-literal=auth-token=$TONL_AUTH_TOKEN \
  --namespace=tonl-system
```

### 3. Deploy

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Complete Deployment Manifests

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
  labels:
    app: tonl-mcp-bridge
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  template:
    metadata:
      labels:
        app: tonl-mcp-bridge
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      # Anti-affinity for high availability
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - tonl-mcp-bridge
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: tonl-server
        image: ghcr.io/kryptomrx/tonl-mcp-bridge:latest
        imagePullPolicy: Always
        
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: TONL_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: tonl-secrets
              key: auth-token
        
        # Resource limits
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        # Liveness probe
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        
        # Readiness probe
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        
        # Startup probe (for slower starts)
        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 12
        
        # Security context
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1000
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: false
      
      # Graceful shutdown
      terminationGracePeriodSeconds: 30
```

### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
  labels:
    app: tonl-mcp-bridge
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: tonl-mcp-bridge
```

### ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: tonl-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tonl-mcp-bridge
            port:
              number: 3000
```

### hpa.yaml (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tonl-mcp-bridge
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### configmap.yaml (Optional)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tonl-config
  namespace: tonl-system
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  # Add other config as needed
```

## Deployment Commands

### Deploy All Resources

```bash
# Create namespace
kubectl create namespace tonl-system

# Create secret
kubectl create secret generic tonl-secrets \
  --from-literal=auth-token=$(openssl rand -hex 32) \
  --namespace=tonl-system

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Verify deployment
kubectl get all -n tonl-system
```

### Check Status

```bash
# Check pods
kubectl get pods -n tonl-system

# Check deployment
kubectl get deployment tonl-mcp-bridge -n tonl-system

# Check service
kubectl get service tonl-mcp-bridge -n tonl-system

# Check HPA
kubectl get hpa -n tonl-system
```

### View Logs

```bash
# All pods
kubectl logs -f deployment/tonl-mcp-bridge -n tonl-system

# Specific pod
kubectl logs -f <pod-name> -n tonl-system

# Previous crashed container
kubectl logs <pod-name> --previous -n tonl-system
```

### Debug

```bash
# Describe pod
kubectl describe pod <pod-name> -n tonl-system

# Execute command in pod
kubectl exec -it <pod-name> -n tonl-system -- /bin/sh

# Port forward for local testing
kubectl port-forward deployment/tonl-mcp-bridge 3000:3000 -n tonl-system
```

## Zero-Downtime Updates

### Rolling Update Strategy

```bash
# Update image
kubectl set image deployment/tonl-mcp-bridge \
  tonl-server=ghcr.io/kryptomrx/tonl-mcp-bridge:v1.0.1 \
  -n tonl-system

# Watch rollout
kubectl rollout status deployment/tonl-mcp-bridge -n tonl-system

# Check history
kubectl rollout history deployment/tonl-mcp-bridge -n tonl-system

# Rollback if needed
kubectl rollout undo deployment/tonl-mcp-bridge -n tonl-system
```

### Blue-Green Deployment

```yaml
# green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tonl-mcp-bridge-green
  namespace: tonl-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tonl-mcp-bridge
      version: green
  template:
    metadata:
      labels:
        app: tonl-mcp-bridge
        version: green
    # ... rest same as main deployment
```

```bash
# Deploy green
kubectl apply -f green-deployment.yaml

# Test green
kubectl port-forward deployment/tonl-mcp-bridge-green 3001:3000

# Switch traffic (update service selector)
kubectl patch service tonl-mcp-bridge -n tonl-system \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Remove old deployment
kubectl delete deployment tonl-mcp-bridge -n tonl-system
```

## Monitoring Setup

### ServiceMonitor (Prometheus Operator)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
  labels:
    app: tonl-mcp-bridge
spec:
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
    scrapeTimeout: 10s
```

### PodMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
spec:
  selector:
    matchLabels:
      app: tonl-mcp-bridge
  podMetricsEndpoints:
  - port: http
    path: /metrics
    interval: 30s
```

## Resource Management

### Resource Requests and Limits

**Requests:** Guaranteed resources
**Limits:** Maximum allowed resources

```yaml
resources:
  requests:
    memory: "256Mi"  # Guaranteed
    cpu: "100m"      # 0.1 CPU cores
  limits:
    memory: "512Mi"  # Maximum
    cpu: "500m"      # 0.5 CPU cores
```

### Quality of Service (QoS)

**Guaranteed:** requests = limits
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Burstable:** requests < limits
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## High Availability

### Pod Anti-Affinity

Spread pods across nodes:

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - tonl-mcp-bridge
      topologyKey: kubernetes.io/hostname
```

### Pod Disruption Budget

Ensure minimum availability during maintenance:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: tonl-mcp-bridge
```

## Security

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
spec:
  podSelector:
    matchLabels:
      app: tonl-mcp-bridge
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443  # External APIs
```

### RBAC

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tonl-mcp-bridge
  namespace: tonl-system
subjects:
- kind: ServiceAccount
  name: tonl-mcp-bridge
roleRef:
  kind: Role
  name: tonl-mcp-bridge
  apiGroup: rbac.authorization.k8s.io
```

## Troubleshooting

### Pod Won't Start

```bash
# Check events
kubectl get events -n tonl-system --sort-by='.lastTimestamp'

# Describe pod
kubectl describe pod <pod-name> -n tonl-system

# Check logs
kubectl logs <pod-name> -n tonl-system
```

### CrashLoopBackOff

```bash
# View previous logs
kubectl logs <pod-name> --previous -n tonl-system

# Check resource limits
kubectl describe pod <pod-name> -n tonl-system | grep -A 5 Limits

# Increase memory/CPU if needed
```

### ImagePullBackOff

```bash
# Check image name
kubectl describe pod <pod-name> -n tonl-system | grep Image

# Check pull secrets
kubectl get secrets -n tonl-system

# Verify image exists
docker pull ghcr.io/kryptomrx/tonl-mcp-bridge:latest
```

## Best Practices

1. **Use Namespace**
   - Isolate TONL resources
   - Easier RBAC management

2. **Set Resource Limits**
   - Prevent resource exhaustion
   - Enable autoscaling

3. **Use Health Checks**
   - Automatic recovery
   - Zero-downtime updates

4. **Enable HPA**
   - Handle traffic spikes
   - Cost optimization

5. **Monitor Everything**
   - Prometheus metrics
   - Log aggregation
   - Alerting rules

6. **Security First**
   - Network policies
   - RBAC
   - Secrets management
   - Security contexts

7. **Plan for Failures**
   - Pod disruption budgets
   - Anti-affinity rules
   - Multiple replicas

## See Also

- [Health Checks](/guide/health-checks) - Health check configuration
- [Docker Deployment](/guide/docker) - Docker setup
- [Production Deployment](/guide/deployment) - General best practices
- [Live Monitoring](/guide/live-monitoring) - Metrics and monitoring
- [Security](/guide/security) - Security configuration
