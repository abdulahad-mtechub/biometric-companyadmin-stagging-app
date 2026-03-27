import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {baseUrl} from '@constants/urls';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useAlert} from '@providers/AlertContext';
import RenderHTML from 'react-native-render-html';
import Loader from '@components/Loaders/loader';
import logger from '@utils/logger';

const TermsAndConditions = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

  const fetchTerm = async () => {
    const {ok, data} = await fetchApis(
      `${baseUrl}/terms`,
      'GET',
      setIsLoading,
      null,
      null,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );

    if (!ok || data?.error) {
      ApiResponse(showAlert, data, language);
      return;
    } else {
      setApiData(language.value === 'es' ? data.data.content_es : data.data.content);
    }
  };

  useEffect(() => {
    fetchTerm();
  }, []);
  const { width } = useWindowDimensions();
  return (
    <ScrollView style={styles.container}>
      <StackHeader
        title="Terms and Conditions"
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(pxToPercentage(18)),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={{
          paddingVertical: hp(2),
          backgroundColor: isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.backgroundColor,
        }}
        onBackPress={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={{alignItems:"center", flex:1}} >
        <Loader size={wp(10)} />

        </View>
      ) : (
        <View style={styles.content}>
          <RenderHTML source={{html: apiData}} contentWidth={width} />
        </View>
      )}
    </ScrollView>
  );
};

export default TermsAndConditions;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    content: {
      marginHorizontal: wp(5),
      //   marginTop: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      padding: wp(2),
      borderRadius: wp(3),
    },

    paragraph: {
      fontSize: RFPercentage(pxToPercentage(15)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      lineHeight: hp(3),
      marginBottom: hp(1),
    },
  });
