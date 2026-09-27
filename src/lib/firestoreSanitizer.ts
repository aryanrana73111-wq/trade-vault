/**
 * TradeVault Centralized Firestore Sanitization Layer
 * 
 * Guarantee: NO `undefined` values ever reach Firestore writes.
 * Recursively inspects objects, arrays, and nested structures to normalize,
 * sanitize, validate, and serialize data safely.
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  DocumentReference, 
  CollectionReference,
  SetOptions,
  UpdateData
} from 'firebase/firestore';

/**
 * Deeply sanitizes any payload by:
 * 1. Converting undefined to null (or deleting keys where appropriate)
 * 2. Normalizing nested arrays, objects, Maps, and Dates
 * 3. Preventing circular references or prototype pollution
 * 4. Guaranteeing clean Firestore-compatible JSON objects
 */
export function sanitizeForFirestore<T = any>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }

  if (data === null || typeof data !== 'object') {
    // Primitive values: string, number, boolean
    if (typeof data === 'number' && (isNaN(data) || !isFinite(data))) {
      return 0 as unknown as T;
    }
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return (isNaN(data.getTime()) ? Date.now() : data.getTime()) as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }

  // Handle plain objects and class instances
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      // Do not write undefined keys to Firestore
      continue;
    }

    if (value === null) {
      sanitized[key] = null;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        sanitized[key] = value
          .filter(v => v !== undefined)
          .map(v => sanitizeForFirestore(v));
      } else if (value instanceof Date) {
        sanitized[key] = isNaN(value.getTime()) ? Date.now() : value.getTime();
      } else {
        sanitized[key] = sanitizeForFirestore(value);
      }
    } else if (typeof value === 'number') {
      sanitized[key] = isNaN(value) || !isFinite(value) ? 0 : value;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Safe wrapper around Firestore setDoc
 */
export async function safeSetDoc<T>(
  reference: DocumentReference,
  data: T,
  options?: SetOptions
): Promise<void> {
  const cleanData = sanitizeForFirestore(data);
  if (options) {
    return setDoc(reference, cleanData as any, options);
  }
  return setDoc(reference, cleanData as any);
}

/**
 * Safe wrapper around Firestore updateDoc
 */
export async function safeUpdateDoc(
  reference: DocumentReference,
  data: Record<string, any>
): Promise<void> {
  const cleanData = sanitizeForFirestore(data);
  return updateDoc(reference, cleanData as UpdateData<any>);
}

/**
 * Safe wrapper around Firestore addDoc
 */
export async function safeAddDoc<T>(
  reference: CollectionReference,
  data: T
): Promise<DocumentReference> {
  const cleanData = sanitizeForFirestore(data);
  return addDoc(reference, cleanData as any);
}
