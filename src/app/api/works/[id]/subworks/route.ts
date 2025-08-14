import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { works } from '@/lib/api/works.api';
import { cookies } from 'next/headers';

// GET /api/works/[id]/subworks - 하위 워크 조회
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

    const { data, error } = await works.getSubworks(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      meta: {
        parentId: params.id,
        count: data.length
      }
    });

  } catch (error) {
    console.error(`GET /api/works/${params.id}/subworks error:`, error);
    return NextResponse.json(
      { error: '하위 워크 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}