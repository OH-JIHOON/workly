import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LeftNavigation from '@/components/navigation/LeftNavigation'
import MobileNavigation from '@/components/navigation/MobileNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '워클리 - 업무 관리 플랫폼',
  description: '효율적인 업무 관리와 팀 협업을 위한 올인원 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {/* 좌측 네비게이션 (데스크톱) */}
          <LeftNavigation />
          
          {/* 메인 콘텐츠 */}
          <div className="md:ml-18">
            {children}
          </div>
          
          {/* 하단 네비게이션 (모바일) */}
          <MobileNavigation />
        </div>
      </body>
    </html>
  )
}