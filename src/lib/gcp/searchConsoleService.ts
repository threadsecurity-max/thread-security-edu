import { google } from 'googleapis';
import { getGcpAuthClient } from './gcpClient';

export interface SearchMetricRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformanceData {
  siteUrl: string;
  startDate: string;
  endDate: string;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: SearchMetricRow[];
  topPages: SearchMetricRow[];
  isMockData?: boolean;
}

export async function fetchSearchConsolePerformance(
  days: number = 28
): Promise<SearchPerformanceData> {
  let siteUrl = process.env.GCP_SEARCH_CONSOLE_SITE_URL || 'sc-domain:threadsecurity.in';
  const auth = getGcpAuthClient();

  const endDateObj = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(endDateObj.getDate() - days);

  const startDate = startDateObj.toISOString().split('T')[0];
  const endDate = endDateObj.toISOString().split('T')[0];

  if (!auth) {
    return getMockSearchPerformance(siteUrl, startDate, endDate);
  }

  // Helper to query search console with fallback between domain property and URL prefix
  async function runQuery(targetSite: string) {
    const searchconsole = google.searchconsole({ version: 'v1', auth: auth as any });
    const queryRes = await searchconsole.searchanalytics.query({
      siteUrl: targetSite,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 15,
      },
    });

    const pageRes = await searchconsole.searchanalytics.query({
      siteUrl: targetSite,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      },
    });

    return { queryRes, pageRes };
  }

  try {
    let result;
    try {
      result = await runQuery(siteUrl);
    } catch (primaryErr: any) {
      // If primary query fails and siteUrl was https://..., try sc-domain:...
      if (siteUrl.startsWith('http')) {
        const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        siteUrl = `sc-domain:${domain}`;
        result = await runQuery(siteUrl);
      } else {
        throw primaryErr;
      }
    }

    const { queryRes, pageRes } = result;

    const queryRows: SearchMetricRow[] = (queryRes.data.rows || []).map((row) => ({
      query: row.keys?.[0] || 'Unknown Query',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
      position: parseFloat((row.position || 0).toFixed(1)),
    }));

    const pageRows: SearchMetricRow[] = (pageRes.data.rows || []).map((row) => ({
      page: row.keys?.[0] || siteUrl,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
      position: parseFloat((row.position || 0).toFixed(1)),
    }));

    const totalClicks = queryRows.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalImpressions = queryRows.reduce((acc, curr) => acc + curr.impressions, 0);
    const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    const avgPosition = queryRows.length > 0 
      ? parseFloat((queryRows.reduce((acc, curr) => acc + curr.position, 0) / queryRows.length).toFixed(1)) 
      : 0;

    return {
      siteUrl,
      startDate,
      endDate,
      totalClicks,
      totalImpressions,
      avgCtr,
      avgPosition,
      topQueries: queryRows,
      topPages: pageRows,
      isMockData: false,
    };
  } catch (error) {
    console.error('[Search Console Service] API fetch failed, falling back to cached telemetry:', error);
    return getMockSearchPerformance(siteUrl, startDate, endDate);
  }
}

function getMockSearchPerformance(siteUrl: string, startDate: string, endDate: string): SearchPerformanceData {
  const cleanWebUrl = 'https://www.threadsecurity.in';

  const topQueries: SearchMetricRow[] = [
    { query: 'thread security', clicks: 17, impressions: 333, ctr: 5.11, position: 2.3 },
    { query: 'thread security jalandhar', clicks: 10, impressions: 41, ctr: 24.39, position: 1.1 },
    { query: 'cyber security course in jalandhar', clicks: 1, impressions: 28, ctr: 3.57, position: 14.8 },
    { query: 'soc analysis', clicks: 1, impressions: 88, ctr: 1.14, position: 9.0 },
    { query: 'ai course in jalandhar', clicks: 0, impressions: 17, ctr: 0.0, position: 11.2 },
    { query: 'ai courses in jalandhar', clicks: 0, impressions: 8, ctr: 0.0, position: 10.3 },
    { query: 'agentic ai course in jalandhar', clicks: 0, impressions: 6, ctr: 0.0, position: 7.0 },
    { query: 'active directory red team specialist', clicks: 0, impressions: 2, ctr: 0.0, position: 51.0 },
    { query: 'advanced web application security', clicks: 0, impressions: 1, ctr: 0.0, position: 1.0 },
    { query: 'ai red team analyst training', clicks: 0, impressions: 1, ctr: 0.0, position: 84.0 },
    { query: 'ai red team certification', clicks: 0, impressions: 1, ctr: 0.0, position: 66.0 },
    { query: '"gpt-6.1 astra" release october 2026', clicks: 0, impressions: 1, ctr: 0.0, position: 10.0 },
    { query: 'aarav sharma', clicks: 0, impressions: 1, ctr: 0.0, position: 9.0 },
    { query: '"bug bounty"', clicks: 0, impressions: 1, ctr: 0.0, position: 67.0 },
    { query: '"crowdstrike" site:onrender.com', clicks: 0, impressions: 1, ctr: 0.0, position: 6.0 },
  ];

  const topPages: SearchMetricRow[] = [
    { page: `${cleanWebUrl}/`, clicks: 34, impressions: 1065, ctr: 3.19, position: 5.8 },
    { page: `https://threadsecurity.in/`, clicks: 16, impressions: 683, ctr: 2.34, position: 5.3 },
    { page: `${cleanWebUrl}/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap`, clicks: 5, impressions: 134, ctr: 3.73, position: 10.3 },
    { page: `${cleanWebUrl}/courses/binary-exploitation-reverse-engineering`, clicks: 3, impressions: 32, ctr: 9.38, position: 7.0 },
    { page: `${cleanWebUrl}/blog/why-openai-scrapped-gpt-61-astra-the-safety-story-behind-the-cancelled-launch`, clicks: 2, impressions: 38, ctr: 5.26, position: 6.7 },
    { page: `${cleanWebUrl}/contact`, clicks: 2, impressions: 80, ctr: 2.50, position: 16.2 },
    { page: `https://threadsecurity.in/contact`, clicks: 1, impressions: 82, ctr: 1.22, position: 6.5 },
    { page: `${cleanWebUrl}/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education`, clicks: 1, impressions: 64, ctr: 1.56, position: 5.6 },
    { page: `${cleanWebUrl}/blog/soc-analysis-a-complete-guide-to-modern-security-operations`, clicks: 1, impressions: 156, ctr: 0.64, position: 7.6 },
    { page: `${cleanWebUrl}/blog/upi-scam-prevention-why-warnings-fail-and-what-works`, clicks: 1, impressions: 83, ctr: 1.20, position: 6.2 },
  ];

  const totalClicks = topPages.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalImpressions = topPages.reduce((acc, curr) => acc + curr.impressions, 0);
  const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const avgPosition = parseFloat((topPages.reduce((acc, curr) => acc + curr.position, 0) / topPages.length).toFixed(1));

  return {
    siteUrl,
    startDate,
    endDate,
    totalClicks,
    totalImpressions,
    avgCtr,
    avgPosition,
    topQueries,
    topPages,
    isMockData: true,
  };
}
