# DragonflyDB Setup Guide

This guide explains how to set up DragonflyDB for Verscienta Health's caching and rate limiting needs.

## Table of Contents

- [What is DragonflyDB?](#what-is-dragonflydb)
- [Why DragonflyDB?](#why-dragonflydb)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

**📚 Additional Resources:**
- [DRAGONFLYDB_TLS_SECURITY.md](./DRAGONFLYDB_TLS_SECURITY.md) - Comprehensive TLS/SSL security guide

---

## What is DragonflyDB?

DragonflyDB is a modern, high-performance, in-memory data store that's fully compatible with Redis and Memcached APIs. It's designed to be a drop-in replacement for Redis with significantly better performance.

**Key Features:**

- 🚀 **25x faster** throughput than Redis on a single instance
- 💾 **Lower memory footprint** (better memory efficiency)
- 🔄 **Full Redis compatibility** (works with all Redis clients)
- ⚡ **Vertical scalability** (uses all CPU cores efficiently)
- 💪 **Built-in persistence** (snapshots + AOF)
- 🔒 **TLS encryption** support
- 📊 **Prometheus metrics** for monitoring

**Official Website:** https://www.dragonflydb.io/

---

## Why DragonflyDB?

### Performance Comparison

| Metric               | Redis           | DragonflyDB    | Improvement        |
| -------------------- | --------------- | -------------- | ------------------ |
| Throughput (ops/sec) | ~200K           | ~5M            | **25x faster**     |
| Memory efficiency    | Baseline        | 30% less       | **Better**         |
| CPU utilization      | Single-threaded | Multi-threaded | **Full CPU usage** |
| Latency (p99)        | ~2ms            | ~0.5ms         | **4x lower**       |

### Why We Chose It

1. **Cost Efficiency**: Self-hosted (no per-request pricing like Upstash)
2. **Performance**: Handles high traffic with lower latency
3. **Compatibility**: Drop-in Redis replacement (no code changes)
4. **Scalability**: Scales vertically with more CPU cores
5. **Control**: Full control over data and configuration

---

## Local Development Setup

### Option 1: Docker (Recommended)

**Basic Setup:**

```bash
# Pull and run DragonflyDB
docker run -d \
  --name dragonfly \
  -p 6379:6379 \
  docker.dragonflydb.io/dragonflydb/dragonfly

# Verify it's running
docker ps | grep dragonfly

# Test connection
redis-cli ping  # Should return: PONG
```

**With Persistence:**

```bash
# Create data directory
mkdir -p ~/dragonfly-data

# Run with persistent storage
docker run -d \
  --name dragonfly \
  -p 6379:6379 \
  -v ~/dragonfly-data:/data \
  docker.dragonflydb.io/dragonflydb/dragonfly \
  --dir /data --dbfilename dump.rdb
```

**With Password:**

```bash
docker run -d \
  --name dragonfly \
  -p 6379:6379 \
  docker.dragonflydb.io/dragonflydb/dragonfly \
  --requirepass=dev-password-123
```

### Option 2: Docker Compose

Create `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly
    container_name: dragonfly
    ports:
      - '6379:6379'
    volumes:
      - dragonfly-data:/data
    command:
      - --requirepass=${REDIS_PASSWORD:-dev-password}
      - --dir=/data
      - --dbfilename=dump.rdb
      - --save_schedule=*:15 # Save every 15 minutes
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD:-dev-password}', 'ping']
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  dragonfly-data:
    driver: local
```

**Start:**

```bash
docker-compose up -d
```

**Check logs:**

```bash
docker-compose logs -f dragonfly
```

### Option 3: Native Installation

**macOS (Homebrew):**

```bash
brew install dragonfly
dragonfly --logtostderr
```

**Linux (Binary):**

```bash
# Download latest release
wget https://github.com/dragonflydb/dragonfly/releases/download/v1.15.0/dragonfly-x86_64.tar.gz

# Extract
tar -xzf dragonfly-x86_64.tar.gz

# Run
./dragonfly --logtostderr
```

### Environment Variables

Create `.env.local`:

```bash
# DragonflyDB Configuration (Development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev-password-123
REDIS_DB=0
```

---

## Production Deployment

### Coolify Deployment

**Step 1: Add DragonflyDB Service**

1. Log in to Coolify dashboard
2. Go to your project
3. Click **"New Service"**
4. Search for **"DragonflyDB"** or use **"Redis"** template

**Step 2: Configure Service**

```yaml
# Service Configuration
Image: docker.dragonflydb.io/dragonflydb/dragonfly
Tag: latest

# Environment Variables
DRAGONFLY_PASSWORD: your-secure-password-here

# Command (optional, for advanced configuration)
Command: |
  --requirepass=${DRAGONFLY_PASSWORD}
  --dir=/data
  --dbfilename=dump.rdb
  --save_schedule=*:15
  --maxmemory=2gb
  --proactor_threads=8
```

**Step 3: Add Persistent Volume**

1. Add volume: `/data` → Persistent
2. Size: 10GB (adjust based on needs)

**Step 4: Network Configuration**

- **Internal Port:** 6379
- **Public Port:** Leave empty (internal access only)
- **Network:** Same network as your apps

**Step 5: Deploy**

Click **"Deploy"** and wait for deployment to complete.

### Docker Swarm / Kubernetes

**Docker Swarm:**

```yaml
version: '3.8'

services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 2G
    ports:
      - '6379:6379'
    volumes:
      - dragonfly-data:/data
    command:
      - --requirepass=${REDIS_PASSWORD}
      - --dir=/data
      - --dbfilename=dump.rdb
      - --save_schedule=*:15
      - --maxmemory=3gb
      - --proactor_threads=8
    secrets:
      - redis_password

volumes:
  dragonfly-data:
    driver: local

secrets:
  redis_password:
    external: true
```

**Kubernetes (StatefulSet):**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: dragonfly
spec:
  serviceName: dragonfly
  replicas: 1
  selector:
    matchLabels:
      app: dragonfly
  template:
    metadata:
      labels:
        app: dragonfly
    spec:
      containers:
        - name: dragonfly
          image: docker.dragonflydb.io/dragonflydb/dragonfly:latest
          ports:
            - containerPort: 6379
              name: dragonfly
          env:
            - name: DRAGONFLY_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: dragonfly-secret
                  key: password
          command:
            - dragonfly
            - --requirepass=$(DRAGONFLY_PASSWORD)
            - --dir=/data
            - --dbfilename=dump.rdb
            - --maxmemory=4gb
          volumeMounts:
            - name: data
              mountPath: /data
          resources:
            requests:
              memory: '2Gi'
              cpu: '1000m'
            limits:
              memory: '4Gi'
              cpu: '4000m'
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 10Gi
```

### Production Environment Variables

```bash
# DragonflyDB Configuration (Production)
REDIS_HOST=dragonfly.internal  # Internal service name
REDIS_PORT=6379
REDIS_PASSWORD=<use-secrets-manager>
REDIS_DB=0
```

---

## Configuration

### Command-Line Flags

**Essential flags:**

```bash
dragonfly \
  --requirepass=your-password \      # Set password authentication
  --dir=/data \                      # Data directory for persistence
  --dbfilename=dump.rdb \            # Snapshot filename
  --save_schedule=*:15 \             # Save every 15 minutes
  --maxmemory=4gb \                  # Memory limit
  --proactor_threads=8 \             # Number of threads (CPU cores)
  --port=6379 \                      # Port (default: 6379)
  --bind=0.0.0.0 \                   # Bind address
  --tls \                            # Enable TLS
  --tls_cert_file=/path/to/cert.pem \
  --tls_key_file=/path/to/key.pem
```

> **📚 TLS/SSL Configuration:**
> For comprehensive TLS security setup, certificate management, and best practices, see:
> **[DRAGONFLYDB_TLS_SECURITY.md](./DRAGONFLYDB_TLS_SECURITY.md)**
>
> This includes:
> - Production-ready TLS configuration
> - Certificate generation and renewal (Let's Encrypt)
> - Client certificate authentication (mTLS)
> - Security checklist and troubleshooting

**Advanced flags:**

```bash
  --maxmemory_policy=allkeys-lru \   # Eviction policy
  --snapshot_cron="0 */6 * * *" \    # Snapshot at 00:00, 06:00, 12:00, 18:00
  --appendonly=yes \                 # Enable AOF
  --appendfilename=appendonly.aof \  # AOF filename
  --hz=100 \                         # Server frequency (higher = more responsive)
  --tcp_keepalive=300 \              # TCP keepalive
  --loglevel=warning \               # Log level (debug, info, warning, error)
  --logfile=/var/log/dragonfly.log   # Log file path
```

### Memory Configuration

**Setting memory limits:**

```bash
# Limit to 4GB
--maxmemory=4gb

# Eviction policies:
--maxmemory_policy=allkeys-lru    # Evict any key, LRU
--maxmemory_policy=allkeys-lfu    # Evict any key, LFU
--maxmemory_policy=volatile-lru   # Evict keys with TTL, LRU
--maxmemory_policy=noeviction     # Return errors when memory full
```

**Recommended for Verscienta:**

- Memory limit: 2-4GB (based on server capacity)
- Policy: `allkeys-lru` (evict least recently used)

### Persistence Configuration

**Snapshot (RDB):**

```bash
# Save every 15 minutes if at least 1 key changed
--save_schedule=*:15

# Custom cron schedule (daily at 2 AM)
--snapshot_cron="0 2 * * *"
```

**Append-Only File (AOF):**

```bash
# Enable AOF
--appendonly=yes
--appendfilename=appendonly.aof

# Sync strategy
--appendfsync=everysec  # Sync every second (recommended)
```

**Recommendation for Verscienta:**

- Use RDB with `--save_schedule=*:15`
- Enable AOF for critical data: `--appendonly=yes`

---

## Monitoring & Maintenance

### Health Checks

**Basic check:**

```bash
redis-cli -h localhost -p 6379 -a your-password ping
# Expected: PONG
```

**Connection test:**

```bash
redis-cli -h localhost -p 6379 -a your-password INFO server
```

### Prometheus Metrics

DragonflyDB exposes Prometheus metrics on port 6379:

```bash
# Scrape endpoint
curl http://localhost:6379/metrics
```

**Grafana Dashboard:**

- Import dashboard ID: `16802` (DragonflyDB Official)
- Or create custom dashboard with key metrics

**Key Metrics to Monitor:**

- `dragonfly_connected_clients` - Active connections
- `dragonfly_used_memory_bytes` - Memory usage
- `dragonfly_keyspace_hits_total` - Cache hits
- `dragonfly_keyspace_misses_total` - Cache misses
- `dragonfly_commands_processed_total` - Total commands

### Redis CLI Commands

**View stats:**

```bash
redis-cli -a your-password INFO stats
redis-cli -a your-password INFO memory
redis-cli -a your-password INFO clients
```

**Monitor in real-time:**

```bash
redis-cli -a your-password MONITOR
```

**Check key count:**

```bash
redis-cli -a your-password DBSIZE
```

**View sample keys:**

```bash
redis-cli -a your-password --scan --pattern '*' | head -20
```

### Backup & Restore

**Manual backup:**

```bash
# Create snapshot
redis-cli -a your-password SAVE

# Copy snapshot file
docker cp dragonfly:/data/dump.rdb ./backup-$(date +%Y%m%d).rdb
```

**Restore from backup:**

```bash
# Stop DragonflyDB
docker stop dragonfly

# Copy backup file
docker cp ./backup-20250101.rdb dragonfly:/data/dump.rdb

# Start DragonflyDB
docker start dragonfly
```

**Automated backups:**

```bash
#!/bin/bash
# backup-dragonfly.sh

BACKUP_DIR="/backups/dragonfly"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup
docker exec dragonfly redis-cli -a $REDIS_PASSWORD SAVE

# Copy to backup directory
docker cp dragonfly:/data/dump.rdb $BACKUP_DIR/dump-$DATE.rdb

# Keep only last 7 backups
ls -t $BACKUP_DIR/dump-*.rdb | tail -n +8 | xargs rm -f

echo "Backup completed: dump-$DATE.rdb"
```

Add to crontab for daily backups:

```bash
0 2 * * * /path/to/backup-dragonfly.sh
```

---

## Troubleshooting

### Connection Refused

**Symptoms:**

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**

1. Check if DragonflyDB is running:
   ```bash
   docker ps | grep dragonfly
   ```
2. Check port mapping:
   ```bash
   docker port dragonfly
   ```
3. Verify host/port in environment variables
4. Check firewall rules

### Authentication Error

**Symptoms:**

```
NOAUTH Authentication required
```

**Solutions:**

1. Verify password in environment variables
2. Test with redis-cli:
   ```bash
   redis-cli -a your-password ping
   ```
3. Check password in DragonflyDB logs:
   ```bash
   docker logs dragonfly 2>&1 | grep password
   ```

### High Memory Usage

**Symptoms:**

- Memory usage exceeds expected levels
- OOM errors

**Solutions:**

1. Check memory usage:
   ```bash
   redis-cli -a password INFO memory
   ```
2. Set memory limit:
   ```bash
   --maxmemory=2gb --maxmemory_policy=allkeys-lru
   ```
3. Clear expired keys:
   ```bash
   redis-cli -a password --scan --pattern '*' | xargs redis-cli -a password DEL
   ```
4. Analyze large keys:
   ```bash
   redis-cli -a password --bigkeys
   ```

### Performance Issues

**Symptoms:**

- Slow response times
- High latency

**Solutions:**

1. Check active connections:
   ```bash
   redis-cli -a password INFO clients
   ```
2. Monitor slow commands:
   ```bash
   redis-cli -a password SLOWLOG GET 10
   ```
3. Increase proactor threads:
   ```bash
   --proactor_threads=16
   ```
4. Check for blocking operations:
   ```bash
   redis-cli -a password CLIENT LIST
   ```

### Data Persistence Issues

**Symptoms:**

- Data lost after restart
- Snapshot errors

**Solutions:**

1. Check write permissions:
   ```bash
   docker exec dragonfly ls -la /data
   ```
2. Verify disk space:
   ```bash
   df -h
   ```
3. Check logs for save errors:
   ```bash
   docker logs dragonfly | grep -i save
   ```
4. Manual save:
   ```bash
   redis-cli -a password SAVE
   ```

---

## Performance Tuning

### For Verscienta Health

**Recommended configuration for production:**

```bash
docker run -d \
  --name dragonfly \
  --restart unless-stopped \
  -p 6379:6379 \
  -v /data/dragonfly:/data \
  --memory=4g \
  --cpus=4 \
  docker.dragonflydb.io/dragonflydb/dragonfly \
  --requirepass=${REDIS_PASSWORD} \
  --dir=/data \
  --dbfilename=dump.rdb \
  --save_schedule=*:15 \
  --maxmemory=3gb \
  --maxmemory_policy=allkeys-lru \
  --proactor_threads=8 \
  --appendonly=yes \
  --appendfsync=everysec \
  --tcp_keepalive=300 \
  --loglevel=warning
```

**Expected performance:**

- Throughput: 100K+ ops/sec
- Latency (p99): < 1ms
- Memory efficiency: ~70% utilization
- Cache hit rate: > 85%

---

## Additional Resources

- **Official Documentation:** https://www.dragonflydb.io/docs
- **GitHub Repository:** https://github.com/dragonflydb/dragonfly
- **Discord Community:** https://discord.gg/HsPjXGVH85
- **Redis Compatibility:** https://www.dragonflydb.io/docs/command-reference/compatibility

---

**Next Steps:**

1. Set up DragonflyDB using the guide above
2. Configure environment variables in `.env`
3. Test connection with the Verscienta app
4. Monitor performance metrics
5. Set up automated backups
