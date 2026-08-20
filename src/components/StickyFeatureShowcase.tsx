import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Layers
} from 'lucide-react';
import { CORE_FEATURES } from '../data/featuresData';
import { AppDeviceMockup } from './AppDeviceMockup';
import type { AppScreenId } from './AppDeviceMockup';
import { playSound } from '../lib/sounds';

export const StickyFeatureShowcase: React.FC = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Map each feature to its authentic app screenshot screen ID
  const featureScreenMap: AppScreenId[] = ['notes', 'picker', 'widgets'];
  const currentScreenId: AppScreenId = featureScreenMap[activeFeatureIndex] || 'notes';

  // Observe which feature is in viewport when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.45;
      featureRefs.current.forEach((el, index) => {
        if (!el) return;
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveFeatureIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeature = (index: number) => {
    playSound('tap');
    setActiveFeatureIndex(index);
    const target = featureRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="features" ref={sectionRef} className="relative py-24 sm:py-32 bg-[#FDFBF7] border-y border-[#E8D8C8]/60 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#E5C158]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#1E3A8A]/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Interactive Mobile App Showcase</span>
          </div>
          
          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-4">
            Authentic BibleNote <span className="text-gold-gradient">App Architecture</span>
          </h2>
          
          <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed">
            Scroll or tap any feature to see how BibleNote's core features (Smart Notes, E-Bible Reader, Home Screen Widgets & Alarms) power your daily spiritual walk.
          </p>

          {/* Quick Jump Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {CORE_FEATURES.map((feat, idx) => (
              <button
                key={feat.id}
                onClick={() => scrollToFeature(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeFeatureIndex === idx
                    ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/20 scale-105'
                    : 'bg-[#F5EBE1] text-[#6B6560] hover:text-[#1A1817] hover:bg-[#E8D8C8]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span>{feat.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sticky Scroll Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Feature Highlight Cards (Scrollable) */}
          <div className="lg:col-span-6 space-y-16 sm:space-y-24 py-6">
            {CORE_FEATURES.map((feature, idx) => {
              const isActive = activeFeatureIndex === idx;
              return (
                <div
                  key={feature.id}
                  ref={(el) => {
                    featureRefs.current[idx] = el;
                  }}
                  className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white shadow-xl shadow-[#1A1817]/5 border-2 border-[#E5C158]/50 translate-x-0'
                      : 'bg-white/40 border border-[#E8D8C8]/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Badge & Step Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E5C158]/20 text-[#966E0C] border border-[#E5C158]/40">
                      <Sparkles className="w-3 h-3 text-[#966E0C]" />
                      {feature.badge}
                    </span>
                    <span className="text-xs font-bold text-[#6B6560]">
                      0{idx + 1} / 0{CORE_FEATURES.length}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif-bible font-bold text-2xl sm:text-3xl text-[#1A1817] mb-3 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-2.5 mb-6">
                    {feature.bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1A1817]/90 font-medium">
                        <CheckCircle className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Interactive Button */}
                  <button
                    onClick={() => scrollToFeature(idx)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1E3A8A] hover:text-[#152a65] group"
                  >
                    <span>View in mockup</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Pinned Sticky Phone Mockup */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 flex justify-center items-center">
            <AppDeviceMockup
              initialScreen={currentScreenId}
              key={currentScreenId}
              interactive={true}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
