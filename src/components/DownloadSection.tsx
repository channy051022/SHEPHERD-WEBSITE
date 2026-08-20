import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { playSound } from '../lib/sounds';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';

interface DownloadSectionProps {
  onOpenInstallGuide: () => void;
  onOpenDownloadModal: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ onOpenInstallGuide, onOpenDownloadModal }) => {
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);

  useEffect(() => {
    getActiveRelease().then((rel) => {
      setActiveReleaseState(rel);
      if (rel) setDownloadCount(rel.downloadsCount || 0);
    });
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) {
        setActiveReleaseState(rel);
        setDownloadCount(rel.downloadsCount || 0);
      }
    });
    return unsubscribe;
  }, []);

  const version = activeRelease?.version || 'Latest Build';
  const fileSize = activeRelease?.fileSizeFormatted || 'Dynamic Size';
  const minOs = activeRelease?.minAndroidVersion || 'Android 8.0+ (Oreo) to 15';
  const filename = activeRelease?.filename || 'biblenote-release.apk';
  const isBeta = Boolean(activeRelease?.isBeta);

  const onDownloadClick = () => {
    playSound('tap');
    onOpenDownloadModal();
  };

  return (
    <section id="download" className="py-24 sm:py-32 bg-[#F7EFE7]/80 border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-[#E5C158]/20 via-[#1E3A8A]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main APK Download Card */}
        <div className="p-8 sm:p-12 lg:p-16 rounded-[40px] bg-white border-2 border-[#E8D8C8] shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Direct APK Download Pitch */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider">
                {isBeta ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span className="text-amber-700">Beta Testing Phase</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Direct Android APK Distribution</span>
                  </>
                )}
              </div>

              <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight">
                Install <span className="text-gold-gradient">BibleNote (SHEPHERD)</span> on Your Device
              </h2>

              <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed">
                Download the official standalone Android APK directly. Zero account setup required, zero tracking, and 100% functional offline with full SQLite Scripture databases pre-packaged.
              </p>

              {/* Beta Warning Callout */}
              {isBeta && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Beta Preview Notice</span>
                  </div>
                  <p className="text-amber-800/90 leading-relaxed">
                    This package is currently in a <strong>Beta Testing Phase</strong>. You may experience active refinements in offline search and features. Please report any feedback!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={onDownloadClick}
                  className="px-8 py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-display font-bold text-base shadow-xl shadow-[#1E3A8A]/25 hover:shadow-2xl hover:shadow-[#1E3A8A]/35 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                  <Download className="w-5 h-5 text-[#E5C158] transition-transform group-hover:translate-y-0.5" />
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <span>Download BibleNote APK</span>
                      <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-[#E5C158] text-[#1A1817] rounded">
                        {isBeta ? `${version} [BETA]` : version}
                      </span>
                    </div>
                    <span className="text-[11px] font-normal text-white/80">
                      Direct Standalone Package (~{fileSize})
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    playSound('tap');
                    onOpenInstallGuide();
                  }}
                  className="px-6 py-4 rounded-2xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] font-display font-bold text-sm border border-[#E8D8C8] hover:border-[#1E3A8A]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
                  <span>How to Install Guide</span>
                </button>
              </div>

            </div>

            {/* Right Column: App Package Specs */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FDFBF7] border border-[#E8D8C8] space-y-6">
              
              {/* App Icon + Package Details */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#E8D8C8]">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#E5C158] shadow-md shrink-0 bg-white">
                  <img src="/assets/icon.png" alt="BibleNote" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-extrabold text-lg text-[#1A1817]">
                    SHEPHERD (BibleNote)
                  </h4>
                  <p className="text-xs text-[#6B6560]">Official Standalone Android APK</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isBeta ? '⚡ Beta Preview Build' : '✓ Verified Production Build'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid (100% Dynamic to uploaded file) */}
              <div className="space-y-2.5 text-left text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">File Name:</span>
                  <span className="font-mono font-bold text-[#1A1817] truncate max-w-[200px]" title={filename}>
                    {filename}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">Application Version:</span>
                  <span className="font-bold text-[#1A1817]">
                    {version} {isBeta ? '(Beta Phase)' : '(Production)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">Package Size:</span>
                  <span className="font-bold text-[#1A1817]">{fileSize}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">Included Translations:</span>
                  <span className="font-bold text-[#1E3A8A]">English KJV, Cebuano, ADB+</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">Minimum OS:</span>
                  <span className="font-bold text-[#1A1817]">{minOs}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D8C8]/60">
                  <span className="text-[#6B6560]">Special Features:</span>
                  <span className="font-bold text-[#966E0C]">Bible, Widgets, Alarms & 4 Mini-Games</span>
                </div>
              </div>

              {/* Live Downloads counter */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8D8C8] flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] text-[#6B6560] block font-bold uppercase tracking-wider">
                    Community Downloads
                  </span>
                  <span className="font-display font-extrabold text-xl text-[#1E3A8A]">
                    {downloadCount.toLocaleString()} APKs
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
