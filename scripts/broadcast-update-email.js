/**
 * BibleNote (SHEPHERD) - SMTP Email Broadcast Script
 * 
 * Usage:
 *   node scripts/broadcast-update-email.js
 *   npm run broadcast
 *   node scripts/broadcast-update-email.js v1.0.2
 */

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const smtpHost = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER || env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS || env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || env.SMTP_FROM || `"BibleNote (SHEPHERD)" <${smtpUser || 'updates@biblenote.app'}>`;
const websiteUrl = process.env.VITE_WEBSITE_URL || env.VITE_WEBSITE_URL || 'https://biblenote.app';

console.log('====================================================');
console.log('🕊️  BibleNote (SHEPHERD) - Release Update Email Broadcast');
console.log('====================================================');

if (!smtpUser || !smtpPass) {
  console.log('⚠️  SMTP credentials not detected in .env file.');
  console.log('📝 Please add the following to your .env file to enable SMTP broadcasting:');
  console.log('   SMTP_HOST=smtp.gmail.com');
  console.log('   SMTP_PORT=465');
  console.log('   SMTP_USER=your-email@gmail.com');
  console.log('   SMTP_PASS=your-gmail-app-password');
  console.log('   SMTP_FROM="BibleNote Releases" <your-email@gmail.com>\n');
  console.log('💡 Tip for Gmail: Generate an "App Password" at https://myaccount.google.com/apppasswords');
  console.log('====================================================\n');
  process.exit(0);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

async function runBroadcast() {
  try {
    // 1. Verify SMTP Connection
    console.log(`🔌 Verifying SMTP connection to ${smtpHost}:${smtpPort}...`);
    await transporter.verify();
    console.log('✅ SMTP connection authenticated successfully!');

    // 2. Fetch Active or Specified Release
    let targetVersion = process.argv[2];
    let release = null;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      if (targetVersion) {
        const { data } = await supabase.from('app_releases').select('*').eq('version', targetVersion).single();
        release = data;
      } else {
        const { data } = await supabase.from('app_releases').select('*').eq('is_active', true).single();
        release = data;
      }

      // 3. Fetch Subscribers
      console.log('👥 Fetching registered subscribers from Supabase...');
      const { data: subs, error: subsErr } = await supabase.from('subscribers').select('email').eq('is_active', true);
      
      if (subsErr || !subs || subs.length === 0) {
        console.log('ℹ️  No active subscribers found in database.');
        return;
      }

      const subscriberEmails = subs.map(s => s.email).filter(Boolean);
      console.log(`📬 Found ${subscriberEmails.length} active subscriber(s).`);

      const version = release?.version || 'v1.0.2';
      const changelog = release?.changelog || '• General performance enhancements\n• Offline SQLite Scripture search updates';
      const downloadLink = release?.download_url || `${websiteUrl}/#download`;
      const fileSize = release?.file_size_formatted || '18 MB';

      const emailSubject = `🕊️ [BibleNote Update] New Release ${version} is now available!`;

      // HTML Template
      const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; margin: 0; padding: 20px; color: #1A1817; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 2px solid #E8D8C8; border-radius: 24px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .badge { display: inline-block; padding: 4px 12px; background: #F5EBE1; color: #1E3A8A; font-weight: bold; border-radius: 12px; font-size: 12px; }
          .title { font-size: 24px; font-weight: bold; color: #1E3A8A; margin: 12px 0 6px; }
          .changelog-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px; margin: 20px 0; font-size: 14px; line-height: 1.6; white-space: pre-line; color: #334155; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: #1E3A8A; color: #ffffff !important; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 16px; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(30,58,138,0.25); }
          .footer { font-size: 11px; text-align: center; color: #64748B; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">SHEPHERD UPDATE NOTIFICATION</span>
            <div class="title">BibleNote ${version} is Ready!</div>
            <p style="font-size: 14px; color: #6B6560; margin: 0;">A new standalone Android release has just been published.</p>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #1A1817;">
            Greetings in Christ! A new update for <strong>BibleNote (SHEPHERD)</strong> is available for download on your device.
          </p>

          <div class="changelog-box">
            <strong>What's New in ${version}:</strong><br/>
            ${changelog}
          </div>

          <div class="btn-container">
            <a href="${downloadLink}" class="btn">
              ⬇️ Download Updated APK (~${fileSize})
            </a>
          </div>

          <p style="font-size: 12px; color: #64748B; line-height: 1.5; text-align: center;">
            ✓ 100% Offline SQLite Search • Dual English KJV + Cebuano Bugna • Home Screen Widgets
          </p>

          <div class="footer">
            You received this email because you downloaded BibleNote or signed up for updates on our portal.<br/>
            BibleNote (SHEPHERD) • Public Domain Scripture Companion
          </div>
        </div>
      </body>
      </html>
      `;

      console.log(`📤 Sending broadcast to ${subscriberEmails.length} recipient(s)...`);

      for (const email of subscriberEmails) {
        try {
          await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: emailSubject,
            html: htmlBody
          });
          console.log(`  ✓ Sent to: ${email}`);
        } catch (sendErr) {
          console.error(`  ✗ Failed to send to ${email}:`, sendErr.message);
        }
      }

      console.log('\n🎉 Release broadcast finished successfully!');
    }
  } catch (error) {
    console.error('❌ Broadcast error:', error);
  }
}

runBroadcast();
