interface GoogleMapsData {
  name?: string
  latitude?: number
  longitude?: number
}

export function parseGoogleMapsUrl(url: string): GoogleMapsData {
  try {
    // Handle both full URLs and URLs without protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(fullUrl)
    
    let name: string | undefined
    let latitude: number | undefined
    let longitude: number | undefined

    // Extract name from the URL path
    const pathParts = urlObj.pathname.split('/')
    const placeIndex = pathParts.findIndex(part => part === 'place')
    
    if (placeIndex !== -1 && placeIndex + 1 < pathParts.length) {
      const encodedName = pathParts[placeIndex + 1]
      // Decode URL encoding and replace + with spaces
      name = decodeURIComponent(encodedName).replace(/\+/g, ' ')
    }

    // Extract coordinates from the URL
    // Look for patterns like @52.0794843,4.5847041,9.21z
    const coordRegex = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/
    const coordMatch = url.match(coordRegex)
    
    if (coordMatch) {
      latitude = parseFloat(coordMatch[1])
      longitude = parseFloat(coordMatch[2])
    }

    // Also check for coordinates in query parameters
    const params = urlObj.searchParams
    if (!latitude && params.has('q')) {
      const qParam = params.get('q')
      if (qParam) {
        const qCoordMatch = qParam.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        if (qCoordMatch) {
          latitude = parseFloat(qCoordMatch[1])
          longitude = parseFloat(qCoordMatch[2])
        }
      }
    }

    return { name, latitude, longitude }
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error)
    return {}
  }
}