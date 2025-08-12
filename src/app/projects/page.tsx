'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline'
import ContentHeader from '@/components/layout/ContentHeader'
import MainContainer from '@/components/layout/MainContainer'
import LoginBanner from '@/components/ui/LoginBanner'
import { isAuthenticated } from '@/lib/auth'

// 단순한 프로젝트 인터페이스
interface SimpleProject {
  id: string
  title: string
  description?: string
  taskCount: number
  createdAt: string
}

function ProjectsPageContent() {
  const [projects, setProjects] = useState<SimpleProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const loggedIn = isAuthenticated()
    setIsLoggedIn(loggedIn)
    
    if (loggedIn) {
      // TODO: 실제 프로젝트 데이터 로딩
      setTimeout(() => {
        setProjects([]) // 현재는 빈 배열
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
    }
  }, [])

  // 새 프로젝트 생성
  const handleCreateProject = () => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      return
    }
    
    const title = prompt('프로젝트 이름을 입력하세요:')
    if (!title) return
    
    const newProject: SimpleProject = {
      id: 'project-' + Date.now(),
      title,
      description: '',
      taskCount: 0,
      createdAt: new Date().toISOString()
    }
    
    setProjects(prev => [newProject, ...prev])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="Workspaces" />
      <LoginBanner />
      
      <MainContainer className="pb-20 md:pb-20">
        {/* 프로젝트 목록 */}
        <div className="workly-list-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="workly-caption mt-2">워크스페이스를 불러오는 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="workly-card-title text-gray-600 mb-1">워크스페이스가 없습니다</h3>
              <p className="workly-caption mb-4">새로운 워크스페이스를 만들어보세요!</p>
              {isLoggedIn && (
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  워크스페이스 만들기
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((project) => (
                <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.taskCount}개 업무
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainContainer>
      
      {/* 플로팅 추가 버튼 (모바일) */}
      {isLoggedIn && (
        <div className="md:hidden fixed right-4 bottom-20 z-50">
          <button
            onClick={handleCreateProject}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      )}
      
      {/* 데스크톱 추가 버튼 */}
      {isLoggedIn && (
        <div className="hidden md:block fixed bottom-4 right-4 z-50">
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            워크스페이스 만들기
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  )
}