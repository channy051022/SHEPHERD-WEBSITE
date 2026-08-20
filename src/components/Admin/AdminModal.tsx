import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
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
  KeyRound,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInAdmin, 
  signOutAdmin, 
  getCurrentAdminUser, 
  type AdminUser, 
  isSupabaseConfigured,
  fetchDownloadEvents,
  fetchSubscribers
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
import { playSound } from '../../lib/sounds';
import confetti from 'canvas-confetti';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReleaseUpdated?: (release: ApkRelease) => void;
}

type TabType = 'upload' | 'releases' | 'analytics' | 'seeder';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onReleaseUpdated }) => {
  // Auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [releases, setReleases] = useState<ApkRelease[]>([]);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);

  // Upload Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionInput, setVersionInput] = useState('v1.0.2');
  const [versionCodeInput, setVersionCodeInput] = useState(2);
  const [releaseTitleInput, setReleaseTitleInput] = useState('BibleNote Maintenance & Performance Update');
  const [minAndroidInput, setMinAndroidInput] = useState('Android 8.0+ (Oreo) to 15');
  const [changelogInput, setChangelogInput] = useState(
    '• Upgraded SQLite FTS5 index performance for faster Scripture search\n• Fixed Cebuano Pinadayag verse reference formatting\n• Polished Shep the Lamb interactive animations\n• Added enhanced offline prayer widget'
  );
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [computedSha256, setComputedSha256] = useState<string>('');
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Analytics & Subscriber state
  const [downloadLogs, setDownloadLogs] = useState<any[]>([]);
  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [copiedShaId, setCopiedShaId] = useState<string | number | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAnalyticsAndSubscribers = React.useCallback(async () => {
    try {
      const [events, subs] = await Promise.all([
        fetchDownloadEvents(),
        fetchSubscribers()
      ]);
      setDownloadLogs(events);
      setSubscribersList(subs);
    } catch (e) {
      console.warn('Error loading analytics:', e);
    }
  }, []);

  const checkCurrentSession = React.useCallback(async () => {
    const user = await getCurrentAdminUser();
    setAdminUser(user);
    if (user) {
      loadAnalyticsAndSubscribers();
    }
  }, [loadAnalyticsAndSubscribers]);

  const loadReleasesList = React.useCallback(async () => {
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

  // Check auth session on mount & when modal opens
  useEffect(() => {
    if (isOpen) {
      checkCurrentSession();
      loadReleasesList();
    }
  }, [isOpen, checkCurrentSession, loadReleasesList]);

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
        setAuthError(result.message || 'Login failed. Check your credentials.');
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

    // Auto-detect version name if formatted like biblenote-v1.2.0.apk
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
    if (!selectedFile) {
      setUploadErrorMessage('Please choose or drag a .apk file to upload.');
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
          version: versionInput.trim(),
          versionCode: Number(versionCodeInput) || 1,
          releaseTitle: releaseTitleInput.trim(),
          minAndroidVersion: minAndroidInput.trim(),
          changelog: changelogInput.trim(),
          sha256Checksum: computedSha256,
          isActive: isActiveToggle
        },
        (pct) => setUploadProgress(pct)
      );

      if (result.success && result.release) {
        playSound('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setUploadSuccessMessage(`Successfully published ${result.release.version}! Website download link updated.`);
        setSelectedFile(null);
        setComputedSha256('');
        loadReleasesList();
        onReleaseUpdated?.(result.release);
      } else {
        setUploadErrorMessage(result.message || 'Upload failed. Please try again.');
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
    const updated = releases.find((r) => String(r.id) === String(id));
    if (updated) {
      onReleaseUpdated?.(updated);
    }
  };

  // Delete Release
  const handleDeleteRelease = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this APK release record?')) {
      return;
    }
    playSound('tap');
    await deleteRelease(id);
    await loadReleasesList();
  };

  // Copy SHA-256
  const handleCopySha = (id: string | number, hash: string) => {
    playSound('tap');
    navigator.clipboard.writeText(hash);
    setCopiedShaId(id);
    setTimeout(() => setCopiedShaId(null), 2000);
  };

  // Export Subscribers to CSV
  const handleExportSubscribersCSV = () => {
    playSound('tap');
    if (subscribersList.length === 0) return;
    const header = 'Email,Source,Created At\n';
    const rows = subscribersList.map((s) => `"${s.email}","${s.source || 'landing_page'}","${s.created_at || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblenote-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] border-2 border-[#E8D8C8] shadow-2xl overflow-hidden z-10 my-auto text-left max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#1E3A8A] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E5C158]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#E5C158]/40 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#E5C158]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-bible font-bold text-lg sm:text-xl text-white tracking-wide">
                    BibleNote Admin Portal
                  </h3>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    isSupabaseConfigured 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Storage'}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Manage APK releases, distribution binaries, and live download analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {adminUser && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-grow p-4 sm:p-6 bg-[#FDFBF7]">
            {!adminUser ? (
              /* ================= LOGIN VIEW ================= */
              <div className="max-w-md mx-auto py-6 sm:py-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center mx-auto text-[#1E3A8A]">
                    <KeyRound className="w-7 h-7 text-[#1E3A8A]" />
                  </div>
                  <h4 className="font-display font-extrabold text-xl sm:text-2xl text-[#1A1817]">
                    Admin Authentication
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B6560]">
                    Log in to upload new APKs and control the website download links.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none text-sm text-[#1A1817] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none text-sm text-[#1A1817] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-md shadow-[#1E3A8A]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#E5C158]" />
                        <span>Sign In as Administrator</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ================= AUTHENTICATED DASHBOARD ================= */
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-[#E8D8C8] pb-3">
                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveTab('upload');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'upload'
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : 'bg-white text-[#6B6560] hover:bg-[#F5EBE1] border border-[#E8D8C8]'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-[#E5C158]" />
                    <span>Upload New APK</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveTab('releases');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'releases'
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : 'bg-white text-[#6B6560] hover:bg-[#F5EBE1] border border-[#E8D8C8]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#E5C158]" />
                    <span>Release History ({releases.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveTab('analytics');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : 'bg-white text-[#6B6560] hover:bg-[#F5EBE1] border border-[#E8D8C8]'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-[#E5C158]" />
                    <span>Downloads & Leads</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveTab('seeder');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'seeder'
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : 'bg-white text-[#6B6560] hover:bg-[#F5EBE1] border border-[#E8D8C8]'
                    }`}
                  >
                    <Database className="w-4 h-4 text-[#E5C158]" />
                    <span>SQL Seeder & Setup</span>
                  </button>
                </div>

                {/* TAB 1: UPLOAD NEW APK */}
                {activeTab === 'upload' && (
                  <form onSubmit={handleUploadSubmit} className="space-y-5">
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

                    {/* Drag & Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handleFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                        selectedFile
                          ? 'bg-emerald-50/50 border-emerald-400'
                          : 'bg-white hover:bg-[#F5EBE1]/40 border-[#E8D8C8] hover:border-[#1E3A8A]'
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
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <FileCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-[#1A1817]">
                              {selectedFile.name}
                            </h5>
                            <p className="text-xs text-[#6B6560]">
                              Size: {formatBytes(selectedFile.size)} • Type: Standalone Android APK
                            </p>
                          </div>
                          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            Click to change file
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mx-auto">
                            <UploadCloud className="w-6 h-6 text-[#1E3A8A]" />
                          </div>
                          <h5 className="font-bold text-sm sm:text-base text-[#1A1817]">
                            Drop your updated Android <code className="text-[#1E3A8A]">.apk</code> here
                          </h5>
                          <p className="text-xs text-[#6B6560]">
                            or browse files on your computer (Supported: .apk binaries up to 100MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                          Release Version (e.g. v1.0.2)
                        </label>
                        <input
                          type="text"
                          required
                          value={versionInput}
                          onChange={(e) => setVersionInput(e.target.value)}
                          placeholder="v1.0.2"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] text-xs font-mono font-bold text-[#1A1817] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                          Version Code (Build #)
                        </label>
                        <input
                          type="number"
                          required
                          value={versionCodeInput}
                          onChange={(e) => setVersionCodeInput(Number(e.target.value))}
                          placeholder="2"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] text-xs font-mono font-bold text-[#1A1817] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                          Release Title
                        </label>
                        <input
                          type="text"
                          value={releaseTitleInput}
                          onChange={(e) => setReleaseTitleInput(e.target.value)}
                          placeholder="BibleNote Feature & Performance Release"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] text-xs font-semibold text-[#1A1817] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                          Minimum Android OS Compatibility
                        </label>
                        <input
                          type="text"
                          value={minAndroidInput}
                          onChange={(e) => setMinAndroidInput(e.target.value)}
                          placeholder="Android 8.0+ (Oreo) to 15"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] text-xs font-semibold text-[#1A1817] outline-none"
                        />
                      </div>

                      {/* SHA-256 Checksum Field (Calculated automatically) */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#1A1817] uppercase tracking-wider">
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
                          placeholder="Auto-calculated upon selecting APK, or paste here..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] font-mono text-[11px] text-[#6B6560] outline-none"
                        />
                      </div>

                      {/* Changelog */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                          Changelog & Release Notes
                        </label>
                        <textarea
                          rows={4}
                          value={changelogInput}
                          onChange={(e) => setChangelogInput(e.target.value)}
                          placeholder="• Bullet points describing improvements..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D8C8] focus:border-[#1E3A8A] text-xs text-[#1A1817] outline-none leading-relaxed"
                        />
                      </div>

                      {/* Active Status Checkbox */}
                      <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white border border-[#E8D8C8] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#1A1817] block">
                            Set as Primary Website Download
                          </span>
                          <span className="text-[11px] text-[#6B6560]">
                            Immediately updates the "Get App (.apk)" button and version badges on the landing page.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isActiveToggle}
                          onChange={(e) => setIsActiveToggle(e.target.checked)}
                          className="w-5 h-5 text-[#1E3A8A] rounded focus:ring-[#1E3A8A] accent-[#1E3A8A] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-[#1E3A8A]">
                          <span>Uploading & Processing Binary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#E8D8C8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E3A8A] transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={isUploading || !selectedFile}
                      className="w-full py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold text-sm shadow-xl shadow-[#1E3A8A]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
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
                )}

                {/* TAB 2: RELEASE HISTORY */}
                {activeTab === 'releases' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1A1817]">
                        All Available APK Distributions
                      </h4>
                      <button
                        onClick={loadReleasesList}
                        className="text-xs text-[#1E3A8A] font-bold hover:underline"
                      >
                        Refresh List
                      </button>
                    </div>

                    {isLoadingReleases ? (
                      <div className="py-12 text-center text-xs text-[#6B6560]">Loading releases...</div>
                    ) : releases.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6B6560]">No releases found. Upload one to get started!</div>
                    ) : (
                      <div className="space-y-3">
                        {releases.map((rel) => (
                          <div
                            key={rel.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              rel.isActive
                                ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/10'
                                : 'bg-white border-[#E8D8C8] opacity-90'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8D8C8]/60">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  rel.isActive ? 'bg-[#1E3A8A] text-white' : 'bg-[#F5EBE1] text-[#6B6560]'
                                }`}>
                                  {rel.version}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-sm text-[#1A1817]">
                                      {rel.releaseTitle}
                                    </h5>
                                    {rel.isActive && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                        ACTIVE LIVE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#6B6560]">
                                    {rel.filename} • {rel.fileSizeFormatted} • {rel.minAndroidVersion}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                {!rel.isActive && (
                                  <button
                                    onClick={() => handleSetActive(rel.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] text-xs font-bold transition-colors"
                                  >
                                    Set Active
                                  </button>
                                )}

                                <button
                                  onClick={() => handleCopySha(rel.id, rel.sha256Checksum)}
                                  className="p-2 rounded-xl bg-white border border-[#E8D8C8] text-xs text-[#1A1817] hover:bg-[#F5EBE1] transition-colors"
                                  title="Copy SHA-256 Checksum"
                                >
                                  {copiedShaId === rel.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-[#6B6560]" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDeleteRelease(rel.id)}
                                  className="p-2 rounded-xl bg-white border border-rose-200 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Release"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Release Notes */}
                            <div className="pt-2 text-xs text-[#6B6560] whitespace-pre-line leading-relaxed">
                              {rel.changelog}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ANALYTICS & SUBSCRIBERS */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8]">
                        <span className="text-[10px] text-[#6B6560] font-bold uppercase tracking-wider block">
                          Total Logged Downloads
                        </span>
                        <span className="font-display font-extrabold text-2xl text-[#1E3A8A]">
                          {downloadLogs.length} Events
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8]">
                        <span className="text-[10px] text-[#6B6560] font-bold uppercase tracking-wider block">
                          Active APK Version
                        </span>
                        <span className="font-display font-extrabold text-2xl text-[#966E0C]">
                          {releases.find((r) => r.isActive)?.version || 'v1.0.1'}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8]">
                        <span className="text-[10px] text-[#6B6560] font-bold uppercase tracking-wider block">
                          Email Subscribers
                        </span>
                        <span className="font-display font-extrabold text-2xl text-emerald-700">
                          {subscribersList.length} Leads
                        </span>
                      </div>
                    </div>

                    {/* Subscribers Table & CSV Export */}
                    <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-[#1A1817] flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#1E3A8A]" />
                          <span>Subscriber Leads ({subscribersList.length})</span>
                        </h5>
                        <button
                          onClick={handleExportSubscribersCSV}
                          className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                          <span>Export CSV</span>
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {subscribersList.map((sub, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8D8C8]/60 flex items-center justify-between text-xs"
                          >
                            <span className="font-mono font-semibold text-[#1A1817]">{sub.email}</span>
                            <span className="text-[10px] text-[#6B6560]">
                              {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Download Events Logs */}
                    <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] space-y-3">
                      <h5 className="font-bold text-sm text-[#1A1817] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#1E3A8A]" />
                        <span>Recent APK Download Clicks</span>
                      </h5>

                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {downloadLogs.slice(0, 15).map((log, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8D8C8]/60 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#1A1817] uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#1E3A8A]/10 text-[#1E3A8A] mr-2">
                                {log.platform || 'Android'}
                              </span>
                              <span className="text-[#6B6560] text-[11px]">
                                Version {log.app_version || '1.0.1'} • {log.referrer || 'Direct'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#6B6560]">
                              {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SQL SEEDER & SETUP */}
                {activeTab === 'seeder' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-white border border-[#E8D8C8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-[#1A1817] flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 text-[#1E3A8A]" />
                          <span>Supabase Database Schema & Seeder Files</span>
                        </h5>
                        <button
                          onClick={() => {
                            playSound('tap');
                            navigator.clipboard.writeText(`npm run seed`);
                            setCopiedSql(true);
                            setTimeout(() => setCopiedSql(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] text-[#1E3A8A] font-bold text-[11px] flex items-center gap-1"
                        >
                          {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSql ? 'Copied command' : 'Copy CLI Command'}</span>
                        </button>
                      </div>

                      <p className="text-[#6B6560] leading-relaxed">
                        The repository contains ready-to-run Supabase schema and seeder files for your backend:
                      </p>

                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="p-3 rounded-xl bg-[#1A1817] text-white/90">
                          <span className="text-emerald-400 font-bold">1. SQL Schema:</span> <code className="text-[#E5C158]">supabase/schema.sql</code>
                          <p className="text-white/60 text-[10px] mt-1">
                            Creates `app_releases`, `download_events`, `subscribers` tables, RLS policies, and `app-releases` storage bucket.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#1A1817] text-white/90">
                          <span className="text-emerald-400 font-bold">2. SQL Seeder:</span> <code className="text-[#E5C158]">supabase/seed.sql</code>
                          <p className="text-white/60 text-[10px] mt-1">
                            Creates configured administrator account with encrypted password, seeds v1.0.1 & v1.2.0 releases, and analytics.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#1A1817] text-white/90">
                          <span className="text-emerald-400 font-bold">3. Node.js Seeder:</span> <code className="text-[#E5C158]">npm run seed</code>
                          <p className="text-white/60 text-[10px] mt-1">
                            Executes automated registration and verification against your configured Supabase project.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
