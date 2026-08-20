import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppScreensGallery } from './components/AppScreensGallery';
import { InteractivePlayground } from './components/InteractivePlayground';
import { ShepMascotShowcase } from './components/ShepMascotShowcase';
import { DualLanguageSection } from './components/DualLanguageSection';
import { DownloadSection } from './components/DownloadSection';
import { LeadCapture } from './components/LeadCapture';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { DownloadEmailModal } from './components/DownloadEmailModal';
import { ShepFloatingGreeter } from './components/ShepFloatingGreeter';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { FeedbackSection } from './components/FeedbackSection';
import { ScrollRevealSection } from './components/ScrollRevealSection';

export function App() {
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isDownloadEmailModalOpen, setIsDownloadEmailModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Check URL path or hash to open admin dashboard (e.g. /admin or #admin)
  const checkAdminUrl = useCallback(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || search.includes('admin')) {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
    }
  }, []);

  useEffect(() => {
    checkAdminUrl();
    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);
    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
    };
  }, [checkAdminUrl]);

  const handleExitAdmin = () => {
    setIsAdminView(false);
    window.history.pushState(null, '', '/');
  };

  const handleDownloadTrigger = () => {
    setIsDownloadEmailModalOpen(true);
  };

  // If on /admin or #admin, render the full-screen Admin Dashboard with Sidebar
  if (isAdminView) {
    return <AdminDashboard onExit={handleExitAdmin} />;
  }

  // Public Landing Page
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1817] flex flex-col font-sans-main antialiased selection:bg-[#E5C158]/30 selection:text-[#1E3A8A] overflow-x-hidden">
      {/* Sticky Floating Navbar */}
      <Navbar
        onOpenDownload={handleDownloadTrigger}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
      />

      {/* Main Landing Page Content with Scroll-Linked Viewport Animations */}
      <main className="flex-grow">
        {/* 1. Hero with animated mascot Shep waving */}
        <ScrollRevealSection isHero>
          <Hero
            onOpenDownload={handleDownloadTrigger}
            onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
          />
        </ScrollRevealSection>

        {/* 2. Official High-Resolution App Screenshots Gallery & Mockups */}
        <ScrollRevealSection id="gallery">
          <AppScreensGallery />
        </ScrollRevealSection>

        {/* 3. Live Interactive Auto Verse Detection Note Editor */}
        <ScrollRevealSection id="playground">
          <InteractivePlayground />
        </ScrollRevealSection>

        {/* 4. Shep the Mascot & Playable Mini-Games */}
        <ScrollRevealSection id="shep">
          <ShepMascotShowcase />
        </ScrollRevealSection>

        {/* 5. Dual-Language Deep Dive: English KJV & Cebuano Bugna/Pinadayag */}
        <ScrollRevealSection id="languages">
          <DualLanguageSection />
        </ScrollRevealSection>

        {/* 6. Standalone Android APK Direct Download Section */}
        <ScrollRevealSection id="download">
          <DownloadSection
            onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
            onOpenDownloadModal={handleDownloadTrigger}
          />
        </ScrollRevealSection>

        {/* 7. Email Updates & Community Signup */}
        <ScrollRevealSection>
          <LeadCapture />
        </ScrollRevealSection>

        {/* 8. User Feedback & Ideas */}
        <ScrollRevealSection id="feedback">
          <FeedbackSection />
        </ScrollRevealSection>

        {/* 9. Frequently Asked Questions Accordion */}
        <ScrollRevealSection id="faq">
          <FaqSection />
        </ScrollRevealSection>
      </main>

      {/* 9. Clean Footer with Credits and Support Links */}
      <Footer
        onOpenDownload={handleDownloadTrigger}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
      />

      {/* Floating Animated Mascot Saying Hello */}
      <ShepFloatingGreeter
        onOpenDownload={handleDownloadTrigger}
      />

      {/* Android Sideloading Helper Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        onDownload={handleDownloadTrigger}
      />

      {/* Pre-Download Email Prompt Modal */}
      <DownloadEmailModal
        isOpen={isDownloadEmailModalOpen}
        onClose={() => setIsDownloadEmailModalOpen(false)}
      />
    </div>
  );
}

export default App;
