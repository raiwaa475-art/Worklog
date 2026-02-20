import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env files properly when running as script
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { supabase } from '../src/lib/supabase';
import { analyzeTrendAndGenerateCaption } from '../src/lib/gemini';
import { postToFacebook, postComment } from '../src/lib/facebook';
import crypto from 'crypto';

async function runAutoPost() {
  console.log("🚀 Starting Auto-Post Engine...");

  try {
    const { data: products, error: productsError } = await supabase.from('products').select('*');
    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      console.log("❌ No products found in Supabase.");
      process.exit(1);
    }

    const dataForGemini = products.map((p: any) => ({
      name: p.name,
      price: p.price,
      sales: p.sales
    }));

    const month = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date());
    const productCount = 5; // Default for auto-post
    const style = 'different';

    console.log("🧠 Fetching generated info from Gemini...");

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

    console.log("📝 Posting to Facebook...");
    // 1. Post original caption
    const fbResult = await postToFacebook(pageId, accessToken, finalCaption);
    const postId = fbResult.id;
    console.log(`✅ Success! Post ID: ${postId}`);

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

    // 3. Post links as a comment
    try {
        await postComment(postId, accessToken, commentMessage);
        console.log("✅ Comment posted successfully.");
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
    
    console.log("💾 Saved to Supabase History!");
    process.exit(0);

  } catch (error: any) {
    console.error('Core Engine Error:', error);
    process.exit(1);
  }
}

runAutoPost();
