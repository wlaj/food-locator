"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export default function ToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const processedRef = useRef(new Set<string>())

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const success = searchParams.get('success')
    
    // Create a unique key for this set of parameters
    const paramsKey = `${error || ''}-${message || ''}-${success || ''}`
    
    // Skip if we've already processed these exact parameters
    if (processedRef.current.has(paramsKey)) {
      return
    }
    
    let hasToast = false

    if (error) {
      toast.error(error)
      hasToast = true
    }

    if (message) {
      toast.info(message)
      hasToast = true
    }

    if (success) {
      toast.success(success)
      hasToast = true
    }

    // Only update URL and mark as processed if we showed a toast
    if (hasToast) {
      processedRef.current.add(paramsKey)
      
      // Remove the toast params from URL
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('error')
      newParams.delete('message')
      newParams.delete('success')
      
      const newUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`
      router.replace(newUrl)
    }
  }, [searchParams, router])

  return null
}