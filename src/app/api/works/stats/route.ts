import { NextRequest, NextResponse } from 'next/server';
import { works } from '@/lib/api/works.api';
import { createClient } from '@/lib/supabase/server';

// GET /api/works/stats - 사용자 워크 통계 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /works/stats 호출됨');
    
    const supabase = await createClient();

    // getUser API 사용 - 서버 사이드 인증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ 사용자 인증 실패:', authError?.message || 'user 없음');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    console.log('✅ 사용자 인증 성공, 사용자 ID:', user.id);
    const userId = user.id;

    // 통계 조회
    const { data, error } = await works.getStats(userId, supabase);
    
    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : '통계 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      meta: {
        userId,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('GET /api/works/stats error:', error);
    return NextResponse.json(
      { error: '워크 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}