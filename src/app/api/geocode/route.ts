import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('q')
  
  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
  }

  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://www.gps-coordinates.net/geoproxy?q=${encodedAddress}&key=641c51bed8ab490184632ad8526e29ad&no_annotations=1&language=en`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 })
  }
}