import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {pxToPercentage} from '@utils/responsive';
import {useTranslation} from 'react-i18next';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Svgs} from '@assets/Svgs/Svgs';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '@constants/Screens';
import {truncateText} from '@utils/Helpers';
import logger from '@utils/logger';

const DocumentCard = ({item, type}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(SCREENS.DOCUMENTDETAILS, {item, type: type});
      }}
      activeOpacity={0.7}
      style={styles.container}>
      <Text style={styles.workerName}>{truncateText(item?.name, 15)}</Text>
      <Svgs.documentred style={{width: '10%'}} />
      <Text
        style={[
          styles.workerName,
          {
            textAlign: 'right',
          },
        ]}
        numberOfLines={1}>
        {moment(item?.updated_at).format('DD MMM- hh:mm a')}
      </Text>
    </TouchableOpacity>
  );
};

export default DocumentCard;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(0.5),
      paddingVertical: hp(1),
      paddingHorizontal: wp(2),
      borderRadius: wp(2),
      alignItems: 'center',
    },
    workerName: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      textAlign: 'left',
      width: '35%',
    },
  });
