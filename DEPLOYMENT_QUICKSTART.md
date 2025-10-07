# Deployment Quick Start - Coolify

Quick reference for deploying Verscienta Health to Coolify.

## 📋 Pre-Deployment Checklist

- [ ] Coolify server set up and accessible
- [ ] Git repository accessible to Coolify
- [ ] Domain names configured (DNS pointing to server)
- [ ] All environment variables prepared
- [ ] PostgreSQL database planned
- [ ] SSL certificates ready (Let's Encrypt via Coolify)

---

## 🚀 30-Minute Deployment

### 1. Create PostgreSQL Database (5 min)

1. Coolify Dashboard → **Databases** → **+ New Database**
2. Select **PostgreSQL 17**
3. Configure:
   - Name: `verscienta-db`
   - Password: Generate strong password
   - Database: `verscienta_health`
4. **Deploy** and wait for health check

**Copy the connection string for later:**

```
postgresql://user:PASSWORD@host:5432/verscienta_health
```

---

### 2. Deploy Backend (10 min)

1. **Projects** → **+ New Resource** → **Dockerfile**
2. Connect Git repository
3. Configuration:
   - **Dockerfile Path:** `apps/cms/Dockerfile`
   - **Build Context:** `.` (root)
   - **Domain:** `backend.verscienta.com`

4. **Environment Variables:**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<from-step-1>
PAYLOAD_SECRET=<generate-64-char-random>
ALGOLIA_APP_ID=<your-algolia-app-id>
ALGOLIA_ADMIN_KEY=<your-algolia-admin-key>
FRONTEND_URL=https://verscienta.com
```

5. Enable **HTTPS** (Let's Encrypt)
6. **Deploy**
7. After deployment succeeds, run migration:
   - Go to service → **Terminal**
   - Run: `pnpm db:push`

---

### 3. Deploy Frontend (10 min)

1. **Projects** → **+ New Resource** → **Dockerfile**
2. Connect same Git repository
3. Configuration:
   - **Dockerfile Path:** `apps/web/Dockerfile`
   - **Build Context:** `.` (root)
   - **Domain:** `verscienta.com`

4. **Environment Variables:**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://verscienta.com
NEXT_PUBLIC_CMS_URL=https://backend.verscienta.com
DATABASE_URL=<from-step-1>
BETTER_AUTH_SECRET=<generate-64-char-random>
NEXT_PUBLIC_ALGOLIA_APP_ID=<your-algolia-app-id>
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=<your-search-key>
GROK_API_KEY=<your-grok-api-key>
```

5. Enable **HTTPS** (Let's Encrypt)
6. **Deploy**

---

### 4. Post-Deployment (5 min)

1. **Create Admin User:**
   - Visit: `https://backend.verscienta.com/admin`
   - Create first admin account

2. **Test Application:**
   - Visit: `https://verscienta.com`
   - Test login/register
   - Create test content in CMS
   - Verify it appears on frontend

3. **Configure Backups:**
   - Database → **Backups** → Enable daily backups
   - Retention: 30 days

---

## 🔄 Continuous Deployment

### Enable Auto-Deploy on Git Push

1. Each service → **Webhooks**
2. Copy webhook URL
3. Add to GitHub/GitLab:
   - Settings → Webhooks
   - Paste URL
   - Trigger: Push to main branch
4. Test: Push a commit, watch Coolify rebuild

---

## 🔧 Common Commands

### View Logs

```bash
# In Coolify UI
Service → Logs → Filter by time
```

### Restart Service

```bash
# In Coolify UI
Service → Restart
```

### Access Database

```bash
# In Coolify UI
Database → Terminal
```

### Run Migrations

```bash
# In CMS service terminal
pnpm db:push
```

### Clear Cache

```bash
# Restart both services
```

---

## 🚨 Troubleshooting

### Build Fails

- Check Dockerfile syntax
- Verify pnpm-lock.yaml is committed
- Review build logs

### Can't Connect to Database

- Verify DATABASE_URL is correct
- Check database service is running
- Verify Docker network connectivity

### 502 Bad Gateway

- Check if service is running (logs)
- Verify port configuration (3000/3001)
- Check health check status

### Environment Variables Not Working

- Ensure no trailing spaces
- Restart service after changes
- Check variable names match exactly

---

## 📊 Monitoring

### Health Checks

- Frontend: `https://verscienta.com/api/health`
- Backend: `https://backend.verscienta.com/api/health`

### Resource Usage

- Coolify Dashboard → Service → Metrics
- Monitor CPU, RAM, Disk usage

### Uptime Monitoring

- Add external uptime monitor (UptimeRobot, etc.)
- Monitor both frontend and backend endpoints

---

## 🔐 Security Checklist

- [ ] Strong database password (20+ characters)
- [ ] Unique PAYLOAD_SECRET (64+ characters)
- [ ] Unique BETTER_AUTH_SECRET (64+ characters)
- [ ] HTTPS enabled on both services
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Database not publicly accessible
- [ ] Backups configured and tested
- [ ] Different secrets for staging/production

---

## 📈 Scaling

### Vertical Scaling (More Resources)

1. Coolify → Service → Settings
2. Adjust CPU/RAM limits
3. Restart service

### Horizontal Scaling (More Instances)

1. Coolify → Service → Settings
2. Increase **Replicas** count
3. Coolify auto-load balances

---

## 💾 Backup & Restore

### Manual Backup

```bash
# Database backup
docker exec verscienta-db pg_dump -U verscienta_user verscienta_health > backup.sql
```

### Restore

```bash
# Upload backup.sql to server
docker exec -i verscienta-db psql -U verscienta_user verscienta_health < backup.sql
```

---

## 📞 Quick Links

- **Full Guide:** See `COOLIFY_DEPLOYMENT.md`
- **Setup Guide:** See `SETUP_GUIDE.md`
- **Coolify Docs:** https://coolify.io/docs
- **Support:** support@verscientahealth.com

---

## ✅ Deployment Success

You should now have:

- ✅ Frontend running at `https://verscienta.com`
- ✅ Backend running at `https://backend.verscienta.com`
- ✅ SSL/HTTPS enabled
- ✅ Auto-deployment on git push
- ✅ Database backups configured
- ✅ Admin user created

**Your Verscienta Health platform is live!** 🎉
