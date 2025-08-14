import { NextRequest, NextResponse } from 'next/server';
import { works } from '@/lib/api/works.api';
import { createClient } from '@/lib/supabase/server';

// GET /api/works/today - 오늘 할 일 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /works/today 호출됨');
    
    const supabase = await createClient();

    // getUser API 사용 - 서버 사이드 인증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ 사용자 인증 실패:', authError?.message || 'user 없음');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    console.log('✅ 사용자 인증 성공, 사용자 ID:', user.id);
    const userId = user.id;

    // 오늘 할 일 조회
    try {
      const { data, error } = await works.getTodayWorks(userId, supabase);
      
      if (error) {
        console.error('❌ getTodayWorks 오류:', error);
        return NextResponse.json({ 
          data: [],
          meta: {
            userId,
            date: new Date().toISOString().split('T')[0],
            count: 0,
            error: 'database_error'
          }
        });
      }

      console.log('✅ 오늘 할 일 조회 성공:', data?.length || 0, '개 작업');
      
      return NextResponse.json({ 
        data: data || [],
        meta: {
          userId,
          date: new Date().toISOString().split('T')[0],
          count: data?.length || 0
        }
      });
      
    } catch (dbError) {
      console.error('💥 getTodayWorks 호출 중 예외:', dbError);
      return NextResponse.json({ 
        data: [],
        meta: {
          userId,
          date: new Date().toISOString().split('T')[0],
          count: 0,
          error: 'critical_error'
        }
      });
    }

  } catch (error) {
    console.error('💥 GET /api/works/today 최상위 예외:', error);
    return NextResponse.json(
      { error: '오늘 할 일 조회 중 치명적 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}