import axios from 'axios';

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export const postToFacebook = async (pageId: string, accessToken: string, message: string) => {
  try {
    const response = await axios.post(`${FB_GRAPH_URL}/${pageId}/feed`, {
      message,
      access_token: accessToken,
    });
    return response.data;
  } catch (error: any) {
    console.error('Facebook posting error:', error.response?.data || error.message);
    throw error;
  }
};

export const postComment = async (postId: string, accessToken: string, message: string) => {
  try {
    const response = await axios.post(`${FB_GRAPH_URL}/${postId}/comments`, {
      message,
      access_token: accessToken,
    });
    return response.data;
  } catch (error: any) {
    console.error('Facebook comment error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPageInsights = async (pageId: string, accessToken: string) => {
  const metrics = [
    'page_impressions',
    'page_engaged_users',
    'page_views_total'
  ].join(',');

  try {
    const response = await axios.get(`${FB_GRAPH_URL}/${pageId}/insights`, {
      params: {
        metric: metrics,
        period: 'day',
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Facebook insights error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPostInsights = async (postId: string, accessToken: string) => {
  try {
    let insightsData: any[] = [];
    
    // 1. Try standard insights metric (might fail with #100 for some post types or pages)
    try {
      const insightsRes = await axios.get(`${FB_GRAPH_URL}/${postId}/insights`, {
        params: {
          metric: 'post_impressions,post_engagements',
          access_token: accessToken,
        },
      });
      insightsData = insightsRes.data.data || [];
    } catch (insightsErr: any) {
      console.warn(`[FB Insights] Insight metrics not supported for ${postId}, using fallback.`);
    }

    // 2. Fetch fallback engagement (Likes, Comments, Shares)
    let fallbackEngagement = 0;
    try {
        // First try: Get everything including nested insights
        const fallbackRes = await axios.get(`${FB_GRAPH_URL}/${postId}`, {
            params: {
                fields: 'reactions.summary(total_count),comments.summary(total_count),shares,insights.metric(post_impressions,post_engagements)',
                access_token: accessToken,
            },
        });
        
        const data = fallbackRes.data;
        const totalReactions = data.reactions?.summary?.total_count || 0;
        const totalComments = data.comments?.summary?.total_count || 0;
        const totalShares = data.shares?.count || 0;
        fallbackEngagement = totalReactions + totalComments + totalShares;

        if (data.insights?.data && insightsData.length === 0) {
            insightsData.push(...data.insights.data);
        }
    } catch (err: any) {
        // Second try: Very basic - just reactions and comments (minimal permissions needed)
        try {
            const basicRes = await axios.get(`${FB_GRAPH_URL}/${postId}`, {
                params: {
                    fields: 'reactions.summary(total_count),comments.summary(total_count)',
                    access_token: accessToken,
                },
            });
            fallbackEngagement = (basicRes.data.reactions?.summary?.total_count || 0) + 
                                 (basicRes.data.comments?.summary?.total_count || 0);
        } catch (basicErr) {
            console.warn(`[FB Very Basic] Fail for ${postId}`);
        }
    }

    return {
      data: insightsData,
      fallbackEngagement
    };
  } catch (error: any) {
    console.error(`Facebook post insights error for ${postId}:`, error.response?.data || error.message);
    throw error;
  }
};
