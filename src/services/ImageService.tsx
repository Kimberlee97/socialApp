/**
 * This service handles file system operations for image assets.
 * It is responsible for moving temporary images (picked from the gallery) 
 * into the app's permanent storage sandbox so they don't disappear 
 * when the OS clears temporary cache files.
 */

import { documentDirectory, copyAsync } from 'expo-file-system/legacy';

export const ImageService = {
  
  // Takes a temporary URI (from ImagePicker) and copies the file 
  // to the app's permanent 'documentDirectory'.
  // Returns the new permanent path to be stored in the SQLite database.
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