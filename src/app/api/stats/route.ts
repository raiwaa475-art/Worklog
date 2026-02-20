import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export async function GET() {
  try {
    // 1. Fetch Posts
    const { data: allPosts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    let totalReach = 0;
    let totalClicks = 0;
    
    // Aggregate posts by day for the calendar
    const dailyStats: Record<string, { posts: number; reach: number }> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    last30Days.forEach(day => {
        dailyStats[day] = { posts: 0, reach: 0 };
    });

    const itemFreq: Record<string, number> = {};

    (allPosts || []).forEach(post => {
        const date = post.created_at ? new Date(post.created_at) : new Date();
        const dayKey = date.toISOString().split('T')[0];
        
        if (dailyStats[dayKey]) {
            dailyStats[dayKey].posts += 1;
            const reach = post.reach || 0;
            const clicks = post.clicks || 0;
            dailyStats[dayKey].reach += reach;
            totalReach += reach;
            totalClicks += clicks;
        }

        const items = post.selected_items || [];
        items.forEach((item: string) => {
            itemFreq[item] = (itemFreq[item] || 0) + 1;
        });
    });

    const topItemsData = Object.entries(itemFreq)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const calendarData = Object.entries(dailyStats).map(([date, data]) => ({
        date,
        ...data
    }));

    const recentPosts = (allPosts || []).slice(0, 5);

    // 2. Fetch Products
    const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('category');
        
    if (productsError) throw productsError;

    const totalProducts = allProducts?.length || 0;
    const categoryMap: Record<string, number> = {};
    
    (allProducts || []).forEach(product => {
        const cat = product.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryStats = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
    })).sort((a, b) => b.value - a.value);

    // Benchmarking (KPI)
    const REACH_TARGET = 5000;
    const cvr = totalReach > 0 ? ((totalClicks / totalReach) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      recentPosts,
      totalProducts,
      categoryStats,
      calendarData,
      topItemsData,
      stats: {
        totalReach,
        totalReachFormatted: totalReach.toLocaleString(), 
        totalClicks,
        totalClicksFormatted: totalClicks.toLocaleString(),
        activeProducts: totalProducts,
        dailyAvgView: (totalReach / Math.max(allPosts?.length || 1, 1)).toFixed(0),
        cvr: cvr + "%",
        reachTarget: REACH_TARGET,
        reachProgress: Math.min(Math.round((totalReach / REACH_TARGET) * 100), 100)
      },
      connections: {
        facebook: !!(process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN),
        gemini: !!process.env.GEMINI_API_KEY
      }
    });
  } catch (error: any) {
    console.error("API Stats Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
