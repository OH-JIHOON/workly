'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { PlusIcon, ClipboardDocumentIcon, FolderPlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

const fabMenuItems = {
  '/': [
    { icon: ClipboardDocumentIcon, label: '업무 추가', action: 'add-task' },
    { icon: FolderPlusIcon, label: '프로젝트 추가', action: 'add-project' },
    { icon: ChatBubbleLeftRightIcon, label: '게시글 추가', action: 'add-post' }
  ],
  '/projects': [
    { icon: ClipboardDocumentIcon, label: '업무 추가', action: 'add-task' },
    { icon: FolderPlusIcon, label: '프로젝트 추가', action: 'add-project' },
    { icon: ChatBubbleLeftRightIcon, label: '게시글 추가', action: 'add-post' }
  ],
  '/board': [
    { icon: ClipboardDocumentIcon, label: '업무 추가', action: 'add-task' },
    { icon: FolderPlusIcon, label: '프로젝트 추가', action: 'add-project' },
    { icon: ChatBubbleLeftRightIcon, label: '게시글 추가', action: 'add-post' }
  ]
}

interface FloatingActionButtonProps {
  onAddTask?: () => void
  onAddProject?: () => void
  onAddPost?: () => void
}

export default function FloatingActionButton({
  onAddTask,
  onAddProject,
  onAddPost
}: FloatingActionButtonProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)

  // 해당 페이지에서만 FAB 표시
  const shouldShowFab = pathname in fabMenuItems
  const menuItems = fabMenuItems[pathname as keyof typeof fabMenuItems] || []

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 페이지 변경 시 메뉴 닫기
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleMenuItemClick = (action: string) => {
    setIsOpen(false)
    
    switch (action) {
      case 'add-task':
        onAddTask?.()
        break
      case 'add-project':
        onAddProject?.()
        break
      case 'add-post':
        onAddPost?.()
        break
      default:
        console.log(`Action: ${action}`)
    }
  }

  if (!shouldShowFab) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50" ref={fabRef}>
      {/* 메뉴 아이템들 */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 space-y-3"
          role="menu"
          aria-label="추가 작업 메뉴"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.action}
                className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-background text-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border whitespace-nowrap">
                  {item.label}
                </span>
                <button
                  onClick={() => handleMenuItemClick(item.action)}
                  className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
                  aria-label={item.label}
                  role="menuitem"
                >
                  <Icon className="w-5 h-5 text-foreground" />
                  <span className="sr-only">{item.label}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 메인 FAB 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg hover:bg-foreground/90 transition-all duration-200 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isOpen ? '메뉴 닫기' : '추가 메뉴 열기'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <PlusIcon className="w-6 h-6" />
        <span className="sr-only">{isOpen ? '메뉴 닫기' : '추가 메뉴 열기'}</span>
      </button>
    </div>
  )
}