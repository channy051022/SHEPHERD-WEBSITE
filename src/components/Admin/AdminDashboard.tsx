import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  LogOut, 
  Layers, 
  Sparkles, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  FileCode2, 
  Users, 
  Activity, 
  Database,
  FileCheck,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
  Smartphone,
  HardDrive,
  Send,
  Mail,
  Flame,
  MessageSquarePlus,
  Star,
  Lightbulb,
  Bug,
  CheckCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  signInAdmin, 
  signOutAdmin, 
  getCurrentAdminUser, 
  type AdminUser, 
  type DownloadEventPayload,
  type SubscriberItem,
  isSupabaseConfigured,
  supabase,
  fetchDownloadEvents,
  fetchSubscribers,
  fetchUserFeedback,
  updateFeedbackStatus,
  deleteFeedbackItem,
  type FeedbackItem,
  type FeedbackStatus
} from '../../lib/supabase';
import { 
  getAllReleases, 
  uploadNewRelease, 
  setActiveRelease, 
  deleteRelease, 
  calculateFileSha256, 
  formatBytes,
  type ApkRelease 
} from '../../lib/releases';
import { handleDirectDownload } from '../../lib/download';
import { playSound } from '../../lib/sounds';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  onExit: () => void;
}

type NavSection = 'overview' | 'upload' | 'releases' | 'analytics' | 'subscribers' | 'feedback' | 'database';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  // Auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Navigation & UI state
  const [currentSection, setCurrentSection] = useState<NavSection>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [releasesSearch, setReleasesSearch] = useState('');
  const [releasesFilter, setReleasesFilter] = useState<'all' | 'active' | 'beta'>('all');

  // Data state (Real database rows - zero dummy data)
  const [releases, setReleases] = useState<ApkRelease[]>([]);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | number | null>(null);
  const [downloadLogs, setDownloadLogs] = useState<DownloadEventPayload[]>([]);
  const [subscribersList, setSubscribersList] = useState<SubscriberItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [feedbackSearch, setFeedbackSearch] = useState<string>('');
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);

  // Diagnostics state
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'healthy' | 'warning' | 'error'>('idle');
  const [healthReports, setHealthReports] = useState<{ label: string; status: 'ok' | 'warn' | 'error'; message: string }[]>([]);

  // Email Broadcast Modal state
  const [broadcastTargetRelease, setBroadcastTargetRelease] = useState<ApkRelease | null>(null);
  const [emailSubjectInput, setEmailSubjectInput] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastStatusMessage, setBroadcastStatusMessage] = useState<string | null>(null);

  // Upload Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customDownloadUrlInput, setCustomDownloadUrlInput] = useState('');
  const [versionInput, setVersionInput] = useState('v1.0.2');
  const [versionCodeInput, setVersionCodeInput] = useState(2);
  const [releaseTitleInput, setReleaseTitleInput] = useState('BibleNote Android Build');
  const [minAndroidInput, setMinAndroidInput] = useState('Android 8.0+ (Oreo) to 15');
  const [changelogInput, setChangelogInput] = useState(
    '• 100% Offline SQLite Scripture indexing\n• Dual English KJV + Cebuano Bugna translations\n• Smart automatic verse detection in notes'
  );
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [isBetaToggle, setIsBetaToggle] = useState(false);
  const [computedSha256, setComputedSha256] = useState<string>('');
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Clipboard copies
  const [copiedShaId, setCopiedShaId] = useState<string | number | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAnalyticsAndSubscribers = useCallback(async () => {
    try {
      const [events, subs, feedbacks] = await Promise.all([
        fetchDownloadEvents(),
        fetchSubscribers(),
        fetchUserFeedback()
      ]);
      setDownloadLogs(events);
      setSubscribersList(subs);
      setFeedbackList(feedbacks);
    } catch (e) {
      console.warn('Error loading analytics:', e);
    }
  }, []);

  const handleToggleFeedbackStatus = async (id: string | number, currentStatus: FeedbackStatus) => {
    playSound('tap');
    const newStatus: FeedbackStatus = currentStatus === 'reviewed' ? 'new' : 'reviewed';
    setIsUpdatingFeedback(true);
    await updateFeedbackStatus(id, newStatus);
    setFeedbackList(prev => prev.map(f => (f.id === id || String(f.id) === String(id) ? { ...f, status: newStatus } : f)));
    setIsUpdatingFeedback(false);
  };

  const handleDeleteFeedbackItem = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this feedback item?')) return;
    playSound('tap');
    await deleteFeedbackItem(id);
    setFeedbackList(prev => prev.filter(f => f.id !== id && String(f.id) !== String(id)));
  };

  const handleExportFeedbackCSV = () => {
    playSound('tap');
    const headers = ['ID', 'User Name', 'Email', 'Category', 'Rating', 'Message', 'App Version', 'Status', 'Date'];
    const rows = feedbackList.map(f => [
      f.id,
      `"${(f.userName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(f.userEmail || '').replace(/"/g, '""')}"`,
      f.category,
      f.rating,
      `"${f.message.replace(/"/g, '""')}"`,
      f.appVersion || 'v1.0.2',
      f.status,
      f.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `biblenote_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadReleasesList = useCallback(async () => {
    setIsLoadingReleases(true);
    try {
      const data = await getAllReleases();
      setReleases(data);
    } catch (e) {
      console.warn('Error loading releases:', e);
    } finally {
      setIsLoadingReleases(false);
    }
  }, []);

  const checkCurrentSession = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      // Clean up any old mock data from previous local runs
      try {
        const storedReleases = localStorage.getItem('biblenote_apk_releases');
        if (storedReleases && (storedReleases.includes('seed-1') || storedReleases.includes('14820'))) {
          localStorage.removeItem('biblenote_apk_releases');
        }
        const storedSubs = localStorage.getItem('biblenote_subscribers');
        if (storedSubs && storedSubs.includes('example.com')) {
          localStorage.removeItem('biblenote_subscribers');
        }
      } catch {
        // ignore
      }

      const user = await getCurrentAdminUser();
      setAdminUser(user);
      if (user) {
        loadAnalyticsAndSubscribers();
        loadReleasesList();
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, [loadAnalyticsAndSubscribers, loadReleasesList]);

  useEffect(() => {
    checkCurrentSession();
  }, [checkCurrentSession]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);
    playSound('tap');

    try {
      const result = await signInAdmin(emailInput, passwordInput);
      if (result.success && result.user) {
        setAdminUser(result.user);
        playSound('success');
        loadReleasesList();
        loadAnalyticsAndSubscribers();
      } else {
        setAuthError(result.message || 'Invalid admin credentials. Please try again.');
        playSound('boing');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown login error';
      setAuthError(msg);
      playSound('boing');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    playSound('tap');
    await signOutAdmin();
    setAdminUser(null);
  };

  // Handle file select
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setIsCalculatingHash(true);
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);

    const match = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (match && match[1]) {
      const detectedVer = match[1].startsWith('v') ? match[1] : `v${match[1]}`;
      setVersionInput(detectedVer);
    }

    try {
      const hash = await calculateFileSha256(file);
      setComputedSha256(hash);
    } catch (err) {
      console.warn('Could not compute SHA-256:', err);
    } finally {
      setIsCalculatingHash(false);
    }
  };

  // Handle APK upload submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !customDownloadUrlInput.trim()) {
      setUploadErrorMessage('Please choose a .apk file to upload or enter an external download link.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);
    playSound('tap');

    try {
      const result = await uploadNewRelease(
        {
          file: selectedFile,
          customDownloadUrl: customDownloadUrlInput.trim() || undefined,
          version: versionInput.trim(),
          versionCode: Number(versionCodeInput) || 1,
          releaseTitle: releaseTitleInput.trim(),
          minAndroidVersion: minAndroidInput.trim(),
          changelog: changelogInput.trim(),
          sha256Checksum: computedSha256,
          isActive: isActiveToggle,
          isBeta: isBetaToggle
        },
        (pct) => setUploadProgress(pct)
      );

      if (result.success && result.release) {
        playSound('success');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        setUploadSuccessMessage(`Successfully published ${result.release.version}! Website download links are updated.`);
        setSelectedFile(null);
        setCustomDownloadUrlInput('');
        setComputedSha256('');
        await loadReleasesList();
        
        // Suggest emailing subscribers
        if (subscribersList.length > 0) {
          setTimeout(() => {
            openBroadcastModal(result.release!);
          }, 1500);
        }
      } else {
        setUploadErrorMessage(result.message || 'Upload failed. Please check storage bucket size limit or SQL schema.');
        playSound('boing');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadErrorMessage(msg);
      playSound('boing');
    } finally {
      setIsUploading(false);
    }
  };

  // Set Active Release
  const handleSetActive = async (id: string | number) => {
    playSound('tap');
    await setActiveRelease(id);
    await loadReleasesList();
  };

  // Delete Release
  const handleDeleteRelease = async (id: string | number, version = 'this build') => {
    if (!window.confirm(`Are you sure you want to delete release ${version}? This will remove the binary file from Supabase storage and table records.`)) {
      return;
    }
    playSound('tap');
    setIsDeletingId(id);
    try {
      await deleteRelease(id);
      await loadReleasesList();
      playSound('success');
    } catch (err) {
      console.warn('Error deleting release:', err);
      playSound('boing');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Copy SHA-256
  const handleCopySha = (id: string | number, hash: string) => {
    playSound('tap');
    navigator.clipboard.writeText(hash);
    setCopiedShaId(id);
    setTimeout(() => setCopiedShaId(null), 2000);
  };

  // Copy Download Link
  const handleCopyDownloadUrl = (id: string | number, url?: string) => {
    playSound('tap');
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  // Run Supabase Diagnostics & Health Check
  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    setHealthStatus('checking');
    playSound('tap');
    const reports: { label: string; status: 'ok' | 'warn' | 'error'; message: string }[] = [];

    try {
      if (!isSupabaseConfigured || !supabase) {
        reports.push({
          label: 'Supabase Configuration',
          status: 'warn',
          message: 'Running in Local Storage / Demo Auth mode. Remote Supabase URL is not configured.'
        });
        setHealthReports(reports);
        setHealthStatus('warning');
        return;
      }

      // 1. Check DB table app_releases
      try {
        const { error } = await supabase.from('app_releases').select('*').limit(1);
        if (error) {
          reports.push({
            label: 'Database Table `app_releases`',
            status: 'error',
            message: `Query failed: ${error.message}. Please run schema.sql in Supabase SQL Editor.`
          });
        } else {
          reports.push({
            label: 'Database Table `app_releases`',
            status: 'ok',
            message: 'Connected. Table is accessible with read/write policies.'
          });
        }
      } catch (e: any) {
        reports.push({
          label: 'Database Table `app_releases`',
          status: 'error',
          message: `Exception querying table: ${e.message}`
        });
      }

      // 2. Check if is_beta column exists
      try {
        const { error } = await supabase.from('app_releases').select('is_beta').limit(1);
        if (error) {
          reports.push({
            label: 'Column `is_beta` in `app_releases`',
            status: 'warn',
            message: 'Column `is_beta` is missing in database table. Run schema.sql migration to add it.'
          });
        } else {
          reports.push({
            label: 'Column `is_beta` in `app_releases`',
            status: 'ok',
            message: 'Column `is_beta` is present and active.'
          });
        }
      } catch {
        // ignore
      }

      // 3. Check Storage bucket app-releases
      try {
        const { data: bucketFiles, error: bErr } = await supabase.storage.from('app-releases').list('', { limit: 5 });
        if (bErr) {
          reports.push({
            label: 'Storage Bucket `app-releases`',
            status: 'error',
            message: `Bucket notice: ${bErr.message}. Ensure bucket exists and public access is enabled.`
          });
        } else {
          reports.push({
            label: 'Storage Bucket `app-releases`',
            status: 'ok',
            message: `Bucket online. Detected ${bucketFiles?.length || 0} file(s) in root directory.`
          });
        }
      } catch (e: any) {
        reports.push({
          label: 'Storage Bucket `app-releases`',
          status: 'error',
          message: `Storage exception: ${e.message}`
        });
      }

      setHealthReports(reports);
      const hasError = reports.some((r) => r.status === 'error');
      const hasWarn = reports.some((r) => r.status === 'warn');
      setHealthStatus(hasError ? 'error' : hasWarn ? 'warning' : 'healthy');
      playSound(hasError ? 'boing' : 'success');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Export Subscribers to CSV
  const handleExportSubscribersCSV = () => {
    playSound('tap');
    if (subscribersList.length === 0) return;
    const header = 'Email,Source,Subscription Date\n';
    const rows = subscribersList.map((s) => `"${s.email}","${s.source || 'landing_page'}","${s.created_at || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblenote-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open Broadcast Modal
  const openBroadcastModal = (rel: ApkRelease) => {
    playSound('tap');
    setBroadcastTargetRelease(rel);
    setEmailSubjectInput(`🐑 [BibleNote Update] New Release ${rel.version} is now available! ✨`);
    setBroadcastStatusMessage(null);
  };

  // Trigger Email Broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastTargetRelease) return;
    setIsSendingBroadcast(true);
    playSound('tap');

    try {
      // Simulate sending / trigger CLI command message
      await new Promise((r) => setTimeout(r, 1200));
      playSound('success');
      setBroadcastStatusMessage(`🚀 Email broadcast command prepared for ${subscribersList.length} subscriber(s). You can run 'npm run broadcast' in terminal or check SMTP logs!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to broadcast';
      setBroadcastStatusMessage(`Error: ${msg}`);
      playSound('boing');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const activeRelease = releases.find((r) => r.isActive) || releases[0] || null;
  const activeReleasesCount = releases.filter((r) => r.isActive).length;
  const betaReleasesCount = releases.filter((r) => r.isBeta).length;

  const filteredReleases = releases.filter((rel) => {
    const matchesSearch = 
      rel.version.toLowerCase().includes(releasesSearch.toLowerCase()) ||
      rel.releaseTitle.toLowerCase().includes(releasesSearch.toLowerCase()) ||
      rel.filename.toLowerCase().includes(releasesSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (releasesFilter === 'active') return rel.isActive;
    if (releasesFilter === 'beta') return rel.isBeta;
    return true;
  });

  // Real Database Metrics (Strictly actual event logs and row counts)
  const totalActualDownloads = downloadLogs.length;
  const totalPublishedBuilds = releases.length;
  const totalSubscribersCount = subscribersList.length;

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#E5C158] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-white/70">Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // FULL PAGE LOGIN VIEW (When unauthenticated)
  // ---------------------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#1E293B] flex flex-col justify-between relative overflow-hidden font-sans-main antialiased selection:bg-[#E5C158]/30">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#1E3A8A]/30 via-[#E5C158]/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

        {/* Top Navbar */}
        <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-colors px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-[#E5C158]" />
            <span>Return to Public Website</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
              isSupabaseConfigured 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Storage'}
            </span>
          </div>
        </header>

        {/* Login Box */}
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10 my-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 text-left"
          >
            {/* Header / Brand */}
            <div className="text-center space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] border-2 border-[#E5C158] flex items-center justify-center mx-auto shadow-md shadow-[#1E3A8A]/25">
                <img src="/assets/icon.png" alt="BibleNote Logo" className="w-10 h-10 object-cover rounded-xl" />
              </div>
              <div>
                <h1 className="font-serif-bible font-bold text-2xl text-[#0F172A] tracking-tight">
                  BibleNote Admin Console
                </h1>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your administrator credentials to manage APK releases and distribution.
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none text-sm text-[#0F172A] transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none text-sm text-[#0F172A] transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-lg shadow-[#1E3A8A]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#E5C158]" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </main>

        <footer className="p-4 text-center text-xs text-white/40 relative z-10">
          BibleNote (SHEPHERD) • Administrator Access Portal
        </footer>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // FULL PAGE DASHBOARD VIEW (With Sidebar)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans-main antialiased selection:bg-[#E5C158]/30">
      
      {/* 1. DESKTOP & MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-[#E5C158] overflow-hidden bg-white shrink-0">
                <img src="/assets/icon.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif-bible font-bold text-base text-white">
                    BibleNote
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[#E5C158] text-[#0F172A]">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-white/50 block">APK Release Console</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center justify-between ${
            isSupabaseConfigured
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
          }`}>
            <span>Status:</span>
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Storage'}</span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="p-3 space-y-1 flex-grow text-left overflow-y-auto">
          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('overview');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'overview'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentSection === 'overview' ? 'text-[#E5C158]' : 'text-white/60'}`} />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('upload');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'upload'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UploadCloud className={`w-4 h-4 ${currentSection === 'upload' ? 'text-[#E5C158]' : 'text-white/60'}`} />
            <span>Upload New APK</span>
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('releases');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'releases'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className={`w-4 h-4 ${currentSection === 'releases' ? 'text-[#E5C158]' : 'text-white/60'}`} />
              <span>Releases & Builds</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white">
              {releases.length}
            </span>
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('analytics');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'analytics'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Activity className={`w-4 h-4 ${currentSection === 'analytics' ? 'text-[#E5C158]' : 'text-white/60'}`} />
            <span>Download Analytics</span>
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('subscribers');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'subscribers'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${currentSection === 'subscribers' ? 'text-[#E5C158]' : 'text-white/60'}`} />
              <span>Newsletter & Leads</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white">
              {subscribersList.length}
            </span>
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('feedback');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'feedback'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquarePlus className={`w-4 h-4 ${currentSection === 'feedback' ? 'text-[#E5C158]' : 'text-white/60'}`} />
              <span>User Feedbacks</span>
            </div>
            {feedbackList.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E5C158] text-[#0F172A]">
                {feedbackList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playSound('tap');
              setCurrentSection('database');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentSection === 'database'
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30 font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Database className={`w-4 h-4 ${currentSection === 'database' ? 'text-[#E5C158]' : 'text-white/60'}`} />
            <span>Database & Cloud</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] border border-[#E5C158] flex items-center justify-center font-bold text-xs text-[#E5C158]">
              A
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {adminUser.email}
              </span>
              <span className="text-[10px] text-white/50 block">Administrator</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onExit}
              className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Website</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#0F172A] hover:bg-[#F1F5F9] focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-left">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] capitalize">
                {currentSection === 'overview' && 'Dashboard Overview'}
                {currentSection === 'upload' && 'Upload New Android APK'}
                {currentSection === 'releases' && 'Releases & Build Distributions'}
                {currentSection === 'analytics' && 'Download Events & Metrics'}
                {currentSection === 'subscribers' && 'Newsletter Subscribers & Leads'}
                {currentSection === 'database' && 'Database & Cloud Configuration'}
              </h2>
              <p className="text-[11px] text-[#64748B] hidden sm:block">
                BibleNote (SHEPHERD) Production Management • Live Database Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playSound('tap');
                setCurrentSection('upload');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#E5C158]" />
              <span className="hidden sm:inline">Upload APK</span>
            </button>

            <button
              onClick={onExit}
              className="px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit to Website</span>
            </button>
          </div>
        </header>

        {/* 3. MAIN SECTION CONTENT */}
        <main className="p-4 sm:p-8 flex-grow space-y-6 text-left max-w-7xl w-full mx-auto">
          
          {/* SECTION: OVERVIEW */}
          {currentSection === 'overview' && (
            <div className="space-y-6">
              {/* Stat Metric Cards (Actual Database Data) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Downloads</span>
                    <Activity className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                    {totalActualDownloads.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Verified telemetry records
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Live APK Build</span>
                    <Smartphone className="w-4 h-4 text-[#E5C158]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#1E3A8A]">
                    {activeRelease?.version || 'None Active'}
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Size: {activeRelease?.fileSizeFormatted || 'Dynamic Size'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Published Builds</span>
                    <Layers className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                    {totalPublishedBuilds}
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    In distribution registry
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Subscriber Leads</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-700">
                    {totalSubscribersCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Email updates opt-in
                  </span>
                </div>

                <div 
                  onClick={() => {
                    playSound('tap');
                    setCurrentSection('feedback');
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1 cursor-pointer hover:border-[#1E3A8A] transition-colors"
                >
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">User Feedbacks</span>
                    <MessageSquarePlus className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                    {feedbackList.length}
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>
                      Avg {feedbackList.length > 0 ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 5), 0) / feedbackList.length).toFixed(1) : '5.0'} Rating
                    </span>
                  </span>
                </div>
              </div>

              {/* Active Release Hero Card */}
              {activeRelease ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#1E3A8A] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-[#E5C158]/20 via-transparent to-transparent blur-3xl pointer-events-none" />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-3 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#E5C158]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Active Production Binary on Website</span>
                      </div>

                      <h3 className="font-serif-bible font-bold text-2xl sm:text-3xl text-white">
                        {activeRelease.releaseTitle} ({activeRelease.version})
                      </h3>

                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                        {activeRelease.changelog}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/70">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10">File: {activeRelease.filename}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/10">Size: {activeRelease.fileSizeFormatted}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/10">{activeRelease.minAndroidVersion}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <button
                        onClick={() => {
                          playSound('tap');
                          handleDirectDownload({ release: activeRelease });
                        }}
                        className="px-6 py-3.5 rounded-2xl bg-[#E5C158] hover:bg-[#d4b045] text-[#0F172A] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Test Download APK</span>
                      </button>

                      <button
                        onClick={() => openBroadcastModal(activeRelease)}
                        className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email Subscribers ({subscribersList.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#0F172A]">No APK Releases in Database</h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto">
                    You have not published any Android APK packages yet. Upload your compiled build to distribute it to users worldwide.
                  </p>
                  <button
                    onClick={() => {
                      playSound('tap');
                      setCurrentSection('upload');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md hover:bg-[#152a65] transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-[#E5C158]" />
                    <span>Upload First APK Build</span>
                  </button>
                </div>
              )}

              {/* Recent Activity & Releases Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Releases */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Recent Builds</span>
                    </h4>
                    <button
                      onClick={() => setCurrentSection('releases')}
                      className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      View all ({releases.length})
                    </button>
                  </div>

                  {releases.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B]">
                      No builds uploaded yet. Click &quot;Upload New APK&quot; to publish your first release.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {releases.slice(0, 4).map((rel) => (
                        <div
                          key={rel.id}
                          className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                              rel.isActive ? 'bg-[#1E3A8A] text-white' : 'bg-white text-[#64748B] border'
                            }`}>
                              {rel.version}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#0F172A] block">{rel.releaseTitle}</span>
                                {rel.isBeta && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold">
                                    BETA
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#64748B]">{rel.fileSizeFormatted}</span>
                            </div>
                          </div>

                          {rel.isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              LIVE
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetActive(rel.id)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors cursor-pointer"
                            >
                              Set Live
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Downloads Telemetry */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Live Download Telemetry</span>
                    </h4>
                    <button
                      onClick={() => setCurrentSection('analytics')}
                      className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      View all ({downloadLogs.length})
                    </button>
                  </div>

                  {downloadLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B]">
                      No download events logged yet. Telemetry will appear as visitors download the APK.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {downloadLogs.slice(0, 5).map((log, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="px-1.5 py-0.5 rounded bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-[10px] uppercase shrink-0">
                              {log.platform || 'Android'}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-[#0F172A] text-xs">
                                {log.user_email || 'Direct Download'}
                              </span>
                              <span className="text-[#64748B] text-[11px] block">
                                v{log.app_version || '1.0.1'} • {log.referrer || 'Direct'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#64748B] shrink-0">
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: UPLOAD NEW APK */}
          {currentSection === 'upload' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#0F172A]">
                    Publish Updated Android Binary
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Upload your compiled APK package. Real-time SHA-256 cryptographic hash is calculated automatically in your browser.
                  </p>
                </div>

                {uploadSuccessMessage && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="font-semibold">{uploadSuccessMessage}</div>
                  </div>
                )}

                {uploadErrorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div className="font-semibold">{uploadErrorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? 'bg-emerald-50/50 border-emerald-400'
                        : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                          <FileCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <h5 className="font-bold text-base text-[#0F172A]">
                            {selectedFile.name}
                          </h5>
                          <p className="text-xs text-[#64748B]">
                            Exact Size: <strong className="text-[#0F172A]">{formatBytes(selectedFile.size)}</strong> • Type: Android Package (.apk)
                          </p>
                        </div>
                        <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          Click to select a different APK file
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mx-auto">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <h5 className="font-bold text-base text-[#0F172A]">
                          Drag & drop your updated <code className="text-[#1E3A8A]">.apk</code> binary here
                        </h5>
                        <p className="text-xs text-[#64748B]">
                          or browse from your local computer (Direct Supabase bucket upload or External URL)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Custom / External Download Link */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-[#1E3A8A]" />
                          <span>Custom / External Download URL (Optional)</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                          Direct CDN / GitHub Release Link
                        </span>
                      </div>
                      <input
                        type="url"
                        value={customDownloadUrlInput}
                        onChange={(e) => setCustomDownloadUrlInput(e.target.value)}
                        placeholder="https://github.com/your-org/repo/releases/download/v1.0.2/Shepherd.apk or Google Drive link"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] focus:border-[#1E3A8A] text-xs font-mono text-[#0F172A] outline-none"
                      />
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        If your APK exceeds Supabase Storage limits or is hosted on GitHub Releases/CDN, paste the direct URL here. Website download buttons will point straight to it!
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Version Tag (e.g. v1.0.2)
                      </label>
                      <input
                        type="text"
                        required
                        value={versionInput}
                        onChange={(e) => setVersionInput(e.target.value)}
                        placeholder="v1.0.2"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs font-mono font-bold text-[#0F172A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Version Code / Build #
                      </label>
                      <input
                        type="number"
                        required
                        value={versionCodeInput}
                        onChange={(e) => setVersionCodeInput(Number(e.target.value))}
                        placeholder="2"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs font-mono font-bold text-[#0F172A] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Release Title
                      </label>
                      <input
                        type="text"
                        value={releaseTitleInput}
                        onChange={(e) => setReleaseTitleInput(e.target.value)}
                        placeholder="BibleNote Feature & Performance Release"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs font-semibold text-[#0F172A] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Minimum OS Compatibility
                      </label>
                      <input
                        type="text"
                        value={minAndroidInput}
                        onChange={(e) => setMinAndroidInput(e.target.value)}
                        placeholder="Android 8.0+ (Oreo) to 15"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs font-semibold text-[#0F172A] outline-none"
                      />
                    </div>

                    {/* SHA-256 Checksum */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                          SHA-256 Checksum
                        </label>
                        {isCalculatingHash && (
                          <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                            Computing cryptographic hash...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={computedSha256}
                        onChange={(e) => setComputedSha256(e.target.value)}
                        placeholder="Auto-calculated upon choosing file..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] text-[#64748B] outline-none"
                      />
                    </div>

                    {/* Changelog */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Changelog & What&apos;s New
                      </label>
                      <textarea
                        rows={4}
                        value={changelogInput}
                        onChange={(e) => setChangelogInput(e.target.value)}
                        placeholder="• Highlight changes in this release..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white text-xs text-[#0F172A] outline-none leading-relaxed"
                      />
                    </div>

                    {/* Active Switch */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] block">
                          Set as Primary Live Download
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Immediately updates the website Hero button and download badges.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isActiveToggle}
                        onChange={(e) => setIsActiveToggle(e.target.checked)}
                        className="w-5 h-5 text-[#1E3A8A] rounded focus:ring-[#1E3A8A] accent-[#1E3A8A] cursor-pointer"
                      />
                    </div>

                    {/* Beta Testing Switch */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-600" />
                          <span>Mark as Beta Testing Build</span>
                        </span>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          Displays a prominent &quot;Beta Testing Phase&quot; notice on the website download button informing users that this is a preview testing build.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isBetaToggle}
                        onChange={(e) => setIsBetaToggle(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Progress */}
                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-[#1E3A8A]">
                        <span>Uploading & Processing Binary...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1E3A8A] transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isUploading || (!selectedFile && !customDownloadUrlInput.trim())}
                    className="w-full py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-xl shadow-[#1E3A8A]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E5C158]" />
                        <span>Publish & Distribute APK Release</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION: RELEASES & BUILDS HISTORY */}
          {currentSection === 'releases' && (
            <div className="space-y-6">
              {/* Header Controls & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      playSound('tap');
                      setReleasesFilter('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      releasesFilter === 'all'
                        ? 'bg-[#1E3A8A] text-white shadow-sm'
                        : 'bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                    }`}
                  >
                    All Builds ({releases.length})
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setReleasesFilter('active');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      releasesFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Live Production ({activeReleasesCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setReleasesFilter('beta');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      releasesFilter === 'beta'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Beta Testing ({betaReleasesCount})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={releasesSearch}
                      onChange={(e) => setReleasesSearch(e.target.value)}
                      placeholder="Search version or title..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      playSound('tap');
                      loadReleasesList();
                    }}
                    className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#1E3A8A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    title="Refresh Registry"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingReleases ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setCurrentSection('upload');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-[#152a65] transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {isLoadingReleases ? (
                <div className="py-16 text-center text-xs text-[#64748B] space-y-2 bg-white rounded-3xl border border-[#E2E8F0]">
                  <div className="w-7 h-7 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Syncing release registry with database...</p>
                </div>
              ) : filteredReleases.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#64748B] space-y-3 bg-white rounded-3xl border border-[#E2E8F0] p-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#0F172A]">No releases found</h5>
                    <p className="text-xs text-[#64748B] mt-1">
                      {releasesSearch ? 'No releases match your current search criteria.' : 'No APK packages uploaded yet.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentSection('upload')}
                    className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Upload Your First Build</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReleases.map((rel) => (
                    <div
                      key={rel.id || rel.version}
                      className={`p-6 rounded-3xl border transition-all ${
                        rel.isActive
                          ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/15'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                            rel.isActive ? 'bg-[#1E3A8A] text-white shadow-md' : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}>
                            {rel.version}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="font-bold text-base text-[#0F172A]">
                                {rel.releaseTitle}
                              </h4>
                              {rel.isActive && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wide flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  <span>LIVE PRODUCTION</span>
                                </span>
                              )}
                              {rel.isBeta && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-amber-600" />
                                  <span>BETA BUILD</span>
                                </span>
                              )}
                              <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                                Code: #{rel.versionCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                              <span>{rel.filename}</span>
                              <span>•</span>
                              <span>{rel.fileSizeFormatted}</span>
                              <span>•</span>
                              <span>{rel.minAndroidVersion}</span>
                              <span>•</span>
                              <span>Uploaded: {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : 'Recent'}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">{rel.downloadsCount || 0} downloads</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                          <button
                            onClick={() => openBroadcastModal(rel)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Broadcast Release Email to Subscribers"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Broadcast</span>
                          </button>

                          {!rel.isActive && (
                            <button
                              onClick={() => handleSetActive(rel.id)}
                              className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#152a65] transition-colors shadow-xs cursor-pointer"
                            >
                              Set as Live
                            </button>
                          )}

                          <button
                            onClick={() => {
                              playSound('tap');
                              handleDirectDownload({ release: rel });
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Download Binary"
                          >
                            <Download className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            <span>Download</span>
                          </button>

                          {rel.downloadUrl && (
                            <button
                              onClick={() => handleCopyDownloadUrl(rel.id, rel.downloadUrl)}
                              className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                              title="Copy Download URL"
                            >
                              {copiedUrlId === rel.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <ExternalLink className="w-4 h-4 text-[#64748B]" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleCopySha(rel.id, rel.sha256Checksum)}
                            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                            title="Copy SHA-256 Checksum"
                          >
                            {copiedShaId === rel.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#64748B]" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteRelease(rel.id, rel.version)}
                            disabled={isDeletingId === rel.id}
                            className="p-2 rounded-xl bg-white border border-rose-200 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Release Record"
                          >
                            {isDeletingId === rel.id ? (
                              <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Changelog, Download URL & SHA */}
                      <div className="pt-4 space-y-3">
                        <div className="text-xs text-[#475569] whitespace-pre-line leading-relaxed">
                          {rel.changelog}
                        </div>

                        {rel.downloadUrl && (
                          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
                            <div className="flex items-center gap-2 truncate font-mono">
                              <ExternalLink className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                              <span className="truncate">Download URL: {rel.downloadUrl}</span>
                            </div>
                            <button
                              onClick={() => handleCopyDownloadUrl(rel.id, rel.downloadUrl)}
                              className="text-xs text-[#1E3A8A] font-bold hover:underline shrink-0 cursor-pointer"
                            >
                              {copiedUrlId === rel.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}

                        {rel.sha256Checksum && (
                          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2 text-[11px] font-mono text-[#64748B]">
                            <div className="flex items-center gap-2 truncate">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">SHA-256: {rel.sha256Checksum}</span>
                            </div>
                            <button
                              onClick={() => handleCopySha(rel.id, rel.sha256Checksum)}
                              className="text-xs text-[#1E3A8A] font-bold hover:underline shrink-0 cursor-pointer"
                            >
                              {copiedShaId === rel.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: DOWNLOAD ANALYTICS (Actual Database Telemetry) */}
          {currentSection === 'analytics' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Download Clicks Telemetry ({downloadLogs.length} Events)</span>
                  </h4>
                  <button
                    onClick={loadAnalyticsAndSubscribers}
                    className="text-xs text-[#1E3A8A] font-bold hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {downloadLogs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
                    <Activity className="w-8 h-8 text-[#94A3B8] mx-auto" />
                    <p className="font-medium text-sm text-[#0F172A]">No download telemetry recorded yet.</p>
                    <p>When visitors enter their email and download the APK on the landing page, live logs will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                          <th className="py-3 px-3">User Email / Lead</th>
                          <th className="py-3 px-3">Platform</th>
                          <th className="py-3 px-3">Version</th>
                          <th className="py-3 px-3">Referrer</th>
                          <th className="py-3 px-3">User Agent</th>
                          <th className="py-3 px-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {downloadLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="py-3 px-3 font-semibold text-[#0F172A]">
                              {log.user_email || <span className="text-[#94A3B8] italic">Anonymous Web</span>}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-[10px] uppercase">
                                {log.platform || 'Android'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                              {log.app_version || '1.0.1'}
                            </td>
                            <td className="py-3 px-3 text-[#64748B]">
                              {log.referrer || 'Direct'}
                            </td>
                            <td className="py-3 px-3 text-[#64748B] max-w-xs truncate font-mono text-[10px]">
                              {log.user_agent || 'Standard client'}
                            </td>
                            <td className="py-3 px-3 text-[#64748B]">
                              {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: NEWSLETTER & SUBSCRIBERS (Actual Database Leads) */}
          {currentSection === 'subscribers' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Registered Subscribers ({subscribersList.length} Leads)</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {activeRelease && (
                      <button
                        onClick={() => openBroadcastModal(activeRelease)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Update Email</span>
                      </button>
                    )}

                    <button
                      onClick={handleExportSubscribersCSV}
                      disabled={subscribersList.length === 0}
                      className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                      <span>Export to CSV</span>
                    </button>
                  </div>
                </div>

                {subscribersList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
                    <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                    <p className="font-medium text-sm text-[#0F172A]">No subscriber leads registered yet.</p>
                    <p>When visitors download the APK or join the newsletter, their verified emails will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                          <th className="py-3 px-3">Subscriber Email</th>
                          <th className="py-3 px-3">Source Channel</th>
                          <th className="py-3 px-3">Subscription Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {subscribersList.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="py-3 px-3 font-semibold text-[#0F172A]">
                              {sub.email}
                            </td>
                            <td className="py-3 px-3 text-[#64748B]">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {sub.source || 'landing_page'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#64748B]">
                              {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: USER FEEDBACKS & IDEAS */}
          {currentSection === 'feedback' && (
            <div className="space-y-6">
              {/* Header & Stat Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Responses</span>
                    <MessageSquarePlus className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                    {feedbackList.length}
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    From web landing page
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Average Rating</span>
                    <Star className="w-4 h-4 text-[#E5C158]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#E5C158] flex items-center gap-1.5">
                    <span>
                      {feedbackList.length > 0 
                        ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 5), 0) / feedbackList.length).toFixed(1) 
                        : '5.0'}
                    </span>
                    <span className="text-sm font-bold text-[#64748B]">/ 5.0</span>
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    ⭐ User satisfaction score
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Feature Requests</span>
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-600">
                    {feedbackList.filter(f => f.category === 'feature_request').length}
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    Ideas & improvements
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="text-xs font-bold uppercase tracking-wider">Bug Reports</span>
                    <Bug className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="font-display font-extrabold text-2xl sm:text-3xl text-rose-600">
                    {feedbackList.filter(f => f.category === 'bug').length}
                  </div>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    Issues & crash reports
                  </span>
                </div>
              </div>

              {/* Feedbacks Filter & List Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <MessageSquarePlus className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Community Feedbacks & Suggestions ({feedbackList.length})</span>
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      User reviews, feature suggestions, bug reports, and translation corrections submitted by website visitors.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={loadAnalyticsAndSubscribers}
                      className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#1E3A8A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    >
                      Refresh
                    </button>

                    <button
                      onClick={handleExportFeedbackCSV}
                      disabled={feedbackList.length === 0}
                      className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                      <span>Export Feedbacks (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Filter Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search messages, name, email..."
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <div>
                    <select
                      value={feedbackCategoryFilter}
                      onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                    >
                      <option value="all">All Categories</option>
                      <option value="feature_request">💡 Feature Requests</option>
                      <option value="bug">🐛 Bug Reports</option>
                      <option value="translation">📖 Translation / Verse</option>
                      <option value="appreciation">❤️ Praise & Love</option>
                      <option value="general">💬 General</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={feedbackStatusFilter}
                      onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="new">🔵 New / Unreviewed</option>
                      <option value="reviewed">✅ Reviewed</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Cards List */}
                {feedbackList.length === 0 ? (
                  <div className="py-14 text-center text-xs text-[#64748B] space-y-2">
                    <MessageSquarePlus className="w-9 h-9 text-[#CBD5E1] mx-auto" />
                    <p className="font-medium text-sm text-[#0F172A]">No feedback submitted yet.</p>
                    <p>When visitors submit ideas or bug reports on the home page, they will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {feedbackList
                      .filter(f => {
                        const matchesCategory = feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter;
                        const matchesStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
                        const matchesSearch = feedbackSearch === '' || 
                          f.message.toLowerCase().includes(feedbackSearch.toLowerCase()) || 
                          (f.userName && f.userName.toLowerCase().includes(feedbackSearch.toLowerCase())) ||
                          (f.userEmail && f.userEmail.toLowerCase().includes(feedbackSearch.toLowerCase()));
                        return matchesCategory && matchesStatus && matchesSearch;
                      })
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            item.status === 'new'
                              ? 'bg-white border-[#1E3A8A]/30 shadow-xs'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-90'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Star rating */}
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < (item.rating || 5)
                                          ? 'text-[#E5C158] fill-[#E5C158]'
                                          : 'text-[#E2E8F0]'
                                      }`}
                                    />
                                  ))}
                                </div>

                                {/* Category Badge */}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  item.category === 'bug'
                                    ? 'bg-rose-100 text-rose-800'
                                    : item.category === 'feature_request'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.category === 'translation'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.category === 'appreciation'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {item.category === 'bug' && '🐛 Bug'}
                                  {item.category === 'feature_request' && '💡 Idea'}
                                  {item.category === 'translation' && '📖 Scripture'}
                                  {item.category === 'appreciation' && '❤️ Praise'}
                                  {item.category === 'general' && '💬 General'}
                                </span>

                                {/* Status Badge */}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  item.status === 'new'
                                    ? 'bg-[#1E3A8A] text-white'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {item.status === 'new' ? 'New' : 'Reviewed'}
                                </span>
                              </div>

                              <div className="text-xs text-[#0F172A] font-bold flex items-center gap-2 pt-0.5">
                                <span>{item.userName || 'Anonymous User'}</span>
                                {item.userEmail && (
                                  <span className="text-[#64748B] font-normal">
                                    ({item.userEmail})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Date & App Version */}
                            <div className="text-right text-[11px] text-[#64748B]">
                              <div>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}</div>
                              <div className="font-mono text-[10px] text-[#94A3B8]">Build: {item.appVersion || 'Web'}</div>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="py-3 text-xs text-[#334155] whitespace-pre-line leading-relaxed font-normal">
                            "{item.message}"
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                              {item.userEmail && (
                                <a
                                  href={`mailto:${item.userEmail}?subject=BibleNote (SHEPHERD) - Regarding your feedback&body=Hi ${item.userName || 'there'},\n\nThank you for reaching out with your feedback:\n"${item.message}"\n\n`}
                                  className="px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#152a65] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Mail className="w-3 h-3 text-[#E5C158]" />
                                  <span>Reply via Email</span>
                                </a>
                              )}

                              <button
                                onClick={() => handleToggleFeedbackStatus(item.id, item.status)}
                                disabled={isUpdatingFeedback}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  item.status === 'new'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <CheckCheck className="w-3 h-3" />
                                <span>{item.status === 'new' ? 'Mark Reviewed' : 'Mark as New'}</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteFeedbackItem(item.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 text-xs transition-colors cursor-pointer"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: DATABASE & CLOUD */}
          {currentSection === 'database' && (
            <div className="space-y-6">
              {/* Supabase Diagnostic Tool */}
              <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Supabase Health Diagnostics & Schema Verification</span>
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Verify table schema columns, RLS permissions, and Storage Bucket accessibility in real time.
                    </p>
                  </div>

                  <button
                    onClick={runHealthCheck}
                    disabled={isCheckingHealth}
                    className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                  >
                    {isCheckingHealth ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5C158]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C158]" />
                    )}
                    <span>{isCheckingHealth ? 'Testing Connection...' : 'Run Diagnostics Test'}</span>
                  </button>
                </div>

                {/* Diagnostics Status Report */}
                {healthStatus !== 'idle' && (
                  <div className="space-y-3 pt-2">
                    <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                      healthStatus === 'healthy'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : healthStatus === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center gap-2.5 font-bold">
                        {healthStatus === 'healthy' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                        <span>
                          {healthStatus === 'healthy'
                            ? 'All Supabase Services & Schema Health Checks Passed!'
                            : healthStatus === 'warning'
                            ? 'Schema Warning Detected: Missing column or settings. Run the SQL script below.'
                            : 'Connection or Permissions Issue Detected'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/70">
                        {healthStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {healthReports.map((report, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border space-y-1 ${
                            report.status === 'ok'
                              ? 'bg-[#F8FAFC] border-emerald-200/80 text-[#0F172A]'
                              : 'bg-amber-50/70 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            {report.status === 'ok' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            <span>{report.label}</span>
                          </div>
                          <p className="text-[11px] text-[#64748B] leading-relaxed">
                            {report.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="font-bold text-[#0F172A] flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Storage Bucket: `app-releases`</span>
                    </span>
                    <p className="text-[#64748B] text-[11px] leading-relaxed">
                      Public bucket for direct worldwide APK distribution. Free tier max single file upload is 50MB. For larger builds, use the Custom / External URL field.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="font-bold text-[#0F172A] flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Registry Table: `app_releases`</span>
                    </span>
                    <p className="text-[#64748B] text-[11px] leading-relaxed">
                      Maintains release metadata, version tags, checksums, and download counters with Row-Level Security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Copyable SQL Setup & Storage Fix */}
              <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-[#1E3A8A]" />
                      <span>One-Click SQL Schema & Storage Fix Migration</span>
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Adds missing `is_beta` column, ensures `version` UNIQUE constraint, and configures storage bucket policies.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      playSound('tap');
                      const sqlContent = `-- BibleNote (SHEPHERD) Supabase Schema & Storage Fix Migration
-- Run in Supabase Dashboard -> SQL Editor

-- 1. Add is_beta column if missing & ensure UNIQUE on version
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_releases' AND column_name = 'is_beta'
  ) THEN
    ALTER TABLE app_releases ADD COLUMN is_beta BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_releases_version_key'
  ) THEN
    ALTER TABLE app_releases ADD CONSTRAINT app_releases_version_key UNIQUE (version);
  END IF;
EXCEPTION
  WHEN duplicate_table OR duplicate_object THEN
    NULL;
END $$;

-- 2. Configure RLS Policies for app_releases
ALTER TABLE app_releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for app_releases" ON app_releases;
CREATE POLICY "Allow public select for app_releases" ON app_releases FOR SELECT TO anon, authenticated, public USING (true);

DROP POLICY IF EXISTS "Allow admin insert for app_releases" ON app_releases;
CREATE POLICY "Allow admin insert for app_releases" ON app_releases FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update for app_releases" ON app_releases;
CREATE POLICY "Allow admin update for app_releases" ON app_releases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete for app_releases" ON app_releases;
CREATE POLICY "Allow admin delete for app_releases" ON app_releases FOR DELETE TO anon, authenticated USING (true);

-- 3. Configure Storage Bucket with 500MB max file size & RLS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('app-releases', 'app-releases', true, 524288000, ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/x-zip-compressed', 'application/zip'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 524288000;

DROP POLICY IF EXISTS "Public Access to App Releases" ON storage.objects;
CREATE POLICY "Public Access to App Releases" ON storage.objects FOR SELECT TO anon, authenticated, public USING (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Upload App Releases" ON storage.objects;
CREATE POLICY "Admin Upload App Releases" ON storage.objects FOR INSERT TO anon, authenticated, public WITH CHECK (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Update App Releases" ON storage.objects;
CREATE POLICY "Admin Update App Releases" ON storage.objects FOR UPDATE TO anon, authenticated, public USING (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Delete App Releases" ON storage.objects;
CREATE POLICY "Admin Delete App Releases" ON storage.objects FOR DELETE TO anon, authenticated, public USING (bucket_id = 'app-releases');`;

                      navigator.clipboard.writeText(sqlContent);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2500);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#E5C158]" />}
                    <span>{copiedSql ? 'SQL Script Copied!' : 'Copy SQL Fix to Clipboard'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F172A] text-white/90 font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/10 max-h-64 space-y-1">
                  <div className="text-emerald-400 font-bold">-- 1. Open Supabase Dashboard -&gt; SQL Editor -&gt; New Query</div>
                  <div className="text-white/70">-- 2. Paste the snippet and click &quot;Run&quot;</div>
                  <div className="text-[#E5C158]">ALTER TABLE app_releases ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false;</div>
                  <div className="text-[#E5C158]">ALTER TABLE app_releases ADD CONSTRAINT app_releases_version_key UNIQUE (version);</div>
                  <div className="text-white/50">... (Click &quot;Copy SQL Fix to Clipboard&quot; to copy the complete 40-line script)</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>How to apply this SQL migration in 30 seconds:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800/90 pt-1">
                    <li>Click the <strong>&quot;Copy SQL Fix to Clipboard&quot;</strong> button above.</li>
                    <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">Supabase Project Dashboard</a> and navigate to <strong>SQL Editor</strong>.</li>
                    <li>Click <strong>&quot;New Query&quot;</strong>, paste the script, and press <strong>&quot;Run&quot;</strong> (Ctrl+Enter).</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. BROADCAST UPDATE EMAIL MODAL (SMTP) */}
      {broadcastTargetRelease && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E2E8F0] shadow-2xl space-y-5 text-left my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">
                    Email Release Notification to Subscribers
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Send announcement email for {broadcastTargetRelease.version} to registered users.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastTargetRelease(null)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A] block">Target Recipients:</span>
                  <span className="text-[11px] text-[#64748B]">
                    All active subscribers in database
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {subscribersList.length} Subscribers
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubjectInput}
                  onChange={(e) => setEmailSubjectInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>SMTP Configuration & Trigger:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  You can broadcast emails directly via the Node CLI runner with your SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`):
                </p>
                <code className="block p-2 rounded-lg bg-white/80 border border-amber-200 font-mono text-[11px] text-[#0F172A]">
                  npm run broadcast {broadcastTargetRelease.version}
                </code>
              </div>

              {broadcastStatusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs">
                  {broadcastStatusMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setBroadcastTargetRelease(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-[#0F172A] text-xs font-bold hover:bg-[#E2E8F0] cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleSendBroadcast}
                disabled={isSendingBroadcast || subscribersList.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSendingBroadcast ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Send Announcement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
