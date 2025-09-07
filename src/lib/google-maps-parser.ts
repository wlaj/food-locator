interface GoogleMapsData {
  name?: string
  isValid: boolean
}

export function parseGoogleMapsUrl(url: string): GoogleMapsData {
  if (!url || !url.trim()) {
    return { isValid: false }
  }

  try {
    // Handle both full URLs and URLs without protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(fullUrl)
    
    // Validate it's actually a Google Maps URL
    const validHosts = [
      'maps.google.com',
      'www.google.com',
      'google.com',
      'maps.app.goo.gl',
      'goo.gl'
    ]
    
    const isValidGoogleMapsUrl = validHosts.some(host => 
      urlObj.hostname === host || urlObj.hostname.endsWith('.' + host)
    ) && (urlObj.pathname.includes('/maps/') || urlObj.pathname.includes('/place/') || urlObj.hostname.includes('goo.gl'))
    
    if (!isValidGoogleMapsUrl) {
      return { isValid: false }
    }

    let name: string | undefined

    // Extract name from the URL path
    const pathParts = urlObj.pathname.split('/')
    const placeIndex = pathParts.findIndex(part => part === 'place')
    
    if (placeIndex !== -1 && placeIndex + 1 < pathParts.length) {
      const encodedName = pathParts[placeIndex + 1]
      // Decode URL encoding and replace + with spaces
      name = decodeURIComponent(encodedName).replace(/\+/g, ' ')
    }

    return { name, isValid: true }
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error)
    return { isValid: false }
  }
}

