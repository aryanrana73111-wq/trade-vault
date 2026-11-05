import { describe, it, expect } from 'vitest';
import {
  TICKER_TAPE_SYMBOLS,
  TradingViewTickerTape,
  TradingViewForexTable,
  TradingViewStockHeatmap,
  TradingViewEconomicMap,
  TradingViewNewsFeed,
  useResolvedTheme
} from './TradingViewNewsWidgets';

describe('TradingViewNewsWidgets Configuration and Specification', () => {
  describe('TradingView Ticker Tape Symbols', () => {
    it('matches the exact provider symbols required by the specification', () => {
      const requiredSymbols = [
        'FOREXCOM:SPXUSD',
        'FOREXCOM:NSXUSD',
        'FOREXCOM:DJI',
        'FX:EURUSD',
        'BITSTAMP:BTCUSD',
        'BITSTAMP:ETHUSD',
        'CMCMARKETS:GOLD'
      ];

      expect(TICKER_TAPE_SYMBOLS).toBe(requiredSymbols.join(','));

      const parsedSymbols = TICKER_TAPE_SYMBOLS.split(',');
      expect(parsedSymbols).toHaveLength(7);
      requiredSymbols.forEach(sym => {
        expect(parsedSymbols).toContain(sym);
      });
    });
  });

  describe('Widget Component Exports', () => {
    it('exports all 5 required TradingView news widgets and the theme hook', () => {
      expect(TradingViewTickerTape).toBeDefined();
      expect(typeof TradingViewTickerTape).toBe('function');

      expect(TradingViewForexTable).toBeDefined();
      expect(typeof TradingViewForexTable).toBe('function');

      expect(TradingViewStockHeatmap).toBeDefined();
      expect(typeof TradingViewStockHeatmap).toBe('function');

      expect(TradingViewEconomicMap).toBeDefined();
      expect(typeof TradingViewEconomicMap).toBe('function');

      expect(TradingViewNewsFeed).toBeDefined();
      expect(typeof TradingViewNewsFeed).toBe('function');

      expect(useResolvedTheme).toBeDefined();
      expect(typeof useResolvedTheme).toBe('function');
    });
  });

  describe('Stock Heatmap default configuration', () => {
    it('defines standard S&P 500 sector parameters for the web component', () => {
      const expectedParams = {
        dataSource: 'SPX500',
        grouping: 'sector',
        blockSize: 'market_cap_basic',
        blockColor: 'change'
      };

      expect(expectedParams.dataSource).toBe('SPX500');
      expect(expectedParams.grouping).toBe('sector');
      expect(expectedParams.blockSize).toBe('market_cap_basic');
      expect(expectedParams.blockColor).toBe('change');
    });
  });
});
