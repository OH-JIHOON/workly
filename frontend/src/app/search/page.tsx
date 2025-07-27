'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import { 
  TaskIcon, 
  ProjectIcon, 
  PostIcon,
  UserIcon
} from '@heroicons/react/24/solid'

interface SearchResult {
  id: string
  type: 'task' | 'project' | 'post' | 'user'
  title: string
  description?: string
  url: string
  category?: string
  timestamp?: string
  status?: string
}

// 목업 검색 결과 데이터
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'task',
    title: '프로젝트 기획서 작성',
    description: '새로운 프로젝트의 기획서를 작성하고 팀과 공유',
    url: '/tasks/1',
    category: '업무',
    timestamp: '6시간 후 마감',
    status: '진행중'
  },
  {
    id: '2',
    type: 'project',
    title: '워클리 MVP 개발',
    description: '비즈니스 성공을 위한 웹 애플리케이션 MVP 버전 개발',
    url: '/projects/1',
    category: '프로젝트',
    status: '활성'
  },
  {
    id: '3',
    type: 'task',
    title: 'API 문서 검토',
    description: '백엔드 API 문서를 검토하고 피드백 제공',
    url: '/tasks/3',
    category: '업무',
    status: '완료'
  },
  {
    id: '4',
    type: 'project',
    title: 'AI 챗봇 개발',
    description: '고객 지원을 위한 AI 기반 챗봇 시스템 구축',
    url: '/projects/2',
    category: '프로젝트',
    status: '활성'
  },
  {
    id: '5',
    type: 'post',
    title: '워클리 런칭 공지',
    description: '워클리 플랫폼이 드디어 베타 버전으로 출시되었습니다!',
    url: '/board/5',
    category: '공지사항',
    timestamp: '2일 전'
  }
]

// 최근 검색어 (로컬스토리지에서 관리)
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('workly-recent-searches')
  return saved ? JSON.parse(saved) : []
}

const saveRecentSearch = (query: string) => {
  if (typeof window === 'undefined' || !query.trim()) return
  
  const current = getRecentSearches()
  const updated = [query, ...current.filter(item => item !== query)].slice(0, 5)
  localStorage.setItem('workly-recent-searches', JSON.stringify(updated))
}

function SearchResultItem({ result }: { result: SearchResult }) {
  const router = useRouter()
  
  const getIcon = () => {
    switch (result.type) {
      case 'task':
        return <TaskIcon className="w-5 h-5 text-blue-600" />
      case 'project':
        return <ProjectIcon className="w-5 h-5 text-green-600" />
      case 'post':
        return <PostIcon className="w-5 h-5 text-purple-600" />
      case 'user':
        return <UserIcon className="w-5 h-5 text-orange-600" />
      default:
        return <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (result.status) {
      case '완료':
        return 'bg-green-100 text-green-800'
      case '진행중':
        return 'bg-blue-100 text-blue-800'
      case '활성':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={() => router.push(result.url)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {result.title}
            </h3>
            <span className="text-xs text-gray-500">{result.category}</span>
            {result.status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
                {result.status}
              </span>
            )}
          </div>
          {result.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {result.description}
            </p>
          )}
          {result.timestamp && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <span>{result.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    // URL 파라미터에서 검색어 가져오기
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
    
    // 최근 검색어 로드
    setRecentSearches(getRecentSearches())
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // 실제로는 API 호출
    // const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
    // const data = await response.json()
    
    // 목업 검색 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 간단한 필터링 로직
    const filtered = mockSearchResults.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setResults(filtered)
    setIsLoading(false)
    
    // 최근 검색어에 추가
    saveRecentSearch(searchQuery)
    setRecentSearches(getRecentSearches())
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    performSearch(searchQuery)
    
    // URL 업데이트
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery)
    }
    router.replace(`/search?${params.toString()}`)
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    handleSearch(recentQuery)
  }

  const clearRecentSearches = () => {
    localStorage.removeItem('workly-recent-searches')
    setRecentSearches([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="업무, 프로젝트, 게시글 검색..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <button
            onClick={() => handleSearch(query)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            검색
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[720px] mx-auto">
        {!query.trim() && recentSearches.length > 0 && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">최근 검색어</h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                전체 삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recent)}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {recent}
                </button>
              ))}
            </div>
          </div>
        )}

        {!query.trim() && (
          <div className="bg-white p-8 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">통합검색</h3>
            <p className="text-gray-500 mb-4">
              업무, 프로젝트, 게시글을 한 번에 검색하세요
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <TaskIcon className="w-4 h-4 text-blue-600" />
                <span>업무</span>
                <ProjectIcon className="w-4 h-4 text-green-600 ml-4" />
                <span>프로젝트</span>
                <PostIcon className="w-4 h-4 text-purple-600 ml-4" />
                <span>게시글</span>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">검색 중...</p>
          </div>
        )}

        {query.trim() && !isLoading && results.length === 0 && (
          <div className="bg-white p-8 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과 없음</h3>
            <p className="text-gray-500">
              '{query}'에 대한 검색 결과가 없습니다.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">
                '{query}' 검색 결과 {results.length}개
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {results.map((result) => (
                <SearchResultItem key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}