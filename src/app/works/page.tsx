'use client';

import { Suspense } from 'react';
import ContentHeader from '@/components/layout/ContentHeader';
import MainContainer from '@/components/layout/MainContainer';
import LoginBanner from '@/components/ui/LoginBanner';
import { WorkList } from '@/components/works/WorkList';
import { WorkComposer } from '@/components/works/WorkComposer';

function WorksPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="Work" />
      
      <MainContainer className="pb-20 md:pb-20">
        <WorkList />
      </MainContainer>
      <WorkComposer />
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