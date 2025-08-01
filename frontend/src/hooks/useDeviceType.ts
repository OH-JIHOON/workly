'use client'

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const checkDeviceType = () => {
      // 터치 지원 여부 확인
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      if (!hasTouchScreen) {
        setDeviceType('desktop')
        return
      }

      // 화면 크기로 모바일/태블릿 구분
      const width = window.innerWidth
      const height = window.innerHeight
      const minDimension = Math.min(width, height)
      const maxDimension = Math.max(width, height)

      // 모바일: 작은 쪽이 480px 미만
      if (minDimension < 480) {
        setDeviceType('mobile')
      }
      // 태블릿: 작은 쪽이 480px 이상, 큰 쪽이 1024px 미만
      else if (maxDimension < 1024) {
        setDeviceType('tablet')
      }
      // 데스크톱: 그 외 (터치 지원 데스크톱 포함)
      else {
        setDeviceType('desktop')
      }
    }

    // 초기 감지
    checkDeviceType()

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkDeviceType)
    
    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [])

  return deviceType
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

export function useIsTouch(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile' || deviceType === 'tablet'
}