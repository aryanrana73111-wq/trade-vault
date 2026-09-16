import { MarketNewsArticle } from '@/types/newsIntelligence';

export type TimeFilter = 'TODAY' | 'TOMORROW' | '7_DAYS' | '1_MONTH' | 'PREV_7_DAYS';

export function filterNewsByTime(news: MarketNewsArticle[], filter: TimeFilter): MarketNewsArticle[] {
  const now = new Date();
  
  // Set to start and end of day in local time
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  const startOfTomorrow = new Date(endOfToday.getTime() + 1);
  const endOfTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000 - 1);

  const startOf7DaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startOf1MonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  const startOfPrev7Days = new Date(startOfToday.getTime() - 13 * 24 * 60 * 60 * 1000);
  const endOfPrev7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000 - 1);

  return news.filter(article => {
    const published = new Date(article.publishedAt);
    
    switch (filter) {
      case 'TODAY':
        return published >= startOfToday && published <= endOfToday;
      case 'TOMORROW':
        // Articles typically aren't published tomorrow, but maybe events are
        return published >= startOfTomorrow && published <= endOfTomorrow;
      case '7_DAYS':
        return published >= startOf7DaysAgo && published <= endOfToday;
      case '1_MONTH':
        return published >= startOf1MonthAgo && published <= endOfToday;
      case 'PREV_7_DAYS':
        return published >= startOfPrev7Days && published <= endOfPrev7Days;
      default:
        return true;
    }
  });
}
