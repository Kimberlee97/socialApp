import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    marginTop: 10
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000' 
  },
  postButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0095F6' 
  },
  disabledText: { 
    color: '#b3dffc' 
  },
  
  formContainer: { 
    padding: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#262626', 
    marginTop: 15, 
    marginBottom: 8 
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 8,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top', 
  },

  imageContainer: {
    width: '100%',
    height: 250, 
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, 
    marginBottom: 40, 
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 8,
    alignSelf: 'center',
  },
  imagePreview: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
    borderRadius: 8,
  },
  placeholderContainer: { 
    alignItems: 'center' 
  },
  plusIcon: { 
    fontSize: 40, 
    color: '#ccc', 
    fontWeight: '300' 
  },
  addPhotoText: { 
    color: '#999', 
    fontSize: 14, 
    marginTop: 5 
  },
});