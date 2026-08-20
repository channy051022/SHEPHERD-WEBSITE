/**
 * BibleNote (SHEPHERD) - Admin Account Seeder Script
 *
 * Usage:
 *   node scripts/seed-admin.js
 *   npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env if exists
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  
  const target = fs.existsSync(envLocalPath) ? envLocalPath : fs.existsSync(envPath) ? envPath : null;
  if (!target) return {};

  const lines = fs.readFileSync(target, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        env[key] = value;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

const ADMIN_EMAIL = 'admin@shepherd.app';
const ADMIN_PASSWORD = 'ShepherdAdmin2026!';

console.log('----------------------------------------------------');
console.log('🐑 BibleNote (SHEPHERD) - Admin Account Seeder');
console.log('----------------------------------------------------');
console.log(`👤 Target Admin Email:    ${ADMIN_EMAIL}`);
console.log(`🔑 Target Admin Password: ${ADMIN_PASSWORD}`);
console.log('----------------------------------------------------');

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
  console.log('\n⚠️  Remote Supabase credentials not detected in .env file.');
  console.log('✨ No problem! The BibleNote Web Portal has BUILT-IN OFFLINE/DEMO AUTH:');
  console.log('   - Navigate to /admin in your browser.');
  console.log(`   - Log in with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('----------------------------------------------------\n');
  process.exit(0);
}

console.log(`🔗 Connecting to Supabase at: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSeed() {
  try {
    console.log('⚙️  Creating / synchronizing admin user in Supabase Auth...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          full_name: 'Shepherd Administrator',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered')) {
        console.log('ℹ️  User already registered. Trying to log in to verify credentials...');
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        if (signInError) {
          console.warn('⚠️  Could not login with default password. You may run "supabase/seed.sql" in Supabase SQL Editor to reset it.');
        } else {
          console.log('✅ Admin login verified successfully!');
        }
      } else {
        console.warn('⚠️  Supabase Auth sign up notice:', signUpError.message);
      }
    } else {
      console.log('✅ Admin user successfully registered in Supabase Auth:', signUpData.user?.email);
    }

    console.log('\n🎉 Admin account setup completed!');
    console.log('You can now log in to the web app using:');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

runSeed();
