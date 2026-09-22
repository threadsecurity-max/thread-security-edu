import { google } from 'googleapis';
import { getGcpAuthClient } from './gcpClient';

export interface LeadSpreadsheetRow {
  name: string;
  email: string;
  phone?: string | null;
  courseInterest?: string | null;
  careerGoal?: string | null;
  aiScore: number;
  intentCategory: string;
  source?: string | null;
  createdAt?: string;
}

export async function appendLeadToGoogleSheet(lead: LeadSpreadsheetRow): Promise<{ success: boolean; message: string }> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const auth = getGcpAuthClient();

  if (!spreadsheetId) {
    return {
      success: false,
      message: 'GOOGLE_SHEETS_SPREADSHEET_ID is not configured in .env',
    };
  }

  if (!auth) {
    return {
      success: false,
      message: 'GCP Service Account credentials not initialized',
    };
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = lead.createdAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const values = [
      [
        timestamp,
        lead.name,
        lead.email,
        lead.phone || 'N/A',
        lead.courseInterest || 'General Mastery',
        lead.careerGoal || 'N/A',
        lead.aiScore,
        lead.intentCategory,
        lead.source || 'LANDING_PAGE',
        'NEW',
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return {
      success: true,
      message: `Lead ${lead.name} successfully appended to Google Sheet.`,
    };
  } catch (error: any) {
    console.error('[Google Sheets Service] Error appending lead:', error);
    return {
      success: false,
      message: error?.message || 'Failed to append row to Google Sheet',
    };
  }
}
