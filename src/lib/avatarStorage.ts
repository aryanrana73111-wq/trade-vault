import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface AvatarUploadResult {
  url: string;
}

/**
 * Compresses and resizes any image file using an offscreen HTML5 canvas.
 * Produces a lightweight, crisp WebP/JPEG data URL (~20-40KB) that fits easily in Firestore.
 */
export async function compressImageToDataUrl(
  file: File, 
  maxWidth = 400, 
  maxHeight = 400, 
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const rawDataUrl = (e.target?.result as string) || '';
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(rawDataUrl);
        }

        // Fill subtle white background for transparent images
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Export as WebP or JPEG
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (!dataUrl || dataUrl.length < 50) {
          dataUrl = rawDataUrl;
        }

        resolve(dataUrl);
      };

      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Robust photo uploader:
 * 1. Validates file format and size
 * 2. Compresses the photo to an optimized high-fidelity thumbnail (~25KB)
 * 3. Attempts Firebase Cloud Storage with a safe 3.5-second timeout
 * 4. If Cloud Storage fails, CORS blocks it, or the bucket is not available,
 *    gracefully falls back to the compressed data URL which saves directly into
 *    the user's Firestore profile without any errors.
 */
export async function uploadAvatarFile(uid: string, file: File): Promise<AvatarUploadResult> {
  // Validate format flexibly
  const lowerType = file.type?.toLowerCase() || '';
  const isImageByMime = lowerType.startsWith('image/') || ALLOWED_MIME_TYPES.includes(lowerType);
  const isImageByName = /\.(jpe?g|png|webp|gif|jfif|bmp|svg|heic|heif|avif)$/i.test(file.name);

  if (!isImageByMime && !isImageByName) {
    throw new Error('Please select an image file (JPG, PNG, WEBP, GIF, etc.).');
  }

  // Size validation (up to 15MB)
  if (file.size > 15 * 1024 * 1024) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeInMB}MB). Maximum allowed size is 15MB.`);
  }

  // 1. Locally optimize and compress image to high-fidelity square crop
  const compressedDataUrl = await compressImageToDataUrl(file, 380, 380, 0.85);

  // 2. Attempt Cloud Storage upload if available
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine && storage) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar_${Date.now()}.${extension}`;
      const avatarRef = ref(storage, `users/${uid}/avatar/${fileName}`);

      const uploadPromise = uploadBytes(avatarRef, file, {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          ownerUid: uid,
          uploadedAt: Date.now().toString(),
        },
      }).then((snapshot) => getDownloadURL(snapshot.ref));

      // 3.5s timeout prevents UI hang if Cloud Storage is blocked by CORS or security rules
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cloud storage timed out')), 3500)
      );

      const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
      if (cloudUrl) {
        return { url: cloudUrl };
      }
    }
  } catch (storageErr) {
    console.warn('Firebase Storage upload notice (using optimized profile data URL fallback):', storageErr);
  }

  // 3. Always return the optimized high-res data URL if cloud storage is unavailable
  return { url: compressedDataUrl };
}
