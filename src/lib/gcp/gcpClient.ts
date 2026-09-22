import { google } from 'googleapis';

/**
 * Helper to retrieve a Google Auth JWT client for GCP API access.
 * Scopes: Search Console, Indexing API, Cloud Platform.
 */
export function getGcpAuthClient() {
  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  let privateKey = process.env.GCP_PRIVATE_KEY;

  const scopes = [
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  // Strategy 1: Direct Service Account JSON Key (if available)
  if (clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    try {
      return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes,
      });
    } catch (error) {
      console.error('[GCP Auth] Failed to initialize JWT Auth client:', error);
    }
  }

  // Strategy 2: Application Default Credentials (ADC) & Service Account Impersonation
  try {
    const auth = new google.auth.GoogleAuth({
      scopes,
      ...(clientEmail ? { targetPrincipal: clientEmail } : {}),
    });
    return auth;
  } catch (error) {
    console.error('[GCP Auth] Failed to initialize ADC / Impersonated client:', error);
    return null;
  }
}

