import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Manually parse .env.local because dotenv is being flaky
function getEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) {
            env[key.trim()] = val.join('=').trim().replace(/"/g, '');
        }
    });
    return env;
}

const env = getEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing keys", { supabaseUrl, hasKey: !!supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Resetting all reach and clicks to 0...");
    const { error } = await supabase.from('posts').update({ reach: 0, clicks: 0 }).neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
    if (error) console.error("Update error:", error);
    else console.log("✅ Reset all posts to 0!");
}
    
    // Also check total stats
    const { data: allPosts } = await supabase.from('posts').select('id, reach, clicks');
    console.log("All individual reach values:", allPosts?.map(p => p.reach));
    const totalReach = allPosts?.reduce((sum, p) => sum + (p.reach || 0), 0);
    console.log("Current Total Reach in DB:", totalReach);
}

fix();
