import { supabase, isSupabaseConfigured } from './supabase';

export interface ApkRelease {
  id: string | number;
  version: string;
  versionCode: number;
  releaseTitle: string;
  filename: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  storagePath: string;
  downloadUrl?: string;
  sha256Checksum: string;
  changelog: string;
  minAndroidVersion: string;
  isActive: boolean;
  isBeta?: boolean;
  downloadsCount: number;
  createdAt: string;
  blobKey?: string; // IndexedDB key if saved locally
}

export interface NewReleasePayload {
  version: string;
  versionCode: number;
  releaseTitle: string;
  minAndroidVersion: string;
  changelog: string;
  sha256Checksum?: string;
  isActive: boolean;
  isBeta?: boolean;
  file: File;
}

const LOCAL_RELEASES_STORAGE_KEY = 'biblenote_apk_releases';
const IDB_NAME = 'BibleNoteStorage';
const IDB_STORE = 'apk_binaries';

// Event listeners for live UI synchronization
type ReleaseChangeListener = (activeRelease: ApkRelease | null) => void;
const listeners: Set<ReleaseChangeListener> = new Set();

export function subscribeReleaseChanges(listener: ReleaseChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyReleaseChange(activeRelease: ApkRelease | null) {
  listeners.forEach((fn) => {
    try {
      fn(activeRelease);
    } catch (e) {
      console.warn('Error notifying release listener:', e);
    }
  });
}

/**
 * Open IndexedDB for storing offline APK binary Blobs
 */
function openApkDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save binary blob to IndexedDB
 */
export async function saveApkBlob(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openApkDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not save APK blob to IndexedDB:', e);
  }
}

/**
 * Retrieve binary blob from IndexedDB
 */
export async function getApkBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openApkDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Calculate SHA-256 hash of a File using Web Crypto API
 */
export async function calculateFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper to format bytes into readable string (e.g. 18.5 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Fetch all releases from Supabase app_releases table or local storage (NO DUMMY DATA)
 */
export async function getAllReleases(): Promise<ApkRelease[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_releases')
        .select('*')
        .order('version_code', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          version: item.version,
          versionCode: item.version_code,
          releaseTitle: item.release_title || `BibleNote ${item.version}`,
          filename: item.filename || 'biblenote-release.apk',
          fileSizeBytes: Number(item.file_size_bytes) || 0,
          fileSizeFormatted: item.file_size_formatted || formatBytes(Number(item.file_size_bytes) || 0),
          storagePath: item.storage_path || 'biblenote-release.apk',
          downloadUrl: item.download_url,
          sha256Checksum: item.sha256_checksum || '',
          changelog: item.changelog || '',
          minAndroidVersion: item.min_android_version || 'Android 8.0+',
          isActive: Boolean(item.is_active),
          isBeta: Boolean(item.is_beta),
          downloadsCount: item.downloads_count || 0,
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch releases from Supabase:', err);
    }
  }

  // Fallback to local storage (only actual user uploads)
  try {
    const stored = localStorage.getItem(LOCAL_RELEASES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Filter out any old mock seed IDs
        const actualUploads = parsed.filter((r) => r.id !== 'seed-1' && r.id !== 'seed-2');
        return actualUploads;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Fetch current active release (or null if no releases uploaded yet)
 */
export async function getActiveRelease(): Promise<ApkRelease | null> {
  const releases = await getAllReleases();
  const active = releases.find((r) => r.isActive) || releases[0] || null;
  return active;
}

/**
 * Upload and publish a new APK release
 */
export async function uploadNewRelease(
  payload: NewReleasePayload,
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; release?: ApkRelease; message?: string }> {
  try {
    onProgress?.(10);

    const filename = payload.file.name.endsWith('.apk')
      ? payload.file.name
      : `biblenote-${payload.version}-release.apk`;

    const fileSizeBytes = payload.file.size;
    const fileSizeFormatted = formatBytes(fileSizeBytes);

    // Compute or verify SHA-256
    onProgress?.(30);
    const calculatedHash = payload.sha256Checksum || (await calculateFileSha256(payload.file));
    onProgress?.(60);

    let storagePath = `releases/${payload.version}/${filename}`;
    let downloadUrl: string | undefined;
    const blobKey = `apk_${payload.version}_${Date.now()}`;

    // 1. Save binary in IndexedDB for instant browser local access
    await saveApkBlob(blobKey, payload.file);

    // 2. If Supabase configured, upload to Supabase Storage bucket 'app-releases'
    if (isSupabaseConfigured && supabase) {
      try {
        onProgress?.(75);
        // Also upload/overwrite primary 'biblenote-release.apk' if active
        if (payload.isActive) {
          await supabase.storage.from('app-releases').upload('biblenote-release.apk', payload.file, {
            upsert: true,
            contentType: 'application/vnd.android.package-archive'
          });
        }

        // Upload versioned release file
        const { error: uploadError } = await supabase.storage
          .from('app-releases')
          .upload(storagePath, payload.file, {
            upsert: true,
            contentType: 'application/vnd.android.package-archive'
          });

        if (uploadError) {
          console.warn('Storage bucket upload notice:', uploadError.message);
          storagePath = 'biblenote-release.apk';
        }

        const { data: publicUrlData } = supabase.storage.from('app-releases').getPublicUrl(storagePath);
        downloadUrl = publicUrlData?.publicUrl;
      } catch (uploadErr) {
        console.warn('Supabase storage upload error:', uploadErr);
      }
    }

    onProgress?.(90);

    const newRelease: ApkRelease = {
      id: isSupabaseConfigured ? Date.now() : `rel_${Date.now()}`,
      version: payload.version,
      versionCode: payload.versionCode,
      releaseTitle: payload.releaseTitle,
      filename,
      fileSizeBytes,
      fileSizeFormatted,
      storagePath,
      downloadUrl,
      sha256Checksum: calculatedHash,
      changelog: payload.changelog,
      minAndroidVersion: payload.minAndroidVersion,
      isActive: payload.isActive,
      isBeta: Boolean(payload.isBeta),
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      blobKey
    };

    // 3. Save release metadata in Supabase table
    if (isSupabaseConfigured && supabase) {
      try {
        if (payload.isActive) {
          // Deactivate other releases
          await supabase.from('app_releases').update({ is_active: false }).neq('version', payload.version);
        }

        const { data, error: insertError } = await supabase
          .from('app_releases')
          .upsert([
            {
              version: newRelease.version,
              version_code: newRelease.versionCode,
              release_title: newRelease.releaseTitle,
              filename: newRelease.filename,
              file_size_bytes: newRelease.fileSizeBytes,
              file_size_formatted: newRelease.fileSizeFormatted,
              storage_path: newRelease.storagePath,
              download_url: newRelease.downloadUrl,
              sha256_checksum: newRelease.sha256Checksum,
              changelog: newRelease.changelog,
              min_android_version: newRelease.minAndroidVersion,
              is_active: newRelease.isActive,
              is_beta: newRelease.isBeta,
              downloads_count: 0
            }
          ], { onConflict: 'version' })
          .select()
          .single();

        if (!insertError && data) {
          newRelease.id = data.id;
        }
      } catch (dbErr) {
        console.warn('Supabase db insert notice:', dbErr);
      }
    }

    // 4. Update local registry
    try {
      const existing = await getAllReleases();
      let updatedList = existing.map((r) => (payload.isActive ? { ...r, isActive: false } : r));
      const existingIdx = updatedList.findIndex((r) => r.version === newRelease.version);
      if (existingIdx !== -1) {
        updatedList[existingIdx] = newRelease;
      } else {
        updatedList.unshift(newRelease);
      }
      localStorage.setItem(LOCAL_RELEASES_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    onProgress?.(100);

    if (payload.isActive) {
      notifyReleaseChange(newRelease);
    }

    return {
      success: true,
      release: newRelease
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown upload error';
    return {
      success: false,
      message: msg
    };
  }
}

/**
 * Set an APK release as the active live download
 */
export async function setActiveRelease(id: string | number): Promise<boolean> {
  const releases = await getAllReleases();
  const target = releases.find((r) => r.id === id || String(r.id) === String(id));
  if (!target) return false;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_releases').update({ is_active: false }).neq('id', target.id);
      await supabase.from('app_releases').update({ is_active: true }).eq('id', target.id);
    } catch (e) {
      console.warn('Error setting active release in Supabase:', e);
    }
  }

  const updated = releases.map((r) => ({
    ...r,
    isActive: r.id === target.id || String(r.id) === String(target.id)
  }));
  localStorage.setItem(LOCAL_RELEASES_STORAGE_KEY, JSON.stringify(updated));

  const newActive = updated.find((r) => r.isActive) || null;
  notifyReleaseChange(newActive);

  return true;
}

/**
 * Delete an APK release
 */
export async function deleteRelease(id: string | number): Promise<boolean> {
  const releases = await getAllReleases();
  const target = releases.find((r) => r.id === id || String(r.id) === String(id));
  if (!target) return false;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_releases').delete().eq('id', target.id);
    } catch (e) {
      console.warn('Error deleting release from Supabase:', e);
    }
  }

  const filtered = releases.filter((r) => r.id !== target.id && String(r.id) !== String(target.id));
  localStorage.setItem(LOCAL_RELEASES_STORAGE_KEY, JSON.stringify(filtered));

  const newActive = filtered.find((r) => r.isActive) || filtered[0] || null;
  notifyReleaseChange(newActive);

  return true;
}
