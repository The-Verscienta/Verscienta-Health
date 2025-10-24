# Next.js Memory Usage Optimization

**Date**: 2025-10-18
**Next.js Version**: 15.5.4
**Node.js Version**: v22.15.0
**Documentation Reference**: https://nextjs.org/docs/app/guides/memory-usage

## 📊 Current Configuration Analysis

### Current Setup

**Node.js Memory**:
- Version: v22.15.0
- Heap size limit: 4144 MB (~4GB)
- Status: ✅ Good - adequate for production builds

**Next.js Configuration** (`apps/web/next.config.ts`):
- Output: `standalone` (Docker-ready)
- Bundle analyzer: Enabled via `ANALYZE=true`
- Source maps: Disabled in client bundles (`sourcemaps.disable: true`)
- Optimized package imports: `lucide-react`, `@radix-ui/react-icons`

---

## 🎯 Recommended Optimizations

Based on Next.js 15 documentation, here are recommended memory optimizations:

### 1. **Enable Webpack Memory Optimizations** ⭐ NEW in v15

**Priority**: HIGH
**Impact**: Reduces max memory usage during builds

**Implementation**:
```ts
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    webpackMemoryOptimizations: true, // ✅ ADD THIS
  },
}
```

**Trade-off**: May slightly increase compilation time, but significantly reduces memory usage.

**Status**: ⏳ Not currently enabled

---

### 2. **Disable Source Maps in Production** ✅ ALREADY DONE

**Priority**: MEDIUM
**Impact**: Reduces build memory usage and output size

**Current Configuration**:
```ts
// Sentry config in next.config.ts
sourcemaps: {
  disable: true, // ✅ Already configured
}
```

**Additional Optimization** (if needed for server):
```ts
experimental: {
  serverSourceMaps: false, // Disable server source maps
}
```

**Status**: ✅ Client source maps already disabled

---

### 3. **Optimize Package Imports** ✅ PARTIALLY DONE

**Priority**: HIGH
**Impact**: Tree-shakes large libraries more effectively

**Current Configuration**:
```ts
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
}
```

**Recommendation - Add More Libraries**:
```ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'react-leaflet',        // ✅ ADD - Used in PractitionerMap
    'leaflet',              // ✅ ADD - Large mapping library
    'date-fns',             // ✅ ADD - If used for date formatting
  ],
}
```

**Status**: ⏳ Can be expanded

---

### 4. **Disable Preload Entries on Start** (Optional)

**Priority**: LOW (for development only)
**Impact**: Reduces initial memory footprint, slower first request

**Implementation**:
```ts
experimental: {
  preloadEntriesOnStart: false, // Trade memory for speed
}
```

**When to Use**:
- Development machines with limited RAM
- Docker containers with memory constraints
- Multi-developer local environments

**Trade-off**: Slower initial page loads in development

**Recommendation**: ⚠️ Only enable if experiencing memory issues

**Status**: ⏳ Not currently needed

---

### 5. **Debug Memory Usage** (Development Tool)

**Priority**: LOW (diagnostic only)
**Impact**: Helps identify memory bottlenecks

**Usage**:
```bash
# Run build with memory debugging
pnpm build --experimental-debug-memory-usage
```

**Output Provides**:
- Heap usage statistics
- Garbage collection data
- Memory usage over time during build
- Peak memory consumption

**When to Use**:
- Investigating Out of Memory (OOM) errors
- Optimizing CI/CD build performance
- Analyzing memory leaks

**Status**: 🔧 Available for diagnostics

---

### 6. **Bundle Analysis** ✅ ALREADY CONFIGURED

**Priority**: MEDIUM
**Impact**: Identifies large dependencies for optimization

**Current Configuration**:
```ts
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
```

**Usage**:
```bash
# Analyze bundle size
ANALYZE=true pnpm build

# Opens interactive bundle visualization
```

**What to Look For**:
- Large dependencies (>100KB)
- Duplicate packages
- Unnecessary imports
- Tree-shaking opportunities

**Status**: ✅ Already enabled

---

### 7. **Production Browser Source Maps** ✅ GOOD PRACTICE

**Priority**: MEDIUM
**Impact**: Reduces build memory and output size

**Recommendation**:
```ts
const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // ✅ ADD THIS
}
```

**Current Status**: ⏳ Not explicitly set (defaults to true in dev)

**Benefits**:
- Smaller build output
- Faster builds
- Less memory during compilation

**Note**: Sentry source maps are already disabled via `sourcemaps.disable: true`

---

### 8. **Static Generation Worker Optimization** ✅ AUTOMATIC in v15

**Priority**: N/A (automatic)
**Impact**: Shares fetch cache across pages

**How it Works**:
- Static generation workers now share the fetch cache
- Cached fetch results reused across pages
- Reduces redundant data fetching during build
- Automatic in Next.js 15+

**Status**: ✅ Automatically enabled in Next.js 15.5.4

---

### 9. **Node.js Memory Allocation** (If Needed)

**Priority**: LOW (only if OOM errors occur)
**Impact**: Increases available heap for large builds

**Current Heap Size**: 4144 MB (adequate)

**If OOM Errors Occur**, increase via `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=8192' next build"
  }
}
```

**Or via environment variable**:
```bash
# .env or CI/CD config
NODE_OPTIONS=--max-old-space-size=8192
```

**Memory Sizes**:
- 4096 MB (4GB) - Default, good for most projects
- 8192 MB (8GB) - Large projects with many pages
- 16384 MB (16GB) - Very large monorepos

**Status**: ✅ Current 4GB is adequate

---

## 📋 Implementation Checklist

### Immediate Actions (High Priority)

- [ ] Enable `experimental.webpackMemoryOptimizations: true`
- [ ] Add `productionBrowserSourceMaps: false`
- [ ] Expand `optimizePackageImports` to include:
  - `react-leaflet`
  - `leaflet`
  - Other large libraries

### Optional Actions (Low Priority)

- [ ] Run `pnpm build --experimental-debug-memory-usage` to baseline
- [ ] Consider `experimental.preloadEntriesOnStart: false` if memory-constrained
- [ ] Monitor build memory usage in CI/CD

### Diagnostic Actions (As Needed)

- [ ] Run bundle analyzer: `ANALYZE=true pnpm build`
- [ ] Check for large dependencies (>100KB)
- [ ] Review lazy loading opportunities (already done for PractitionerMap)

---

## 🚀 Recommended Configuration Update

```ts
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Production optimizations
  productionBrowserSourceMaps: false, // ✅ ADD

  // Enable experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'react-leaflet',  // ✅ ADD
      'leaflet',        // ✅ ADD
    ],
    webpackMemoryOptimizations: true, // ✅ ADD
    serverSourceMaps: false,          // ✅ ADD (optional)
    // preloadEntriesOnStart: false,  // ⚠️ Only if memory-constrained
  },

  // ... rest of config
}
```

---

## 📊 Expected Impact

### With Recommended Optimizations:

**Memory Savings**:
- Webpack optimizations: ~10-20% reduction in peak memory
- Disabled source maps: ~5-10% reduction
- Optimized imports: ~5-15% smaller bundles

**Total Expected Reduction**: ~20-40% lower peak memory during builds

**Build Time**:
- Webpack optimizations: +5-10% build time (slight increase)
- Overall: Negligible impact on modern hardware

**Bundle Size**:
- Optimized imports: ~10-20KB smaller per optimized library
- Lazy loading (already done): ~150KB saved on initial load

---

## 🧪 Testing & Validation

### 1. Baseline Measurement

```bash
# Current build
pnpm build --experimental-debug-memory-usage > baseline.log
```

### 2. Apply Optimizations

Update `next.config.ts` with recommended changes

### 3. Test Build

```bash
# Optimized build
pnpm build --experimental-debug-memory-usage > optimized.log
```

### 4. Compare Results

```bash
# Compare memory usage
diff baseline.log optimized.log
```

### 5. Production Test

```bash
# Build for production
pnpm build

# Run production server
pnpm start

# Monitor memory usage
# Check initial load performance
# Verify lazy loading works correctly
```

---

## 🔍 Monitoring & Maintenance

### Development Monitoring

```bash
# Check heap usage during dev
node --expose-gc apps/web/node_modules/.bin/next dev

# Monitor memory in real-time
node --inspect apps/web/node_modules/.bin/next dev
# Then open chrome://inspect
```

### Production Monitoring

```bash
# Check production build memory
pnpm build --experimental-debug-memory-usage

# Analyze bundle
ANALYZE=true pnpm build
```

### CI/CD Integration

```yaml
# .github/workflows/build.yml
- name: Build with memory monitoring
  run: pnpm build --experimental-debug-memory-usage
  env:
    NODE_OPTIONS: '--max-old-space-size=4096'
```

---

## 🐛 Troubleshooting

### Out of Memory (OOM) Errors

**Symptoms**:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions**:
1. Enable `webpackMemoryOptimizations: true`
2. Increase Node heap: `NODE_OPTIONS='--max-old-space-size=8192'`
3. Disable source maps: `productionBrowserSourceMaps: false`
4. Run `ANALYZE=true pnpm build` to find large dependencies
5. Implement more lazy loading (see [LAZY_LOADING_ANALYSIS.md](./LAZY_LOADING_ANALYSIS.md))

### Slow Builds

**Symptoms**: Build takes >5 minutes

**Solutions**:
1. Keep `webpackMemoryOptimizations: true` (small time increase is worth it)
2. Use Turbopack in dev: `pnpm dev --turbo`
3. Optimize package imports
4. Review bundle analyzer for opportunities

### High Memory in Development

**Symptoms**: Dev server uses >2GB RAM

**Solutions**:
1. Set `experimental.preloadEntriesOnStart: false`
2. Restart dev server periodically
3. Clear `.next` folder: `rm -rf .next`
4. Use `pnpm dev --turbo` for better memory management

---

## 📚 Additional Resources

- [Next.js Memory Usage Guide](https://nextjs.org/docs/app/guides/memory-usage)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Bundle Analyzer Setup](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling)
- [V8 Heap Statistics](https://nodejs.org/api/v8.html#v8_v8_getheapstatistics)

---

## 🎯 Summary

### Current Status
- ✅ Bundle analyzer enabled
- ✅ Source maps disabled (client)
- ✅ Package import optimization (partial)
- ✅ Adequate Node heap size (4GB)
- ✅ Lazy loading implemented (PractitionerMap)

### Recommended Next Steps
1. **Enable webpack memory optimizations** (highest impact)
2. **Expand optimized package imports** (easy win)
3. **Disable production browser source maps** (already mostly done)
4. **Test and measure** improvements

### Expected Results
- 20-40% reduction in build memory usage
- Slightly longer build times (5-10%)
- No impact on runtime performance
- Better CI/CD stability

---

**Last Updated**: 2025-10-18
**Next Review**: After implementing recommended optimizations
**Status**: Ready to implement
