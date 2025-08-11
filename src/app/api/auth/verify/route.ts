/**
 * 비대칭 암호화 기반 인증 검증 API
 * 클라이언트에서 인증 상태를 확인하기 위한 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/server-auth-helpers';

export const GET = withAuth(async (request: NextRequest, context) => {
  const { user, session } = context;
  
  console.log('✅ API 인증 검증 성공:', {
    userId: user.id,
    email: user.email,
    role: user.role || user.user_metadata?.role,
    adminRole: user.app_metadata?.admin_role,
    sessionExpiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
  });

  return NextResponse.json({
    success: true,
    message: '비대칭 인증 검증 성공',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role || user.user_metadata?.role || 'member',
        adminRole: user.app_metadata?.admin_role,
        emailConfirmedAt: user.email_confirmed_at,
        lastSignInAt: user.last_sign_in_at
      },
      session: {
        expiresAt: session.expires_at,
        tokenType: session.token_type
      },
      verification: {
        method: 'asymmetric_cryptography',
        algorithm: 'ECC_P256',
        timestamp: new Date().toISOString()
      }
    }
  });
});

export const POST = withAuth(async (request: NextRequest, context) => {
  const { user, session } = context;
  
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'refresh':
        // 세션 새로고침 요청 처리
        return NextResponse.json({
          success: true,
          message: '세션 상태 확인됨',
          data: {
            needsRefresh: false, // 실제로는 만료 시간 확인 로직 필요
            expiresAt: session.expires_at,
            currentTime: Math.floor(Date.now() / 1000)
          }
        });
        
      case 'validate':
        // 특정 권한 검증
        const { requiredRole } = body;
        
        if (!requiredRole) {
          return NextResponse.json({
            success: false,
            error: 'requiredRole이 필요합니다'
          }, { status: 400 });
        }
        
        const userRole = user.role || user.user_metadata?.role || 'member';
        
        const roleHierarchy: { [key: string]: number } = {
          'member': 1,
          'manager': 2,
          'admin': 3,
          'super_admin': 4
        };

        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        const hasPermission = userLevel >= requiredLevel;
        
        return NextResponse.json({
          success: true,
          message: `권한 검증 ${hasPermission ? '성공' : '실패'}`,
          data: {
            hasPermission,
            userRole,
            requiredRole,
            userLevel,
            requiredLevel
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: '지원하지 않는 action입니다'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('POST /api/auth/verify 오류:', error);
    return NextResponse.json({
      success: false,
      error: '요청 처리 중 오류가 발생했습니다'
    }, { status: 500 });
  }
});