# DragonflyDB TLS/SSL Security Guide

**Last Updated:** 2025-10-22
**Purpose:** Comprehensive TLS/SSL configuration and security best practices for DragonflyDB
**Audience:** DevOps, Security Engineers, Production Deployment

---

## Table of Contents

1. [Current Implementation Review](#current-implementation-review)
2. [TLS Best Practices](#tls-best-practices)
3. [Server-Side Configuration](#server-side-configuration)
4. [Client-Side Configuration](#client-side-configuration)
5. [Certificate Management](#certificate-management)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Current Implementation Review

### ✅ What We're Doing Right

Our current implementation in `apps/web/lib/cache.ts` follows several security best practices:

#### 1. **Production Certificate Validation**
```typescript
tls: url.protocol === 'rediss:' ? {
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  servername: url.hostname,
} : undefined
```

**Why this is secure:**
- ✅ Enables strict certificate validation in production
- ✅ Allows self-signed certificates in development for testing
- ✅ Prevents Man-in-the-Middle (MITM) attacks in production
- ✅ Uses Server Name Indication (SNI) for multi-domain environments

#### 2. **Automatic TLS Detection**
```typescript
const useTLS = process.env.REDIS_TLS === 'true' ||
               process.env.REDIS_URL?.startsWith('rediss://')
```

**Why this is secure:**
- ✅ Supports both explicit TLS flag and URL-based detection
- ✅ Uses `rediss://` protocol (secure Redis) to auto-enable TLS
- ✅ Flexible configuration for different deployment environments

#### 3. **Connection Security Measures**
```typescript
enableReadyCheck: true,
enableOfflineQueue: false,  // Fail fast if Redis is down
connectTimeout: 10000,      // 10 seconds
commandTimeout: 5000,       // 5 seconds per command
keepAlive: 30000,           // 30 seconds keepalive
maxRetriesPerRequest: 3,
```

**Why this is secure:**
- ✅ Prevents connection hanging indefinitely
- ✅ Detects and responds to connection failures quickly
- ✅ Limits resource consumption from failed connections
- ✅ Reduces attack surface for DoS attempts

### 🔄 Recommended Enhancements

#### 1. **CA Certificate Support for Client Authentication**

DragonflyDB supports **client certificate authentication** as an alternative to password authentication. This is more secure for production environments.

**Current limitation:** We only support password-based authentication.

**Enhancement:**
```typescript
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    const url = new URL(redisUrl)
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
      db: parseInt(url.pathname.slice(1) || '0'),
      tls: url.protocol === 'rediss:' ? {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        servername: url.hostname,
        // 🔧 ADD: Client certificate authentication
        ca: process.env.REDIS_TLS_CA_FILE ?
            fs.readFileSync(process.env.REDIS_TLS_CA_FILE) : undefined,
        cert: process.env.REDIS_TLS_CERT_FILE ?
              fs.readFileSync(process.env.REDIS_TLS_CERT_FILE) : undefined,
        key: process.env.REDIS_TLS_KEY_FILE ?
             fs.readFileSync(process.env.REDIS_TLS_KEY_FILE) : undefined,
      } : undefined,
    }
  }
  // ... rest of config
}
```

**New environment variables:**
```bash
# Optional: Client certificate authentication (more secure than passwords)
REDIS_TLS_CA_FILE=/path/to/ca.crt        # CA root certificate
REDIS_TLS_CERT_FILE=/path/to/client.crt  # Client certificate
REDIS_TLS_KEY_FILE=/path/to/client.key   # Client private key
```

#### 2. **TLS Version Enforcement**

**Enhancement:**
```typescript
tls: url.protocol === 'rediss:' ? {
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  servername: url.hostname,
  // 🔧 ADD: Enforce TLS 1.2+
  minVersion: 'TLSv1.2',  // Reject TLS 1.0 and 1.1 (deprecated)
  maxVersion: 'TLSv1.3',  // Latest and most secure
} : undefined
```

**Why this matters:**
- TLS 1.0 and 1.1 are deprecated and have known vulnerabilities
- TLS 1.2 and 1.3 provide modern encryption standards
- PCI DSS and HIPAA compliance require TLS 1.2+

#### 3. **Certificate Expiration Monitoring**

**Current gap:** No automated certificate expiration monitoring.

**Recommendation:** Implement a cron job or monitoring script:
```typescript
// Example: apps/web/lib/tls-monitor.ts
export async function checkCertificateExpiration(): Promise<{
  daysUntilExpiry: number;
  isExpiring: boolean;
}> {
  if (process.env.NODE_ENV !== 'production') return { daysUntilExpiry: 365, isExpiring: false }

  const tlsSocket = tls.connect({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    rejectUnauthorized: true,
  })

  return new Promise((resolve, reject) => {
    tlsSocket.on('secureConnect', () => {
      const cert = tlsSocket.getPeerCertificate()
      const expiryDate = new Date(cert.valid_to)
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      tlsSocket.end()

      resolve({
        daysUntilExpiry,
        isExpiring: daysUntilExpiry < 30,  // Alert if expiring in 30 days
      })
    })

    tlsSocket.on('error', reject)
  })
}
```

---

## TLS Best Practices

### 1. Certificate Requirements (2025 Standards)

| Requirement | Minimum | Recommended | Why |
|------------|---------|-------------|-----|
| **Key Algorithm** | RSA 2048-bit | RSA 2048-bit or ECC 256-bit | RSA 2048 = ~112 bits of security, sufficient for most use cases |
| **Signature Algorithm** | SHA-256 | SHA-256 or SHA-384 | MD5 and SHA-1 are broken |
| **Certificate Validity** | ≤ 398 days | 90 days (Let's Encrypt) | Shorter validity = less impact if compromised |
| **TLS Version** | TLS 1.2 | TLS 1.3 | TLS 1.0/1.1 deprecated, known vulnerabilities |
| **Certificate Chain** | Complete chain | Complete chain + OCSP Stapling | Missing intermediate certificates cause errors |

### 2. Certificate Authorities (CAs)

**Production:**
- ✅ Use trusted CA (Let's Encrypt, DigiCert, Sectigo)
- ✅ Automate certificate renewal (Certbot, ACME protocol)
- ✅ Monitor expiration dates (30-day warning minimum)

**Development/Testing:**
- ⚠️ Self-signed certificates are acceptable
- ⚠️ Disable `rejectUnauthorized` only in non-production
- ⚠️ Never commit private keys to version control

### 3. Key Management

**DO:**
- ✅ Store private keys in secure secrets management (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets)
- ✅ Use file permissions `600` (owner read/write only) for key files
- ✅ Rotate certificates every 90 days
- ✅ Use separate certificates for each environment (dev, staging, prod)

**DON'T:**
- ❌ Commit private keys to Git
- ❌ Share private keys between services
- ❌ Use the same certificate for multiple domains (use SAN certificates or wildcards)
- ❌ Store keys in environment variables (files or secrets managers only)

---

## Server-Side Configuration

### DragonflyDB TLS Setup

#### Option 1: Password Authentication with TLS (Current)

**Docker Compose:**
```yaml
services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly:latest
    ports:
      - '6379:6379'
    volumes:
      - dragonfly-data:/data
      - ./certs:/certs:ro  # Mount certificate directory
    command:
      - --requirepass=${REDIS_PASSWORD}
      - --dir=/data
      - --tls  # Enable TLS
      - --tls_cert_file=/certs/server.crt  # Server certificate
      - --tls_key_file=/certs/server.key   # Server private key
      - --tls_ca_cert_file=/certs/ca.crt   # Optional: CA certificate for client verification
      - --maxmemory=3gb
    secrets:
      - redis_password
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: dragonfly
spec:
  serviceName: dragonfly
  template:
    spec:
      containers:
        - name: dragonfly
          image: docker.dragonflydb.io/dragonflydb/dragonfly:latest
          ports:
            - containerPort: 6379
          env:
            - name: DRAGONFLY_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: dragonfly-secret
                  key: password
          command:
            - dragonfly
            - --requirepass=$(DRAGONFLY_PASSWORD)
            - --tls
            - --tls_cert_file=/certs/tls.crt
            - --tls_key_file=/certs/tls.key
          volumeMounts:
            - name: data
              mountPath: /data
            - name: tls-certs
              mountPath: /certs
              readOnly: true
      volumes:
        - name: tls-certs
          secret:
            secretName: dragonfly-tls
            defaultMode: 0400  # Read-only for owner
```

#### Option 2: Client Certificate Authentication (More Secure)

**DragonflyDB command:**
```bash
dragonfly \
  --tls \
  --tls_cert_file=/certs/server.crt \
  --tls_key_file=/certs/server.key \
  --tls_ca_cert_file=/certs/ca.crt \
  --tls_client_cert_required=true  # Require client certificates
```

**Benefits:**
- 🔐 No passwords to manage or rotate
- 🔐 Mutual TLS (mTLS) authentication
- 🔐 Better defense against brute force attacks
- 🔐 Easier to revoke access (revoke certificate instead of changing passwords)

### Certificate Generation

#### Self-Signed Certificates (Development Only)

```bash
#!/bin/bash
# generate-tls-certs.sh - Development ONLY

# 1. Generate CA private key and certificate
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt \
  -subj "/C=US/ST=State/L=City/O=Verscienta/CN=DragonflyDB CA"

# 2. Generate server private key
openssl genrsa -out server.key 2048

# 3. Generate server certificate signing request (CSR)
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=State/L=City/O=Verscienta/CN=dragonfly.internal"

# 4. Sign server certificate with CA
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt

# 5. Generate client private key and certificate (optional, for mTLS)
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
  -subj "/C=US/ST=State/L=City/O=Verscienta/CN=verscienta-web-client"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt

# Set secure permissions
chmod 600 *.key
chmod 644 *.crt

echo "✓ TLS certificates generated (development only)"
echo "⚠️  NEVER use these in production!"
```

#### Production Certificates (Let's Encrypt)

**Certbot with DNS challenge (recommended for internal services):**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-dns-cloudflare  # Example: Cloudflare DNS

# Generate certificate
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /path/to/cloudflare.ini \
  -d dragonfly.verscienta.com

# Certificates will be in:
# /etc/letsencrypt/live/dragonfly.verscienta.com/fullchain.pem  # Certificate + chain
# /etc/letsencrypt/live/dragonfly.verscienta.com/privkey.pem    # Private key
```

**Auto-renewal setup:**
```bash
# Certbot auto-renews certificates via cron/systemd timer
# Test renewal:
sudo certbot renew --dry-run

# Important: DragonflyDB does NOT auto-reload certificates
# Add post-renewal hook to restart DragonflyDB:
cat > /etc/letsencrypt/renewal-hooks/post/restart-dragonfly.sh << 'EOF'
#!/bin/bash
# Restart DragonflyDB after certificate renewal
docker restart dragonfly  # Docker
# OR
kubectl rollout restart statefulset/dragonfly  # Kubernetes
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/restart-dragonfly.sh
```

---

## Client-Side Configuration

### Current Implementation (`apps/web/lib/cache.ts`)

```typescript
import Redis from 'ioredis'

function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    const url = new URL(redisUrl)
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
      db: parseInt(url.pathname.slice(1) || '0'),
      tls: url.protocol === 'rediss:' ? {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        servername: url.hostname,
      } : undefined,
    }
  }

  const useTLS = process.env.REDIS_TLS === 'true' ||
                 process.env.REDIS_URL?.startsWith('rediss://')

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    tls: useTLS ? {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      servername: process.env.REDIS_HOST || 'localhost',
    } : undefined,
  }
}

export const redis = new Redis({
  ...getRedisConfig(),
  // ... other options
})
```

### Environment Variables

#### Development (Self-Signed Certificates)

```bash
# .env.local (Development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev-password
REDIS_DB=0
REDIS_TLS=false  # Or true with rejectUnauthorized=false
```

#### Production (Let's Encrypt or Trusted CA)

```bash
# Production environment variables (use secrets manager)
REDIS_URL=rediss://:your-password@dragonfly.verscienta.com:6379/0
NODE_ENV=production  # Enables certificate validation

# OR with individual vars:
REDIS_HOST=dragonfly.verscienta.com
REDIS_PORT=6379
REDIS_PASSWORD=<use-secrets-manager>
REDIS_DB=0
REDIS_TLS=true
```

#### Production with Client Certificates (Most Secure)

```bash
# Production with mTLS
REDIS_URL=rediss://dragonfly.verscienta.com:6379/0
REDIS_TLS_CA_FILE=/app/certs/ca.crt
REDIS_TLS_CERT_FILE=/app/certs/client.crt
REDIS_TLS_KEY_FILE=/app/certs/client.key
NODE_ENV=production
```

---

## Certificate Management

### Certificate Lifecycle

```
1. Generation → 2. Installation → 3. Monitoring → 4. Renewal → 5. Revocation (if needed)
     ↑                                                             |
     └─────────────────────────────────────────────────────────────┘
```

### 1. Certificate Generation

**Production:**
- Use Let's Encrypt (free, trusted, 90-day validity)
- Use DNS-01 challenge for internal services
- Use HTTP-01 challenge for public-facing services

**Development:**
- Self-signed certificates are acceptable
- Generate with OpenSSL (see script above)

### 2. Certificate Installation

**Docker:**
```bash
# Copy certificates to mounted volume
cp /etc/letsencrypt/live/dragonfly.verscienta.com/*.pem /opt/dragonfly/certs/

# Update docker-compose.yml volumes
volumes:
  - /opt/dragonfly/certs:/certs:ro
```

**Kubernetes:**
```bash
# Create TLS secret from certificate files
kubectl create secret tls dragonfly-tls \
  --cert=/etc/letsencrypt/live/dragonfly.verscienta.com/fullchain.pem \
  --key=/etc/letsencrypt/live/dragonfly.verscienta.com/privkey.pem \
  -n production

# Secret will be mounted in pod (see server config above)
```

### 3. Certificate Monitoring

**Automated monitoring script** (run daily via cron):
```bash
#!/bin/bash
# /opt/scripts/check-cert-expiry.sh

CERT_FILE="/etc/letsencrypt/live/dragonfly.verscienta.com/fullchain.pem"
ALERT_DAYS=30

if [ ! -f "$CERT_FILE" ]; then
  echo "ERROR: Certificate not found: $CERT_FILE"
  exit 1
fi

EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

echo "Certificate expires in $DAYS_LEFT days ($EXPIRY_DATE)"

if [ $DAYS_LEFT -lt $ALERT_DAYS ]; then
  echo "⚠️  WARNING: Certificate expiring soon!"
  # Send alert (email, Slack, PagerDuty, etc.)
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"⚠️ DragonflyDB certificate expires in $DAYS_LEFT days\"}"
fi
```

**Add to crontab:**
```bash
# Run daily at 9 AM
0 9 * * * /opt/scripts/check-cert-expiry.sh >> /var/log/cert-check.log 2>&1
```

### 4. Certificate Renewal

**Let's Encrypt (automatic):**
```bash
# Certbot auto-renews via systemd timer
# Check renewal status:
sudo certbot certificates

# Test renewal:
sudo certbot renew --dry-run

# Manual renewal (if needed):
sudo certbot renew --force-renewal
```

**Post-renewal actions:**
```bash
# DragonflyDB does NOT auto-reload certificates
# Must restart after renewal

# Docker:
docker restart dragonfly

# Kubernetes:
kubectl rollout restart statefulset/dragonfly -n production

# Verify new certificate:
openssl s_client -connect dragonfly.verscienta.com:6379 -showcerts < /dev/null | \
  openssl x509 -noout -dates
```

### 5. Certificate Revocation

**When to revoke:**
- Private key compromised
- Certificate issued incorrectly
- Domain ownership changed
- Service decommissioned

**How to revoke (Let's Encrypt):**
```bash
# Revoke current certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/dragonfly.verscienta.com/cert.pem

# Optionally delete certificate files
sudo certbot delete --cert-name dragonfly.verscienta.com
```

---

## Security Checklist

### Pre-Production Deployment

- [ ] **TLS enabled** on DragonflyDB server (`--tls` flag)
- [ ] **Valid certificate** from trusted CA (not self-signed)
- [ ] **Complete certificate chain** installed (intermediate + root certificates)
- [ ] **Private key permissions** set to `600` (owner read/write only)
- [ ] **Certificate expiration** > 30 days
- [ ] **TLS version** enforcement (TLS 1.2+ minimum)
- [ ] **Client certificate validation** enabled (`rejectUnauthorized: true`)
- [ ] **SNI** configured (`servername` matches certificate CN/SAN)
- [ ] **Connection timeouts** configured (10s connect, 5s command)
- [ ] **Automated certificate renewal** configured (Certbot + post-renewal hooks)
- [ ] **Certificate expiration monitoring** enabled (30-day alerts)
- [ ] **Secrets management** used for passwords/keys (not hardcoded)

### Post-Deployment Verification

```bash
# 1. Test TLS connection
openssl s_client -connect dragonfly.verscienta.com:6379 -showcerts

# Expected output:
# - Verify return code: 0 (ok)
# - SSL handshake successful
# - Certificate chain displayed

# 2. Verify certificate details
echo "QUIT" | openssl s_client -connect dragonfly.verscienta.com:6379 2>&1 | \
  openssl x509 -noout -text

# Check:
# - Issuer (should be trusted CA, not self-signed)
# - Validity dates (not expired, > 30 days remaining)
# - Subject Alternative Names (SAN) match hostname

# 3. Test application connection
curl -X GET http://localhost:3000/api/health

# Expected: "ok" response (confirms Redis connection works)

# 4. Check Redis INFO output
redis-cli --tls --cert /path/to/client.crt --key /path/to/client.key \
  --cacert /path/to/ca.crt -h dragonfly.verscienta.com INFO server

# Expected: Server info displayed (confirms TLS connection successful)
```

### Ongoing Maintenance

**Weekly:**
- [ ] Monitor certificate expiration dates
- [ ] Review connection error logs

**Monthly:**
- [ ] Test certificate renewal process (dry-run)
- [ ] Review security advisories for TLS vulnerabilities
- [ ] Audit secrets access logs

**Quarterly:**
- [ ] Rotate service passwords
- [ ] Review and update TLS configuration
- [ ] Test disaster recovery procedures

---

## Troubleshooting

### Common Issues

#### 1. "ECONNREFUSED" Error

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Causes:**
- DragonflyDB is not running
- Wrong host/port configuration
- Firewall blocking connection

**Solutions:**
```bash
# Check if DragonflyDB is running
docker ps | grep dragonfly
# OR
kubectl get pods | grep dragonfly

# Check firewall rules
sudo iptables -L | grep 6379

# Test connection
telnet dragonfly.verscienta.com 6379
```

#### 2. "SELF_SIGNED_CERT_IN_CHAIN" Error

**Symptom:**
```
Error: self-signed certificate in certificate chain
```

**Causes:**
- Self-signed certificate in production with `rejectUnauthorized: true`
- Incomplete certificate chain (missing intermediate certificates)
- CA certificate not trusted by system

**Solutions:**
```bash
# Option 1: Install complete certificate chain
# Ensure server certificate includes intermediate certificates
cat server.crt intermediate.crt > fullchain.pem

# Option 2: Add CA certificate to client config (if using custom CA)
REDIS_TLS_CA_FILE=/path/to/ca.crt

# Option 3: Development only - disable validation
NODE_ENV=development  # Allows self-signed certificates
```

#### 3. "CERT_HAS_EXPIRED" Error

**Symptom:**
```
Error: certificate has expired
```

**Cause:** Certificate expiration date has passed.

**Solutions:**
```bash
# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/dragonfly.verscienta.com/fullchain.pem

# Renew certificate immediately
sudo certbot renew --force-renewal

# Restart DragonflyDB to load new certificate
docker restart dragonfly
```

#### 4. "UNABLE_TO_VERIFY_LEAF_SIGNATURE" Error

**Symptom:**
```
Error: unable to verify the first certificate
```

**Causes:**
- Incomplete certificate chain
- Missing intermediate certificates
- CA certificate not provided

**Solutions:**
```bash
# Verify certificate chain is complete
openssl verify -CAfile ca.crt -untrusted intermediate.crt server.crt

# Expected: server.crt: OK

# If missing intermediate, concatenate:
cat server.crt intermediate.crt > fullchain.pem
```

#### 5. Connection Timeout with TLS

**Symptom:**
```
Error: Connection timeout
```

**Causes:**
- TLS handshake taking too long
- Network latency
- Certificate validation issues

**Solutions:**
```bash
# Increase connection timeout
connectTimeout: 30000  // 30 seconds instead of 10

# Test TLS handshake performance
time openssl s_client -connect dragonfly.verscienta.com:6379 < /dev/null

# Check network latency
ping dragonfly.verscienta.com
```

### Debug Mode

Enable verbose TLS debugging:

```typescript
import Redis from 'ioredis'

const redis = new Redis({
  // ... config
  tls: {
    rejectUnauthorized: true,
    servername: 'dragonfly.verscienta.com',
    // Enable TLS debugging
    secureOptions: require('constants').SSL_OP_NO_TLSv1 |
                   require('constants').SSL_OP_NO_TLSv1_1,
  },
})

redis.on('connect', () => {
  console.log('✓ Redis connected')
})

redis.on('ready', () => {
  console.log('✓ Redis ready (TLS handshake complete)')
})

redis.on('error', (err) => {
  console.error('✗ Redis error:', err)
  console.error('Error code:', err.code)
  console.error('Error message:', err.message)
})

redis.on('close', () => {
  console.log('⚠ Redis connection closed')
})
```

---

## Additional Resources

### Official Documentation
- [DragonflyDB TLS Documentation](https://www.dragonflydb.io/docs/managing-dragonfly/using-tls)
- [DragonflyDB Operator Server TLS](https://www.dragonflydb.io/docs/managing-dragonfly/operator/server-tls)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js TLS/SSL Documentation](https://nodejs.org/api/tls.html)

### Security Standards
- [SSL Labs TLS Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)

### Tools
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Certbot (Let's Encrypt)](https://certbot.eff.org/)
- [OpenSSL](https://www.openssl.org/)

---

## Summary

### Current Security Posture: ✅ Strong

Our TLS implementation follows modern security best practices:
- Production certificate validation enabled
- SNI support for multi-domain environments
- Connection timeouts and resource limits configured
- Automatic TLS detection via URL protocol
- Fail-fast behavior for connection errors

### Recommended Next Steps

1. **Add client certificate support** for enhanced authentication
2. **Implement certificate expiration monitoring** (30-day alerts)
3. **Enforce TLS 1.2+ minimum version**
4. **Document certificate renewal procedures** in runbooks
5. **Set up automated testing** of TLS connections in CI/CD

### Production Readiness: 🟢 Ready

**Prerequisites met:**
- ✅ TLS enabled with proper validation
- ✅ Connection security measures in place
- ✅ Environment-specific configuration (dev vs prod)
- ✅ Comprehensive documentation

**Action items before production:**
- [ ] Generate production certificates (Let's Encrypt)
- [ ] Configure certificate auto-renewal with post-renewal hooks
- [ ] Set up certificate expiration monitoring and alerts
- [ ] Test TLS connection from production environment
- [ ] Update environment variables in secrets manager

---

**Document Version:** 1.0
**Last Reviewed:** 2025-10-22
**Next Review:** 2025-11-22
**Owner:** DevOps/Security Team
