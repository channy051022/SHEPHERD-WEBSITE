import React, { useState, useEffect } from 'react';
import { 
  Download, 
  MessageCircle
} from 'lucide-react';
import { playSound } from '../lib/sounds';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';

interface FooterProps {
  onOpenDownload: () => void;
  onOpenInstallGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDownload, onOpenInstallGuide }) => {
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);

  useEffect(() => {
    getActiveRelease().then(setActiveReleaseState);
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) setActiveReleaseState(rel);
    });
    return unsubscribe;
  }, []);

  const versionText = activeRelease?.version || 'v1.0.1';

  return (
    <footer className="bg-[#1A1817] text-white/80 border-t border-white/10 pt-14 sm:pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5C158] shadow-md bg-white">
                <img src="/assets/icon.png" alt="BibleNote Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif-bible font-bold text-xl text-white tracking-wide block">
                  BibleNote (SHEPHERD)
                </span>
                <span className="text-[11px] text-[#E5C158] font-bold">
                  100% Offline Scripture Companion
                </span>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              An offline rich-text Bible journal and devotion app featuring on-device SQLite FTS5 search, English KJV & Cebuano Pinadayag translations, automatic verse link detection, home screen widgets, and Shep the Lamb.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playSound('tap');
                  onOpenDownload();
                }}
                className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Get APK ({versionText})</span>
              </button>

              <button
                onClick={() => {
                  playSound('tap');
                  onOpenInstallGuide();
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Install Guide
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <a href="#gallery" className="hover:text-[#E5C158] transition-colors">
                  App Mockups & UI
                </a>
              </li>
              <li>
                <a href="#playground" className="hover:text-[#E5C158] transition-colors">
                  Verse Parser Demo
                </a>
              </li>
              <li>
                <a href="#shep" className="hover:text-[#E5C158] transition-colors">
                  Shep the Lamb & Mini-Games
                </a>
              </li>
              <li>
                <a href="#languages" className="hover:text-[#E5C158] transition-colors">
                  KJV & Cebuano Pinadayag
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-[#E5C158] transition-colors">
                  Direct APK Download
                </a>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Core Features
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>Automatic Regex Verse Detection</li>
              <li>Dual KJV + Cebuano Translations</li>
              <li>Home Screen Verse Widgets</li>
              <li>Spiritual Alarms & Devotions</li>
              <li>4 Arcade Mini-Games</li>
              <li>8 Aesthetic Color Themes</li>
            </ul>
          </div>

          {/* Developer & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Developer Support
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <a 
                  href="https://m.me/christian.mestola.7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Messenger Support</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/christian.mestola.7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors"
                >
                  Facebook: Christian Mestola
                </a>
              </li>
              <li>Package: <code className="text-[#E5C158]">com.biblenotes.app</code></li>
              <li>Build: Android Production APK {versionText}</li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits & Public Domain Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            <span>Built with faith and devotion by</span>
            <span className="font-bold text-white">Christian Mestola</span>
            <span>•</span>
            <span>All Glory to God alone</span>
          </div>

          <div className="text-[11px] text-white/40">
            Scripture texts: Authorized King James Version (KJV) & Cebuano Bugna/Pinadayag (Public Domain).
          </div>
        </div>

      </div>
    </footer>
  );
};
