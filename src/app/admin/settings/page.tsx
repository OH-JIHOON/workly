'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CloudIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SystemSettings {
  app: {
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    projectCreation: boolean;
    fileUpload: boolean;
    maxFileSize: number;
    maxProjectMembers: number;
    taskDeadlineWarningDays: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    dailyDigestEnabled: boolean;
    weeklyReportEnabled: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
  };
  features: {
    realTimeChat: boolean;
    fileSharing: boolean;
    integrations: boolean;
    analytics: boolean;
    apiAccess: boolean;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('app');

  // 임시 데이터
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // 실제로는 API 호출
        
        // const data = await response.json();
        
        // 임시 데이터
        const mockSettings: SystemSettings = {
          app: {
            maintenanceMode: false,
            newUserRegistration: true,
            projectCreation: true,
            fileUpload: true,
            maxFileSize: 10,
            maxProjectMembers: 50,
            taskDeadlineWarningDays: 3,
          },
          notifications: {
            emailEnabled: true,
            pushEnabled: true,
            dailyDigestEnabled: true,
            weeklyReportEnabled: true,
          },
          security: {
            passwordMinLength: 8,
            passwordRequireSpecialChar: true,
            sessionTimeoutMinutes: 120,
            maxLoginAttempts: 5,
            twoFactorRequired: false,
          },
          features: {
            realTimeChat: true,
            fileSharing: true,
            integrations: false,
            analytics: true,
            apiAccess: false,
          },
        };
        
        setSettings(mockSettings);
      } catch (error) {
        console.error('설정 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      // 실제로는 API 호출
      
      
      // 임시로 2초만 기다리기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'app', name: '애플리케이션', icon: Cog6ToothIcon },
    { id: 'notifications', name: '알림', icon: BellIcon },
    { id: 'security', name: '보안', icon: ShieldCheckIcon },
    { id: 'features', name: '기능', icon: GlobeAltIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">설정을 불러올 수 없습니다</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
        <p className="mt-1 text-sm text-gray-600">
          워클리 시스템의 전반적인 설정을 관리하세요
        </p>
      </div>

      <div className="flex">
        {/* 사이드바 탭 */}
        <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 ml-6">
          <div className="bg-white rounded-lg shadow">
            {/* 애플리케이션 설정 */}
            {activeTab === 'app' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">애플리케이션 설정</h2>
                
                {/* 유지보수 모드 */}
                <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">유지보수 모드</h3>
                      <p className="text-sm text-yellow-700">시스템을 일시적으로 사용 중단할 수 있습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.app.maintenanceMode}
                        onChange={(e) => updateSetting('app', 'maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 사용자 등록 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">신규 사용자 등록 허용</h3>
                      <p className="text-sm text-gray-500">새로운 사용자의 회원가입을 허용합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.app.newUserRegistration}
                        onChange={(e) => updateSetting('app', 'newUserRegistration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* 프로젝트 생성 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">프로젝트 생성 허용</h3>
                      <p className="text-sm text-gray-500">사용자의 새 프로젝트 생성을 허용합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.app.projectCreation}
                        onChange={(e) => updateSetting('app', 'projectCreation', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* 파일 업로드 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">파일 업로드 허용</h3>
                      <p className="text-sm text-gray-500">사용자의 파일 업로드를 허용합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.app.fileUpload}
                        onChange={(e) => updateSetting('app', 'fileUpload', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* 최대 파일 크기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      최대 파일 크기 (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.app.maxFileSize}
                      onChange={(e) => updateSetting('app', 'maxFileSize', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* 최대 프로젝트 멤버 수 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      프로젝트당 최대 멤버 수
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={settings.app.maxProjectMembers}
                      onChange={(e) => updateSetting('app', 'maxProjectMembers', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* 업무 마감일 경고 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      업무 마감일 경고 (일 전)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.app.taskDeadlineWarningDays}
                      onChange={(e) => updateSetting('app', 'taskDeadlineWarningDays', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 알림 설정 */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">이메일 알림</h3>
                      <p className="text-sm text-gray-500">이메일을 통한 알림을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">푸시 알림</h3>
                      <p className="text-sm text-gray-500">브라우저 푸시 알림을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushEnabled}
                        onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">일일 요약</h3>
                      <p className="text-sm text-gray-500">매일 활동 요약을 발송합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailyDigestEnabled}
                        onChange={(e) => updateSetting('notifications', 'dailyDigestEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">주간 리포트</h3>
                      <p className="text-sm text-gray-500">매주 성과 리포트를 발송합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.weeklyReportEnabled}
                        onChange={(e) => updateSetting('notifications', 'weeklyReportEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 보안 설정 */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">보안 설정</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      최소 비밀번호 길이
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">특수문자 포함 필수</h3>
                      <p className="text-sm text-gray-500">비밀번호에 특수문자를 포함하도록 강제합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordRequireSpecialChar}
                        onChange={(e) => updateSetting('security', 'passwordRequireSpecialChar', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      세션 타임아웃 (분)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => updateSetting('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      최대 로그인 시도 횟수
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">2단계 인증 필수</h3>
                      <p className="text-sm text-gray-500">모든 사용자에게 2단계 인증을 강제합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorRequired}
                        onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 기능 설정 */}
            {activeTab === 'features' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">기능 설정</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">실시간 채팅</h3>
                      <p className="text-sm text-gray-500">프로젝트 내 실시간 채팅 기능을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.realTimeChat}
                        onChange={(e) => updateSetting('features', 'realTimeChat', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">파일 공유</h3>
                      <p className="text-sm text-gray-500">프로젝트 내 파일 공유 기능을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.fileSharing}
                        onChange={(e) => updateSetting('features', 'fileSharing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">외부 통합</h3>
                      <p className="text-sm text-gray-500">Slack, Notion 등 외부 서비스 통합을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.integrations}
                        onChange={(e) => updateSetting('features', 'integrations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">분석 기능</h3>
                      <p className="text-sm text-gray-500">사용자 활동 분석 및 통계 기능을 활성화합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.analytics}
                        onChange={(e) => updateSetting('features', 'analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">API 접근</h3>
                      <p className="text-sm text-gray-500">외부 애플리케이션의 API 접근을 허용합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.apiAccess}
                        onChange={(e) => updateSetting('features', 'apiAccess', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <CloudIcon className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <CloudIcon className="mr-2 h-4 w-4" />
                      설정 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}