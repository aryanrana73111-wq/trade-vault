import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MARKET_OVERVIEW_SECTORS,
  DEFAULT_MARKET_DATA_SECTORS,
} from './TradingViewWidgets';

describe('TradingViewWidgets Sector Configurations', () => {
  describe('DEFAULT_MARKET_OVERVIEW_SECTORS', () => {
    it('is a valid JSON string matching the official TradingView widget specification', () => {
      const parsed = JSON.parse(DEFAULT_MARKET_OVERVIEW_SECTORS);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);

      expect(parsed[0].sectionName).toBe('Indices');
      expect(parsed[0].symbols).toEqual([
        'FOREXCOM:SPXUSD',
        'FOREXCOM:NSXUSD',
        'FOREXCOM:DJI',
        'FOREXCOM:UKXGBP',
      ]);

      expect(parsed[1].sectionName).toBe('Stocks');
      expect(parsed[1].symbols).toEqual([
        'NASDAQ:AAPL',
        'NASDAQ:ADBE',
        'NASDAQ:NVDA',
        'NASDAQ:TSLA',
      ]);

      expect(parsed[2].sectionName).toBe('Crypto');
      expect(parsed[2].symbols).toEqual([
        'BITSTAMP:BTCUSD',
        'BITSTAMP:ETHUSD',
        'CRYPTO:XRPUSD',
      ]);
    });
  });

  describe('DEFAULT_MARKET_DATA_SECTORS', () => {
    it('is a valid JSON string matching the multi-asset sector specification', () => {
      const parsed = JSON.parse(DEFAULT_MARKET_DATA_SECTORS);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(4);

      expect(parsed[0].sectionName).toBe('Indices');
      expect(parsed[0].symbols).toEqual([
        'FOREXCOM:SPXUSD',
        'FOREXCOM:NSXUSD',
        'FOREXCOM:DJI',
        'INDEX:NKY',
        'INDEX:DEU40',
        'FOREXCOM:UKXGBP',
      ]);

      expect(parsed[1].sectionName).toBe('Futures');
      expect(parsed[1].symbols).toEqual([
        'BMFBOVESPA:ISP1!',
        'BMFBOVESPA:EUR1!',
        'CMCMARKETS:GOLD',
        'TVC:USOIL',
        'BMFBOVESPA:CCM1!',
      ]);

      expect(parsed[2].sectionName).toBe('Bonds');
      expect(parsed[2].symbols).toEqual([
        'EUREX:FGBL1!',
        'EUREX:FBTP1!',
        'EUREX:FGBM1!',
      ]);

      expect(parsed[3].sectionName).toBe('Forex');
      expect(parsed[3].symbols).toEqual([
        'FX:EURUSD',
        'FX:GBPUSD',
        'FX:USDJPY',
        'FX:USDCHF',
        'FX:AUDUSD',
        'FX:USDCAD',
      ]);
    });
  });
});
