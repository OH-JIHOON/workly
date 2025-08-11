/**
 * 비대칭 암호화 인증 테스트 페이지
 * 새로운 인증 시스템의 동작을 확인하기 위한 테스트 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/stores/auth.store';
import { asymmetricAuth, type AuthVerificationResult } from '@/lib/auth/asymmetric-auth';
import { auth } from '@/lib/api/auth.api';

export default function AuthTestPage() {
  const { user, session, isAuthenticated, verifyAuthentication, validatePermissions, refreshAuthClaims } = useSupabaseAuth();
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    console.log(`🧪 테스트 시작: ${testName}`);
    try {
      const startTime = Date.now();
      const result = await testFn();
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          result,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log(`✅ 테스트 성공: ${testName}`, result);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      }));
      
      console.error(`❌ 테스트 실패: ${testName}`, error);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});

    await runTest('클라이언트 비대칭 검증', async () => {
      return await asymmetricAuth.verifyClientToken();
    });

    await runTest('Auth Store 검증', async () => {
      return await verifyAuthentication();
    });

    await runTest('Auth API 세션 조회', async () => {
      return await auth.getSession();
    });

    await runTest('Auth API 사용자 조회', async () => {
      return await auth.getUser();
    });

    await runTest('토큰 직접 검증', async () => {
      return await auth.verifyToken();
    });

    await runTest('관리자 권한 확인', async () => {
      return await auth.isAdmin();
    });

    await runTest('토큰 만료 확인', async () => {
      return await auth.isTokenExpired();
    });

    await runTest('토큰 새로고침 필요 여부', async () => {
      return await auth.needsRefresh();
    });

    if (isAuthenticated) {
      await runTest('API 인증 검증', async () => {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include'
        });
        return await response.json();
      });

      await runTest('권한 검증 (member)', async () => {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            action: 'validate',
            requiredRole: 'member'
          })
        });
        return await response.json();
      });

      await runTest('권한 검증 (admin)', async () => {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            action: 'validate',
            requiredRole: 'admin'
          })
        });
        return await response.json();
      });

      // 관리자인 경우에만 관리자 API 테스트
      const isAdminUser = await auth.isAdmin();
      if (isAdminUser) {
        await runTest('관리자 API 접근', async () => {
          const response = await fetch('/api/admin/test', {
            credentials: 'include'
          });
          return await response.json();
        });
      }
    }

    setIsRunningTests(false);
  };

  const handleLogin = async () => {
    try {
      console.log('🔑 로그인 시도');
      const result = await auth.signInWithGoogle(`${window.location.origin}/auth/callback`);
      if (result.error) {
        console.error('로그인 오류:', result.error);
        alert(`로그인 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('로그인 예외:', error);
      alert('로그인 중 오류가 발생했습니다');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 로그아웃 시도');
      await auth.signOut();
    } catch (error) {
      console.error('로그아웃 예외:', error);
      alert('로그아웃 중 오류가 발생했습니다');
    }
  };

  const handleRefreshClaims = async () => {
    try {
      await refreshAuthClaims();
      alert('클레임이 새로고침되었습니다');
    } catch (error) {
      console.error('클레임 새로고침 오류:', error);
      alert('클레임 새로고침 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔒 비대칭 암호화 인증 테스트
          </h1>

          {/* 인증 상태 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">현재 인증 상태</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">인증 여부:</p>
                <p className={`font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅ 인증됨' : '❌ 미인증'}
                </p>
              </div>
              
              {user && (
                <div>
                  <p className="text-sm text-gray-600">사용자 정보:</p>
                  <p className="font-semibold text-blue-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    역할: {user.role || 'member'} 
                    {user.admin_role && ` (관리자: ${user.admin_role})`}
                  </p>
                </div>
              )}
              
              {session && (
                <div>
                  <p className="text-sm text-gray-600">세션 만료:</p>
                  <p className="font-semibold text-orange-600">
                    {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '정보 없음'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="mb-6 flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
              >
                🔑 Google 로그인
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
                >
                  🚪 로그아웃
                </button>
                <button
                  onClick={handleRefreshClaims}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                >
                  🔄 클레임 새로고침
                </button>
              </>
            )}
            
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className={`px-4 py-2 rounded-md font-semibold ${
                isRunningTests 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isRunningTests ? '🔄 테스트 실행 중...' : '🧪 전체 테스트 실행'}
            </button>
          </div>

          {/* 테스트 결과 */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">테스트 결과</h2>
              
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={testName}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅' : '❌'} {testName}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {result.duration && `${result.duration}ms`}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(result.success ? result.result : result.error, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {result.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 설명 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔒 비대칭 암호화 인증 시스템
            </h3>
            <div className="text-blue-700 space-y-2">
              <p>• ECC (P-256) 알고리즘 기반 JWT 검증</p>
              <p>• 서버는 더 이상 대칭키를 보관하지 않음</p>
              <p>• Supabase의 공개키를 사용한 안전한 토큰 검증</p>
              <p>• 클라이언트와 서버 모두에서 일관된 인증 검증</p>
              <p>• 권한 기반 접근 제어 (RBAC) 지원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}