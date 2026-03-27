import React, {useState, useEffect} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSelector} from 'react-redux';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {t} from 'i18next';
import logger from '@utils/logger';

const UpdateWorkerCountModal = ({
  visible,
  onClose,
  planId,
  addWorkers,
  fetchCurrentPlan,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language, planDetails:currentPlan} = useSelector(store => store.auth);
  const {showAlert} = useAlert();

  // Try multiple paths for the Employee Count
  const workerCount = currentPlan?.company_info?.current_workers_count
    || currentPlan?.current_plan?.worker_count
    || currentPlan?.workers_count
    || 1;
  const minimumCount = Number(workerCount);



  const [count, setCount] = useState(1); // Start with default
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [hasRecalculated, setHasRecalculated] = useState(false);

  useEffect(() => {
    logger.log('Updating count to minimumCount:', minimumCount, { context: 'UpdateWorkerCountModal' });
    setCount(minimumCount);
  }, [minimumCount]);

  useEffect(() => {
    if (visible) {
      setPriceData(null);
      setHasRecalculated(false);
      logger.log('Modal opened, setting count to:', minimumCount, { context: 'UpdateWorkerCountModal' });
      setCount(minimumCount);
    }
  }, [visible, minimumCount]);

  useEffect(() => {
    if (priceData) {
      setHasRecalculated(false);
    }
  }, [count]);

  // Ensure count never goes below minimum
  useEffect(() => {
    if (count < minimumCount) {
      setCount(minimumCount);
    }
  }, [count, minimumCount]);

  const handleCalculatePrice = async () => {
    try {
      setLoading(true);
      const payload = {plan_id: planId, worker_count: count};

      const res = await fetch(`${baseUrl}/payments/calculate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showAlert(data.message || 'Failed to calculate price', 'error');
        return;
      }
      setPriceData(data?.data || null);
      setHasRecalculated(true); // Enable continue button after successful calculation
    } catch (err) {
      showAlert('Something went wrong while calculating price', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      const res = await fetchApis(
        `${baseUrl}/payments/company-admin/generate-payment-link?plan_id=${planId}&worker_count=${count}&payment_type=recurring`,
        'GET',
        setLoading,
        null,
        true,
        {Authorization: `Bearer ${token}`},
      );

      const paypalData = res?.data?.data;
      if (!res.error && paypalData?.approval_url) {
        setPriceData({
          pricing: {
            plan_name: paypalData.plan_name,
            worker_count: paypalData.worker_count,
            per_worker_amount: paypalData.per_worker_price,
            total_amount: paypalData.total_amount,
            billing_explanation:
              paypalData.billing_info?.billing_explanation || '',
          },
        });
        setWebViewUrl(paypalData.approval_url);
        setShowWebView(true);
      } else {
        showAlert(res.data.message, 'error');
        ApiResponse(showAlert, res.data, language);
      }
    } catch (e) {
      showAlert('Something went wrong while generating payment link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async () => {
    logger.log({
      new_plan_id: planId,
      worker_count: count,
    }, { context: 'UpdateWorkerCountModal' });
    try {
      setLoading(true);
      const res = await fetchApis(
        `${baseUrl}/payments/company-admin/switch-plan`,
        'POST',
        setLoading,
        {
          new_plan_id: planId,
          worker_count: count,
        },
        true,
        {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      );

      const paypalData = res?.data?.data?.new_subscription;
      logger.log(paypalData, { context: 'UpdateWorkerCountModal' });

      if (!res.data?.error && paypalData?.approval_url) {
        setPriceData({
          pricing: {
            plan_name: paypalData.plan_name,
            worker_count: paypalData.worker_count,
            per_worker_amount: paypalData.per_worker_price,
            total_amount: paypalData.total_amount,
          },
        });
        setWebViewUrl(paypalData.approval_url);
        setShowWebView(true);
      } else {
        showAlert(res.data.message, 'error');
        ApiResponse(showAlert, res.data, language);
      }
    } catch (e) {
      showAlert('Something went wrong while generating payment link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkerCount = async () => {
    try {
      setLoading(true);
      const payload = {new_worker_count: count};
      const res = await fetch(
        `${baseUrl}/payments/company-admin/update-worker-count`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json(); // Parse JSON

      if (!res.ok || data.error) {
        showAlert(data.message || 'Failed to update employee count', 'error');
        return;
      }

      if (data.data && data?.data?.paypal_revision) {
        setWebViewUrl(data?.data?.paypal_revision.approval_url);
        setShowWebView(true);
      } else {
        // If no URL, show success message and close
        showAlert('Employee count updated successfully', 'success');
        onClose();
      }

      onClose();
    } catch (err) {
      logger.log(err, { context: 'UpdateWorkerCountModal' });
      showAlert('Something went wrong while updating employee count', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showWebView) {
    return (
      <Modal visible={true} animationType="slide">
        <View style={{flex: 1}}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity onPress={() => setShowWebView(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{uri: webViewUrl}}
            startInLoadingState={true}
            onNavigationStateChange={async navState => {
              logger.log(navState.url, { context: 'UpdateWorkerCountModal' });
              // Handle success URL for addWorkers flow
              if (
                (addWorkers && navState.url.includes('success')) ||
                navState.url.includes('revision-approved')
              ) {
                setTimeout(() => {
                  setShowWebView(false);
                  showAlert('Employee count updated successfully', 'success');
                  onClose();
                }, 3000);
              }

              // Existing PayPal success handling
              if (navState.url === 'https://company-admin.biometricpro.app/payment/success') {
                setTimeout(() => {
                  setShowWebView(false);
                  onClose();
                }, 1000);
                fetchCurrentPlan();
                logger.log('Payment successful via PayPal: ', navState.url, { context: 'UpdateWorkerCountModal' });
                // setWebViewUrl(navState.url)
                // const url = navState.url;

                // // Convert query string to an object
                // const params = Object.fromEntries(
                // );

                // // Prepare body
                // const body = {
                //   subscription_id: params.subscription_id,
                //   ba_token: params.ba_token,
                //   token: params.token,
                // };

                // try {
                //   const res = await fetch(
                //     {
                //       method: 'POST',
                //       headers: {
                //         'Content-Type': 'application/json',
                //         Authorization: `Bearer ${token}`,
                //       },
                //       body: JSON.stringify(body),
                //     },
                //   );

                //   const data = await res.json();

                // } catch (err) {
                // }
              }
            }}
            onLoadEnd={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
            }}
          />
        </View>
      </Modal>
    );
  }


  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {t(addWorkers ? 'Add Employees' : 'Choose Employee Count')}
          </Text>

          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[
                styles.circleButton,
                count === minimumCount && styles.disabledButton,
              ]}
              onPress={() => {
                if (count > minimumCount) {
                  setCount(prev => prev - 1);
                }
              }}
              disabled={count === minimumCount}>
              <Text
                style={[
                  styles.counterText,
                  count === minimumCount && styles.disabledText,
                ]}>
                –
              </Text>
            </TouchableOpacity>

            <View style={styles.countBox}>
              <Text style={styles.count}>{count}</Text>
            </View>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setCount(prev => prev + 1)}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>

          
          <Text style={styles.minimumText}>
            {t('Minimum:')} {minimumCount} {t('Employees')}
          </Text>

          {priceData?.pricing && (
            <View style={{alignItems: 'center', marginTop: 10}}>
              <Text style={{fontSize: 16, fontWeight: '600'}}>
                {priceData.pricing.plan_name}
              </Text>
              <Text style={{fontSize: 14, color: '#666', textAlign: 'center'}}>
                {t(
                  priceData.pricing.billing_explanation ||
                    `Employee Count` + ` : ${priceData.pricing.worker_count}`,
                )}
              </Text>
              <Text style={{fontSize: 14, color: '#666'}}>
                {t('Per Employee')}: ${priceData.pricing.per_worker_amount}
              </Text>
              <Text style={{fontSize: 16, fontWeight: '700', marginTop: 5}}>
                {t('Total')}: ${priceData?.pricing.total_amount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primary]}
              onPress={handleCalculatePrice}
              disabled={loading}>
              <Text style={styles.actionText2}>
                {t(
                  loading
                    ? 'Loading...'
                    : priceData
                    ? 'Recalculate'
                    : 'Calculate',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                hasRecalculated && priceData && !loading
                  ? styles.continue
                  : styles.disabled,
              ]}
              disabled={!hasRecalculated || !priceData || loading}
              onPress={() => {
                if (addWorkers) {
                  handleUpdateWorkerCount();
                } else {
                  if (currentPlan?.current_plan?.plan_id) {
                    handleSwitch();
                  } else {
                    handleContinue();
                  }
                }
              }}>
              <Text style={styles.actionText}>
                {t(loading ? 'Processing...' : 'Continue')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '85%',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.text,
      marginBottom: 20,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
    },
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.5,
    },
    counterText: {
      fontSize: 22,
      color: Colors.text,
    },
    disabledText: {
      opacity: 0.5,
    },
    countBox: {
      width: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 15,
    },
    count: {
      fontSize: 20,
      fontWeight: '600',
      color: Colors.text,
    },
    minimumText: {
      fontSize: 12,
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
      marginBottom: 10,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    primary: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    continue: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    disabled: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      opacity: 0.5,
    },
    actionText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
    actionText2: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontSize: 15,
      fontWeight: '600',
    },
    closeIcon: {
      position: 'absolute',
      top: 10,
      right: 15,
    },
    closeText: {
      fontSize: 35,
      color: '#000',
    },
    webviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
  });

export default UpdateWorkerCountModal;
