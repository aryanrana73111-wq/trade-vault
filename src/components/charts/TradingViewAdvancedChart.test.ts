import { describe, it, expect } from 'vitest';
import {
  formatTradingViewSymbol,
  formatTradingViewInterval,
} from './TradingViewAdvancedChart';

describe('TradingViewAdvancedChart Helper Functions', () => {
  describe('formatTradingViewSymbol', () => {
    it('defaults to NASDAQ:NDX when no symbol or empty string is provided', () => {
      expect(formatTradingViewSymbol()).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('')).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('   ')).toBe('NASDAQ:NDX');
    });

    it('correctly normalizes institutional tech index symbols to NASDAQ:NDX', () => {
      expect(formatTradingViewSymbol('NASDAQ')).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('^NDX')).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('ndx')).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('US100')).toBe('NASDAQ:NDX');
      expect(formatTradingViewSymbol('nas100')).toBe('NASDAQ:NDX');
    });

    it('correctly maps major forex pairs to FX format', () => {
      expect(formatTradingViewSymbol('EUR/USD')).toBe('FX:EURUSD');
      expect(formatTradingViewSymbol('GBP/USD')).toBe('FX:GBPUSD');
      expect(formatTradingViewSymbol('USD/JPY')).toBe('FX:USDJPY');
    });

    it('correctly maps crypto pairs to Binance format', () => {
      expect(formatTradingViewSymbol('BTC/USDT')).toBe('BINANCE:BTCUSDT');
      expect(formatTradingViewSymbol('ETH/USDT')).toBe('BINANCE:ETHUSDT');
    });

    it('correctly maps precious metals to OANDA format', () => {
      expect(formatTradingViewSymbol('XAU/USD')).toBe('OANDA:XAUUSD');
      expect(formatTradingViewSymbol('GOLD')).toBe('OANDA:XAUUSD');
    });

    it('preserves already qualified exchange:symbol tickers', () => {
      expect(formatTradingViewSymbol('NASDAQ:AAPL')).toBe('NASDAQ:AAPL');
      expect(formatTradingViewSymbol('AMEX:SPY')).toBe('AMEX:SPY');
      expect(formatTradingViewSymbol('BINANCE:SOLUSDT')).toBe('BINANCE:SOLUSDT');
    });
  });

  describe('formatTradingViewInterval', () => {
    it('defaults to 15 when no interval is provided', () => {
      expect(formatTradingViewInterval()).toBe('15');
      expect(formatTradingViewInterval('')).toBe('15');
    });

    it('normalizes minute timeframes into integer strings', () => {
      expect(formatTradingViewInterval('1m')).toBe('1');
      expect(formatTradingViewInterval('5m')).toBe('5');
      expect(formatTradingViewInterval('15m')).toBe('15');
      expect(formatTradingViewInterval('30m')).toBe('30');
    });

    it('normalizes hour and day timeframes into TradingView conventions', () => {
      expect(formatTradingViewInterval('1h')).toBe('60');
      expect(formatTradingViewInterval('4h')).toBe('240');
      expect(formatTradingViewInterval('1D')).toBe('D');
      expect(formatTradingViewInterval('1W')).toBe('W');
    });
  });
});
