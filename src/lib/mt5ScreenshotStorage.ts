import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImageToDataUrl } from './avatarStorage';
import { MT5ScreenshotMetadata } from '../types/mt5Screenshot';

export interface SaveScreenshotParams {
  uid: string;
  tradeId: string;
  dataUrl: string;
  fileName?: string;
  mimeType?: string;
  rawSymbol?: string;
  ticketId?: string;
  analysisId?: string;
  currentImageId?: string;
}

export interface SaveScreenshotResult {
  url: string;
  metadata: MT5ScreenshotMetadata;
}

/**
 * Saves original MT5 screenshot as a trade attachment
 * Tries Firebase Storage first; falls back to compressed high-res data URL.
 */
export async function saveMT5ScreenshotAttachment(
  params: SaveScreenshotParams
): Promise<SaveScreenshotResult> {
  const { uid, tradeId, dataUrl, fileName = 'mt5_screenshot.jpg', mimeType = 'image/jpeg', rawSymbol, ticketId, analysisId, currentImageId } = params;
  const now = Date.now();
  const screenshotId = `mt5_ss_${now}_${Math.random().toString(36).slice(2, 8)}`;

  let finalUrl = dataUrl;
  let storagePath: string | undefined = undefined;

  // 1. Try Firebase Storage if online and storage initialized
  if (typeof navigator !== 'undefined' && navigator.onLine && storage && dataUrl.startsWith('data:')) {
    try {
      const ext = fileName.split('.').pop() || 'jpg';
      const cleanFileName = `screenshot_${screenshotId}.${ext}`;
      const path = `users/${uid}/trades/${tradeId || 'pending'}/screenshots/${cleanFileName}`;
      const storageRef = ref(storage, path);

      // Convert base64 dataUrl to Uint8Array Blob
      const base64Part = dataUrl.split(',')[1];
      if (base64Part) {
        const byteCharacters = atob(base64Part);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const uploadPromise = uploadBytes(storageRef, blob, {
          contentType: mimeType,
          customMetadata: {
            ownerUid: uid,
            uploadedAt: now.toString(),
            source: 'mt5_screenshot',
            analysisId: analysisId || '',
            currentImageId: currentImageId || '',
            rawSymbol: rawSymbol || '',
            ticketId: ticketId || ''
          }
        }).then(snap => getDownloadURL(snap.ref));

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cloud storage upload timed out')), 4000)
        );

        const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (cloudUrl) {
          finalUrl = cloudUrl;
          storagePath = path;
        }
      }
    } catch (storageErr) {
      console.warn('Firebase Storage notice (persisting via optimized data URL fallback):', storageErr);
    }
  }

  const metadata: MT5ScreenshotMetadata = {
    screenshotId,
    analysisId,
    currentImageId,
    storagePath,
    fileName,
    mimeType,
    uploadedAt: now,
    source: 'mt5_screenshot',
    analysisVersion: 'mt5-screenshot-v2',
    fileSize: Math.round(dataUrl.length * 0.75),
    rawSymbol,
    ticketId
  };

  return {
    url: finalUrl,
    metadata
  };
}
