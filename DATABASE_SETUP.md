# 🐘 PostgreSQL Database Setup with Docker

## Step 1: Install Docker Desktop (if not installed)

### Windows:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer if prompted
3. Start Docker Desktop from the Start menu
4. Wait for Docker to fully start (you'll see the Docker icon in the system tray)

### Verify Docker is running:
```bash
docker --version
# Should show: Docker version XX.X.X

docker compose version
# Should show: Docker Compose version vX.X.X
```

---

## Step 2: Start PostgreSQL Container

Your `docker-compose.yml` is already configured! Just run:

```bash
# From the project root directory
docker compose up -d postgres

# Expected output:
# [+] Running 2/2
#  ✔ Network verscienta-network  Created
#  ✔ Container verscienta-db     Started
```

### Verify it's running:
```bash
docker compose ps

# Should show:
# NAME              STATUS    PORTS
# verscienta-db     Up        0.0.0.0:5432->5432/tcp
```

### Check logs if needed:
```bash
docker compose logs postgres

# Should show PostgreSQL initialization logs
```

---

## Step 3: Verify Database Connection

Test the connection:

```bash
# Option A: Using psql (if installed)
psql postgresql://verscienta_user:changeme123@localhost:5432/verscienta_health -c "\l"

# Option B: Using Docker
docker exec -it verscienta-db psql -U verscienta_user -d verscienta_health -c "\l"
```

---

## Step 4: Run Payload Migrations

Now that the database is running, create all the tables:

```bash
cd apps/payload-cms

# Run migrations (creates all 13 collection tables)
pnpm payload migrate

# Expected output:
# ✓ Creating migration verscienta_health_YYYYMMDDHHMMSS
# ✓ Creating tables for:
#   - users
#   - media
#   - herbs
#   - formulas
#   - conditions
#   - symptoms
#   - practitioners
#   - modalities
#   - reviews
#   - grok_insights
#   - audit_logs
#   - import_logs
#   - validation_reports
# ✓ Creating global: trefle_import_state
# ✓ Migrations complete!
```

---

## Step 5: Start Payload CMS

```bash
# Still in apps/payload-cms directory
pnpm dev

# Expected output:
# ▲ Next.js 15.5.6
# - Local:        http://localhost:3001
# - Network:      http://192.168.x.x:3001
#
# ✓ Ready in XXXXms
```

---

## Step 6: Access Admin Panel

1. Open http://localhost:3001/admin
2. **Create your first admin user:**
   - First Name: Your name
   - Last Name: Your last name
   - Email: your-email@example.com
   - Password: (secure password)
   - Role: admin (automatically set)

3. **Test creating content:**
   - Go to "Herbs" → "Create New"
   - Fill in: Title, Slug, Description
   - Try adding botanical info, TCM properties
   - Save and see your first herb!

---

## Step 7: Test the API

Once you have some content, test the REST API:

```bash
# Get all herbs
curl http://localhost:3001/api/herbs

# Response:
# {
#   "docs": [...],
#   "totalDocs": 1,
#   "limit": 25,
#   "totalPages": 1,
#   "page": 1,
#   "hasPrevPage": false,
#   "hasNextPage": false
# }

# Get specific herb by slug
curl "http://localhost:3001/api/herbs?where[slug][equals]=ginseng"

# Get all formulas
curl http://localhost:3001/api/formulas

# Get all conditions
curl http://localhost:3001/api/conditions
```

---

## 🎉 Success Checklist

After completing these steps, you should have:

- [ ] Docker Desktop installed and running
- [ ] PostgreSQL container running (`verscienta-db`)
- [ ] Database migrations completed (all tables created)
- [ ] Payload dev server running on http://localhost:3001
- [ ] Admin user created
- [ ] Can access admin panel at http://localhost:3001/admin
- [ ] Can create/edit content (try creating a Herb)
- [ ] API responds at http://localhost:3001/api/herbs

---

## 🛠️ Useful Commands

### Docker Management
```bash
# View all running containers
docker compose ps

# View logs
docker compose logs postgres
docker compose logs -f postgres  # Follow logs

# Stop PostgreSQL
docker compose stop postgres

# Start PostgreSQL
docker compose start postgres

# Restart PostgreSQL
docker compose restart postgres

# Stop and remove container (keeps data)
docker compose down

# Stop and remove container + data (⚠️ careful!)
docker compose down -v
```

### Database Management
```bash
# Connect to PostgreSQL CLI
docker exec -it verscienta-db psql -U verscienta_user -d verscienta_health

# Inside psql:
\dt          # List all tables
\d herbs     # Describe herbs table
\q           # Quit

# Backup database
docker exec verscienta-db pg_dump -U verscienta_user verscienta_health > backup.sql

# Restore database
docker exec -i verscienta-db psql -U verscienta_user verscienta_health < backup.sql
```

### Payload Management
```bash
cd apps/payload-cms

# Generate TypeScript types
pnpm generate:types

# Generate import map
pnpm generate:importmap

# Run migrations
pnpm payload migrate

# Create new migration
pnpm payload migrate:create

# Check migration status
pnpm payload migrate:status
```

---

## 🐛 Troubleshooting

### "Docker command not found"
- Make sure Docker Desktop is installed and running
- Restart your terminal after installing Docker
- Check Docker is in your PATH: `where docker`

### "Port 5432 already in use"
- Another PostgreSQL instance is running
- Stop it: `net stop postgresql` (Windows)
- Or change the port in docker-compose.yml

### "Cannot connect to database"
- Check Docker container is running: `docker compose ps`
- Check logs: `docker compose logs postgres`
- Verify .env DATABASE_URI matches docker-compose.yml settings
- Wait a few seconds for PostgreSQL to initialize on first start

### "Migration failed"
- Check database is accessible
- Check you're in the correct directory: `apps/payload-cms`
- Try: `docker compose restart postgres` and wait 10 seconds

### "Admin panel won't load"
- Check dev server is running: `pnpm dev`
- Check no errors in console
- Try clearing browser cache
- Try incognito/private window

### "Can't create content - validation errors"
- Check required fields are filled
- Check slug doesn't already exist (must be unique)
- Check relationships are valid (referenced items exist)

---

## 📊 Database Schema Created

After migrations, you'll have these tables:

**Core Collections:**
- `users` - Authentication
- `media` - File uploads
- `herbs` - Main herb database (40+ columns!)
- `formulas` - Herbal formulas
- `conditions` - Health conditions
- `symptoms` - Symptom database

**Directory Collections:**
- `practitioners` - Practitioner directory
- `modalities` - Treatment modalities
- `reviews` - User reviews (polymorphic)

**Utility Collections:**
- `grok_insights` - AI insights
- `audit_logs` - HIPAA logs
- `import_logs` - Data import tracking
- `validation_reports` - Quality reports

**Globals:**
- `trefle_import_state` - Import state tracking

**System Tables:**
- `payload_migrations` - Migration history
- `payload_preferences` - User preferences
- Plus various junction tables for many-to-many relationships

---

## 🎯 Next Steps After Database Setup

Once your database is running and tested:

1. ✅ Database setup complete
2. 📋 Port Trefle integration (see NEXT_STEPS.md)
3. 📋 Set up Algolia hooks
4. 📋 Create frontend API client
5. 📋 Refactor frontend
6. 📋 Deploy to production

---

## 💡 Tips

**Development Workflow:**
1. Start Docker: `docker compose up -d postgres`
2. Start Payload: `cd apps/payload-cms && pnpm dev`
3. Start Frontend: `cd apps/web && pnpm dev`
4. Code, test, commit!

**When you're done coding:**
```bash
# Stop dev servers (Ctrl+C in terminals)
# Optionally stop Docker:
docker compose stop postgres
```

**For production:**
- Change `POSTGRES_PASSWORD` in docker-compose.yml
- Change `PAYLOAD_SECRET` in .env
- Use proper SSL certificates
- Enable PostgreSQL SSL
- Set up backups
- Monitor logs

---

**Ready? Start with Step 1 if Docker isn't installed, or jump to Step 2 if it is!** 🚀
