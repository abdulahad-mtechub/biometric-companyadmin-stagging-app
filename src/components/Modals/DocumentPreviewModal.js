import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
import { Colors } from '@constants/themeColors';
import { Fonts } from '@constants/Fonts';
import { useTranslation } from 'react-i18next';
import logger from '@utils/logger';

const DocumentPreviewModal = ({
  visible,
  onClose,
  title = 'Document Preview',
  data = [],
  buttonLabel = 'Generate Document',
  onButtonPress,
  theme = 'light', // 'dark' or 'light'
}) => {
  const colorTheme = theme === 'dark' ? Colors.darkTheme : Colors.lightTheme;
  const {t} = useTranslation()

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colorTheme.secondryColor },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colorTheme.primaryTextColor, fontFamily: Fonts.PoppinsSemiBold },
              ]}
            >
              {t(title)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{
                  fontSize: RFPercentage(2.5),
                  color: colorTheme.iconColor,
                  fontFamily: Fonts.PoppinsBold,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { borderBottomColor: colorTheme.BorderGrayColor }]} />

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: hp(60), marginTop: hp(1.5) }}
          >
            {data.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colorTheme.BorderGrayColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: colorTheme.secondryTextColor, fontFamily: Fonts.PoppinsRegular },
                  ]}
                >
                  {t(item.label)}
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: colorTheme.primaryTextColor, fontFamily: Fonts.PoppinsMedium },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colorTheme.primaryBtn.BtnColor },
            ]}
            onPress={onButtonPress}
          >
            <Text
              style={{
                color: colorTheme.primaryBtn.TextColor,
                fontSize: RFPercentage(1.8),
                fontFamily: Fonts.PoppinsMedium,
              }}
            >
              {t(buttonLabel)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DocumentPreviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(85),
    borderRadius: wp(3),
    padding: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: RFPercentage(2.3),
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: hp(1),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
  },
  label: {
    fontSize: RFPercentage(1.8),
  },
  value: {
    fontSize: RFPercentage(1.6),
    textAlign: 'right',
    flexShrink: 1,
  },
  button: {
    alignSelf: 'center',
    marginTop: hp(2.5),
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
  },
});
