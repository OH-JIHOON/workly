import Header from '@/components/layout/Header'
import WorkDashboard from '@/components/dashboard/WorkDashboard'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title="업무" 
        showDropdown={true}
        dropdownItems={['업무', '대시보드']}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto p-6 pb-20 md:pb-6">
        <WorkDashboard />
      </main>
    </div>
  )
}