// ✅ CHANGE THE IMPORT TO 'expo-file-system/legacy'
import { documentDirectory, copyAsync } from 'expo-file-system/legacy';

export const ImageService = {
  async saveImage(tempUri: string): Promise<string | null> {
    try {
      // 1. Safety Check
      if (!documentDirectory) {
        console.warn("Document directory is not available.");
        return null;
      }

      // 2. Generate unique filename
      const fileName = tempUri.split('/').pop();
      // Ensure we don't get double slashes if documentDirectory ends with one
      const newPath = documentDirectory + fileName;

      // 3. Move file from Cache to Documents
      await copyAsync({
        from: tempUri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error("Image save failed:", error);
      return null;
    }
  },
};