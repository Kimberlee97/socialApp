import { documentDirectory, copyAsync } from 'expo-file-system/legacy';

export const ImageService = {
  async saveImage(tempUri: string): Promise<string | null> {
    try {
      if (!documentDirectory) {
        console.warn("Document directory is not available.");
        return null;
      }

      const fileName = tempUri.split('/').pop();
      const newPath = documentDirectory + fileName;

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