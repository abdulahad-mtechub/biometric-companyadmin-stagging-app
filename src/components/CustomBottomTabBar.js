import React from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import logger from '@utils/logger';

const CustomBottomTabBar = ({
  state,
  descriptors,
  navigation,
  icons,
  FocusedIcons,
  unreadCount = 0,
}) => {
  const {routes} = state;
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={[styles.tabContainer]}>
      {routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const showBadge = index === 3 && unreadCount > 0;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}>
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <View style={{position: 'relative'}}>
                {isFocused ? FocusedIcons[index] : icons[index]}
                {showBadge && (
                  <View
                    style={[
                      styles.unreadBadge,
                      {
                        backgroundColor: isDarkMode
                          ? Colors.darkTheme.primaryColor
                          : Colors.lightTheme.primaryColor,
                      },
                    ]}>
                    <Text style={styles.unreadText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabText,
                  isFocused && {
                    color: Colors.darkTheme.primaryColor,
                  },
                ]}>
                {t(label)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomBottomTabBar;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      height: Platform.OS === 'ios' ? 80 : 60,
      paddingBottom: Platform.OS === 'ios' ? 15 : 0,
       borderTopWidth: 1, // 👈 Enable top border
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor // 👈 Dynamic border color for dark mode
        : Colors.lightTheme.BorderGrayColor,
        paddingHorizontal: 15,
    },
    tabButton: {
      // borderRadius: 30,
      // paddingHorizontal: 8,
      // height: 40,
      // justifyContent: 'center',
    },
    tabText: {
      textAlign: 'center',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      marginTop: heightPercentageToDP(0.5),
      letterSpacing: 0.5,
    },
    unreadBadge: {
      position: 'absolute',
      top: -4,
      right: -12,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      zIndex: 10,
    },
    unreadText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
