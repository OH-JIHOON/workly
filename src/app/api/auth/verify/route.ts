import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error?.message || 'No session' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: session.user
    })
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error?.message || 'No session' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    return NextResponse.json({ 
      authenticated: true,
      user: session.user,
      action: body.action || 'verify'
    })
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}