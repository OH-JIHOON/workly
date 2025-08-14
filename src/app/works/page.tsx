'use client';

import { Suspense } from 'react';
import ContentHeader from '@/components/layout/ContentHeader';
import MainContainer from '@/components/layout/MainContainer';
import LoginBanner from '@/components/ui/LoginBanner';
import { WorkList } from '@/components/works/WorkList';
import { WorkComposer } from '@/components/works/WorkComposer';
import { useWorks } from '@/hooks/useWorks';

function WorksPageContent() {
  // 상위에서 상태 관리하여 WorkList와 WorkComposer가 동일한 상태를 공유
  const worksState = useWorks();

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="Work" />
      
      <MainContainer className="pb-20 md:pb-20">
        <WorkList worksState={worksState} />
      </MainContainer>
      <WorkComposer worksState={worksState} />
    </div>
  );
}

export default function WorksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WorksPageContent />
    </Suspense>
  );
}