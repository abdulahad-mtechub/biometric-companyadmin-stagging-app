import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors } from '@constants/themeColors';
import { Fonts } from '@constants/Fonts';
import { useTranslation } from 'react-i18next';
import logger from '@utils/logger';

const NestedTabsSelector = ({ tabs = [], selectedTab, onTabPress }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = selectedTab === tab;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              {
                backgroundColor: isActive
                  ? Colors.lightTheme.primaryColor
                  : Colors.lightTheme.backgroundColor,
                borderTopLeftRadius: index === 0 ? wp(10) : 0,
                borderBottomLeftRadius: index === 0 ? wp(10) : 0,
                borderTopRightRadius: index === tabs.length - 1 ? wp(10) : 0,
                borderBottomRightRadius: index === tabs.length - 1 ? wp(10) : 0,
              },
            ]}
            onPress={() => onTabPress(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive
                    ? Colors.lightTheme.primaryBtn.TextColor
                    : Colors.lightTheme.primaryColor,
                  fontFamily: isActive
                    ? Fonts.PoppinsSemiBold
                    : Fonts.PoppinsMedium,
                },
              ]}
            >
              {t(tab)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default NestedTabsSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.lightTheme.primaryColor,
    borderRadius: wp(10),
    overflow: 'hidden',
    alignSelf: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
  },
  tabText: {
    fontSize: RFPercentage(1.6),
  },
});
