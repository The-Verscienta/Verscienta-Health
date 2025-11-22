# Master TODO List – Verscienta Health
**Created:** 2025-01-15 | **Last Updated:** 2025-01-22 | **Total Items:** 258 | **Status:** Active
**Overall Progress:** 29.1% Complete (75 completed / 258 total)  

**Organized by Implementation Phases** (aligned with `VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md` + new Phase 7 for mobile)

**Key Notes**
- All completed items have been re-verified as of 2025-11-22.
- **NEW (2025-01-22)**: Trefle API enhanced client completed with timeout, circuit breaker, retry logic & statistics tracking
- 8 new high-priority TODOs added (marked ⭐ NEW) based on current blockers, compliance gaps, and launch readiness.
- Minor re-categorization for clarity (e.g., testing tasks grouped under Phase 3).
- Mobile phase remains untouched (0/55).

### Phase 1: Foundation (Weeks 1-4) – Monorepo, CMS, Core Integrations  
🟢 **Status:** 72% Complete (18 / 25 items)

**Completed (18)**
- [x] PayloadCMS 3.0 migration complete (collections, Local API, types)
- [x] NCCIH/PubMed integration with full citation system
- [x] Trefle + Perenual API clients (rate-limited, cached) - Basic implementation
- [x] Herb deduplication engine
- [x] API versioning system (#140)
- [x] CORS for mobile & third-party origins (#141)
- [x] Resend email integration
- [x] Dual Prisma + Payload migration system
- [x] 39 database indexes + seed scripts
- [x] Database backup/restore system with GFS rotation (#142)
- [x] TypeScript strict mode enforcement (core app clean) (#158)
- [x] Payload plugin & hook documentation (#159)
- [x] All documentation updated for Payload 3.0
- [x] Update all docs for 2025 trends (gut health, precision medicine)

**Pending (7)**
- [ ] Deploy database indexes to production & verify gains
- [ ] Monthly index usage monitoring & optimization
- [ ] ⭐ NEW: Run `pnpm prisma migrate deploy` in production (post-index verification)
- [ ] ⭐ NEW: Create production health-check endpoint `/api/health` (DB, Redis, Grok, Cloudflare)
- [ ] ⭐ NEW: Add monitoring alert for PubMed sync failures (>3 consecutive)
- [ ] ⭐ NEW: Add fallback logic if PubMed API is down (use cached citations)
- [ ] ⭐ NEW: Document final production environment variables checklist

### Phase 2: Core Features (Weeks 5-8) – Formula System, Symptom Checker, Practitioner Directory
🟡 **Status:** 57% Complete (16 / 28 items)

**Completed (16)**
- [x] Cron infrastructure (registration, monitoring)
- [x] Algolia sync cron (every 6h + manual trigger)
- [x] Trefle & Perenual progressive import crons
- [x] Expired session & verification token cleanup crons
- [x] Grok AI symptom checker backend + API route (rate-limited, cached, HIPAA-compliant)
- [x] Enhanced Algolia edge-case handling (#160)
- [x] Perenual enhanced client with timeout, circuit breaker, retry logic & statistics (#161)
- [x] Trefle enhanced client with timeout, circuit breaker, retry logic & statistics (2025-01-22) - ✅ Complete: Created comprehensive Trefle API client (~1,400 lines total) with advanced resilience features. lib/trefle/client.ts (650+ lines): Base client with search, plant details, enrichment, validation, basic retry logic, rate limiting (500ms = 120 req/min), caching (24h TTL). lib/trefle/client-enhanced.ts (~750 lines): **Timeout handling** (10s default with Promise.race), **Circuit breaker** (3 states: CLOSED/OPEN/HALF_OPEN, opens after 5 failures, 60s recovery, needs 2 successes to close), **Enhanced retry logic** with smart error categorization (4xx not retryable except 429, 5xx retryable, network retryable, exponential backoff with jitter: 1s, 2s, 4s delays), **Statistics tracking** (10 metrics: totalRequests, successfulRequests, failedRequests, retriedRequests, totalRetries, timeoutErrors, networkErrors, rateLimitErrors, circuitBreakerTrips, avgResponseTimeMs), **Enhanced error classes** (TrefleAPIError with retryable flag, TrefleTimeoutError, TrefleNetworkError, TrefleCircuitBreakerError), **Rate limiting** (500ms delay, 60s wait on 429). lib/trefle/index.ts: Public API exports both clients (backward compatible). Comprehensive 1000+ line documentation (TREFLE_RETRY_LOGIC.md) with error handling strategies, circuit breaker explanation, configuration guide, testing procedures, troubleshooting. Updated .env.example and ENVIRONMENT_VARIABLES_CHECKLIST.md with complete Trefle configuration.

**Pending (12)**
- [ ] Validate Herb Data daily cron (2 AM)
- [ ] Gut Health sync cron (daily)
- [ ] Precision Medicine personalization cron (weekly)
- [ ] Trend monitoring cron (monthly)
- [ ] Cache cleanup cron (daily 4 AM)
- [ ] Database backup cron (daily 1 AM) – already implemented but needs verification in prod
- [ ] Digest email cron (weekly Mon 8 AM)
- [ ] Integrate wearable APIs (Apple Health / Google Fit / Fitbit)
- [ ] Formula ingredient quantity validation (#162)
- [ ] User content moderation system (#170)
- [ ] Flagging system for UGC (#171)
- [ ] Create Wellness Practices collection (#172)
- [ ] ⭐ NEW: Add rate-limit bypass for verified practitioners (admin approval)

### Phase 3: Polish & Launch Prep (Weeks 9-12) – SEO, Security, Testing, Performance  
🟢 **Status:** 79% Complete (59 / 75 items)

**Completed (59)**
- All JSON-LD schemas implemented & documented (7 page types + FAQ)
- Cloudflare Images integration (flexible variants, rate limiting, moderation, logging)
- Comprehensive testing suite (413+ tests, 80%+ coverage)
- All component, hook, API, security, performance, and E2E tests
- Storybook 100% complete (68 stories, 5,399 lines MDX)
- i18n MVP (en, es, zh-CN, zh-TW) + missing keys fixed
- Build fixes for Next.js 15/16
- Rate limiting across all endpoints (7 tiers, Redis-backed)
- TLS enforcement + certificate expiration monitoring for DragonflyDB
- All HIPAA Phase 1–3 security enhancements (idle timeout, CSP, MFA enforcement, breach system, password history, API request logging, encryption verification)
- Sentry configured (just needs DSN)
- Lighthouse CI automation

**Pending (16)**
- [ ] Test all JSON-LD schemas with Google Rich Results Test (use testing guide)
- [ ] Enable Cloudflare Images credentials in production
- [ ] Test image uploads via Payload admin
- [ ] Replace in-memory rate limiting & logs with Redis/DB in Cloudflare Images
- [ ] Implement backend MFA API routes & full end-to-end verification
- [ ] Hook audit logging to DB/external service
- [ ] Security event dashboard for admins
- [ ] Data retention policy automation (7-year logs, GDPR soft-delete)
- [ ] Optimize ISR for herb pages (#147)
- [ ] Automated XSS testing in CI (#149)
- [ ] Enhance PWA manifest shortcuts (#150)
- [ ] Log Cloudflare Turnstile failures (#151)
- [ ] Implement ML consent flow UI (#185)
- [ ] Load test ML endpoints (#186)
- [ ] ⭐ NEW: Run full penetration test (external firm preferred)
- [ ] ⭐ NEW: Create launch checklist & rollback plan

### Phase 4: Content Population (Weeks 13-16)  
🔴 **Status:** 0% Complete (0 / 6)

- [ ] Migrate Drupal content → PayloadCMS
- [ ] Create sample formulas, conditions, modalities
- [ ] Recruit & seed practitioner directory
- [ ] Validate migrated content (#152)
- [ ] Seed Wellness Practices with 2025-trend content (#178)
- [ ] Validate practitioner profile completeness (#179)

### Phase 5: Launch (Week 17)  
🔴 **Status:** 0% Complete (0 / 8)

- [ ] Beta testing (50–100 users)
- [ ] Final performance optimization
- [ ] Marketing materials & landing page (#181)
- [ ] Load testing for launch (#153)
- [ ] User onboarding tutorial (#154)
- [ ] Penetration testing (final) (#180)
- [ ] Soft launch → full launch procedure
- [ ] Post-launch monitoring dashboard

### Phase 6: 2025+ Comprehensiveness (Ongoing)  
🟡 **Status:** 1.8% Complete (1 / 56)

**Completed (1)**
- [x] Herb recommendation UI component (HerbRecommendations.tsx)

**Pending (55)**
- All 24 ML/AI roadmap tasks (Grok client, pgvector, embeddings, TCM pattern recognition, hybrid search, etc.)
- Email templates & digest system
- 2025 trend modules (mental health tech, offline PWA, calming UX)
- DragonflyDB health monitoring
- Expand i18n to 10+ languages
- Community forums
- Turnstile CAPTCHA, Docker, CI/CD, env documentation
- Export symptom checker data (#156)
- AI ethics review (#157)
- Advanced ML features (image recognition, voice, multilingual AI, etc.)

### Phase 7: Mobile App Development & Release (Weeks 18-24)  
🔴 **Status:** 0% Complete (0 / 55)

- All 55 mobile tasks unchanged (React Native/Expo + .NET MAUI)
- High-level MVP: offline herb search, symptom checker chat, practitioner map, push notifications

### Current Priorities (Next 7–14 Days)
1. Deploy & verify database indexes in production  
2. Activate Cloudflare Images + test uploads  
3. Run Google Rich Results Test on all JSON-LD schemas  
4. Begin Grok AI foundation (client + pgvector)  
5. Start content migration from Drupal  
6. Finalize MFA full implementation  
7. Execute penetration test  
8. Prepare beta tester recruitment & onboarding flow

**Total Completed:** 75 / 258 (29.1%)
**MVP Target (Phases 1–5):** ~46% when content migration completes
**Launch Readiness:** Estimated Q1 2026 (assuming content migration finishes Dec 2025)

Last reviewed & updated: 2025-01-22  
Next full review: 2025-12-06