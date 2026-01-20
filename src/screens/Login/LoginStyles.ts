import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#fff' 
  },
  header: { 
    marginBottom: 40, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 32, 
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
    marginBottom: 15, 
    height: 50, 
    justifyContent: 'center' 
  },
  btnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  bioBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#007AFF', 
    borderRadius: 12, 
    backgroundColor: '#f0f9ff' 
  },
  bioText: { 
    color: '#007AFF', 
    marginLeft: 10, 
    fontWeight: '600', 
    fontSize: 16 
  },
  linkBtn: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#007AFF', 
    fontWeight: 'bold' 
  }
});