import { getDriveClient } from './client';

export const createBlogDriveFolder = async (folderName: string, parentFolderId?: string) => {
  const drive = getDriveClient();
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : undefined,
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    return file.data.id;
  } catch (err) {
    console.error('Error creating Google Drive folder:', err);
    throw new Error('Failed to create Google Drive folder');
  }
};
