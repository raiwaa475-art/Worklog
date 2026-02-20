import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPostInsights } from '@/lib/facebook';

export async function POST() {
  try {
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Facebook credentials" }, { status: 400 });
    }

    // Get latest 30 posts from supabase to check their stats
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (fetchError) throw fetchError;
    
    if (!posts || posts.length === 0) {
       return NextResponse.json({ message: "No posts found to sync" });
    }

    let updatedCount = 0;

    for (const post of posts) {
      if (!post.fb_post_id) continue;

      try {
        const insightsResponse = await getPostInsights(post.fb_post_id, accessToken);
        const insightsData = insightsResponse.data;
        
        // Reset to 0 to wipe any old simulated data
        let newReach = 0;
        let newClicks = 0;

        if (insightsData && Array.isArray(insightsData) && insightsData.length > 0) {
           const reachMetric = insightsData.find((m: any) => m.name === 'post_impressions');
           const engagedMetric = insightsData.find((m: any) => m.name === 'post_engagements');

           if (reachMetric?.values?.[0]?.value !== undefined) {
              newReach = reachMetric.values[0].value;
           }
           if (engagedMetric?.values?.[0]?.value !== undefined) {
              newClicks = engagedMetric.values[0].value;
           }
        } else if (insightsResponse.fallbackEngagement !== undefined) {
           // If standard insights fail or return empty, use basic engagement metrics (Likes/Comments/Shares)
           newClicks = insightsResponse.fallbackEngagement;
        }

        // Only commit update if stats actually changed
        if (newReach !== post.reach || newClicks !== post.clicks) {
           await supabase
             .from('posts')
             .update({ reach: newReach, clicks: newClicks })
             .eq('id', post.id);
           updatedCount++;
        }
      } catch (err: any) {
        console.error(`Skipping sync for post ${post.fb_post_id} due to error`);
      }
    }

    return NextResponse.json({ success: true, updatedCount });

  } catch (error: any) {
    console.error('FB Sync Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
