'use client'

import { useState } from 'react'
import { 
  ChevronRightIcon, 
  GlobeAltIcon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  BellIcon 
} from '@heroicons/react/24/outline'

interface SettingSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [language, setLanguage] = useState('ko')
  const [theme, setTheme] = useState('system')
  const [notifications, setNotifications] = useState({
    taskMentions: true,
    projectUpdates: true,
    applicationApproval: false,
    deadlineReminders: true,
    systemAnnouncements: false
  })

  const languages = [
    { code: 'ko', name: '한국어', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ]

  const themes = [
    { value: 'light', label: '라이트 모드', icon: SunIcon },
    { value: 'dark', label: '다크 모드', icon: MoonIcon },
    { value: 'system', label: '시스템 설정', icon: ComputerDesktopIcon }
  ]

  const notificationSettings = [
    { key: 'taskMentions', label: '업무 멘션', description: '업무에서 나를 언급했을 때' },
    { key: 'projectUpdates', label: '프로젝트 업데이트', description: '참여 중인 프로젝트의 새로운 소식' },
    { key: 'applicationApproval', label: '지원서 승인', description: '프로젝트 지원서가 승인되었을 때' },
    { key: 'deadlineReminders', label: '마감일 알림', description: '업무 마감일이 다가왔을 때' },
    { key: 'systemAnnouncements', label: '시스템 공지', description: '워클리의 새로운 기능이나 공지사항' }
  ]

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-[720px] mx-auto px-0 md:px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">설정</h1>
        </div>
      </div>

      {/* 설정 내용 */}
      <div className="max-w-[720px] mx-auto p-4 md:p-6 space-y-8">
        {/* 언어 설정 */}
        <SettingSection 
          title="언어 설정"
          description="앱에서 사용할 언어를 선택하세요"
        >
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  language === lang.code 
                    ? 'bg-accent text-foreground' 
                    : 'hover:bg-accent/50 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-sm text-muted-foreground">{lang.name}</div>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* 테마 설정 */}
        <SettingSection 
          title="화면 테마"
          description="라이트 모드, 다크 모드, 또는 시스템 설정을 따릅니다"
        >
          <div className="space-y-2">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              return (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    theme === themeOption.value 
                      ? 'bg-accent text-foreground' 
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{themeOption.label}</span>
                  </div>
                  {theme === themeOption.value && (
                    <div className="w-2 h-2 bg-foreground rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </SettingSection>

        {/* 알림 설정 */}
        <SettingSection 
          title="알림 설정"
          description="받고 싶은 알림을 선택하세요"
        >
          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <BellIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{setting.label}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange(setting.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground ${
                    notifications[setting.key as keyof typeof notifications]
                      ? 'bg-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[setting.key as keyof typeof notifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* 추가 옵션 */}
        <div className="pt-8 border-t border-border">
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-accent rounded-lg transition-colors">
              <span className="text-foreground">계정 정보</span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-accent rounded-lg transition-colors">
              <span className="text-foreground">데이터 내보내기</span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-accent rounded-lg transition-colors">
              <span className="text-foreground">도움말</span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-accent rounded-lg transition-colors text-red-600">
              <span>로그아웃</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}