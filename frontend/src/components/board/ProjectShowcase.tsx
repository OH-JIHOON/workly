'use client'

import { useState } from 'react'
import { Search, Heart, Eye, MessageCircle, User, Calendar, Tag, ExternalLink, Image, Video, Github, Globe, Award, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProjectShowcaseProps {
  searchQuery: string
}

interface ShowcaseProject {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
    level: number
    reputation: number
  }
  category: string
  tags: string[]
  images: string[]
  videoUrl?: string
  links: {
    demo?: string
    github?: string
    website?: string
  }
  stats: {
    views: number
    likes: number
    comments: number
  }
  createdAt: string
  isFeatured: boolean
  challenges: string[]
  solutions: string[]
  lessons: string[]
  technologies: string[]
  teamMembers?: {
    name: string
    role: string
    avatar: string
  }[]
}

// 임시 데이터
const mockProjects: ShowcaseProject[] = [
  {
    id: '1',
    title: '실시간 협업 화이트보드 애플리케이션',
    description: '팀이 실시간으로 함께 작업할 수 있는 화이트보드 앱을 개발했습니다. Socket.io를 활용한 실시간 동기화와 Canvas API를 이용한 드로잉 기능을 구현했습니다.',
    author: {
      name: '김협업',
      avatar: '/avatars/kim.jpg',
      level: 15,
      reputation: 2340
    },
    category: '웹 개발',
    tags: ['React', 'Socket.io', 'Canvas', 'TypeScript', 'Node.js'],
    images: [
      '/projects/whiteboard-1.jpg',
      '/projects/whiteboard-2.jpg',
      '/projects/whiteboard-3.jpg'
    ],
    videoUrl: '/projects/whiteboard-demo.mp4',
    links: {
      demo: 'https://whiteboard-demo.com',
      github: 'https://github.com/user/whiteboard',
      website: 'https://whiteboard-app.com'
    },
    stats: {
      views: 1234,
      likes: 89,
      comments: 23
    },
    createdAt: '2024-01-15',
    isFeatured: true,
    challenges: [
      '실시간 데이터 동기화의 성능 최적화',
      '다양한 브라우저에서의 Canvas 호환성',
      '대용량 데이터 처리'
    ],
    solutions: [
      'WebSocket 연결 풀링과 데이터 압축으로 성능 개선',
      'Fabric.js 라이브러리 도입으로 브라우저 호환성 해결',
      'Virtual scrolling과 lazy loading 적용'
    ],
    lessons: [
      '실시간 애플리케이션에서의 상태 관리 중요성',
      '사용자 경험을 위한 오프라인 모드 필요성',
      '확장 가능한 아키텍처 설계의 중요성'
    ],
    technologies: ['React', 'TypeScript', 'Socket.io', 'Canvas API', 'Node.js', 'MongoDB'],
    teamMembers: [
      { name: '김협업', role: 'Frontend Developer', avatar: '/avatars/kim.jpg' },
      { name: '박실시간', role: 'Backend Developer', avatar: '/avatars/park.jpg' },
      { name: '이디자인', role: 'UI/UX Designer', avatar: '/avatars/lee.jpg' }
    ]
  },
  {
    id: '2',
    title: 'AI 기반 개인 학습 도우미',
    description: 'OpenAI API를 활용하여 개인화된 학습 경험을 제공하는 모바일 앱을 개발했습니다. 사용자의 학습 패턴을 분석하고 맞춤형 콘텐츠를 추천합니다.',
    author: {
      name: '박AI',
      avatar: '/avatars/park.jpg',
      level: 12,
      reputation: 1890
    },
    category: '모바일 앱',
    tags: ['React Native', 'AI', 'Machine Learning', 'OpenAI', 'Firebase'],
    images: [
      '/projects/ai-tutor-1.jpg',
      '/projects/ai-tutor-2.jpg'
    ],
    links: {
      demo: 'https://ai-tutor-demo.com',
      github: 'https://github.com/user/ai-tutor'
    },
    stats: {
      views: 867,
      likes: 56,
      comments: 18
    },
    createdAt: '2024-01-12',
    isFeatured: false,
    challenges: [
      'AI 응답의 정확성과 관련성 확보',
      '사용자 개인정보 보호',
      '모바일 환경에서의 성능 최적화'
    ],
    solutions: [
      'Prompt engineering과 fine-tuning으로 응답 품질 개선',
      '로컬 데이터 처리와 암호화로 프라이버시 보호',
      '캐싱과 압축으로 데이터 사용량 최소화'
    ],
    lessons: [
      'AI 서비스에서의 사용자 신뢰 구축 중요성',
      '점진적 기능 개선의 효과',
      '사용자 피드백 수집의 중요성'
    ],
    technologies: ['React Native', 'OpenAI API', 'Firebase', 'TensorFlow Lite'],
    teamMembers: [
      { name: '박AI', role: 'Full Stack Developer', avatar: '/avatars/park.jpg' },
      { name: '최ML', role: 'ML Engineer', avatar: '/avatars/choi.jpg' }
    ]
  },
  {
    id: '3',
    title: '지속가능한 패션 플랫폼',
    description: '친환경 패션 브랜드들을 연결하는 이커머스 플랫폼을 디자인하고 개발했습니다. 지속가능성 지표와 브랜드 스토리를 중심으로 한 독특한 UX를 제공합니다.',
    author: {
      name: '이그린',
      avatar: '/avatars/lee.jpg',
      level: 8,
      reputation: 1245
    },
    category: '이커머스',
    tags: ['Next.js', 'Tailwind CSS', 'Stripe', 'Sustainability', 'E-commerce'],
    images: [
      '/projects/eco-fashion-1.jpg',
      '/projects/eco-fashion-2.jpg',
      '/projects/eco-fashion-3.jpg'
    ],
    links: {
      demo: 'https://eco-fashion-demo.com',
      website: 'https://green-fashion.com'
    },
    stats: {
      views: 654,
      likes: 42,
      comments: 12
    },
    createdAt: '2024-01-08',
    isFeatured: true,
    challenges: [
      '복잡한 지속가능성 데이터의 시각화',
      '다양한 브랜드 요구사항 통합',
      '신뢰할 수 있는 결제 시스템 구축'
    ],
    solutions: [
      '인터랙티브 차트와 인포그래픽으로 데이터 표현',
      '모듈식 아키텍처로 확장성 확보',
      'Stripe Connect를 활용한 멀티벤더 결제'
    ],
    lessons: [
      '사회적 가치와 비즈니스 모델의 조화',
      '사용자 교육의 중요성',
      '스토리텔링이 주는 브랜드 차별화 효과'
    ],
    technologies: ['Next.js', 'Tailwind CSS', 'Stripe', 'PostgreSQL', 'Vercel']
  }
]

const categories = ['전체', '웹 개발', '모바일 앱', '이커머스', '게임', '디자인', '데이터 과학']
const sortOptions = [
  { key: 'latest', label: '최신순' },
  { key: 'popular', label: '인기순' },
  { key: 'likes', label: '좋아요순' },
  { key: 'views', label: '조회수순' }
]

export default function ProjectShowcase({ searchQuery }: ProjectShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes' | 'views'>('latest')

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === '전체' || project.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.stats.views + b.stats.likes) - (a.stats.views + a.stats.likes)
      case 'likes':
        return b.stats.likes - a.stats.likes
      case 'views':
        return b.stats.views - a.stats.views
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const featuredProjects = mockProjects.filter(project => project.isFeatured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">


      {/* 프로젝트 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-500">다른 조건으로 검색해보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${index === filteredProjects.length - 1 ? '' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-gray-900">{project.title}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {project.category}
                      </span>
                      {project.isFeatured && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    
                    {/* 기술 스택 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.slice(0, 4).map((tech, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500">+{project.technologies.length - 4}</span>
                      )}
                    </div>

                    {/* 팀 멤버 */}
                    {project.teamMembers && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>팀:</span>
                          {project.teamMembers.slice(0, 3).map((member, index) => (
                            <span key={index}>{member.name}{index < 2 && index < project.teamMembers!.length - 1 ? ', ' : ''}</span>
                          ))}
                          {project.teamMembers.length > 3 && (
                            <span>외 {project.teamMembers.length - 3}명</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 프로젝트 썸네일 */}
                  <div className="w-20 h-16 bg-gray-100 rounded border border-gray-200 ml-4 flex items-center justify-center">
                    {project.videoUrl ? (
                      <Video className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Image className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 도전과제와 해결책 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-1">주요 도전과제</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {project.challenges.slice(0, 1).map((challenge, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span className="line-clamp-1">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-1">핵심 해결책</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {project.solutions.slice(0, 1).map((solution, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span className="line-clamp-1">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{project.author.name}</span>
                      <span className="text-xs text-gray-600">Lv.{project.author.level}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {project.stats.views.toLocaleString()}회
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {project.stats.likes}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(project.createdAt)}
                    </span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 통계 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-medium text-gray-900">쇼케이스 통계</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{mockProjects.length}</div>
            <div className="text-xs text-gray-500">총 프로젝트</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {mockProjects.reduce((sum, project) => sum + project.stats.views, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">총 조회수</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {mockProjects.reduce((sum, project) => sum + project.stats.likes, 0)}
            </div>
            <div className="text-xs text-gray-500">총 좋아요</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{categories.length - 1}</div>
            <div className="text-xs text-gray-500">카테고리 수</div>
          </div>
        </div>
      </div>
    </div>
  )
}