import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import {Fonts} from '@constants/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {pxToPercentage} from '@utils/responsive';
import {useTranslation} from 'react-i18next';
import logger from '@utils/logger';

const TabSelector = ({
  tabs = [],
  selectedTab,
  onTabPress,
  isScrollable = false,
  alignTabsLeft = false,
  containerStyle,
}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const scrollRef = useRef();
  const tabRefs = useRef([]);
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const [measured, setMeasured] = useState(false);
  const {t} = useTranslation();
  const [tabMeasurements, setTabMeasurements] = useState([]);

  useEffect(() => {
    if (!isScrollable || tabs.length === 0) return;

    const timeout = setTimeout(() => {
      const index = tabs.indexOf(selectedTab);
      const ref = tabRefs.current[index];

      if (ref && scrollRef.current) {
        ref.measureLayout(
          scrollRef.current,
          (x, y, width) => {
            Animated.timing(underlineX, {
              toValue: x,
              duration: 50,
              useNativeDriver: false,
            }).start();
            Animated.timing(underlineWidth, {
              toValue: width,
              duration: 50,
              useNativeDriver: false,
            }).start();

            scrollRef.current.scrollTo({
              x: Math.max(0, x - wp(10)),
              animated: true,
            });
          },
          error => logger.log('measureLayout error:', error),
        );
      }
    }, 50); // short delay ensures layout is ready

    return () => clearTimeout(timeout);
  }, [selectedTab, tabs]);

  const renderTabs = () =>
    tabs.map((tab, index) => (
      <TouchableOpacity
        key={tab}
        onPress={() => onTabPress(tab)}
        style={[
          isScrollable ? styles.scrollableTab : styles.fixedTab,
          selectedTab === tab && styles.activeTab,
          alignTabsLeft && !isScrollable && styles.leftAlignedTab,
        ]}
        ref={ref => (tabRefs.current[index] = ref)}
        onLayout={event => {
          if (alignTabsLeft && !isScrollable) {
            const {x, width} = event.nativeEvent.layout;
            const newMeasurements = [...tabMeasurements];
            newMeasurements[index] = {x, width};
            setTabMeasurements(newMeasurements);
          }
        }}>
        <Text
        key={tab}
          style={[styles.tabText, selectedTab === tab && styles.activeText]}>
          {t(tab)}
        </Text>
      </TouchableOpacity>
    ));

  useEffect(() => {
    if (isScrollable) setMeasured(false);
  }, [tabs]);

  return (
    <>
      {isScrollable ? (
        <View style={{}}>
          <ScrollView
            horizontal
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
            onContentSizeChange={() => setMeasured(true)}>
            {renderTabs()}
            <Animated.View
              style={[
                styles.activeLine,
                {
                  width: underlineWidth,
                  transform: [{translateX: underlineX}],
                },
              ]}
            />
          </ScrollView>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.tabContainer,
              alignTabsLeft && styles.leftAlignedContainer,
              containerStyle,
            ]}>
            {renderTabs()}
          </View>

          <View style={styles.underlineContainer}>
            <View style={styles.inactiveLine} />
            <View
              style={[
                styles.activeLine,
                alignTabsLeft
                  ? {
                      left: tabMeasurements[tabs.indexOf(selectedTab)]?.x || 0,
                      width:
                        tabMeasurements[tabs.indexOf(selectedTab)]?.width *
                          0.6 || wp(15), // 60% of tab width for smaller underline
                      transform: [
                        {
                          translateX:
                            tabMeasurements[tabs.indexOf(selectedTab)]?.width *
                              0.2 || wp(2), // Center the smaller underline
                        },
                      ],
                    }
                  : {
                      left: `${
                        (tabs.indexOf(selectedTab) / tabs.length) * 100
                      }%`,
                      width: `${100 / tabs.length}%`,
                    },
              ]}
            />
          </View>
        </>
      )}
    </>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: hp(1.5),
      paddingBottom: hp(0.7),
    },
    leftAlignedContainer: {
      justifyContent: 'flex-start',
      paddingHorizontal: wp(2),
    },
    tabScrollContainer: {
      paddingHorizontal: wp(2),
      paddingTop: hp(1.5),
      paddingBottom: hp(0.7),
    },
    fixedTab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftAlignedTab: {
      flex: 0,
      minWidth: wp(20),
      paddingHorizontal: wp(4),
      marginRight: wp(2),
    },
    scrollableTab: {
      paddingHorizontal: wp(4),
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: wp(28),
    },
    tabText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      textAlign: 'center',
    },
    activeText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
    },
    underlineContainer: {
      position: 'relative',
      height: 2,
    },
    inactiveLine: {
      position: 'absolute',
      width: '100%',
      height: 3,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    activeLine: {
      position: 'absolute',
      height: 2,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      bottom: 0,
    },
    scrollUnderlineContainer: {
      height: 1,
      marginTop: -3,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      position: 'relative',
    },
  });

export default TabSelector;
