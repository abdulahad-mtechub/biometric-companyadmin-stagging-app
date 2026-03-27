import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import WebView from 'react-native-webview';
import {useSelector} from 'react-redux';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const PaypalWebView = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const webviewRef = useRef(null);
  const {url, order_id} = route.params;
  const [loading, setLoading] = useState(false);
  const [webUrl, setWebUrl] = useState(url);
  const capturePaymentURL = `${baseUrl}/payments/capture-payment`;
  const {showAlert} = useAlert();
  const {token, language} = useSelector(store => store.auth);

  const {t} = useTranslation();

  const renderWebView = () => {
    if (loading) {
      return (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Loader size={wp(10)} />
        </View>
      );
    }

    return (
      <WebView
        ref={webviewRef}
        source={{uri: webUrl}}
        style={{flex: 1, marginTop: hp(2)}}
        incognito={true}
        cacheEnabled={false}
        onNavigationStateChange={handleNavigationStateChange}
      />
    );
  };

  const capturePayment = async order_id => {
    try {
      const {ok, data} = await fetchApis(
        capturePaymentURL,
        'POST',
        setLoading,
        {
          order_id: order_id,
        },
        showAlert,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      );

      ApiResponse(showAlert, data, language);
      if (!ok) {
        return;
      }
      if (data?.data?.success === true) {

        navigation.goBack();
      }
    } catch (error) {
      logger.log(error, 'error', { context:'PaypalWebView' });
    }
  };

  const handleNavigationStateChange = newNavState => {
    const {url} = newNavState;

    if (url.includes('/payment/success')) {
      setLoading(true);
      const queryString = url.split('?')[1]; // "token=88934543XT944040T&PayerID=RUW56AC5ACK3Y"
      const params = queryString.split('&'); // ["token=...", "PayerID=..."]

      let token = null;

      for (let param of params) {
        if (param.startsWith('token=')) {
          token = param.split('=')[1];
          break;
        }
      }

      if (token) {
        capturePayment(token);
        // You can now use the token
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader
        title={t('Pay With Paypal')}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(pxToPercentage(20)),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={styles.headerStyle}
        onBackPress={() => navigation.goBack()}
      />
      {renderWebView()}
    </SafeAreaView>
  );
};

export default PaypalWebView;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
        paddingTop: hp(2),
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
  });
