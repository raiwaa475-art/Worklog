import axios from 'axios';
import { NextResponse } from 'next/server';

const FB_GRAPH_URL = 'https://graph.facebook.com/v24.0';

export async function POST(request: Request) {
  try {
    const { pageId, accessToken, testPost } = await request.json();

    if (!pageId || !accessToken) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    try {
      // 1. Verify token and get user's name
      const meRes = await axios.get(`${FB_GRAPH_URL}/me`, {
        params: { access_token: accessToken }
      });
      const userName = meRes.data.name;

      // 2. Try to list user's pages to see what they HAVE access to
      let accessiblePages: any[] = [];
      try {
        const accountsRes = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
          params: { access_token: accessToken, fields: 'name,id,category' }
        });
        accessiblePages = accountsRes.data.data || [];
      } catch (e) {
        console.error("Could not fetch accounts list");
      }

      // 3. Verify specific Page ID and find its specific Page Token
      let pageData: any = null;
      let verifyError = null;
      let targetPageToken = accessToken; // Default to provided token

      // Look if this page is in the authorized accounts list
      const matchedAccount = accessiblePages.find(p => p.id === pageId);
      if (matchedAccount && matchedAccount.access_token) {
        targetPageToken = matchedAccount.access_token;
      }

      try {
        const pageRes = await axios.get(`${FB_GRAPH_URL}/${pageId}`, {
          params: { 
            fields: 'name,metadata{type},category',
            metadata: 1,
            access_token: targetPageToken 
          }
        });
        pageData = pageRes.data;
      } catch (e: any) {
        verifyError = e.response?.data?.error?.message || e.message;
      }

      if (pageData) {
        const type = pageData.metadata?.type || 'unknown';
        if (type !== 'page') {
          return NextResponse.json({ 
            success: false, 
            message: `ID นี้ไม่ใช่ Facebook Page (ตรวจพบว่าเป็น: ${type}) กรุณาใช้ Page ID แท้ๆ แทน Profile ID`,
            details: pageData,
            suggestedPages: accessiblePages
          });
        }

        // Test Post Logic...
        if (testPost) {
          try {
            const postRes = await axios.post(`${FB_GRAPH_URL}/${pageId}/feed`, {
              message: `🤖 Test Post from AI Affiliate System\nUser: ${userName}\nPage: ${pageData.name}\nTime: ${new Date().toLocaleString('th-TH')}\nStatus: Connection successful!`,
              access_token: targetPageToken
            });
            return NextResponse.json({ 
              success: true, 
              message: `ส่งโพสต์ทดสอบสำเร็จลงเพจ "${pageData.name}"!\n(ระบบใช้ Page Token ที่ค้นหาให้โดยอัตโนมัติ)`,
              details: postRes.data,
              autoRetrievedToken: targetPageToken // Optional: give it back to them
            });
          } catch (postError: any) {
             return NextResponse.json({ 
              success: false, 
              message: `พบเพจ "${pageData.name}" แต่โพสต์ไม่ได้: ${postError.response?.data?.error?.message || postError.message}\n(ตรวจสอบว่าแอพมีสิทธิ์ 'pages_manage_posts' หรือไม่)`,
              suggestedPages: accessiblePages
            });
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: `เชื่อมต่อสำเร็จ! พบเพจ: ${pageData.name}`,
          details: pageData,
          autoRetrievedToken: targetPageToken
        });
      } else {
        // ID not found or no permission
        let msg = `ไม่พบ Object ID '${pageId}' หรือคุณไม่มีสิทธิ์เข้าถึง`;
        if (accessiblePages.length > 0) {
          msg += `\n\nโชคดี! เราพบเพจที่คุณมีสิทธิ์เข้าถึง ${accessiblePages.length} เพจ ดังนี้:\n` + 
                 accessiblePages.map(p => `- ${p.name} (ID: ${p.id})`).join('\n') +
                 `\n\nกรุณาลองใช้ ID ที่ระบุข้างต้นแทนครับ`;
        } else {
          msg += `\n\nและเราไม่พบเพจอื่นๆ ในบัญชีนี้เลย กรุณาตรวจสอบว่า Access Token มีสิทธิ์ 'pages_manage_posts' หรือไม่`;
        }

        return NextResponse.json({ 
          success: false, 
          message: msg,
          error: verifyError,
          suggestedPages: accessiblePages
        });
      }

    } catch (fbError: any) {
      const errorData = fbError.response?.data?.error || {};
      return NextResponse.json({ 
        success: false, 
        message: `ข้อผิดพลาดจาก Facebook: ${errorData.message || fbError.message}`,
        error: errorData
      }, { status: 200 }); // Return 200 so frontend can handle message
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
