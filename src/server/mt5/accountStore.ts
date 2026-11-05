import { ConnectedTradingAccount } from '../../types/mt5';
import { firebaseAppConfig } from '../firebaseAdmin';

// In-memory cache of authenticated MT5 trading accounts to avoid redundant DB roundtrips
const accountCache = new Map<string, ConnectedTradingAccount>();

export function getCachedAccount(accountId: string): ConnectedTradingAccount | undefined {
  return accountCache.get(accountId);
}

export function setCachedAccount(accountId: string, account: ConnectedTradingAccount): void {
  const existing = accountCache.get(accountId);
  accountCache.set(accountId, {
    ...existing,
    ...account
  });
}

function parseFirestoreRestFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) result[k] = v.stringValue;
    else if (v.integerValue !== undefined) result[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) result[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) result[k] = v.booleanValue;
    else if (v.nullValue !== undefined) result[k] = null;
    else if (v.mapValue && v.mapValue.fields) result[k] = parseFirestoreRestFields(v.mapValue.fields);
    else if (v.arrayValue && v.arrayValue.values) result[k] = v.arrayValue.values.map((item: any) => {
      if (item.stringValue !== undefined) return item.stringValue;
      if (item.integerValue !== undefined) return Number(item.integerValue);
      if (item.doubleValue !== undefined) return Number(item.doubleValue);
      if (item.booleanValue !== undefined) return item.booleanValue;
      if (item.mapValue && item.mapValue.fields) return parseFirestoreRestFields(item.mapValue.fields);
      return item;
    });
    else result[k] = v;
  }
  return result;
}

export async function fetchAccountViaRest(uid: string, accountId: string, token: string): Promise<ConnectedTradingAccount | null> {
  try {
    const cfg = firebaseAppConfig;
    if (!cfg.projectId || !token) return null;
    const dbId = encodeURIComponent(cfg.firestoreDatabaseId || '(default)');
    const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents/users/${encodeURIComponent(uid)}/tradingAccounts/${encodeURIComponent(accountId)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const doc = await res.json();
    if (!doc.fields) return null;
    const parsed = parseFirestoreRestFields(doc.fields);
    return { id: accountId, ...parsed } as ConnectedTradingAccount;
  } catch {
    return null;
  }
}
