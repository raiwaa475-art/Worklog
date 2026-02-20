import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiModel = (apiKey?: string, modelName = "gemini-2.5-flash") => {
  // Priority: 1. Passed apiKey 2. Env variable
  const key = (apiKey && apiKey.trim() !== "") ? apiKey : (process.env.GEMINI_API_KEY || "");
  
  if (!key || key.trim() === "") {
    throw new Error("ไม่พบ Gemini API Key กรุณาระบุรหัสในหน้า 'ตั้งค่า' หรือไฟล์ .env ให้เรียบร้อย (GEMINI_API_KEY)");
  }
  
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
};

export const analyzeTrendAndGenerateCaption = async (
  productsJson: string, 
  month: string, 
  apiKey?: string,
  productCount: number = 5,
  style: string = 'different',
  lastPostContent?: string
) => {
  try {
    const model = getGeminiModel(apiKey, "gemini-2.5-flash");
    
    let styleInstruction = "";
    if (style === 'similar' && lastPostContent) {
      styleInstruction = `จงเขียนให้มีโทนและความรู้สึกใกล้เคียงกับโพสต์ล่าสุดนี้: "${lastPostContent}" แต่อย่าก๊อปปี้คำต่อคำ`;
    } else if (style === 'different' && lastPostContent) {
      styleInstruction = `จงเขียนให้ 'แตกต่างอย่างสิ้นเชิง' จากโพสต์ล่าสุดนี้: "${lastPostContent}" ทั้งพาดหัวและสำนวนการพูด เพื่อความสดใหม่`;
    }

    const prompt = `คุณคือ AI ผู้เชี่ยวชาญด้านการตลาดดิจิทัลและ Content Creator ระดับสูง วันนี้คือเดือน${month} ปี 2026

**บริบทเทรนด์พฤติกรรมผู้บริโภคไทยต้นปี 2026:**
1. **Smart Purchasing & Value-Focused**: คนเน้นความคุ้มค่าและคุณภาพงานจริง (Long-term usage) มากกว่าสินค้าตามกระแสฉาบฉวย
2. **Health & Wellness Priority**: เทรนด์การดูแลสุขภาพเชิงป้องกัน (Pro-ageing) และการบำรุงจากภายในครองอันดับ 1
3. **Lifestyle Convenience**: สินค้าที่ช่วยแก้ปัญหาชีวิตประจำวัน (Life-hacks) หรืออุปกรณ์บ้านอัจฉริยะที่ประหยัดเวลา มียอดค้นหาพุ่งสูง

**นี่คือคลังสินค้าของคุณ:** ${productsJson}

**ภารกิจของคุณ:**
1. **วิเคราะห์และคัดเลือก**: จากฐานข้อมูล ให้เลือกสินค้าจำนวน ${productCount} ชิ้น ที่มีคุณสมบัติดังนี้:
   - **Category Focus**: พยายามเลือกสินค้าอยู่ในหมวดหมู่เดียวกันหรือใกล้เคียงกันเพื่อให้โพสต์ดูโฟกัสไม่สะเปะสะปะ
   - **Target Match**: เลือกสินค้าที่ตรงกับกลุ่มเป้าหมายเฉพาะ (เช่น วัยทำงานที่เหนื่อยล้า, คุณแม่ยุคใหม่, หรือคนรักสุขภาพ)
   - **Price Psychology**: คัดเลือกสินค้าที่มีช่วงราคาที่เหมาะสมกับกำลังซื้อและคุ้มค่าที่สุดในกลุ่มเป้าหมายนั้นๆ

2. **เขียนแคปชั่นยอดขายสูง (Facebook Copywriting)**:
   - **Headline (Hook)**: ฮุคต้องคมกริบ หยุดนิ้วคนดูได้ทันที! เน้นกระแทกใจด้วย "ความคุ้มค่าของเงินหรือเวลา" ในปี 2026 (ห้ามเริ่มด้วยคำทักทายทั่วไป) ตัวอย่างเช่น: "หยุดจ่ายให้ของตามกระแส! มัดรวม ${productCount} ไอเทมคุณภาพเน้นๆ ที่คนฉลาดเลือกใช้ลงทุนกับตัวเองในปี 2026"
   - **Visual Hierarchy**: ใช้ Emoji นำหน้าชื่อสินค้าเป็น Visual Cues ให้แยกแยะง่าย
   - **Benefit-Focused Bullets**: เขียนจุดเด่นเป็นข้อๆ เน้น "ผลที่ลูกค้าจะได้รับ" (ไม่ใช่แค่สรรพคุณ)
   - **Whitespace & Points**: ใส่จุด (.) คั่นบรรทัดว่างเพื่อให้โพสต์ดูสะอาดตา สบายตาบนมือถือ
   - **Urgency CTA**: จบด้วยการกระตุ้นให้รีบตัดสินใจ (เช่น "รุ่นนี้ผลิตน้อย", "ช้าหมดต้องรอล็อตหน้า") และย้ำให้ดูลิงก์ในคอมเมนต์
   - **Style Preference**: ${styleInstruction || 'สร้างสรรค์เนื้อหาที่น่าตื่นเต้นและดูมีความเชี่ยวชาญ'}

**ข้อกำหนดการส่งข้อมูล (JSON Only):**
ส่งข้อมูลกลับมาในรูปแบบ JSON ตามโครงสร้างนี้เท่านั้น:
{
  "caption": "เนื้อหาโพสต์ที่จัดรูปแบบแล้ว",
  "selected_items": ["ชื่อสินค้า 1", "ชื่อสินค้า 2", ...],
  "target_audience": "ระบุกลุ่มเป้าหมายที่เลือก (เช่น กลุ่มชาวออฟฟิศปวดหลัง)"
}

สำคัญ: คัดเลือกสินค้ามา ${productCount} ชิ้น และส่งกลับเฉพาะ JSON เท่านั้น`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleanJson);
  } catch (e: any) {
    console.error("Gemini Error Details:", e);
    
    if (e.message?.includes("403") || e.message?.includes("API key not valid")) {
      throw new Error("API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึงโมเดลนี้ กรุณาตรวจสอบอีกครั้ง");
    }
    
    if (e.message?.includes("not found") || e.message?.includes("model")) {
      throw new Error(`ไม่พบโมเดลชื่อนี้ หรือ API ของคุณยังไม่รองรับรุ่นนี้ กรุณาตรวจสอบรุ่นลำดับ (ปัจจุบันใช้: gemini-2.5-flash)`);
    }

    throw new Error(e.message || "เกิดข้อผิดพลาดในการประมวลผลด้วย AI");
  }
};
