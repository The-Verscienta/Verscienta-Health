/**
 * Monitoring and Alerting System
 *
 * Centralized monitoring for botanical APIs and system health.
 *
 * Features:
 * - Circuit breaker monitoring and alerts
 * - Health score tracking
 * - Email/webhook notifications
 * - Alert history and analytics
 *
 * Usage:
 *   import { circuitBreakerAlerts, scheduleCircuitBreakerMonitoring } from '@/lib/monitoring'
 *
 *   // Start monitoring
 *   scheduleCircuitBreakerMonitoring()
 *
 *   // Manual check
 *   await circuitBreakerAlerts.checkAndAlert('trefle')
 */

export {
  circuitBreakerAlerts,
  scheduleCircuitBreakerMonitoring,
  type CircuitBreakerAlert,
  type AlertSeverity,
} from './circuit-breaker-alerts'
