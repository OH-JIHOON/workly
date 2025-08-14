import { NextRequest, NextResponse } from 'next/server';
import { works } from '@/lib/api/works.api';
import { createClient } from '@/lib/supabase/server';
import type { WorkQueryDto, CreateWorkDto } from '@/types/work.types';

// GET /api/works - 워크 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /works 호출됨');
    
    const supabase = await createClient();

    // getUser API 사용 - 서버 사이드 인증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ 사용자 인증 실패:', authError?.message || 'user 없음');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    console.log('✅ 사용자 인증 성공, 사용자 ID:', user.id, 'Email:', user.email);
    const userId = user.id;

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const filters: WorkQueryDto = {
      status: searchParams.get('status') as any,
      priority: searchParams.get('priority') as any,
      type: searchParams.get('type') as any,
      projectId: searchParams.get('projectId') || undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'ASC' | 'DESC' || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      dueDate: searchParams.get('dueDate') || undefined,
    };

    const { data, error } = await works.list(userId, filters, supabase);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      meta: {
        userId: userId,
        filters
      }
    });

  } catch (error) {
    console.error('GET /api/works error:', error);
    return NextResponse.json(
      { error: '워크 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/works - 새 워크 생성
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /works POST 호출됨');
    
    const supabase = await createClient();

    // getUser API 사용 - 서버 사이드 인증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ 사용자 인증 실패:', authError?.message || 'user 없음');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    console.log('✅ 사용자 인증 성공, 사용자 ID:', user.id, 'Email:', user.email);
    const userId = user.id;

    // 요청 본문 파싱
    const body: CreateWorkDto = await request.json();

    // 필수 필드 검증
    if (!body.title) {
      return NextResponse.json({ error: '워크 제목은 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await works.create(body, userId, supabase);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('POST /api/works error:', error);
    return NextResponse.json(
      { error: '워크 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}