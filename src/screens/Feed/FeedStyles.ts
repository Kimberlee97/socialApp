import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  }, 
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb', 
    marginTop: Platform.OS === 'android' ? 30 : 0, 
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold', 
    color: '#000',
  },
  logoutText: {
    fontSize: 15,
    color: '#0095F6', 
    fontWeight: '600',
  },
});