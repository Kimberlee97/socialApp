import * as LocalAuthentication from 'expo-local-authentication';

export const AuthService = {
  async authenticate(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock App',
        fallbackLabel: 'Use PIN',
      });
      return result.success;
    } catch (error) {
      return false; 
    }
  }
};