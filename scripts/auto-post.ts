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
    const avoidRecent = true; // Auto-post should always try to avoid repetition

    console.log("🧠 Fetching generated info from Gemini...");

    // Fetch the last few posts to identify recently used items
    const { data: recentPostsForFilter } = await supabase
        .from('posts')
        .select('caption, selected_items')
        .order('created_at', { ascending: false })
        .limit(10);
        
    const lastPostCaption = recentPostsForFilter?.[0]?.caption || '';
    
    // Get list of recently used product names
    const recentlyUsedItems = new Set<string>();
    recentPostsForFilter?.forEach(p => {
        if (Array.isArray(p.selected_items)) {
            p.selected_items.forEach((item: string) => recentlyUsedItems.add(item));
        }
    });

    let filteredProducts = products;
    if (avoidRecent && recentlyUsedItems.size > 0) {
        // Filter out products that were used recently
        filteredProducts = products.filter(p => !recentlyUsedItems.has(p.name));
        
        // If we filtered out too many, fallback to original list
        if (filteredProducts.length < productCount) {
            console.log("⚠️ Too many products filtered, falling back to original list for variety.");
            filteredProducts = products;
        } else {
            console.log(`✅ Filtered out ${products.length - filteredProducts.length} recently used products.`);
        }
    }

    const dataForGemini = filteredProducts.map((p: any) => ({
      name: p.name,
      price: p.price,
      sales: p.sales
    }));

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
    
    // 5. Auto-Sync past posts' stats
    console.log("🔄 Auto-syncing stats from previous posts...");
    try {
        const { getPostInsights } = await import('../src/lib/facebook');
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);
            
        if (recentPosts && recentPosts.length > 0) {
            let updatedCount = 0;
            for (const p of recentPosts) {
                if (!p.fb_post_id) continue;
                try {
                    const insightsResponse = await getPostInsights(p.fb_post_id, accessToken);
                    const insightsData = insightsResponse.data;
                    let newReach = p.reach || 0;
                    let newClicks = p.clicks || 0;
                    
                    if (insightsData && Array.isArray(insightsData) && insightsData.length > 0) {
                        const reachMetric = insightsData.find((m: any) => m.name === 'post_impressions');
                        const engagedMetric = insightsData.find((m: any) => m.name === 'post_engagements');
                        if (reachMetric?.values?.[0]?.value !== undefined) newReach = reachMetric.values[0].value;
                        if (engagedMetric?.values?.[0]?.value !== undefined) newClicks = engagedMetric.values[0].value;
                    } else if (insightsResponse.fallbackEngagement !== undefined) {
                        newClicks = insightsResponse.fallbackEngagement;
                    }
                    
                    if (newReach !== p.reach || newClicks !== p.clicks) {
                        await supabase.from('posts').update({ reach: newReach, clicks: newClicks }).eq('id', p.id);
                        updatedCount++;
                    }
                } catch(e) {}
            }
            console.log(`✅ Auto-synced ${updatedCount} posts from Facebook!`);
        }
    } catch(err) {
        console.error("⚠️ Failed to auto-sync stats:", err);
    }

    console.log("🎊 All tasks completed successfully!");
    process.exit(0);

  } catch (error: any) {
    console.error('Core Engine Error:', error);
    process.exit(1);
  }
}

runAutoPost();
