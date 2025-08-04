'use client'

import { useState } from 'react'
import { Search, BookOpen, User, Eye, ThumbsUp, Clock, Tag, Star, FileText, Plus, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface KnowledgeWikiProps {
  searchQuery: string
}

interface WikiArticle {
  id: string
  title: string
  summary: string
  content: string
  author: {
    name: string
    avatar: string
    reputation: number
  }
  category: string
  tags: string[]
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: number
  isFeatured: boolean
}

// 임시 데이터
const mockArticles: WikiArticle[] = [
  {
    id: '1',
    title: 'React Hook 완벽 가이드',
    summary: 'React Hook의 기본 개념부터 고급 패턴까지 상세히 설명합니다. useState, useEffect, useContext 등 핵심 Hook들의 실전 사용법을 다룹니다.',
    content: '# React Hook 완벽 가이드\n\nReact Hook은...',
    author: {
      name: '김개발',
      avatar: '/avatars/kim.jpg',
      reputation: 1250
    },
    category: 'Frontend',
    tags: ['React', 'JavaScript', 'Hook', 'Frontend'],
    views: 1542,
    likes: 89,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    difficulty: 'intermediate',
    readTime: 12,
    isFeatured: true
  },
  {
    id: '2',
    title: 'TypeScript 타입 시스템 심화',
    summary: 'TypeScript의 고급 타입 시스템을 활용한 타입 안전성 향상 방법을 설명합니다. 제네릭, 유니온 타입, 조건부 타입 등을 다룹니다.',
    content: '# TypeScript 타입 시스템 심화\n\n타입 시스템은...',
    author: {
      name: '박타입',
      avatar: '/avatars/park.jpg',
      reputation: 2100
    },
    category: 'Programming',
    tags: ['TypeScript', 'Types', 'Programming', 'JavaScript'],
    views: 892,
    likes: 67,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    difficulty: 'advanced',
    readTime: 18,
    isFeatured: false
  },
  {
    id: '3',
    title: 'UX 디자인 기초: 사용자 중심 설계',
    summary: '사용자 경험 디자인의 기본 원칙과 방법론을 소개합니다. 사용자 조사, 와이어프레임, 프로토타이핑까지 전체 과정을 다룹니다.',
    content: '# UX 디자인 기초\n\n사용자 중심 설계는...',
    author: {
      name: '이디자인',
      avatar: '/avatars/lee.jpg',
      reputation: 1680
    },
    category: 'Design',
    tags: ['UX', 'Design', 'User Research', 'Prototyping'],
    views: 2156,
    likes: 134,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-16',
    difficulty: 'beginner',
    readTime: 15,
    isFeatured: true
  }
]

const categories = ['전체', 'Frontend', 'Backend', 'Design', 'Programming', 'DevOps', 'Marketing']
const difficulties = [
  { key: 'all', label: '전체 수준' },
  { key: 'beginner', label: '초급' },
  { key: 'intermediate', label: '중급' },
  { key: 'advanced', label: '고급' }
]

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

const difficultyLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급'
}

export default function KnowledgeWiki({ searchQuery }: KnowledgeWikiProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes'>('latest')

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === '전체' || article.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.views - a.views
      case 'likes':
        return b.likes - a.likes
      case 'latest':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  const featuredArticles = mockArticles.filter(article => article.isFeatured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">


      {/* 위키 문서 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-500">다른 조건으로 검색해보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredArticles.map((article, index) => (
              <div key={article.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${index === filteredArticles.length - 1 ? '' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-gray-900">{article.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[article.difficulty]}`}>
                        {difficultyLabels[article.difficulty]}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                    
                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">+{article.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}분 읽기
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{article.author.name}</span>
                      <span className="text-xs text-gray-600">평판 {article.author.reputation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views.toLocaleString()}회
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {article.likes}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      업데이트: {formatDate(article.updatedAt)}
                    </span>
                    <Button variant="outline" size="sm">
                      <FileText className="w-3 h-3 mr-1" />
                      읽기
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
          <h3 className="text-sm font-medium text-gray-900">위키 통계</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{mockArticles.length}</div>
            <div className="text-xs text-gray-500">총 문서 수</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {mockArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">총 조회수</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {mockArticles.reduce((sum, article) => sum + article.likes, 0)}
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