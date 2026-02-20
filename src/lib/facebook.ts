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
  // post_impressions_unique = Reach
  // post_engaged_users = Engaged users (Clicks/Interactions)
  const metrics = [
    'post_impressions_unique',
    'post_engaged_users'
  ].join(',');

  try {
    const response = await axios.get(`${FB_GRAPH_URL}/${postId}/insights`, {
      params: {
        metric: metrics,
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Facebook post insights error for ${postId}:`, error.response?.data || error.message);
    throw error;
  }
};
