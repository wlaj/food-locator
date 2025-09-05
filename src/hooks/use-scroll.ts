"use client"

import { useState, useEffect } from 'react'

interface UseScrollReturn {
  isAtTop: boolean
  scrollY: number
  scrollDirection: 'up' | 'down' | null
}

export function useScroll(threshold: number = 50): UseScrollReturn {
  const [isAtTop, setIsAtTop] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    let lastScrollY = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scroll position
      setScrollY(currentScrollY)
      
      // Check if at top (within threshold)
      setIsAtTop(currentScrollY <= threshold)
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }
      
      lastScrollY = currentScrollY
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Set initial values
    const initialScrollY = window.scrollY
    setScrollY(initialScrollY)
    setIsAtTop(initialScrollY <= threshold)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return { isAtTop, scrollY, scrollDirection }
}