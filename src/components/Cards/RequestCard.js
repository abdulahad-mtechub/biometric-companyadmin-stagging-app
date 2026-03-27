import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import StatusBox from './StatusBox';
import { capitalize } from '@utils/Helpers';

const RequestCard = ({ item, onPress, containerStyle }) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  // Format the type to be more readable
  const formatType = (type) => {
    return capitalize(type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  };

  // Format the date
  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMM YYYY, hh:mm A');
  };

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row - Type and Status */}
      <View style={styles.headerRow}>
        <Text style={styles.typeText}>
          {t(formatType(item.type))}
        </Text>
        <StatusBox 
          status={capitalize(item.status) === "Info_requested"? "Request Info" : capitalize(item.status)}
          containerStyle={styles.statusContainer}
        />
      </View>

      {/* Subject */}
      <Text style={styles.subjectText} numberOfLines={2}>
        {item.subject}
      </Text>

      {/* Date */}
      <Text style={styles.dateText}>
        {formatDate(item.created_at)}
      </Text>

      {/* Optional: Requester name */}
      <Text style={styles.requesterText}>
        {t('Requested by')}: {item.requester_name}
      </Text>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      marginVertical: hp(0.8),
      shadowColor: isDarkMode ? '#ffffff' : '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 3,
      borderWidth: isDarkMode ? 0 : 0.5,
      borderColor: isDarkMode 
        ? 'transparent' 
        : Colors.lightTheme.BorderGrayColor,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    typeText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
      marginRight: wp(2),
    },
    statusContainer: {
      paddingHorizontal: wp(3),
      paddingVertical: wp(1),
    },
    subjectText: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
      lineHeight: RFPercentage(2.3),
    },
    dateText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(0.5),
    },
    requesterText: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontStyle: 'italic',
    },
  });

export default RequestCard;