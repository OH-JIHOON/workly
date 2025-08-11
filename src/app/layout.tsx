'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import TrustedTypesScript from '@/components/TrustedTypesScript'
import { useSupabaseAuth } from '@/lib/stores/auth.store';

const inter = Inter({ subsets: ['latin'] })

// Metadata는 더 이상 export할 수 없습니다. 필요 시 부모 레이아웃이나 페이지에서 처리해야 합니다.
// export const metadata: Metadata = {
//   title: '워클리 - 업무 관리 플랫폼',
//   description: '효율적인 업무 관리와 팀 협업을 위한 올인원 플랫폼',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    useSupabaseAuth.getState().initialize();
  }, []);

  return (
    <html lang="ko">
      <head>
        <TrustedTypesScript />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}