import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { works } from '@/lib/api/works.api';
import { cookies } from 'next/headers';
import type { UpdateWorkDto, WorkStatus } from '@/types/work.types';

// GET /api/works/[id] - 단일 워크 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // SSR에서는 쿠키 설정 불가
          }
        }
      }
    );

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data, error } = await works.get(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '워크를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error(`GET /api/works/${params.id} error:`, error);
    return NextResponse.json(
      { error: '워크 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/works/[id] - 워크 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // SSR에서는 쿠키 설정 불가
          }
        }
      }
    );

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 요청 본문 파싱
    const body: UpdateWorkDto = await request.json();

    const { data, error } = await works.update(params.id, body);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '워크를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error(`PUT /api/works/${params.id} error:`, error);
    return NextResponse.json(
      { error: '워크 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH /api/works/[id] - 워크 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // SSR에서는 쿠키 설정 불가
          }
        }
      }
    );

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 요청 본문 파싱
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: '상태값이 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await works.updateStatus(params.id, status as WorkStatus);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '워크를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error(`PATCH /api/works/${params.id} error:`, error);
    return NextResponse.json(
      { error: '워크 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/works/[id] - 워크 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // SSR에서는 쿠키 설정 불가
          }
        }
      }
    );

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error } = await works.delete(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '워크가 삭제되었습니다.' });

  } catch (error) {
    console.error(`DELETE /api/works/${params.id} error:`, error);
    return NextResponse.json(
      { error: '워크 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}