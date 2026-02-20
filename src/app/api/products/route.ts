import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map to preserve existing frontend expectation fields (like createdAt -> created_at, affiliateLink -> affiliate_link)
    const mappedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      affiliateLink: product.affiliate_link,
      sales: product.sales,
      status: product.status,
      createdAt: product.created_at
    }));

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("API Products GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-generate some fields if missing for consistency
    const newProduct = {
      id: crypto.randomUUID(),
      name: body.name || "Unnamed Product",
      category: body.category || "General",
      price: parseFloat(body.price) || 0,
      affiliate_link: body.affiliateLink || "",
      sales: typeof body.sales === 'string' ? parseInt(body.sales.replace(/[^0-9]/g, '') || '0', 10) : (body.sales || 0),
      status: "active"
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select().single();

    if (error) throw error;

    return NextResponse.json({
        id: data.id,
        name: data.name,
        category: data.category,
        price: data.price,
        affiliateLink: data.affiliate_link,
        sales: data.sales,
        status: data.status,
        createdAt: data.created_at
    });
  } catch (error: any) {
    console.error("API Products POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
