'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ContentHeader from '@/components/layout/ContentHeader';
import MainContainer from '@/components/layout/MainContainer';
import LoginBanner from '@/components/ui/LoginBanner';
import { CreateWorkForm } from '@/components/works';
import { Card } from '@/components/ui/Card';

function CreateWorkPageContent() {
  const router = useRouter();

  const handleWorkCreated = (work: any) => {
    console.log('Work created:', work);
    router.push('/works');
  };

  const handleCancel = () => {
    router.push('/works');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="새 워크 생성" />
      
      <MainContainer className="pb-20 md:pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">새 워크 생성</h1>
              <p className="text-gray-600 mt-1">새로운 작업을 생성하고 관리해보세요.</p>
            </div>
            
            <CreateWorkForm
              onSuccess={handleWorkCreated}
              onCancel={handleCancel}
            />
          </Card>
        </div>
      </MainContainer>
    </div>
  );
}

export default function CreateWorkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CreateWorkPageContent />
    </Suspense>
  );
}