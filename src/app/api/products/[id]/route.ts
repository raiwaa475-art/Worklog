import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const id = params.id;

    // Optional mapping from frontend to db schema
    const updatePayload: any = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.price !== undefined) updatePayload.price = parseFloat(body.price);
    if (body.affiliateLink !== undefined) updatePayload.affiliate_link = body.affiliateLink;
    if (body.sales !== undefined) {
        updatePayload.sales = typeof body.sales === 'string' ? parseInt(body.sales.replace(/[^0-9]/g, '') || '0', 10) : body.sales;
    }
    if (body.status !== undefined) updatePayload.status = body.status;

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
