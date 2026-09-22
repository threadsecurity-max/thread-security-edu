import { getDriveClient } from './client';
import { Readable } from 'stream';

export const uploadFileToDrive = async (
  folderId: string, 
  fileName: string, 
  mimeType: string, 
  buffer: Buffer
) => {
  const drive = getDriveClient();

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });
    return file.data;
  } catch (err) {
    console.error('Error uploading file to Google Drive:', err);
    throw new Error('Failed to upload file to Google Drive');
  }
};
