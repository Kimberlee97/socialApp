import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: { 
    marginBottom: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 12,
  },
  author: { 
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  date: { 
    color: '#888', 
    fontSize: 12,
  },
  image: { 
    width: '100%', 
    height: 300,        
    backgroundColor: '#f5f5f5', 
  }, 
  content: { 
    padding: 12,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 6,
    color: '#000',
  },
  description: { 
    fontSize: 14, 
    lineHeight: 22, 
    color: '#444',
  },
});