'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project.types';
import ProjectChatChannel from './ProjectChatChannel';
import ProjectInfoSidebar from './ProjectInfoSidebar';

interface ProjectDetailViewProps {
  project: Project;
  onEdit: () => void;
  onProjectUpdate: () => void;
}

export default function ProjectDetailView({ 
  project, 
  onEdit,
  onProjectUpdate 
}: ProjectDetailViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // 모바일에서는 기본적으로 사이드바 닫힘
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 터치 이벤트 핸들러 (메모화)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isMobile) {
      if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      if (isRightSwipe && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    }
  }, [touchStart, touchEnd, isMobile, isSidebarOpen]);

  // 사이드바 토글 핸들러 (메모화)
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen]);

  return (
    <div 
      className="h-screen h-screen-mobile bg-gray-50 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="프로젝트 상세 페이지"
    >
      {/* 좌측 메인 콘텐츠 (채팅) - 고정 위치 */}
      <div className="fixed inset-0 bg-white">
        <ProjectChatChannel
          project={project}
          members={project.members || []}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          onToggleSidebar={handleToggleSidebar}
          onTaskCreate={(taskData) => {
            console.log('새 업무 생성:', taskData)
            // TODO: 실제 업무 생성 API 호출
          }}
          onMilestoneCreate={(milestoneData) => {
            console.log('마일스톤 생성:', milestoneData)
            // TODO: 실제 마일스톤 생성 API 호출
          }}
          onUserDelegate={(delegationData) => {
            console.log('업무 재할당:', delegationData)
            // TODO: 실제 업무 재할당 API 호출
          }}
        />
      </div>

      {/* 모바일 오버레이 */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 우측 사이드바 - 완전 고정 위치 */}
      <aside 
        className={`
          fixed top-0 bottom-0 right-0 z-45
          transition-all duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          ${isMobile ? 'w-full' : 'w-[640px]'}
          bg-white border-l border-gray-200 shadow-2xl
        `}
        style={{
          transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(100%)',
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out'
        }}
        role="complementary"
        aria-label="프로젝트 정보 사이드바"
        aria-hidden={!isSidebarOpen}
      >
        <ProjectInfoSidebar
          project={project}
          onEdit={onEdit}
          onProjectUpdate={onProjectUpdate}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={isMobile}
        />
      </aside>
    </div>
  );
}