'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseScrollVisibilityOptions {
  hideDelay?: number
  showOnHover?: boolean
}

export function useScrollVisibility(options: UseScrollVisibilityOptions = {}) {
  const { hideDelay = 1000, showOnHover = true } = options
  const elementRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showScrollbar = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.add('scrolling')
    }
  }, [])

  const hideScrollbar = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.remove('scrolling')
    }
  }, [])

  const handleScroll = useCallback(() => {
    showScrollbar()
    
    // 기존 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      hideScrollbar()
    }, hideDelay)
  }, [showScrollbar, hideScrollbar, hideDelay])

  const handleMouseEnter = useCallback(() => {
    if (showOnHover) {
      showScrollbar()
    }
  }, [showScrollbar, showOnHover])

  const handleMouseLeave = useCallback(() => {
    if (showOnHover) {
      // 스크롤 중이 아닐 때만 숨김
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        hideScrollbar()
      }, 300)
    }
  }, [hideScrollbar, showOnHover])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('scroll', handleScroll, { passive: true })
    
    if (showOnHover) {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      element.removeEventListener('scroll', handleScroll)
      if (showOnHover) {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll, handleMouseEnter, handleMouseLeave, showOnHover])

  return { elementRef, showScrollbar, hideScrollbar }
}