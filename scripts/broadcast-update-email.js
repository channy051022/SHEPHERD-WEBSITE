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
console.log('🐑  BibleNote (SHEPHERD) - Release Update Email Broadcast ✨');
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
      const { data: subs, error: subsErr } = await supabase.from('subscribers').select('*');
      
      if (subsErr) {
        console.warn(`⚠️ Supabase subscribers query notice: ${subsErr.message}`);
        console.log('💡 If RLS policy is blocking reads, run the schema.sql in your Supabase SQL Editor.');
      }

      // Check if a direct test email was provided via CLI (e.g. npm run broadcast v1.0.2 your@email.com)
      const cliCustomEmail = process.argv[3];
      let subscriberEmails = (subs || [])
        .filter(s => s.is_active !== false && s.email)
        .map(s => s.email.trim());

      if (cliCustomEmail && cliCustomEmail.includes('@')) {
        console.log(`🎯 Direct test recipient specified: ${cliCustomEmail}`);
        subscriberEmails = [cliCustomEmail];
      }

      if (subscriberEmails.length === 0) {
        console.log('ℹ️  No subscribers found in database table `subscribers`.');
        console.log('💡 Tip: You can test sending directly to your email with:');
        console.log(`   npm run broadcast ${targetVersion || 'v1.0.2'} your-email@gmail.com\n`);
        return;
      }

      console.log(`📬 Found ${subscriberEmails.length} subscriber(s) to notify.`);

      const version = release?.version || 'v1.0.2';
      const changelog = release?.changelog || '• General performance enhancements\n• Offline SQLite Scripture search updates\n• Polished UI & cute Shep interactions';
      const downloadLink = release?.download_url || `${websiteUrl}/#download`;
      const fileSize = release?.file_size_formatted || '18 MB';

      const emailSubject = `🐑 [BibleNote Update] New Release ${version} is here! ✨`;

      // CUTE SHEEP EMAIL HTML TEMPLATE
      const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BibleNote Update</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #F8F5EE;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #2D3748;
            -webkit-font-smoothing: antialiased;
          }
          table {
            border-collapse: separate;
          }
          .email-wrapper {
            width: 100%;
            background-color: #F8F5EE;
            padding: 32px 12px;
          }
          .email-container {
            max-width: 560px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 28px;
            overflow: hidden;
            border: 2px solid #E8DFD0;
            box-shadow: 0 10px 25px rgba(229, 193, 88, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
          }
          .hero-banner {
            background: linear-gradient(145deg, #FFFDF8 0%, #FEF8E8 50%, #EFF6FF 100%);
            padding: 36px 24px 28px;
            text-align: center;
            border-bottom: 2px dashed #EEDDC5;
          }
          .sheep-badge {
            display: inline-block;
            width: 72px;
            height: 72px;
            line-height: 72px;
            background: #FFFFFF;
            border-radius: 50%;
            font-size: 38px;
            text-align: center;
            box-shadow: 0 6px 16px rgba(229, 193, 88, 0.28), 0 0 0 4px #FEF3C7;
            margin-bottom: 16px;
          }
          .app-tag {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 6px 14px;
            border-radius: 999px;
            margin-bottom: 10px;
            border: 1px solid #FDE68A;
          }
          .email-title {
            font-size: 24px;
            font-weight: 800;
            color: #1E3A8A;
            margin: 4px 0 6px;
            letter-spacing: -0.5px;
          }
          .email-subtitle {
            font-size: 14px;
            color: #64748B;
            margin: 0;
          }
          .content-body {
            padding: 28px 28px 24px;
          }
          .greeting-text {
            font-size: 15px;
            line-height: 1.6;
            color: #334155;
            margin-bottom: 20px;
          }
          .changelog-card {
            background: #FAF8F5;
            border: 1.5px solid #EFE6D8;
            border-radius: 20px;
            padding: 18px 20px;
            margin: 22px 0;
          }
          .changelog-header {
            font-size: 13px;
            font-weight: 800;
            color: #92400E;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            display: block;
          }
          .changelog-content {
            font-size: 13.5px;
            line-height: 1.7;
            color: #475569;
            white-space: pre-line;
            font-family: inherit;
          }
          .feature-grid {
            margin: 20px 0 24px;
            background: #F0FDF4;
            border: 1px solid #DCFCE7;
            border-radius: 18px;
            padding: 14px 18px;
          }
          .feature-row {
            font-size: 12.5px;
            color: #166534;
            padding: 4px 0;
            line-height: 1.5;
            font-weight: 600;
          }
          .cta-wrap {
            text-align: center;
            margin: 28px 0 20px;
          }
          .cta-btn {
            background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
            color: #FFFFFF !important;
            display: inline-block;
            padding: 15px 32px;
            font-size: 15px;
            font-weight: 800;
            text-decoration: none;
            border-radius: 999px;
            box-shadow: 0 6px 18px rgba(30, 58, 138, 0.28);
            letter-spacing: 0.2px;
          }
          .footer-section {
            background: #FAF7F2;
            border-top: 1px solid #E8DFD0;
            padding: 22px 24px;
            text-align: center;
            border-radius: 0 0 26px 26px;
          }
          .footer-quote {
            font-size: 12px;
            color: #64748B;
            font-style: italic;
            margin-bottom: 8px;
          }
          .footer-text {
            font-size: 11px;
            color: #94A3B8;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <!-- Hero Mascot Header -->
            <div class="hero-banner">
              <div class="sheep-badge">🐑</div>
              <div>
                <span class="app-tag">🌿 BibleNote • New Build ${version}</span>
                <h1 class="email-title">Baa! A Fresh Update is Here! ✨</h1>
                <p class="email-subtitle">Shep the Little Lamb has brought a brand new release to your pasture.</p>
              </div>
            </div>

            <!-- Main Body -->
            <div class="content-body">
              <p class="greeting-text">
                Greetings friend! 🌾 A new update for <strong>BibleNote (SHEPHERD)</strong> is ready for your Android device. We've polished the experience so your Scripture study and sermon notes feel even sweeter and smoother.
              </p>

              <!-- Cute Changelog Card -->
              <div class="changelog-card">
                <span class="changelog-header">✨ What&apos;s New & Fresh in ${version}:</span>
                <div class="changelog-content">${changelog}</div>
              </div>

              <!-- Pastoral Highlights -->
              <div class="feature-grid">
                <div class="feature-row">📖 100% Offline SQLite Holy Bible (No internet needed)</div>
                <div class="feature-row">🌾 Dual English KJV + Cebuano Bugna translations</div>
                <div class="feature-row">✨ Automatic Scripture verse detection in your notes</div>
                <div class="feature-row">🐑 100% Free • Zero Ads • Open Hearted</div>
              </div>

              <!-- Cute Button CTA -->
              <div class="cta-wrap">
                <a href="${downloadLink}" class="cta-btn" target="_blank">
                  ⬇️ Download APK Update (~${fileSize}) 🚀
                </a>
              </div>
            </div>

            <!-- Pastoral Footer -->
            <div class="footer-section">
              <p class="footer-quote">
                &ldquo;The LORD is my shepherd; I shall not want.&rdquo; — Psalm 23:1
              </p>
              <p class="footer-text">
                With love from the BibleNote Shepherd team 🐑🌾<br/>
                You received this because you signed up for updates on our portal.
              </p>
            </div>
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
