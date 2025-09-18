'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3600000, // 1 hour - data is fresh for 1 hour
      gcTime: 3600000, // 1 hour - keep data in cache for 1 hour after it becomes unused
      refetchOnWindowFocus: false, // Don't refetch on window focus for static data
      refetchOnReconnect: true, // Refetch on reconnect to ensure fresh data
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export { queryClient }