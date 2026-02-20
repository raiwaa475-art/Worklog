import { getDb } from '../src/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or PUBLISHABLE_DEFAULT_KEY) in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    const db = getDb();

    console.log("📦 Migrating products...");
    const productsSnap = await db.collection('products').get();
    for (const doc of productsSnap.docs) {
        const data = doc.data();
        
        let salesInt = 0;
        if (typeof data.sales === 'string') {
            salesInt = parseInt(data.sales.replace(/[^0-9]/g, '') || '0', 10);
        } else {
            salesInt = data.sales || 0;
        }

        const { error } = await supabase.from('products').upsert({
            id: doc.id,
            name: data.name || 'Unnamed',
            category: data.category || 'General',
            price: Number(data.price) || 0,
            affiliate_link: data.affiliateLink || data.affiliate_link || '',
            sales: salesInt,
            status: data.status || 'active',
            created_at: data.createdAt || data.created_at || new Date().toISOString()
        });

        if (error) {
            console.error(`🚨 Failed to insert product ${doc.id}:`, error.message);
        }
    }
    console.log(`✅ Migrated ${productsSnap.size} products!`);

    console.log("\n📦 Migrating posts...");
    const postsSnap = await db.collection('posts').get();
    for (const doc of postsSnap.docs) {
        const data = doc.data();
        let createdAt = new Date().toISOString();

        if (data.created_at) {
            createdAt = (data.created_at.toDate ? data.created_at.toDate() : new Date(data.created_at)).toISOString();
        }

        const { error } = await supabase.from('posts').upsert({
            id: doc.id,
            caption: data.caption || '',
            theme: data.theme || 'General',
            selected_items: data.selected_items || [],
            fb_post_id: data.fb_post_id || null,
            reach: data.reach || 0,
            clicks: data.clicks || 0,
            created_at: createdAt
        });

        if (error) {
            console.error(`🚨 Failed to insert post ${doc.id}:`, error.message);
        }
    }
    console.log(`✅ Migrated ${postsSnap.size} posts!`);
    
    console.log("\n🎉 Migration complete!");
}

migrate().catch(console.error);
