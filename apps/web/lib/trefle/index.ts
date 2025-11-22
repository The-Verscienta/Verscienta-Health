/**
 * Trefle API Client - Public API
 *
 * Exports both the original client (for backward compatibility) and the enhanced client
 * with advanced retry logic, timeout handling, and circuit breaker pattern.
 *
 * Usage:
 * ```typescript
 * // Use enhanced client (recommended)
 * import { trefleClientEnhanced } from '@/lib/trefle'
 * const plants = await trefleClientEnhanced.searchPlants('lavender')
 * const stats = trefleClientEnhanced.getStats()
 *
 * // Or use original client (backward compatibility)
 * import { trefleClient } from '@/lib/trefle'
 * const plants = await trefleClient.searchPlants('lavender')
 * ```
 */

// Export enhanced client (recommended)
export {
  TrefleClientEnhanced,
  trefleClientEnhanced,
  TrefleAPIError,
  TrefleTimeoutError,
  TrefleNetworkError,
  TrefleCircuitBreakerError,
  type RetryStats,
} from './client-enhanced'

// Export original client (backward compatibility)
export {
  TrefleClient,
  trefleClient,
  searchPlants,
  getPlantData,
  validateScientificName,
  enrichHerbWithTrefle,
  type TreflePlant,
  TreflePlantDetail,
  type TrefleListResponse,
  type TrefleError,
} from './client'

// Re-export default as enhanced client
export { trefleClientEnhanced as default } from './client-enhanced'
