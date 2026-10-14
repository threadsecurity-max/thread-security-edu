import { google } from 'googleapis';

export interface GcpCredentialStatus {
  isConfigured: boolean;
  method: 'SERVICE_ACCOUNT_KEY' | 'ADC' | 'UNCONFIGURED';
  clientEmail: string | null;
  hasPrivateKey: boolean;
  projectId: string | null;
  message: string;
}

export function getGcpCredentialStatus(): GcpCredentialStatus {
  const clientEmail = process.env.GCP_CLIENT_EMAIL || null;
  const privateKey = process.env.GCP_PRIVATE_KEY || null;
  const projectId = process.env.GCP_PROJECT_ID || null;
  const adcFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || null;

  if (clientEmail && privateKey && privateKey.trim().length > 20) {
    return {
      isConfigured: true,
      method: 'SERVICE_ACCOUNT_KEY',
      clientEmail,
      hasPrivateKey: true,
      projectId,
      message: 'Active Service Account Key detected in environment.',
    };
  }

  if (adcFile) {
    return {
      isConfigured: true,
      method: 'ADC',
      clientEmail,
      hasPrivateKey: false,
      projectId,
      message: `Using Google Application Default Credentials file: ${adcFile}`,
    };
  }

  if (clientEmail && (!privateKey || privateKey.trim().length < 20)) {
    return {
      isConfigured: false,
      method: 'UNCONFIGURED',
      clientEmail,
      hasPrivateKey: false,
      projectId,
      message: 'GCP_CLIENT_EMAIL is configured, but GCP_PRIVATE_KEY is missing in .env. Running in safe benchmark simulation mode.',
    };
  }

  return {
    isConfigured: false,
    method: 'UNCONFIGURED',
    clientEmail: null,
    hasPrivateKey: false,
    projectId,
    message: 'GCP Service Account credentials are not configured. Running in benchmark simulation mode.',
  };
}

/**
 * Helper to retrieve a Google Auth client for GCP API access.
 * Scopes: Search Console, Indexing API, Cloud Platform.
 * Returns null safely if credentials are not configured to avoid unhandled ADC crashes.
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

  // Strategy 1: Direct Service Account JSON Key in .env
  if (clientEmail && privateKey && privateKey.trim().length > 20) {
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

  // Strategy 2: File-based Application Default Credentials if explicitly specified
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.ENABLE_GCP_ADC === 'true') {
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

  // If no private key or explicit ADC file is configured, return null gracefully
  // This prevents the SDK from throwing unhandled "Could not load the default credentials" errors
  return null;
}

