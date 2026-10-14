import { google } from 'googleapis';
import { getGcpAuthClient } from './gcpClient';
import { prisma } from '@/server/database/prisma';

export interface IndexingResponse {
  success: boolean;
  message: string;
  url: string;
  action: 'URL_UPDATED' | 'URL_DELETED';
  timestamp: string;
  isMock?: boolean;
}

export async function requestGoogleInstantIndexing(
  url: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
  submittedBy: string = 'SYSTEM'
): Promise<IndexingResponse> {
  const auth = getGcpAuthClient();

  if (!auth) {
    const mockRes: IndexingResponse = {
      success: true,
      message: `[DEV MODE] Instant Indexing request for ${url} queued successfully. Set GCP_CLIENT_EMAIL & GCP_PRIVATE_KEY for live Google API notification.`,
      url,
      action,
      timestamp: new Date().toISOString(),
      isMock: true,
    };

    // Log to Database for audit history
    try {
      await (prisma as any).indexingLog.create({
        data: {
          url,
          action,
          response: mockRes.message,
          submittedBy,
        },
      });
    } catch (dbError) {
      console.error('[Indexing Service] DB log error:', dbError);
    }

    return mockRes;
  }

  try {
    const indexing = google.indexing({ version: 'v3', auth });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: action,
      },
    });

    const successMessage = `Google Indexing API accepted notification for ${url} (HTTP ${response.status})`;

    // Log to Database
    await (prisma as any).indexingLog.create({
      data: {
        url,
        action,
        response: successMessage,
        submittedBy,
      },
    });

    return {
      success: true,
      message: successMessage,
      url,
      action,
      timestamp: new Date().toISOString(),
      isMock: false,
    };
  } catch (error: any) {
    const rawError = error?.message || 'Failed to submit URL to Google Indexing API';
    let errorMessage = rawError;
    if (rawError.includes('Could not load the default credentials')) {
      errorMessage = 'Google Cloud Authentication Required: GCP_PRIVATE_KEY is missing or invalid in your .env configuration. To submit live URLs to Google Indexing API, add the service account private key to .env.';
    }
    console.error('[Indexing Service] Request failed:', errorMessage);

    try {
      await (prisma as any).indexingLog.create({
        data: {
          url,
          action,
          response: `ERROR: ${errorMessage}`,
          submittedBy,
        },
      });
    } catch (dbError) {
      console.error('[Indexing Service] DB log error:', dbError);
    }

    return {
      success: false,
      message: errorMessage,
      url,
      action,
      timestamp: new Date().toISOString(),
      isMock: false,
    };
  }
}
