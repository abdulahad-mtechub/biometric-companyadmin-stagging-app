import React, {useState} from 'react';
import {Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';
import logger from '@utils/logger';

const DocumentViewModal = ({visible, documentUrl, onClose}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize URL
  const normalizedUrl = documentUrl?.startsWith('http') 
    ? documentUrl 
    : `https://${documentUrl}`;


  const source = { 
    uri: normalizedUrl, 
    cache: true,
    // Add headers if needed for authentication
    // headers: {
    //   'Authorization': 'Bearer token'
    // }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}

        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        
        <Pdf
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            logger.log(`Number of pages: ${numberOfPages}`, { context: 'DocumentViewModal' });
            setLoading(false);
            setError(null);
          }}
          onPageChanged={(page, numberOfPages) => {
            logger.log(`Current page: ${page}`, { context: 'DocumentViewModal' });
          }}
          onError={(error) => {
            logger.log('PDF Error:', error, { context: 'DocumentViewModal' });
            setLoading(false);
            setError('Failed to load PDF. Please check the URL and try again.');
          }}
          onPressLink={(uri) => {
            logger.log(`Link pressed: ${uri}`, { context: 'DocumentViewModal' });
          }}
          trustAllCerts={false} // Set to true only for development
          style={styles.pdf}
        />
      </View>
    </Modal>
  );
};

export default DocumentViewModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    zIndex: 5,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});