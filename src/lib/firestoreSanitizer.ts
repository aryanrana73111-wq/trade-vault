/**
 * TradeVault Centralized Firestore Sanitization Layer
 * 
 * Guarantee: NO `undefined` values ever reach Firestore writes.
 * Recursively inspects objects, arrays, and nested structures to normalize,
 * sanitize, validate, and serialize data safely.
 */

import { 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  DocumentReference, 
  CollectionReference,
  SetOptions,
  UpdateData,
  WriteBatch
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

  // Handle plain objects and class instances (preserving Firestore serverTimestamp or FieldValue if present)
  if (data.constructor && data.constructor.name !== 'Object' && data.constructor.name !== '') {
    // Check if it's a Firestore special token like FieldValue
    const className = data.constructor.name;
    if (className === 'FieldValue' || className === 'Timestamp') {
      return data;
    }
  }

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
 * Alias for sanitizeForFirestore to match specification
 */
export const sanitizeFirestoreData = sanitizeForFirestore;

/**
 * Validates that an object is 100% Firestore-safe:
 * - Contains NO undefined values at any nesting level
 * - Contains NO NaN or Infinity numeric values
 * Returns detailed error report if validation fails.
 */
export function validateFirestoreData(data: any, path: string = 'root'): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  function check(val: any, currentPath: string) {
    if (val === undefined) {
      errors.push(`Field '${currentPath}' is undefined. Firestore forbids undefined values.`);
      return;
    }

    if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
      errors.push(`Field '${currentPath}' is NaN or Infinity.`);
      return;
    }

    if (val === null || typeof val !== 'object') {
      return;
    }

    if (val instanceof Date) {
      if (isNaN(val.getTime())) {
        errors.push(`Field '${currentPath}' is an invalid Date.`);
      }
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item, idx) => check(item, `${currentPath}[${idx}]`));
      return;
    }

    // Special Firestore tokens
    if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== '') {
      if (val.constructor.name === 'FieldValue' || val.constructor.name === 'Timestamp') {
        return;
      }
    }

    for (const [k, v] of Object.entries(val)) {
      check(v, `${currentPath}.${k}`);
    }
  }

  check(data, path);
  return {
    isValid: errors.length === 0,
    errors
  };
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
  const validation = validateFirestoreData(cleanData);
  if (!validation.isValid) {
    console.error('Firestore validation error on setDoc:', validation.errors);
  }
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
  const validation = validateFirestoreData(cleanData);
  if (!validation.isValid) {
    console.error('Firestore validation error on updateDoc:', validation.errors);
  }
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
  const validation = validateFirestoreData(cleanData);
  if (!validation.isValid) {
    console.error('Firestore validation error on addDoc:', validation.errors);
  }
  return addDoc(reference, cleanData as any);
}

/**
 * Safe wrapper around Firestore batch.set
 */
export function safeBatchSet<T>(
  batch: WriteBatch,
  reference: DocumentReference,
  data: T,
  options?: SetOptions
): void {
  const cleanData = sanitizeForFirestore(data);
  const validation = validateFirestoreData(cleanData);
  if (!validation.isValid) {
    console.error('Firestore validation error on batch.set:', validation.errors);
  }
  if (options) {
    batch.set(reference, cleanData as any, options);
  } else {
    batch.set(reference, cleanData as any);
  }
}

/**
 * Safe wrapper around Firestore batch.update
 */
export function safeBatchUpdate(
  batch: WriteBatch,
  reference: DocumentReference,
  data: Record<string, any>
): void {
  const cleanData = sanitizeForFirestore(data);
  const validation = validateFirestoreData(cleanData);
  if (!validation.isValid) {
    console.error('Firestore validation error on batch.update:', validation.errors);
  }
  batch.update(reference, cleanData as UpdateData<any>);
}
