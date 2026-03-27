import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { Symbols } from "@constants/DummyData";
import { Fonts } from "@constants/Fonts";
import { Svgs } from "@assets/Svgs/Svgs";
import { pxToPercentage } from "@utils/responsive";
import logger from '@utils/logger';

const SymbolCard = ({ theme = false, heading, title, array, contianerStyle }) => {
  const { isDarkMode,Colors } = useSelector((store) => store.theme);

  const { t } = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);
  //   backgroundColor: "#9CA3AF",
  // };

  return (
    <View style={[styles.cardContainer, contianerStyle]}>
      <Text style={[styles.title]}>{t(heading)}</Text>
      <View style={styles.divider} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.symbolsContainer]}>
        {array?.map((item, index) => (
          <View style={[styles.symbolRow]} key={index}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: Symbols[item]?.backgroundColor || "#9CA3AF" },
              ]}
            >
              {Symbols[item]?.icon || (
                <Svgs.alertWhite height={hp(6)} width={hp(6)} />
              )}
            </View>
            <Text style={[styles.symbolText, {}]}>{t(item)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    cardContainer: {
      padding: wp(4),
      borderRadius: wp(3),
      borderWidth: 1,
      marginVertical: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginBottom: hp(2),
    },
    symbolsContainer: {
      // flexDirection: "row",
      // flexWrap: "wrap",
      // justifyContent: "space-between",
      //   width: "70%",
    },
    symbolRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: wp(2),
    },
    iconWrapper: {
      height: hp(3.5),
      width: hp(3.5),
      borderRadius: hp(2.25),
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(1),
    },
    symbolText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
  });

export default SymbolCard;
