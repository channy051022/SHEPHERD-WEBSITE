import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Settings, 
  CheckCircle2,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/sounds';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);

  useEffect(() => {
    getActiveRelease().then(setActiveReleaseState);
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) setActiveReleaseState(rel);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const appTitle = activeRelease?.releaseTitle || 'BibleNote (SHEPHERD)';
  const version = activeRelease?.version || 'Latest Build';
  const filename = activeRelease?.filename || 'biblenote-release.apk';
  const fileSize = activeRelease?.fileSizeFormatted ? `(~${activeRelease.fileSizeFormatted})` : '';
  const isBeta = Boolean(activeRelease?.isBeta);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#FDFBF7] border-2 border-[#E8D8C8] rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl text-left relative my-8"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              playSound('tap');
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full text-[#6B6560] hover:text-[#1A1817] hover:bg-[#E8D8C8]/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-bible font-bold text-2xl text-[#1A1817]">
                  How to Install {appTitle}
                </h3>
                {isBeta && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>BETA</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6560]">
                Quick 3-step guide to install the official standalone Android application on your device.
              </p>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-4 mb-8">
            
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-[#1A1817] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Download the Package</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Tap the <strong className="text-[#1A1817]">"Download APK"</strong> button below to save <code className="text-[#1E3A8A] font-bold">{filename}</code> {fileSize} directly to your device&apos;s Downloads folder.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#E5C158] text-[#1A1817] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-[#1A1817] flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-[#966E0C]" />
                  <span>Allow &quot;Install Unknown Apps&quot;</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Open the downloaded file. When prompted by Android with a security notice, tap <strong className="text-[#1A1817]">Settings</strong> and toggle <strong className="text-[#1A1817]">&quot;Allow from this source&quot;</strong> (for Chrome, Files, or your browser).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-[#1A1817] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tap Install & Enjoy 100% Offline</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Tap <strong className="text-[#1A1817]">Install</strong>. Once completed, open BibleNote to immediately enjoy English KJV, Cebuano Bugna, smart notes, widgets, and Shep the Lamb!
                </p>
              </div>
            </div>

          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              100% Free • Zero Ads • Direct Standalone Android Package ({version})
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                playSound('tap');
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white border border-[#E8D8C8] text-xs font-bold text-[#6B6560] hover:text-[#1A1817] hover:bg-[#F5EBE1] transition-colors text-center cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                playSound('tap');
                onDownload();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#E5C158]" />
              <span>Download APK Now ({version})</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
