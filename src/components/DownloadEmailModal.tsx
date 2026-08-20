import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/sounds';
import { handleDirectDownload } from '../lib/download';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';
import confetti from 'canvas-confetti';

interface DownloadEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadEmailModal: React.FC<DownloadEmailModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    getActiveRelease().then(setActiveReleaseState);
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) setActiveReleaseState(rel);
    });
    return unsubscribe;
  }, []);

  // Pre-fill user email from localStorage if they have used the site before
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('biblenote_user_email') || '';
      setEmail(savedEmail);
      setIsSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      playSound('boing');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    playSound('tap');

    try {
      const cleanEmail = email.trim().toLowerCase();
      localStorage.setItem('biblenote_user_email', cleanEmail);

      // Trigger the direct APK download and record email in Supabase & analytics
      await handleDirectDownload({
        platform: 'android',
        release: activeRelease || undefined,
        userEmail: cleanEmail,
        onStart: () => console.log('Starting APK download with email:', cleanEmail),
        onComplete: () => console.log('Download initiated successfully!')
      });

      setIsSuccess(true);
      playSound('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Download error:', err);
      setErrorMsg('Could not initiate download. Please try again.');
      playSound('boing');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const version = activeRelease?.version || 'APK Build';
  const fileSize = activeRelease?.fileSizeFormatted || 'Dynamic Size';
  const isBeta = Boolean(activeRelease?.isBeta);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-[32px] border-2 border-[#E8D8C8] shadow-2xl overflow-hidden z-10 text-left my-auto p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5EBE1] hover:bg-[#E8D8C8] flex items-center justify-center text-[#6B6560] hover:text-[#1A1817] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header & Icon */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#E5C158] shadow-md bg-white shrink-0">
                <img src="/assets/icon.png" alt="BibleNote" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-bible font-bold text-xl text-[#1A1817]">
                    BibleNote (SHEPHERD)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E5C158]/30 text-[#966E0C] text-[10px] font-extrabold uppercase">
                    {isBeta ? `${version} [BETA]` : version}
                  </span>
                </div>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  100% Offline SQLite Scripture Companion
                </p>
              </div>
            </div>

            {/* Value Prompt */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8D8C8] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A]">
                <Sparkles className="w-4 h-4 text-[#E5C158] shrink-0" />
                <span>Enter your email to download & receive update notices</span>
              </div>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Provide your email below to start the direct APK package download ({fileSize}). We will notify you automatically when new features, translations, and updates are published!
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Success State */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm">Download Started!</h4>
                <p className="text-xs text-emerald-800">
                  Your browser is downloading <strong>{activeRelease?.filename || 'biblenote-release.apk'}</strong>. We have registered your email for future updates.
                </p>
              </motion.div>
            ) : (
              /* Email Input & Download Action Form */
              <form onSubmit={handleDownloadSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                    Your Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#6B6560] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8D8C8] focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none text-sm text-[#1A1817] transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-xl shadow-[#1E3A8A]/25 transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#E5C158]" />
                      <span>Start Direct APK Download ({version})</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Privacy & Package Specs Guarantee */}
            <div className="pt-2 border-t border-[#E8D8C8]/60 flex items-center justify-between text-[11px] text-[#6B6560]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero spam • Unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                <span>Android 8.0+</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
