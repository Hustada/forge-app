#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment or command line
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  console.log('\nExample:');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co VITE_SUPABASE_ANON_KEY=your-key node scripts/setup-database.js');
  process.exit(1);
}

console.log('🔥 Setting up Forge database...\n');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Read the SQL schema file
    const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    console.log('📝 Running database schema...');
    
    // Note: Supabase doesn't support running raw SQL through the client library
    // You need to run this in the Supabase dashboard SQL editor
    console.log('\n⚠️  IMPORTANT: You need to run the following SQL in your Supabase dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bkcfpoifzfjhxrgwplck/sql');
    console.log('2. Copy and paste the contents of supabase/schema.sql');
    console.log('3. Click "Run"\n');
    
    // Test if tables exist
    console.log('🔍 Checking if tables exist...');
    
    const { data: programs, error: programsError } = await supabase
      .from('forge_programs')
      .select('id')
      .limit(1);
    
    if (programsError?.message?.includes('does not exist')) {
      console.log('❌ Table "forge_programs" does not exist');
      console.log('Please run the schema.sql file in Supabase dashboard first!\n');
      return false;
    }
    
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('id')
      .limit(1);
    
    if (logsError?.message?.includes('does not exist')) {
      console.log('❌ Table "daily_logs" does not exist');
      console.log('Please run the schema.sql file in Supabase dashboard first!\n');
      return false;
    }
    
    console.log('✅ Tables exist!');
    console.log('\n🎉 Database is ready for The Forge!');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return false;
  }
}

setupDatabase().then((success) => {
  if (!success) {
    console.log('\n📋 Quick Setup Instructions:');
    console.log('1. Open: https://supabase.com/dashboard/project/bkcfpoifzfjhxrgwplck/sql');
    console.log('2. Copy the entire contents of supabase/schema.sql');
    console.log('3. Paste it in the SQL editor');
    console.log('4. Click "Run"');
    console.log('5. Run this script again to verify');
  }
  process.exit(success ? 0 : 1);
});