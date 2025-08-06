'use client'

import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { 
  RectangleStackIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { worklyApi } from '@/lib/api/workly-api'

interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  memberCount?: number
}

interface ProjectSelectorProps {
  value: string | null
  onChange: (projectId: string | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  allowClear?: boolean
}

export default function ProjectSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = '프로젝트 선택',
  size = 'md',
  allowClear = true
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 프로젝트 목록 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // worklyApi를 통해 프로젝트 목록 가져오기
        const response = await worklyApi.projects.getAll({ 
          page: 1, 
          limit: 100,
          status: 'active'
        })
        
        setProjects(response.data || [])
      } catch (err) {
        console.error('프로젝트 목록 로드 실패:', err)
        setError('프로젝트 목록을 불러올 수 없습니다.')
        
        // 목업 데이터 사용 (API 실패시 fallback)
        setProjects([
          {
            id: '1',
            name: '워클리 메인 프로젝트',
            description: '워클리 핵심 기능 개발',
            status: 'active',
            memberCount: 5
          },
          {
            id: '2', 
            name: '디자인 시스템',
            description: 'UI/UX 컴포넌트 라이브러리',
            status: 'active',
            memberCount: 3
          },
          {
            id: '3',
            name: '모바일 앱',
            description: '워클리 모바일 애플리케이션',
            status: 'active', 
            memberCount: 4
          },
          {
            id: '4',
            name: 'API 개선',
            description: '백엔드 성능 최적화',
            status: 'active',
            memberCount: 2
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  // 선택된 프로젝트 찾기
  const selectedProject = projects.find(project => project.id === value)

  // 검색 필터링
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sizeClasses = {
    sm: 'text-sm py-1.5 pl-2 pr-8',
    md: 'text-sm py-2 pl-3 pr-10', 
    lg: 'text-base py-3 pl-4 pr-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button 
            className={`
              relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400
              ${sizeClasses[size]}
            `}
          >
            <span className="flex items-center gap-2">
              <RectangleStackIcon className={`${iconSizes[size]} text-gray-500 flex-shrink-0`} />
              {selectedProject ? (
                <div className="flex-1 text-left">
                  <span className="block truncate font-medium text-gray-900">
                    {selectedProject.name}
                  </span>
                  {selectedProject.description && (
                    <span className="block truncate text-xs text-gray-500">
                      {selectedProject.description}
                    </span>
                  )}
                </div>
              ) : (
                <span className="block truncate text-gray-500">{placeholder}</span>
              )}
            </span>
            
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              {allowClear && selectedProject ? (
                <button
                  onClick={handleClear}
                  className="pointer-events-auto flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="선택 해제"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              ) : (
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              )}
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* 검색 입력 */}
              <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="프로젝트 검색..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 선택 해제 옵션 */}
              {allowClear && (
                <Listbox.Option
                  value={null}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2">
                        <XMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className={`block italic ${selected ? 'font-semibold' : ''}`}>
                          프로젝트 없음
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              )}

              {/* 구분선 */}
              {allowClear && filteredProjects.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}

              {loading ? (
                <div className="py-4 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    로딩 중...
                  </div>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-500 text-sm">
                  {error}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-4 text-center text-gray-500 text-sm">
                  {searchQuery ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <Listbox.Option
                    key={project.id}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                        active || selected
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`
                    }
                    value={project.id}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-center gap-2">
                          <RectangleStackIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <span className={`block font-medium ${selected ? 'font-semibold' : ''}`}>
                              {project.name}
                            </span>
                            {project.description && (
                              <span className="block text-xs text-gray-500">
                                {project.description}
                              </span>
                            )}
                            {project.memberCount && (
                              <span className="block text-xs text-gray-400">
                                멤버 {project.memberCount}명
                              </span>
                            )}
                          </div>
                        </div>

                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}