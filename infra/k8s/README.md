# Kubernetes Deployment for Zyra

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm (optional, for secrets management)

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

**Option A: Using kubectl command**

```bash
kubectl create secret generic zyra-secrets \
  --namespace=zyra \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/zyra_db" \
  --from-literal=redis-url="redis://redis:6379" \
  --from-literal=jwt-secret="your-secret-32-chars" \
  --from-literal=wa-api-key="your-key" \
  --from-literal=mpesa-consumer-key="your-key" \
  --from-literal=mpesa-consumer-secret="your-secret" \
  --from-literal=postgres-user="zyra_user" \
  --from-literal=postgres-password="your-password"
```

**Option B: Using sealed-secrets or external-secrets operator**

See `secrets.example.yaml` for reference.

### 3. Deploy PostgreSQL

```bash
kubectl apply -f postgres-statefulset.yaml
```

Wait for PostgreSQL to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n zyra --timeout=300s
```

### 4. Run Database Migrations

```bash
kubectl run prisma-migrate -it --rm --image=zyra/backend:latest --restart=Never \
  --namespace=zyra \
  --env="DATABASE_URL=postgresql://..." \
  -- npx prisma migrate deploy
```

### 5. Deploy Redis

```bash
kubectl apply -f redis-deployment.yaml
```

### 6. Deploy Backend

```bash
kubectl apply -f backend-deployment.yaml
```

### 7. Verify Deployment

```bash
kubectl get pods -n zyra
kubectl get services -n zyra
kubectl logs -f deployment/zyra-backend -n zyra
```

## Scaling

The backend deployment includes a HorizontalPodAutoscaler (HPA) that scales between 3-10 replicas based on CPU and memory usage.

Manual scaling:

```bash
kubectl scale deployment zyra-backend --replicas=5 -n zyra
```

## Monitoring

- Health checks: `kubectl exec -it <pod-name> -n zyra -- curl http://localhost:3001/health`
- Metrics: `kubectl port-forward svc/zyra-backend 3001:80 -n zyra` then visit `http://localhost:3001/metrics`

## Rolling Updates

```bash
kubectl set image deployment/zyra-backend backend=zyra/backend:v2.0.0 -n zyra
kubectl rollout status deployment/zyra-backend -n zyra
```

## Troubleshooting

- Check pod logs: `kubectl logs <pod-name> -n zyra`
- Check pod status: `kubectl describe pod <pod-name> -n zyra`
- Check service endpoints: `kubectl get endpoints zyra-backend -n zyra`

