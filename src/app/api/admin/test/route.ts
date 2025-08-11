/**
 * 관리자 권한 테스트 API
 * 비대칭 암호화 기반 관리자 권한 검증 테스트
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth/server-auth-helpers';

export const GET = withAdminAuth(async (request: NextRequest, context) => {
  const { user, session } = context;
  
  console.log('✅ 관리자 API 접근 성공:', {
    userId: user.id,
    email: user.email,
    role: user.role || user.user_metadata?.role,
    adminRole: user.app_metadata?.admin_role
  });

  return NextResponse.json({
    success: true,
    message: '관리자 권한 인증 성공',
    data: {
      adminUser: {
        id: user.id,
        email: user.email,
        role: user.role || user.user_metadata?.role || 'member',
        adminRole: user.app_metadata?.admin_role,
        permissions: getAdminPermissions(user.app_metadata?.admin_role || user.role)
      },
      session: {
        expiresAt: session.expires_at,
        isValid: session.expires_at ? session.expires_at > Math.floor(Date.now() / 1000) : false
      },
      verification: {
        method: 'asymmetric_cryptography_admin',
        algorithm: 'ECC_P256',
        timestamp: new Date().toISOString()
      }
    }
  });
});

export const POST = withAdminAuth(async (request: NextRequest, context) => {
  const { user } = context;
  
  try {
    const body = await request.json();
    const { operation } = body;
    
    switch (operation) {
      case 'user_list':
        // 사용자 목록 조회 (모의 데이터)
        return NextResponse.json({
          success: true,
          message: '사용자 목록 조회 성공',
          data: {
            users: [
              {
                id: 'user-001',
                email: 'user1@example.com',
                role: 'member',
                status: 'active'
              },
              {
                id: 'user-002', 
                email: 'user2@example.com',
                role: 'manager',
                status: 'active'
              }
            ],
            total: 2,
            adminUserId: user.id
          }
        });
        
      case 'system_stats':
        // 시스템 통계 조회 (모의 데이터)
        return NextResponse.json({
          success: true,
          message: '시스템 통계 조회 성공',
          data: {
            stats: {
              totalUsers: 150,
              activeUsers: 142,
              totalTasks: 1250,
              completedTasks: 890
            },
            timestamp: new Date().toISOString(),
            requestedBy: user.email
          }
        });
        
      case 'audit_log':
        // 감사 로그 조회 (모의 데이터)
        return NextResponse.json({
          success: true,
          message: '감사 로그 조회 성공',
          data: {
            auditLogs: [
              {
                id: 'audit-001',
                action: 'user_login',
                userId: 'user-001',
                timestamp: new Date().toISOString(),
                details: 'Successful login via Google OAuth'
              },
              {
                id: 'audit-002',
                action: 'admin_access',
                userId: user.id,
                timestamp: new Date().toISOString(),
                details: 'Admin API accessed'
              }
            ],
            total: 2,
            requestedBy: user.email
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: '지원하지 않는 operation입니다'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('POST /api/admin/test 오류:', error);
    return NextResponse.json({
      success: false,
      error: '요청 처리 중 오류가 발생했습니다'
    }, { status: 500 });
  }
});

// 관리자 권한별 permissions 매핑
function getAdminPermissions(adminRole: string): string[] {
  const permissionsMap: { [key: string]: string[] } = {
    'super_admin': [
      'admin:users:read',
      'admin:users:write',
      'admin:users:delete',
      'admin:system:read',
      'admin:system:write',
      'admin:audit:read',
      'admin:settings:write'
    ],
    'admin': [
      'admin:users:read',
      'admin:users:write',
      'admin:system:read',
      'admin:audit:read'
    ],
    'moderator': [
      'admin:users:read',
      'admin:system:read'
    ],
    'support': [
      'admin:users:read'
    ]
  };
  
  return permissionsMap[adminRole] || [];
}