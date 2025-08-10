import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '인증 - 워클리',
  description: '워클리 로그인 및 인증',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}