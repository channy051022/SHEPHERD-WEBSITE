import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  Bug, 
  BookOpen, 
  Heart,
  MessageCircle
} from 'lucide-react';
import { playSound } from '../lib/sounds';
import { submitUserFeedback, type FeedbackCategory } from '../lib/supabase';
import confetti from 'canvas-confetti';

export const FeedbackSection: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('feature_request');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories: { id: FeedbackCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'feature_request', label: 'Feature Request', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'bug', label: 'Bug Report', icon: <Bug className="w-3.5 h-3.5" />, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'translation', label: 'Translation / Verse', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'appreciation', label: 'Praise & Love', icon: <Heart className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'general', label: 'General Feedback', icon: <MessageCircle className="w-3.5 h-3.5" />, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please write a brief message or suggestion before submitting.');
      playSound('boing');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    playSound('tap');

    try {
      const res = await submitUserFeedback({
        userName: userName.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        category,
        rating,
        message: message.trim(),
        appVersion: 'v1.0.2'
      });

      if (res.success) {
        playSound('success');
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
        setSuccessMessage(res.message);
        setMessage('');
        setUserName('');
        setUserEmail('');
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    } catch {
      setErrorMessage('Failed to send feedback. Please try again.');
      playSound('boing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-24 sm:py-32 bg-[#FDFBF7] border-b border-[#E8D8C8]/60 relative overflow-hidden text-left">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-[#E5C158]/15 via-[#1E3A8A]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider">
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Community Feedback & Ideas</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817]">
            Help Us Improve <span className="text-gold-gradient">BibleNote (SHEPHERD)</span>
          </h2>

          <p className="text-sm sm:text-base text-[#6B6560] max-w-xl mx-auto leading-relaxed">
            Your feedback directly shapes our future updates. Found a bug, requested a new feature, or have suggestions for translations? Share your thoughts below!
          </p>
        </div>

        {/* Feedback Form Card */}
        <div className="p-6 sm:p-10 rounded-[36px] bg-white border-2 border-[#E8D8C8] shadow-xl relative overflow-hidden">
          
          {successMessage ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-bible font-bold text-2xl text-[#1A1817]">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6560] max-w-md mx-auto leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#152a65] transition-colors cursor-pointer"
              >
                Send Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  1. Select Feedback Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        playSound('tap');
                        setCategory(c.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        category === c.id
                          ? 'bg-[#1E3A8A] text-white shadow-md scale-102 ring-2 ring-[#1E3A8A]/20'
                          : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      {c.icon}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  2. How do you rate your BibleNote experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        playSound('tap');
                        setRating(star);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 rounded-lg hover:scale-115 transition-transform cursor-pointer"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-[#E5C158] fill-[#E5C158]'
                            : 'text-[#E2E8F0]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#64748B] ml-2">
                    {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent!' : rating === 4 ? '⭐⭐⭐⭐ Very Good' : rating === 3 ? '⭐⭐⭐ Good' : rating === 2 ? '⭐⭐ Needs Work' : '⭐ Poor'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  3. Your Feedback / Suggestions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what features you'd like to see, translation corrections, or describe a bug you encountered..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs sm:text-sm text-[#0F172A] outline-none leading-relaxed transition-all"
                />
              </div>

              {/* Name & Email Inputs (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Bro. Christian"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs text-[#0F172A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Your Email (Optional, for developer replies)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs text-[#0F172A] outline-none"
                  />
                </div>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-xl shadow-[#1E3A8A]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#E5C158]" />
                    <span>Submit Feedback</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
