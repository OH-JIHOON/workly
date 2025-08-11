'use client'

import { Suspense, ReactNode } from 'react'

interface SearchParamsWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function SearchParamsWrapper({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}