/**
 * Perenual API Client - Public API
 *
 * Exports both the original client (for backward compatibility) and the enhanced client
 * with advanced retry logic, timeout handling, and circuit breaker pattern.
 *
 * Usage:
 * ```typescript
 * // Use enhanced client (recommended)
 * import { perenualClientEnhanced } from '@/lib/perenual'
 * const species = await perenualClientEnhanced.getSpeciesList()
 * const stats = perenualClientEnhanced.getStats()
 *
 * // Or use original client (backward compatibility)
 * import { perenualClient } from '@/lib/perenual'
 * const species = await perenualClient.getSpeciesList()
 * ```
 */

// Export enhanced client (recommended)
export {
  PerenualClientEnhanced,
  perenualClientEnhanced,
  PerenualAPIError,
  PerenualTimeoutError,
  PerenualNetworkError,
  PerenualCircuitBreakerError,
  type PerenualSpecies,
  type PerenualSpeciesDetail,
  type PerenualListResponse,
  type PerenualError,
} from './client-enhanced'

// Export original client (backward compatibility)
export {
  PerenualClient,
  perenualClient,
  getPlantData,
  searchPlants,
  getMedicinalPlants,
} from './client'

// Re-export default as enhanced client
export { perenualClientEnhanced as default } from './client-enhanced'
