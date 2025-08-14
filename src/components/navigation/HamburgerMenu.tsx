'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { 
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/stores/auth.store'

interface HamburgerMenuProps {
  className?: string
}

export default function HamburgerMenu({ className = '' }: HamburgerMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 바깥 클릭/터치 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // 약간의 지연 후 이벤트 리스너 등록 (메뉴 열림과 동시에 닫히는 것 방지)
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await signOut()
        setIsOpen(false)
        router.push('/auth/login')
      } catch (error) {
        console.error('로그아웃 오류:', error)
      }
    }
  }

  const menuItems = [
    {
      label: '설정',
      icon: Cog6ToothIcon,
      onClick: () => {
        setIsOpen(false)
        router.push('/settings')
      }
    }
  ]

  const getMenuPosition = () => {
    if (!buttonRef.current || !mounted) return { top: 0, left: 0, transform: '' }
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // 데스크톱: 버튼 우측 상단 모서리가 메뉴 좌측 하단 모서리와 만남
    if (viewportWidth >= 768) {
      return {
        top: buttonRect.top,
        left: buttonRect.right,
        transform: 'translateY(-100%)' // 메뉴를 위로 올려서 하단이 버튼 상단과 맞춤
      }
    }
    
    // 모바일에서는 버튼 아래쪽에 표시
    return {
      top: buttonRect.bottom + 8,
      left: Math.max(8, buttonRect.left),
      transform: ''
    }
  }

  const menuPosition = getMenuPosition()

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors ${className}`}
        aria-label="메뉴 열기"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Portal로 렌더링되는 메뉴 */}
      {mounted && isOpen && createPortal(
        <div ref={menuRef}>
          {/* 배경 오버레이 (모바일용) */}
          <div 
            className="fixed inset-0 z-[9999] bg-black bg-opacity-25 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 메뉴 패널 */}
          <div 
            className="fixed w-64 bg-white rounded-lg shadow-lg border z-[10000] max-w-[calc(100vw-2rem)]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: menuPosition.transform,
            }}
          >
            {/* 사용자 정보 */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="프로필" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 메뉴 항목들 */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}

              {/* 로그인/로그아웃 */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-sm font-medium">로그아웃</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/auth/login')
                  }}
                  className="w-full flex items-center px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100 mt-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium">로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
