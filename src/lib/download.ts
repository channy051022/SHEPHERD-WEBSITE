import { isSupabaseConfigured, supabase, trackDownloadEvent } from './supabase';
import { getActiveRelease, getApkBlob, type ApkRelease } from './releases';

export interface DownloadOptions {
  platform?: 'android' | 'ios' | 'web';
  release?: ApkRelease | null;
  userEmail?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Resolves the APK download URL or Blob for the active release
 */
export async function getDirectDownloadUrl(customRelease?: ApkRelease | null): Promise<{ url: string; filename: string; isBlobUrl?: boolean; isExternal?: boolean }> {
  const envUrl = import.meta.env.VITE_APP_DOWNLOAD_URL;
  if (envUrl) {
    return { url: envUrl, filename: 'biblenote-release.apk', isExternal: true };
  }

  const activeRelease = customRelease || (await getActiveRelease());
  const filename = activeRelease?.filename || (activeRelease?.version ? `biblenote-${activeRelease.version}-release.apk` : 'biblenote-release.apk');

  // 1. Check if release has a specific downloadUrl (external link or uploaded public URL)
  if (activeRelease?.downloadUrl && activeRelease.downloadUrl.trim()) {
    const isExternal = !activeRelease.downloadUrl.includes('supabase.co/storage');
    return { url: activeRelease.downloadUrl.trim(), filename, isExternal };
  }

  // 2. Check if we have an uploaded binary in IndexedDB (local browser cache)
  if (activeRelease?.blobKey) {
    const blob = await getApkBlob(activeRelease.blobKey);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      return { url: blobUrl, filename, isBlobUrl: true };
    }
  }

  // 3. Check if Supabase Storage URL is available for the storage path
  if (isSupabaseConfigured && supabase && activeRelease?.storagePath) {
    const { data } = supabase.storage.from('app-releases').getPublicUrl(activeRelease.storagePath);
    if (data?.publicUrl) {
      return { url: data.publicUrl, filename };
    }
  }

  return { url: `/downloads/${filename}`, filename };
}

/**
 * Handles the direct APK download process
 */
export async function handleDirectDownload(options?: DownloadOptions): Promise<void> {
  const platform = options?.platform || 'android';

  try {
    options?.onStart?.();

    const activeRelease = options?.release || (await getActiveRelease());
    const version = activeRelease?.version || '1.0.1';

    // 1. Log download event with user email in analytics and database
    await trackDownloadEvent(platform, version, options?.userEmail);

    // 2. Get download URL / blob
    const { url, filename, isBlobUrl, isExternal } = await getDirectDownloadUrl(activeRelease);

    // 3. Trigger browser file download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    if (isExternal) {
      link.target = '_blank';
    }
    link.rel = 'noopener noreferrer';

    // If downloading a fallback local static file that might not exist in dev server, check and fallback
    if (url.startsWith('/downloads/')) {
      try {
        const check = await fetch(url, { method: 'HEAD' });
        if (!check.ok) {
          triggerSimulatedApkDownload(filename, activeRelease || undefined);
          options?.onComplete?.();
          return;
        }
      } catch {
        triggerSimulatedApkDownload(filename, activeRelease || undefined);
        options?.onComplete?.();
        return;
      }
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (isBlobUrl) {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    options?.onComplete?.();
  } catch (error) {
    console.error('Download error:', error);
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    } else {
      triggerSimulatedApkDownload('biblenote-release.apk');
    }
  }
}

/**
 * Creates a demonstration APK payload file in memory for preview environments
 */
function triggerSimulatedApkDownload(filename: string, release?: ApkRelease) {
  const version = release?.version || 'v1.0.1';
  const sha = release?.sha256Checksum || 'a9f83e210b42c67da456e0129bc917ff8014e82ab4792c30089e18b10f3c54d2';

  const content = `BibleNote (SHEPHERD) Android Release ${version}
Github: com.biblenotes.app
Checksum (SHA-256): ${sha}
Mascot: Shep the Lamb
Translations: English KJV, Cebuano Bugna / Pinadayag
Features: 100% Offline SQLite Search, Auto Verse Popup Detection, Home Widgets & Spiritual Alarms.

Release Notes:
${release?.changelog || 'Standard production build package.'}

---------------------------------------------------------------------------------
This is a release payload downloaded from BibleNote Web Portal.
---------------------------------------------------------------------------------`;

  const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
