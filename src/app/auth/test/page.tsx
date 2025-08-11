/**
 * 단순한 Supabase 인증 테스트 페이지
 * supabase.auth.getClaims() API 테스트
 */

'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/lib/stores/auth.store';

export default function AuthTestPage() {
  const { user, session, isAuthenticated, getClaims, signInWithGoogle, signOut } = useSupabaseAuth();
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

    await runTest('getClaims API 호출', async () => {
      return await getClaims();
    });

    await runTest('현재 세션 상태', async () => {
      return {
        hasUser: !!user,
        hasSession: !!session,
        isAuthenticated,
        userEmail: user?.email,
        userRole: user?.role
      };
    });

    if (isAuthenticated && session) {
      await runTest('세션 만료 시간', async () => {
        return {
          expiresAt: session.expires_at,
          expiresAtDate: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          isExpired: session.expires_at ? Date.now() > session.expires_at * 1000 : false
        };
      });
    }

    setIsRunningTests(false);
  };

  const handleLogin = async () => {
    try {
      console.log('🔑 로그인 시도');
      const result = await signInWithGoogle(`${window.location.origin}/auth/callback`);
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
      await signOut();
    } catch (error) {
      console.error('로그아웃 예외:', error);
      alert('로그아웃 중 오류가 발생했습니다');
    }
  };

  const handleGetClaims = async () => {
    try {
      const claims = await getClaims();
      alert(`Claims: ${JSON.stringify(claims, null, 2)}`);
    } catch (error) {
      console.error('getClaims 오류:', error);
      alert('getClaims 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔒 단순한 Supabase 인증 테스트
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
                  onClick={handleGetClaims}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                >
                  📋 getClaims 호출
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
              📋 단순한 Supabase 인증 시스템
            </h3>
            <div className="text-blue-700 space-y-2">
              <p>• supabase.auth.getClaims() API 사용</p>
              <p>• 기본 Supabase 인증과 세션 관리</p>
              <p>• 복잡한 비대칭 암호화 로직 제거</p>
              <p>• 단순하고 직관적인 인증 플로우</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}