import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '@constants/themeColors';
import {Fonts} from '@constants/Fonts';
import moment from 'moment';
import {useSelector} from 'react-redux';
import logger from '@utils/logger';

const AbsenceListModal = ({visible, onClose, data = []}) => {
  const {isDarkMode} = useSelector(store => store.theme);

  const renderItem = ({item}) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode
            ? Colors.darkTheme.cardBackground
            : Colors.lightTheme.cardBackground,
        },
      ]}>
      <View style={[styles.colorBullet, {backgroundColor: item.color}]} />

      <View style={{flex: 1}}>
        <Text
          style={[
            styles.title,
            {
              color: isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor,
            },
          ]}>
          {item.title}
        </Text>

        <Text
          style={[
            styles.subText,
            {
              color: isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.secondryTextColor,
            },
          ]}>
          {item.worker?.name || 'Unknown'} • {item.worker?.employeeId || '--'}
        </Text>

        <Text
          style={[
            styles.date,
            {
              color: isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor,
            },
          ]}>
          {moment(item.start).format('DD MMM, YYYY')}
        </Text>

        {item.comment ? (
          <Text
            style={[
              styles.comment,
              {
                color: isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor,
              },
            ]}>
            {item.comment}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDarkMode
                ? Colors.darkTheme.backgroundColor
                : Colors.lightTheme.backgroundColor,
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.headerText,
                {
                  color: isDarkMode
                    ? Colors.darkTheme.primaryTextColor
                    : Colors.lightTheme.primaryTextColor,
                },
              ]}>
              Absence Details
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text
                style={[
                  styles.closeText,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.primaryTextColor,
                  },
                ]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: hp(3)}}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AbsenceListModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  container: {
    height: hp(75),
    width: '100%',
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  headerText: {
    fontSize: RFPercentage(2.5),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  closeText: {
    fontSize: RFPercentage(3),
    fontFamily: Fonts.PoppinsMedium,
  },
  card: {
    flexDirection: 'row',
    padding: hp(1.8),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    elevation: 2,
  },
  colorBullet: {
    height: hp(5),
    width: wp(2),
    borderRadius: wp(1),
    marginRight: wp(3),
  },
  title: {
    fontSize: RFPercentage(2),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subText: {
    fontSize: RFPercentage(1.6),
    marginTop: hp(0.3),
    fontFamily: Fonts.PoppinsRegular,
  },
  date: {
    fontSize: RFPercentage(1.8),
    marginTop: hp(0.6),
    fontFamily: Fonts.PoppinsMedium,
  },
  comment: {
    fontSize: RFPercentage(1.6),
    marginTop: hp(0.3),
    fontFamily: Fonts.PoppinsRegular,
  },
});
