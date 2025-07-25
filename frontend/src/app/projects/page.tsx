import Header from '@/components/layout/Header'
import FloatingActionButton from '@/components/ui/FloatingActionButton'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title="프로젝트" 
        showDropdown={true}
        dropdownItems={['전체 프로젝트', '내 프로젝트', '진행 중', '완료됨']}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-[640px] mx-auto px-6 py-6 pb-20 md:pb-6">
        <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">프로젝트 페이지</h2>
          <p className="text-muted-foreground">프로젝트 관리 기능이 여기에 추가될 예정입니다.</p>
        </div>
      </main>
      
      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton />
    </div>
  )
}