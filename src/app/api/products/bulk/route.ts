import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
    }

    const newProducts = products.map((product: any) => ({
        id: crypto.randomUUID(),
        name: product.name,
        price: parseFloat(product.price) || 0,
        sales: typeof product.sales === 'string' ? parseInt(product.sales.replace(/[^0-9]/g, '') || '0', 10) : (product.sales || 0),
        category: product.category || 'General',
        affiliate_link: product.affiliateLink || product.affiliate_link || '',
        status: 'active'
    }));

    const { error } = await supabase.from('products').insert(newProducts);

    if (error) throw error;

    return NextResponse.json({ success: true, count: newProducts.length });
  } catch (error: any) {
    console.error('Import API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
