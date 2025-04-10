import { StyleSheet } from 'react-native';

export const chatColors = {
  primary: 'navy',
  secondary: '#001133',
  accent: '#7af',
  text: 'white',
  inputBg: '#223',
  highlight: '#334',
  error: 'red',
  success: 'green',
};

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: chatColors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: chatColors.primary,
    borderBottomWidth: 1,
    borderBottomColor: chatColors.highlight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: chatColors.text,
  },
  backButton: {
    padding: 8,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: chatColors.accent,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: chatColors.highlight,
  },
  messageText: {
    fontSize: 16,
    color: chatColors.text,
  },
  timestamp: {
    fontSize: 12,
    color: '#eee',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: chatColors.primary,
    borderTopWidth: 1,
    borderTopColor: chatColors.highlight,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: chatColors.highlight,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: chatColors.inputBg,
    color: chatColors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: chatColors.accent,
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  sendButtonText: {
    color: chatColors.text,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: chatColors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyMessage: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  senderName: {
    fontWeight: 'bold',
    color: chatColors.text,
    marginBottom: 5,
  },
}); 