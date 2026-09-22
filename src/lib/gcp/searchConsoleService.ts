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
  const siteUrl = process.env.GCP_SEARCH_CONSOLE_SITE_URL || 'https://threadsec.com';
  const auth = getGcpAuthClient();

  const endDateObj = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(endDateObj.getDate() - days);

  const startDate = startDateObj.toISOString().split('T')[0];
  const endDate = endDateObj.toISOString().split('T')[0];

  if (!auth) {
    return getMockSearchPerformance(siteUrl, startDate, endDate);
  }

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // 1. Fetch Query level metrics
    const queryRes = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 15,
      },
    });

    // 2. Fetch Page level metrics
    const pageRes = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      },
    });

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
  return {
    siteUrl,
    startDate,
    endDate,
    totalClicks: 14850,
    totalImpressions: 284200,
    avgCtr: 5.22,
    avgPosition: 8.4,
    topQueries: [
      { query: 'cyber threat defense certification', clicks: 3420, impressions: 42100, ctr: 8.12, position: 2.1 },
      { query: 'soc analyst 2.0 course online', clicks: 2890, impressions: 38900, ctr: 7.43, position: 3.4 },
      { query: 'red team offensive operations lab', clicks: 2150, impressions: 31200, ctr: 6.89, position: 4.8 },
      { query: 'practical penetration testing masterclass', clicks: 1840, impressions: 29800, ctr: 6.17, position: 5.2 },
      { query: 'cloud security engineering architecture', clicks: 1420, impressions: 24500, ctr: 5.80, position: 6.9 },
      { query: 'malware reverse engineering course', clicks: 1120, impressions: 19400, ctr: 5.77, position: 7.5 },
      { query: 'thread security education certificate', clicks: 980, impressions: 12400, ctr: 7.90, position: 1.8 },
    ],
    topPages: [
      { page: `${siteUrl}/courses/cyber-threat-defense`, clicks: 4890, impressions: 72000, ctr: 6.79, position: 3.1 },
      { page: `${siteUrl}/courses/soc-analyst-mastery`, clicks: 3620, impressions: 58000, ctr: 6.24, position: 4.0 },
      { page: `${siteUrl}/courses/red-team-ops`, clicks: 2840, impressions: 46000, ctr: 6.17, position: 4.9 },
      { page: `${siteUrl}/blog`, clicks: 1980, impressions: 39000, ctr: 5.07, position: 8.2 },
      { page: `${siteUrl}/workshops`, clicks: 1520, impressions: 31000, ctr: 4.90, position: 9.1 },
    ],
    isMockData: true,
  };
}
