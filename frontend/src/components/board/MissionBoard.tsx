'use client'

import { useState } from 'react'
import { Search, MapPin, Clock, DollarSign, User, Briefcase, Star, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MissionBoardProps {
  searchQuery: string
}

interface Mission {
  id: string
  title: string
  description: string
  client: string
  budget: {
    type: 'fixed' | 'hourly'
    amount: number
  }
  deadline: string
  location: string
  skills: string[]
  proposals: number
  rating: number
  postedAt: string
  category: 'development' | 'design' | 'marketing' | 'writing' | 'consulting'
}

// 임시 데이터
const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'React 웹 애플리케이션 개발',
    description: '사용자 관리 시스템이 포함된 React 기반 웹 애플리케이션을 개발해주실 개발자를 찾습니다. TypeScript와 Next.js 경험이 있으시면 더욱 좋습니다.',
    client: 'TechCorp',
    budget: { type: 'fixed', amount: 3000000 },
    deadline: '2024-03-15',
    location: '원격',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
    proposals: 12,
    rating: 4.8,
    postedAt: '2024-01-10',
    category: 'development'
  },
  {
    id: '2',
    title: 'UX/UI 디자인 리뉴얼',
    description: '기존 모바일 앱의 UX/UI를 모던하고 사용자 친화적으로 리디자인해주실 디자이너를 찾습니다.',
    client: 'StartupA',
    budget: { type: 'hourly', amount: 50000 },
    deadline: '2024-02-28',
    location: '서울',
    skills: ['Figma', 'UX Design', 'UI Design', 'Prototyping'],
    proposals: 8,
    rating: 4.9,
    postedAt: '2024-01-12',
    category: 'design'
  },
  {
    id: '3',
    title: '마케팅 전략 수립 및 실행',
    description: '신제품 런칭을 위한 종합적인 디지털 마케팅 전략을 수립하고 실행해주실 마케터를 찾습니다.',
    client: 'BrandCo',
    budget: { type: 'fixed', amount: 2500000 },
    deadline: '2024-04-01',
    location: '부산',
    skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
    proposals: 15,
    rating: 4.7,
    postedAt: '2024-01-08',
    category: 'marketing'
  }
]

const categoryLabels = {
  development: '개발',
  design: '디자인',
  marketing: '마케팅',
  writing: '라이팅',
  consulting: '컨설팅'
}

export default function MissionBoard({ searchQuery }: MissionBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [budgetFilter, setBudgetFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')

  const categories = ['all', 'development', 'design', 'marketing', 'writing', 'consulting']

  const filteredMissions = mockMissions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mission.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory
    
    let matchesBudget = true
    if (budgetFilter !== 'all') {
      const amount = mission.budget.amount
      switch (budgetFilter) {
        case '1000000-':
          matchesBudget = amount < 1000000
          break
        case '1000000-3000000':
          matchesBudget = amount >= 1000000 && amount <= 3000000
          break
        case '3000000+':
          matchesBudget = amount > 3000000
          break
      }
    }
    
    const matchesLocation = locationFilter === 'all' || mission.location === locationFilter
    
    return matchesSearch && matchesCategory && matchesBudget && matchesLocation
  })

  const formatBudget = (budget: Mission['budget']) => {
    const formattedAmount = new Intl.NumberFormat('ko-KR').format(budget.amount)
    return budget.type === 'fixed' 
      ? `${formattedAmount}원 (고정)`
      : `${formattedAmount}원/시간`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">

      {/* 임무 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

        {filteredMissions.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-500">다른 조건으로 검색해보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMissions.map((mission, index) => (
              <div key={mission.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${index === filteredMissions.length - 1 ? '' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-gray-900">{mission.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {categoryLabels[mission.category]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mission.description}</p>
                    
                    {/* 스킬 태그 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mission.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {skill}
                        </span>
                      ))}
                      {mission.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">+{mission.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {formatBudget(mission.budget)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      {mission.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {mission.client}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {mission.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      마감: {formatDate(mission.deadline)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">{mission.proposals}개 제안</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}