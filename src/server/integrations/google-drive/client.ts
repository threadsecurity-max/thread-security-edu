import { google } from 'googleapis';

export const getDriveClient = () => {
  const credentialsJson = process.env.GOOGLE_DRIVE_CREDENTIALS;
  if (!credentialsJson) {
    console.warn('Google Drive credentials not configured. Please set GOOGLE_DRIVE_CREDENTIALS in .env');
    // For development without credentials, we might mock this or throw.
    // We throw to ensure the integration is explicit.
    throw new Error('Google Drive credentials not configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
};
