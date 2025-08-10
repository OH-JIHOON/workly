'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { SparklesIcon } from '@heroicons/react/24/outline'
import TriageWizardModal from '@/components/ui/TriageWizardModal'
import { WorklyTask } from '@/types/workly-core.types'

interface WorklyFloatingActionButtonProps {
  tasks?: WorklyTask[] // 정리 마법사를 위한 업무 목록
  onTaskUpdate?: (taskId: string, updates: Partial<WorklyTask>) => void
  onTaskDelete?: (taskId: string) => void
  showOnDesktop?: boolean  // 워클리 정책: 데스크톱에서만 표시
  showOnMobile?: boolean   // 모바일에서는 기본적으로 숨김
}

export default function WorklyFloatingActionButton({
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
  showOnDesktop = true,
  showOnMobile = false
}: WorklyFloatingActionButtonProps) {
  const pathname = usePathname()
  const [isTriageWizardOpen, setIsTriageWizardOpen] = useState(false)

  // PRD 명세: 미분류 업무 20개 초과 시 지능적 유도
  const untriagedTasks = tasks.filter(task => !task.projectId && !task.goalId)
  const shouldShowTriagePrompt = untriagedTasks.length >= 20
  
  // 디버깅: 테스트를 위해 업무가 있으면 항상 FAB 표시
  const hasTasksToTriage = tasks.length > 0

  console.log('WorklyFloatingActionButton - 전체 업무:', tasks.length)
  console.log('WorklyFloatingActionButton - 미분류 업무:', untriagedTasks.length)
  console.log('WorklyFloatingActionButton - FAB 표시 여부:', hasTasksToTriage)

  const handleOpenTriageWizard = () => {
    console.log('정리 마법사 열기 클릭!')
    console.log('전체 업무:', tasks.length)
    console.log('미분류 업무:', untriagedTasks.length)
    setIsTriageWizardOpen(true)
  }

  const handleCloseTriageWizard = () => {
    setIsTriageWizardOpen(false)
  }

  return (
    <>
      {/* 데스크톱 버전 - 정리 마법사 FAB */}
      {showOnDesktop && (
        <div className="hidden md:block fixed bottom-6 right-6 z-40">
          {/* 정리 마법사 버튼 */}
          <button
            onClick={handleOpenTriageWizard}
            className={`
              w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full 
              flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 
              hover:scale-110 active:scale-95
              ${shouldShowTriagePrompt ? 'animate-pulse ring-4 ring-blue-200' : ''}
            `}
            aria-label="정리 마법사 열기"
          >
            <SparklesIcon className="w-7 h-7" />
          </button>

          {/* 지능적 유도 알림 */}
          {shouldShowTriagePrompt && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap animate-bounce">
              <div className="text-center">
                <div className="font-semibold">정리가 필요해요!</div>
                <div>미분류 업무 {untriagedTasks.length}개</div>
              </div>
              {/* 화살표 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {/* 모바일 버전 - 정리 마법사 FAB */}
      {showOnMobile && hasTasksToTriage && (
        <div className="md:hidden fixed bottom-20 right-6 z-40">
          <button
            onClick={handleOpenTriageWizard}
            className={`
              w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full 
              flex items-center justify-center shadow-lg transition-all duration-300
              ${shouldShowTriagePrompt ? 'animate-pulse ring-2 ring-blue-200' : ''}
            `}
            aria-label="정리 마법사"
          >
            <SparklesIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 정리 마법사 모달 */}
      <TriageWizardModal
        isOpen={isTriageWizardOpen}
        onClose={handleCloseTriageWizard}
        tasks={tasks}
        onTaskUpdate={onTaskUpdate || (() => {})}
        onTaskDelete={onTaskDelete || (() => {})}
      />
    </>
  )
}