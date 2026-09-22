import { getDriveClient } from './client';

export const deleteDriveFile = async (fileId: string) => {
  const drive = getDriveClient();
  
  try {
    await drive.files.delete({
      fileId,
    });
    return true;
  } catch (err) {
    console.error('Error deleting Google Drive file:', err);
    throw new Error('Failed to delete Google Drive file');
  }
};
