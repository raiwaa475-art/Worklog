import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("API History Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
