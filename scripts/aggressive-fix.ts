import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Manually parse .env.local because dotenv is being flaky
function getEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')).forEach(line => {
        const index = line.indexOf('=');
        if (index > 0) {
            const key = line.substring(0, index).trim();
            const val = line.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
            env[key] = val;
        }
    });
    return env;
}

const env = getEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing keys", { supabaseUrl, hasKey: !!supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: allPosts, error } = await supabase
        .from('posts')
        .select('fb_post_id, reach, clicks')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching posts:", error);
        return;
    }

    console.log("-----------------------------------------");
    console.log("📊 รายงานข้อมูลในฐานข้อมูลล่าสุด:");
    console.table(allPosts);
    
    const totalReach = allPosts?.reduce((sum, p) => sum + (p.reach || 0), 0);
    const totalClicks = allPosts?.reduce((sum, p) => sum + (p.clicks || 0), 0);
    console.log(`\n✅ รวมทั้งหมด -> Reach: ${totalReach}, Clicks: ${totalClicks}`);
    console.log("-----------------------------------------");
}

check();
