export type EventImportance = 'HIGH' | 'MEDIUM' | 'LOW';

export interface NormalizedEconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm format (or e.g. "10:00 AM")
  dateTime: string; // ISO 8601
  country: string;
  countryCode: string; // US, EU, GB, JP, CA, AU, etc.
  currency: string;
  event: string;
  importance: EventImportance;
  previous?: string;
  forecast?: string;
  actual?: string;
  revision?: string;
  status: 'SCHEDULED' | 'RELEASED';
  source?: string;
  sourceUrl?: string;
  unit?: string;
  category?: string;
  description?: string;
  affectedMarkets?: string[];
}

export interface EconomicCalendarFilterParams {
  date: string; // YYYY-MM-DD
  currency?: string;
  importance?: EventImportance | 'ALL';
  searchQuery?: string;
}
