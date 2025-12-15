const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL or Key not found in environment variables');
    console.warn('   Please add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY to your .env file');
    console.warn('   Note: For server-side operations, consider using SUPABASE_SERVICE_ROLE_KEY instead');
}

// Create Supabase client
// Use SERVICE_ROLE_KEY for server-side operations (bypasses RLS)
// Use ANON_KEY for client-side operations (respects RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    }
});

// Test connection
async function testSupabaseConnection() {
    try {
        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️  Supabase credentials not configured');
            return false;
        }

        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        if (error) {
            // PGRST116 = no rows returned (table exists but empty - this is OK)
            if (error.code === 'PGRST116') {
                console.log('✅ Supabase connection established successfully (table exists but empty).');
                return true;
            }
            console.error('❌ Supabase connection test failed:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to Supabase:', error.message);
        return false;
    }
}

module.exports = { supabase, testSupabaseConnection };

