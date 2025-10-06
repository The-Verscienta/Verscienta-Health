import type { CollectionBeforeChangeHook } from 'payload/types'
import axios from 'axios'

/**
 * Auto-geocode practitioner addresses using OpenStreetMap Nominatim API
 */
export const geocodeAddress: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    if (data.address && (!data.address.latitude || !data.address.longitude)) {
      const { street, city, state, zipCode, country } = data.address

      // Only geocode if we have enough address information
      if (city && (state || country)) {
        const query = [street, city, state, zipCode, country]
          .filter(Boolean)
          .join(', ')

        try {
          const response = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
              params: {
                q: query,
                format: 'json',
                limit: 1,
              },
              headers: {
                'User-Agent': 'Verscienta Health App (https://verscienta.health)',
              },
            }
          )

          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0]
            data.address.latitude = parseFloat(lat)
            data.address.longitude = parseFloat(lon)

            console.log(`✓ Geocoded address: ${query} → ${lat}, ${lon}`)
          } else {
            console.warn(`⚠ Could not geocode address: ${query}`)
          }
        } catch (error) {
          console.error('Geocoding error:', error)
          // Continue without geocoding rather than fail
        }
      }
    }
  }

  return data
}
