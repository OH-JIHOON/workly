'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import TrustedTypesScript from '@/components/TrustedTypesScript'
import { useAuth } from '@/lib/stores/auth.store';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    useAuth.getState().init();
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
