import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeTrendAndGenerateCaption } from '@/lib/gemini';
import { postToFacebook, postComment } from '@/lib/facebook';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { data: products, error: productsError } = await supabase.from('products').select('*');
    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    const dataForGemini = products.map((p: any) => ({
      name: p.name,
      price: p.price,
      sales: p.sales
    }));

    const month = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date());
    const productCount = body.productCount || 5;
    const style = body.style || 'different';

    // Fetch the last post to provide context for style
    const { data: lastPostData } = await supabase
        .from('posts')
        .select('caption')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
    const lastPostCaption = lastPostData?.caption || '';

    const aiResult = await analyzeTrendAndGenerateCaption(
      JSON.stringify(dataForGemini), 
      month,
      process.env.GEMINI_API_KEY,
      productCount,
      style,
      lastPostCaption
    );
    
    // Add call to action to check comments
    const finalCaption = aiResult.caption + "\n\n👇 พิกัดสินค้าทั้งหมด แปะไว้ให้ในคอมเมนต์แรกนะค้าาา! 🛒✨";

    const pageId = process.env.FB_PAGE_ID || "";
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    
    if (!pageId || !accessToken) {
      throw new Error("Missing Facebook credentials");
    }

    // 1. Post original caption
    const fbResult = await postToFacebook(pageId, accessToken, finalCaption);
    const postId = fbResult.id;

    // 2. Prepare links for comment
    let commentMessage = "🛒 สนใจชิ้นไหน จิ้มพิกัดตรงนี้เลยค่าาา:\n\n";
    if (aiResult.selected_items && Array.isArray(aiResult.selected_items)) {
        aiResult.selected_items.forEach((itemName: string, index: number) => {
            const product = products.find((p: any) => p.name && itemName && p.name.includes(itemName));
            if (product && product.affiliate_link) {
                commentMessage += `${index + 1}. ${itemName}\n🔗 พิกัด: ${product.affiliate_link}\n\n`;
            }
        });
    }

    // 3. Post links as a comment (assuming postComment exists and works)
    try {
        await postComment(postId, accessToken, commentMessage);
    } catch(e) {
        console.error("Failed to post comment to FB:", e);
    }

    // 4. Save to Supabase
    const { error: insertError } = await supabase.from('posts').insert([{
      id: crypto.randomUUID(),
      fb_post_id: postId,
      caption: finalCaption,
      theme: month,
      selected_items: aiResult.selected_items || [],
      reach: 0,
      clicks: 0
    }]);
    
    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      message: 'AI content and links in comment posted successfully',
      post_id: postId
    });

  } catch (error: any) {
    console.error('Core Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
