import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {Colors} from '@constants/themeColors';
import {Fonts} from '@constants/Fonts';
import TxtInput from '@components/TextInput/Txtinput';
import {Svgs} from '@assets/Svgs/Svgs';
import Loader from '@components/Loaders/loader';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import {capitalize} from '@utils/Helpers';
import logger from '@utils/logger';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const NavigateAbleBtmSheet = ({
  refRBSheet,
  sheetTitle = 'Start New Chat',
  data = [],
  onItemPress,
  enableMultipleSelect = false,
  onSendBulkMessage,
  bulkMessagePlaceholder = 'Type your message...',
  selectedUsers,
  onSelectionChange,
}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const insets = useSafeAreaInsets();

  const {t} = useTranslation();

  const styles = dynamicStyles(isDarkMode);

  const filteredData = data.filter(item =>
    item?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Helper function to toggle item selection
  const toggleItemSelection = item => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      let newSelection;

      if (isSelected) {
        newSelection = prev.filter(selected => selected.id !== item.id);
      } else {
        newSelection = [...prev, item];
      }

      setSelectAll(
        newSelection.length === filteredData.length && filteredData.length > 0,
      );

      onSelectionChange?.(newSelection);

      return newSelection;
    });
  };

  // Helper function to toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
      onSelectionChange?.([]);
    } else {
      setSelectedItems([...filteredData]);
      setSelectAll(true);
      onSelectionChange?.([...filteredData]);
    }
  };

  // Handle bulk message send
  const handleSendBulkMessage = async () => {
    if (!bulkMessageText.trim() || selectedItems.length === 0) return;

    setIsSending(true);
    try {
      await onSendBulkMessage(selectedItems, bulkMessageText);
      setBulkMessageText('');
      setSelectedItems([]);
      setSelectAll(false);
      setIsComposing(false);
      refRBSheet.current?.close();
    } catch (error) {
      console.error('Failed to send bulk message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle continue to compose
  const handleContinueToCompose = () => {
    if (selectedItems.length === 0) return;

    // If only 1 item is selected, use default onItemPress behavior
    if (selectedItems.length === 1) {
      onItemPress(selectedItems[0]);
      setSelectedItems([]);
      setSelectAll(false);
      refRBSheet.current?.close();
      return;
    }

    setIsComposing(true);
  };

  // Get selected count display text
  const getSelectedCountText = () => {
    if (selectedItems.length === 0) return '';
    return `(${selectedItems.length} selected)`;
  };

  const onClose = () => {
     refRBSheet.current?.close()
     setSelectedItems([])
  }
  return (
    <RBSheet
      ref={refRBSheet}
      height={hp('60%')}
      openDuration={250}
      // closeOnDragDown
      // closeOnPressMask
      draggable={true}
      customStyles={{
        container: {
          borderTopLeftRadius: wp('6%'),
          borderTopRightRadius: wp('6%'),
          backgroundColor: isDarkMode
            ? Colors.darkTheme.backgroundColor
            : Colors.lightTheme.backgroundColor,
          paddingBottom: hp('2%') + insets.bottom,
        },
        draggableIcon: {
          backgroundColor: isDarkMode
            ? Colors.darkTheme.iconColor
            : Colors.lightTheme.iconColor,
        },
      }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t(sheetTitle)}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={RFPercentage(3)}
              color={
                isDarkMode
                  ? Colors.darkTheme.iconColor
                  : Colors.lightTheme.iconColor
              }
            />
          </TouchableOpacity>
        </View>

        <TxtInput
          placeholder={'Search'}
          svg={
            isDarkMode ? (
              <Svgs.searchD height={hp(2.5)} width={hp(2.5)} />
            ) : (
              <Svgs.SearchL height={hp(2.5)} width={hp(2.5)} />
            )
          }
          onChangeText={searchQuery => setSearch(searchQuery)}
          rightIcon={search.length > 0 && 'close-circle-outline'}
          rightIconSize={wp(6)}
          rightBtnStyle={{width: wp(8), backgroundColor: 'transparent'}}
          rightIconPress={() => setSearch('')}
          value={search}
          containerStyle={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.input
              : Colors.lightTheme.input,
          }}
        />

        {!isComposing ? (
          // List Mode
          <View style={{flex: 1}}>
            <FlatList
              data={filteredData}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingTop: hp('2%')}}
              renderItem={({item}) => {
                const isItemSelected = selectedItems.some(
                  selected => selected.id === item.id,
                );

                return (
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => {
                      if (enableMultipleSelect) {
                        toggleItemSelection(item);
                      } else {
                        onItemPress(item);
                      }
                    }}>
                    {/* Checkbox for multi-select mode */}
                    {enableMultipleSelect && (
                      <View style={styles.checkbox}>
                        {isItemSelected ? (
                          <MaterialCommunityIcons
                            name="checkbox-marked"
                            size={RFPercentage(2.5)}
                            color={Colors.darkTheme.primaryColor}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="checkbox-blank-outline"
                            size={RFPercentage(2.5)}
                            color={Colors.darkTheme.primaryColor}
                          />
                        )}
                      </View>
                    )}

                    <View style={styles.textWrapper}>
                      <View style={{flexDirection: 'row'}}>
                        {item.avatar && (
                          <Image source={item?.avatar} style={styles.avatar} />
                        )}

                        {item?.name && (
                          <Text
                            style={[
                              styles.name,
                              isItemSelected &&
                                enableMultipleSelect &&
                                styles.nameSelected,
                            ]}>
                            {item?.name}
                          </Text>
                        )}
                      </View>

                      {item?.method && (
                        <Text style={styles.subText}>
                          {t(item?.method)} | {item.date} - {item.time}
                        </Text>
                      )}

                      {item?.email && (
                        <Text style={styles.subText}>
                          {capitalize(item?.email)} |{' '}
                          {item.role === 'account_executive'
                            ? t('Account Executive')
                            : item.role === 'company_admin'
                            ? t('Company Admin')
                            : t(item.role)}
                        </Text>
                      )}
                    </View>

                    {/* Show chevron only in single-select mode */}
                    {!enableMultipleSelect && (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={RFPercentage(2.6)}
                        color={
                          isDarkMode
                            ? Colors.darkTheme.iconColor
                            : Colors.lightTheme.iconColor
                        }
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Select All and Continue Button */}
            <View>
              {enableMultipleSelect && (
                <TouchableOpacity
                  style={styles.selectAllContainer}
                  onPress={toggleSelectAll}>
                  <View style={styles.checkbox}>
                    {selectAll ? (
                      <MaterialCommunityIcons
                        name="checkbox-blank"
                        size={RFPercentage(2.5)}
                        color={Colors.darkTheme.primaryColor}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="checkbox-blank-outline"
                        size={RFPercentage(2.5)}
                        color={Colors.darkTheme.primaryColor}
                      />
                    )}
                  </View>
                  <Text style={styles.selectAllText}>{t("Select All")}</Text>
                  {selectedItems.length > 0 && (
                    <Text style={styles.selectedCountText}>
                      {getSelectedCountText()}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {enableMultipleSelect && selectedItems.length > 0 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueToCompose}>
                  <Text style={styles.continueButtonText}>
                    {t("Continue")} ({selectedItems.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          // Compose Mode
          <View style={styles.composeContainer}>
            {/* Selected Users Header */}
            <View style={styles.composeHeader}>
              <Text style={styles.composeTitle}>
                {selectedItems.length} {t("Contacts")}
              </Text>
              <TouchableOpacity onPress={() => setIsComposing(false)}>
                <Text style={styles.editSelectionText}>{t("Edit Selection")}</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Users List */}
              <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.selectedUsersContainer}>
              {selectedItems.map(user => (
                <View key={user.id} style={styles.selectedUserChip}>
                  <Text style={styles.selectedUserText}>{user.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleItemSelection(user)}
                    style={styles.removeUserButton}>
                    <MaterialCommunityIcons
                      name="close"
                      size={RFPercentage(2)}
                      color={
                        isDarkMode
                          ? Colors.darkTheme.primaryColor
                          : Colors.lightTheme.primaryColor
                      }
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
              </ScrollView>
          

            {/* Message Input */}
            <TxtInput
              value={bulkMessageText}
              onChangeText={setBulkMessageText}
              placeholder={bulkMessagePlaceholder}
              multiline
              containerStyle={{
                backgroundColor: isDarkMode
                  ? Colors.darkTheme.input
                  : Colors.lightTheme.input,
                marginTop: hp('2%'),
              }}
              style={{minHeight: hp('12%'), maxHeight: hp('20%')}}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsComposing(false)}
                disabled={isSending}>
                <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!bulkMessageText.trim() || isSending) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSendBulkMessage}
                disabled={!bulkMessageText.trim() || isSending}>
                {isSending ? (
                  <View style={styles.loaderContainer}>
                    <Loader size={wp(5)} color={Colors.lightTheme.backgroundColor} />
                  </View>
                ) : (
                  <View style={styles.sendButtonContent}>
                    <Svgs.sendWhite height={hp(2.5)} width={hp(2.5)} />
                    <Text style={styles.sendButtonText}>{t("Send")}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </RBSheet>
  );
};

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      paddingHorizontal: wp('5%'),
      paddingTop: hp('2%'),
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('1.5%'),
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(22)),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('1.5%'),
      borderBottomWidth: 1,
      borderColor: '#E0E0E0',
    },
    avatar: {
      height: wp('6%'),
      width: wp('6%'),
      borderRadius: wp('5%'),
      marginRight: wp('3%'),
    },
    textWrapper: {
      flex: 1,
    },
    name: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    subText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: '#888',
      marginTop: hp('0.3%'),
    },

    // Multi-select styles
    checkbox: {marginRight: wp('2%')},
    selectAllContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('1%'),
      paddingHorizontal: wp('2%'),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp('2%'),
      marginBottom: hp('1%'),
    },
    selectAllText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
    },
    selectedCountText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(13)),
      color: Colors.darkTheme.primaryColor,
    },
    continueButton: {
      backgroundColor: Colors.darkTheme.primaryColor,
      paddingVertical: hp('1.2%'),
      paddingHorizontal: wp('4%'),
      borderRadius: wp('2%'),
      alignItems: 'center',
      marginBottom: hp('1%'),
    },
    continueButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: '#fff',
    },
    nameSelected: {
      color: Colors.darkTheme.primaryColor,
    },
    // Compose mode styles
    composeContainer: {
      flex: 1,
      paddingTop: hp('1%'),
    },
    composeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('1%'),
    },
    composeTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    editSelectionText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(13)),
      color: Colors.darkTheme.primaryColor,
    },
    selectedUsersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp('2%'),
      marginBottom: hp('1%'),
    },
    selectedUserChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp('3%'),
      paddingVertical: hp('0.8%'),
      borderRadius: wp('5%'),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    selectedUserText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(13)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginRight: wp('2%'),
    },
    removeUserButton: {
      padding: wp('0.5%'),
      borderRadius: '100%',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp('3%'),
      marginTop: hp('2%'),
    },
    cancelButton: {
      flex: 1,
      paddingVertical: hp('1.5%'),
      borderRadius: wp('2%'),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    sendButton: {
      flex: 1,
      backgroundColor: Colors.darkTheme.primaryColor,
      paddingVertical: hp('1.5%'),
      borderRadius: wp('2%'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    loaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp('2%'),
    },
    sendButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: '#fff',
    },
  });

export default NavigateAbleBtmSheet;
