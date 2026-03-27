import { pick, types } from '@react-native-documents/picker';
import { viewDocument } from '@react-native-documents/viewer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import TxtInput from '@components/TextInput/Txtinput';
import { Fonts } from '@constants/Fonts';
import { baseUrl } from '@constants/urls';
import { useAlert } from '@providers/AlertContext';
import { ApiResponse, fetchApis, fetchFormDataApi } from '@utils/Helpers';
import logger from '@utils/logger';

// Constants
const MIN_DOC_NAME_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 10;
const SUPPORTED_FILE_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadDocument = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {company, token, language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const {showAlert} = useAlert();

  const styles = useMemo(() => dynamicStyles(isDarkMode,Colors), [isDarkMode,Colors]);

  // Form states
  const [formData, setFormData] = useState({
    docName: '',
    description: '',
    subject: '',
    accessibleTo: null,
    selectedWorkers: [],
    selectedDocument: null,
  });

  const {workers} = useSelector(store => store.states);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoized dropdown data
  const accessOptions = useMemo(
    () => [
      {label: t('All'), value: 'all'},
      {label: t('Specific'), value: 'specific'},
    ],
    [t],
  );

  // Update form data helper
  const updateFormData = useCallback(
    (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      // Clear error when field is updated
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: null,
        }));
      }
    },
    [errors],
  );

  // File upload function
  const uploadDocumentToServer = useCallback(async document => {
    if (!document) return null;

    const formData = new FormData();
    formData.append('pdf', {
      uri: document.uri,
      type: document.type || 'application/pdf',
      name: document.name || `upload-${Date.now()}.pdf`,
    });

    try {
      const {ok, data} = await fetchFormDataApi(
        `${baseUrl}/upload/pdf`,
        'POST',
        null,
        formData,
        null,
        {'Content-Type': 'multipart/form-data'},
      );

      if (!ok) {
        throw new Error(data?.message || 'Upload failed');
      }

      return data?.data?.url;
    } catch (error) {
      logger.error('Document upload failed:', error, { context: 'UploadDocument' });
      throw error;
    }
  }, []);



  const validateForm = useCallback(() => {
    const newErrors = {};
    const {
      docName,
      description,
      subject,
      accessibleTo,
      selectedWorkers,
      selectedDocument,
    } = formData;

    if (!docName.trim()) {
      newErrors.docName = t('Document name is required');
    }

    if (!description.trim()) {
      newErrors.description = t('Description is required');
    } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = t(
        `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`,
      );
    }

    if (!subject.trim()) {
      newErrors.subject = t('Subject is required');
    }

    if (!accessibleTo) {
      newErrors.accessibleTo = t('Please select who can access this document');
    }

    if (accessibleTo === 'specific' && selectedWorkers.length === 0) {
      newErrors.selectedWorkers = t('Please select at least one employee');
    }

    if (!selectedDocument) {
      newErrors.selectedDocument = t('Please select a document to upload');
    } else {
      if (!SUPPORTED_FILE_TYPES.includes(selectedDocument.type)) {
        newErrors.selectedDocument = t('Only PDF files are supported');
      }
      if (selectedDocument.size && selectedDocument.size > MAX_FILE_SIZE) {
        newErrors.selectedDocument = t('File size must be less than 10MB');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (loading) return; 

    setLoading(true);

    try {
      // Upload document first
      const uploadedUrl = await uploadDocumentToServer(
        formData.selectedDocument,
      );
      if (!uploadedUrl) {
        throw new Error('Failed to upload document');
      }

      const payload = {
        name: formData.docName.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        file_id: uploadedUrl,
        file_type: 'pdf',
        access_mode: formData.accessibleTo,
      };

      if (formData.accessibleTo === 'specific') {
        payload.recipients = formData.selectedWorkers.map(
          worker => worker.value,
        );
      }

      const {ok, data} = await fetchApis(
        `${baseUrl}/documents`,
        'POST',
        null,
        payload,
        null,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);

      if (!ok || data?.error) {
      }

      navigation.goBack();
    } catch (error) {
      logger.error('Error uploading document:', error, { context: 'UploadDocument' });
      showAlert(
        error.message || t('Failed to upload document. Please try again.'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    validateForm,
    uploadDocumentToServer,
    token,
    showAlert,
    t,
    navigation,
    loading,
  ]);

  // Document picker
  const pickDocument = useCallback(async () => {
    try {
      const [result] = await pick({
        mode: 'import',
        type: [types.pdf],
      });

      if (result) {
        updateFormData('selectedDocument', result);
      }
    } catch (error) {
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        logger.error('Document picker error:', error, { context: 'UploadDocument' });
        showAlert(t('Failed to select document'), 'error');
      }
    }
  }, [updateFormData, showAlert, t]);

  // Document viewer
  const viewSelectedDocument = useCallback(() => {
    if (!formData.selectedDocument?.uri) {
      showAlert(t('No document selected'), 'error');
      return;
    }

    viewDocument({
      uri: formData.selectedDocument.uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, { context: 'UploadDocument' });
      showAlert(t('Failed to open document'), 'error');
    });
  }, [formData.selectedDocument, showAlert, t]);

  // Handle access mode change
  const handleAccessModeChange = useCallback(
    value => {
      updateFormData('accessibleTo', value);
      // Clear selected workers if switching to 'all'
      if (value === 'all') {
        updateFormData('selectedWorkers', []);
      }
    },
    [updateFormData],
  );

  // Handle worker selection
  const handleWorkerSelection = useCallback(
    worker => {
      setFormData(prev => {
        const currentWorkers = prev.selectedWorkers;
        const exists = currentWorkers.some(w => w.value === worker.value);
        const newWorkers = exists
          ? currentWorkers.filter(w => w.value !== worker.value)
          : [...currentWorkers, worker];

        return {
          ...prev,
          selectedWorkers: newWorkers,
        };
      });

      // Clear error
      if (errors.selectedWorkers) {
        setErrors(prev => ({
          ...prev,
          selectedWorkers: null,
        }));
      }
    },
    [errors.selectedWorkers],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={RFPercentage(4)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.iconColor
              }
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Upload Document')}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('Document Details')}</Text>

          
          <Text style={styles.label}>
            {t('Name')}
            <Text style={styles.required}> *</Text>
          </Text>
          <TxtInput
            value={formData.docName}
            containerStyle={[
              styles.inputContainer,
              {
                borderColor: errors.docName
                  ? Colors.error
                  : isDarkMode
                  ? Colors.darkTheme.BorderGrayColor
                  : Colors.lightTheme.BorderGrayColor,
                borderWidth: errors.docName ? 1.5 : 1,
                marginBottom: errors.docName ? hp(0.5) : hp(2),
              },
            ]}
            placeholder={t('e.g., Missed Punch Request')}
            onChangeText={text => updateFormData('docName', text)}
            error={errors.docName}
            editable={!loading}
            maxLength={100}
          />

          
          <Text style={styles.label}>
            {t('Description')}
            <Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                borderColor: errors.description
                  ? Colors.error
                  : isDarkMode
                  ? Colors.darkTheme.BorderGrayColor
                  : Colors.lightTheme.BorderGrayColor,
                borderWidth: errors.description ? 1.5 : 1,
                marginBottom: errors.description ? hp(0.5) : hp(2),
              },
            ]}
            placeholder={t('Describe the document and its purpose')}
            placeholderTextColor={
              isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.secondryTextColor
            }
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={text => updateFormData('description', text)}
            editable={!loading}
            maxLength={500}
          />
          {errors.description && (
            <Text style={styles.errorText}>{t(errors.description)}</Text>
          )}


          <Text style={styles.label}>
            {t('Subject')}
            <Text style={styles.required}> *</Text>
          </Text>
          <TxtInput
            value={formData.subject}
            containerStyle={[
              styles.inputContainer,
              {
                borderColor: errors.subject
                  ? Colors.error
                  : isDarkMode
                  ? Colors.darkTheme.BorderGrayColor
                  : Colors.lightTheme.BorderGrayColor,
                borderWidth: errors.subject ? 1.5 : 1,
                marginBottom: errors.subject ? hp(0.5) : hp(2),
              },
            ]}
            placeholder={t('e.g., Missed Punch Request')}
            onChangeText={text => updateFormData('subject', text)}
            error={errors.subject}
            editable={!loading}
            maxLength={100}
          />


          <Text style={styles.label}>
            {t('Accessible To')}
            <Text style={styles.required}> *</Text>
          </Text>
          <View
            style={[
              styles.radioGroup,
              {marginBottom: errors.accessibleTo ? hp(0.5) : hp(2)},
            ]}>
            {accessOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioButton}
                onPress={() => handleAccessModeChange(option.value)}
                disabled={loading}>
                <MaterialIcons
                  name={
                    formData.accessibleTo === option.value
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={
                    formData.accessibleTo === option.value
                      ? isDarkMode
                        ? Colors.darkTheme.primaryBtn.BtnColor
                        : Colors.lightTheme.primaryBtn.BtnColor
                      : isDarkMode
                      ? Colors.darkTheme.iconColor
                      : Colors.lightTheme.iconColor
                  }
                />
                <Text style={styles.radioText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.accessibleTo && (
            <Text style={styles.errorText}>{t(errors.accessibleTo)}</Text>
          )}

          
          {formData.accessibleTo === 'specific' && (
            <>
              <Text style={styles.label}>
                {t('Select Employee')}
                <Text style={styles.required}> *</Text>
              </Text>
              <CustomDropDown
                data={workers}
                selectedValue={formData.selectedWorkers}
                onValueChange={handleWorkerSelection}
                placeholder={t('Select Employee')}
                multiple={true}
                error={errors.selectedWorkers}
                disabled={loading}
              />
              {
                formData.selectedWorkers.length > 0  && (
                  <View style={styles.tagsContainer}>
                  {formData.selectedWorkers.map((item, index) => (
                    <View style={styles.tag} key={index}>
                      <Text style={styles.tagText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
                )
              }
            
            </>
          )}

          
          <View style={styles.uploadSection}>
            <Text style={styles.label}>
              {t('Document')}
              <Text style={styles.required}> *</Text>
            </Text>
            <Text style={styles.subLabel}>
              {t('PDF format only (max 10MB)')}
            </Text>

            <View
              style={[
                styles.uploadContainer,
                {
                  borderColor: errors.selectedDocument
                    ? Colors.error
                    : 'transparent',
                  borderWidth: errors.selectedDocument ? 1.5 : 0,
                  marginBottom: errors.selectedDocument ? hp(0.5) : hp(2),
                },
              ]}>
              {formData.selectedDocument ? (
                <View style={styles.selectedDocumentContainer}>
                  <TouchableOpacity
                    onPress={viewSelectedDocument}
                    style={styles.viewDocumentButton}
                    disabled={loading}>
                    <Svgs.eyeBlueCricled />
                  </TouchableOpacity>
                  <Text style={styles.documentName} numberOfLines={2}>
                    {formData.selectedDocument.name}
                  </Text>
                  <TouchableOpacity
                    onPress={pickDocument}
                    style={styles.changeDocumentButton}
                    disabled={loading}>
                    <Text style={styles.changeDocumentText}>{t('Change')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickDocument}
                  disabled={loading}>
                  <Svgs.whitePlus />
                </TouchableOpacity>
              )}
            </View>

            {errors.selectedDocument && (
              <Text style={styles.errorText}>{t(errors.selectedDocument)}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      
      <View style={styles.buttonContainer}>
        <CustomButton
          text={loading ? t('Uploading...') : t('Upload Document')}
          onPress={handleSubmit}
          textStyle={[styles.buttonText, {opacity: loading ? 0.7 : 1}]}
          containerStyle={[styles.button, {opacity: loading ? 0.7 : 1}]}
          isLoading={loading}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default UploadDocument;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: hp(2),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
    },
    backButton: {
      padding: wp(1),
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginRight: wp(8), // Compensate for back button
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(1),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      marginBottom: hp(0.5),
    },
    subLabel: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginBottom: hp(1),
    },
    required: {
      color: Colors.error,
    },
    inputContainer: {
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
    },
    textArea: {
      borderWidth: 1,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'top',
      minHeight: hp(12),
    },
    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: wp(8),
      paddingVertical: hp(1),
    },
    radioText: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginLeft: wp(2),
    },
    uploadSection: {
      marginTop: hp(2),
    },
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      minHeight: hp(15),
      borderStyle: 'dashed',
      padding: wp(4),
    },
    uploadButton: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: wp(4),
      backgroundColor: isDarkMode ? '#5E5F60' : '#5E5F60',
      borderRadius: wp(100),
    },
    uploadButtonText: {
      marginTop: hp(1),
      fontSize: RFPercentage(1.6),
      color: '#FFFFFF',
      fontFamily: Fonts.PoppinsRegular,
    },
    selectedDocumentContainer: {
      alignItems: 'center',
      width: '100%',
    },
    viewDocumentButton: {
      marginBottom: hp(1),
    },
    documentName: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    changeDocumentButton: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      borderRadius: wp(2),
    },
    changeDocumentText: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    buttonContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    button: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.8),
      borderRadius: wp(3),
      alignItems: 'center',
    },
    buttonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      marginBottom: hp(1),
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',

      // gap: wp(1.5),
    },
    tag: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : '#579DFF',
      borderRadius: wp(1),
      paddingHorizontal: wp(1.5),
      paddingVertical: hp(1),
      marginLeft: wp(0.5),
    },
    tagText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.6),
      color: Colors.darkTheme.primaryTextColor,
    },
  });
