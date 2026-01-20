import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#fff' 
  },
  header: { 
    marginBottom: 30, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#333' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666' 
  },
  label: { 
    fontWeight: '600', 
    marginBottom: 5, 
    color: '#333' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20, 
    fontSize: 16, 
    backgroundColor: '#f9f9f9' 
  },
  mainBtn: { 
    backgroundColor: '#333', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    height: 50, 
    justifyContent: 'center' 
  },
  btnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  linkBtn: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#007AFF', 
    fontWeight: '600' 
  }
});