export type EventImportance = 'HIGH' | 'MEDIUM' | 'LOW' | 'NON-ECONOMIC';

export interface NormalizedEconomicEvent {
  id: string;
  source?: string;
  sourceEventId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm format
  dateTime: string; // ISO 8601 UTC
  timestampUtc?: string;
  timestampLocal?: string;
  timezone?: string;
  country: string;
  countryCode: string; // US, EU, GB, JP, CA, AU, CH, NZ, CN, WW
  currency: string;
  currencyName?: string;
  event: string;
  importance: EventImportance;
  previous?: string | null;
  forecast?: string | null;
  actual?: string | null;
  revision?: string | null;
  unit?: string | null;
  frequency?: string | null;
  category?: string | null;
  description?: string | null;
  status: 'SCHEDULED' | 'UPCOMING' | 'RELEASED' | 'AWAITING_ACTUAL' | 'UNCONFIRMED' | 'CANCELLED';
  sourceUrl?: string | null;
  affectedMarkets?: string[];
}

export interface EconomicCalendarFilterParams {
  date: string; // YYYY-MM-DD
  currency?: string;
  importance?: EventImportance | 'ALL';
  searchQuery?: string;
}

