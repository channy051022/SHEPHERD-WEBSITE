import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Shield, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeEmail } from '../lib/supabase';

export const LeadCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const res = await subscribeEmail(email);
      if (res.success) {
        setStatus('success');
        setFeedbackMessage(res.message);
        setEmail('');
      } else {
        setStatus('error');
        setFeedbackMessage(res.message);
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-[#F7EFE7]/80 border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E5C158]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Mascot badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8D8C8] text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <Bell className="w-3.5 h-3.5 text-[#E5C158]" />
          <span>Stay in the Sheepfold</span>
        </div>

        {/* Title */}
        <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl text-[#1A1817] mb-3">
          Get Release Updates & Daily <span className="text-gold-gradient">Encouragements</span>
        </h2>

        <p className="text-sm sm:text-base text-[#6B6560] max-w-xl mx-auto mb-8 leading-relaxed">
          Join our growing community of believers. Receive new APK feature drops, daily bilingual scripture devotions, and Shep's memory challenge cards directly in your inbox.
        </p>

        {/* Lead Capture Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-white border-2 border-[#E8D8C8] focus-within:border-[#1E3A8A] shadow-lg transition-all">
            <div className="relative flex-1 flex items-center">
              <Mail className="w-4 h-4 text-[#6B6560] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email address..."
                className="w-full pl-10 pr-3 py-3 text-sm text-[#1A1817] bg-transparent focus:outline-none placeholder:text-[#9E968F] font-medium"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-xs shadow-md shadow-[#1E3A8A]/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <span>{status === 'loading' ? 'Joining...' : 'Subscribe'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5C158]" />
            </button>
          </div>

          {/* Feedback Message Alert */}
          <AnimatePresence>
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                  status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>{feedbackMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B6560]">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero spam. Direct Supabase encrypted database. Unsubscribe at any time.</span>
        </div>

      </div>
    </section>
  );
};
