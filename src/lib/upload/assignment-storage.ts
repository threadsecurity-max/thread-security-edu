import fs from 'fs/promises';
import path from 'path';

export const MAX_FILE_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB strictly

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

/**
 * Saves an uploaded assignment file (from Mentor or Student)
 * Strictly validates that file does not exceed 2.5 MB.
 */
export async function saveAssignmentFile(
  file: File,
  folderPrefix: 'mentor' | 'student' = 'mentor'
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 2.5 MB.`
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${folderPrefix}-${Date.now()}-${cleanName}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assignments');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, uniqueName);
  await fs.writeFile(filePath, buffer);

  return {
    fileUrl: `/uploads/assignments/${uniqueName}`,
    fileName: file.name,
    fileSize: file.size,
  };
}
