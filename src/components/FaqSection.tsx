import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/sounds';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is BibleNote (SHEPHERD) truly 100% offline?',
    answer: 'Yes, absolutely! The entire Holy Scripture database—including all 66 books of the Old and New Testaments in both English KJV and Cebuano Bugna/Pinadayag—is bundled directly within the app using high-performance on-device SQLite. You can read, search, write notes, play mini-games, and set alarms without any internet connection or cellular data.',
    category: 'Offline Capability'
  },
  {
    question: 'How does the automatic verse detection in notes work?',
    answer: 'As you write personal journals, sermons, or morning devotions, BibleNote\'s on-device parser scans your text in real time. Whenever it recognizes scripture references like "John 3:16", "Romans 8:28", or "Psalm 23:1", it automatically creates an interactive golden pill. Tapping the pill immediately opens the exact scripture passage in a bottom drawer without leaving your note.',
    category: 'Smart Notes'
  },
  {
    question: 'What are the Spiritual Alarms and built-in wake-up tones?',
    answer: 'The Spiritual Alarm feature lets you schedule daily devotional wake-up calls. You can choose from 6 uplifting spiritual ringtones (such as Cathedral Tower Bells, Morning Harp & Strings, or Radiant Sunrise Bells) that wake you up paired with your daily Scripture prompt.',
    category: 'Spiritual Alarms'
  },
  {
    question: 'Can I add Verse of the Day widgets to my Android Home Screen?',
    answer: 'Yes! BibleNote includes native Home Screen Widgets in Small (2x2), Medium (4x2), and Large (4x4) sizes. You can also export custom Verse of the Day cards formatted directly as lock screen wallpapers.',
    category: 'Widgets'
  },
  {
    question: 'Which Bible translations are included in the app?',
    answer: 'BibleNote includes two complete translations: the Authorized King James Version (KJV 1769) in English and the Cebuano Bugna / Pinadayag (CEB) translation. You can toggle between them instantly with a single tap in the reader, notes, or today dashboard.',
    category: 'Translations'
  },
  {
    question: 'What arcade mini-games can I play with Shep the Lamb?',
    answer: 'BibleNote includes 4 interactive scripture games: Verse Scramble (reordering word tiles into canonical verses), Books Chrono Sort (arranging Bible books from Genesis to Revelation), Bible Trivia Party (multiple-choice questions with biblical explanations), and Scripture Crosswords.',
    category: 'Mini-Games'
  },
  {
    question: 'How do I safely install the standalone Android APK?',
    answer: 'Tap "Download APK" to save the .apk file on your phone. When prompted by Android, enable "Allow from this source" in your browser or file manager settings, and tap "Install". The app has zero trackers, zero ads, and requires no account creation.',
    category: 'Installation'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    playSound('tap');
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-4">
            Frequently Asked <span className="text-gold-gradient">Questions</span>
          </h2>

          <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about BibleNote's offline architecture, dual translations, smart notes, and Android APK installation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#E5C158] shadow-lg ring-1 ring-[#E5C158]/40'
                    : 'bg-white/70 border-[#E8D8C8] hover:border-[#1E3A8A]/30'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif-bible font-bold text-base sm:text-lg text-[#1A1817]">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#1E3A8A] text-white rotate-180' : 'bg-[#F5EBE1] text-[#1E3A8A]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#6B6560] leading-relaxed border-t border-[#E8D8C8]/40">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
