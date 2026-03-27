import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import TabSelector from '@components/TabSelector/TabSelector';
import {Fonts} from '@constants/Fonts';
import StackHeader from '@components/Header/StackHeader';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, capitalize, fetchApis} from '@utils/Helpers';
import {WebView} from 'react-native-webview';
import UpdateWorkerCountModal from '@components/UpdateWorkerCountModal/UpdateWorkerCountModal';
import SubscriptionAlertBanner from '@components/SubscriptionAlertBanner/SubscriptionAlertBanner';
import {SCREENS} from '@constants/Screens';
import {useTranslation} from 'react-i18next';
import {usePlanDetails} from '@utils/Hooks/Hooks';
import logger from '@utils/logger';

const getPlansApi = `${baseUrl}/payments/plans?page=1&limit=105&sort_order=asc`;
const getHistoryApi = `${baseUrl}/payments/company-admin/payments`;
const generatePaymentLinkApi = `${baseUrl}/company-admin/generate-payment-link`;
const updatePaymentMethod = `${baseUrl}/payments/company-admin/update-payment-method`;
const cancelSubscriptionApi = `${baseUrl}/payments/company-admin/cancel-subscription`;
const SubscriptionPlans = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const [selectedTab, setSelectedTab] = useState('Current Plan');
  const [billingCycle, setBillingCycle] = useState('Yearly');
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [isWorkerModalVisible, setWorkerModalVisible] = useState(false);
  const [isCurrentPlanModalVisible, setIsCurrentPlanModalVisible] =
    useState(false);
  const {planDetails, refetch} = usePlanDetails();
  const {language, token} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState({
    plans: true,
    currentPlan: false,
    history: true,
  });
  const fetchPlans = async () => {
    try {
      setLoading(prev => ({...prev, plans: true}));
      const {ok, data} = await fetchApis(
        getPlansApi,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);

        return;
      }

      if (data?.data?.plans) {
        setPlans(data.data.plans);
      }
    } catch (error) {
      logger.log('Error fetching plans:', error, {
        context: 'SubscriptionPlans',
      });
      showAlert('Failed to load plans', 'error');
    } finally {
      setLoading(prev => ({...prev, plans: false}));
    }
  };

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      setLoading(prev => ({...prev, history: true}));
      const {ok, data} = await fetchApis(
        getHistoryApi,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }

      if (data?.data?.payments) {
        setPaymentHistory(data.data.payments);
      }
    } catch (error) {
      logger.log('Error fetching payment history:', error, {
        context: 'SubscriptionPlans',
      });
      showAlert('Failed to load payment history', 'error');
    } finally {
      setLoading(prev => ({...prev, history: false}));
    }
  };

  // Generate PayPal Payment Link and redirect
  const handleGeneratePaymentLink = async plan => {
    try {
      setLoading(prev => ({...prev, payment: true}));

      const {ok, data} = await fetchApis(
        generatePaymentLinkApi,
        'GET',
        null,
        {plan_id: plan.plan_id, amount: plan.amount}, // adjust if your API expects query params differently
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (!ok || data?.error) {
        // Specific handling for active subscription
        if (data?.data?.error === 'ACTIVE_SUBSCRIPTION_EXISTS') {
          const current = data.data.current_subscription;
          const actions = data.data.available_actions;

          // Show a friendly alert with options
          showAlert(
            `You already have an active subscription (${current.plan_name}).\n\n` +
              `🧾 Status: ${current.status}\n👥 Workers: ${current.worker_count}\n\n` +
              `Please cancel your current plan before purchasing a new one.`,
            'warning',
          );

          logger.log('Available actions:', actions, {
            context: 'SubscriptionPlans',
          });
          return;
        }

        showAlert(data?.message || 'Failed to generate payment link', 'error');
        return;
      }

      const paypalUrl = data?.data?.url;
      if (paypalUrl) {
        Linking.openURL(paypalUrl);
      } else {
        showAlert('Invalid PayPal URL', 'error');
      }
    } catch (error) {
      logger.log('Error generating payment link:', error, {
        context: 'SubscriptionPlans',
      });
      showAlert('Error generating payment link', 'error');
    } finally {
      setLoading(prev => ({...prev, payment: false}));
    }
  };

  // Handle update payment method
  const handleUpdatePaymentMethod = async () => {
    try {
      setLoading(prev => ({...prev, payment: true}));

      const {ok, data} = await fetchApis(
        updatePaymentMethod,
        'POST',
        null,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);

        return;
      }

      const approvalUrl = data?.data?.payment_method_update?.approval_url;

      if (approvalUrl) {
        // open in WebView inside app
        setWebViewUrl(approvalUrl);
        setShowWebView(true);
      } else {
        showAlert('Approval URL missing', 'error');
      }
    } catch (error) {
      logger.log('Error updating payment method:', error, {
        context: 'SubscriptionPlans',
      });
      showAlert('Error updating payment method', 'error');
    } finally {
      setLoading(prev => ({...prev, payment: false}));
    }
  };
  const handleCancelSubscription = async () => {
    try {
      setLoading(prev => ({...prev, cancel: true}));

      const {ok, data} = await fetchApis(
        cancelSubscriptionApi,
        'POST',
        null,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      console.log(data);

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }

      setCancelModalVisible(false);
      refetch(); // refresh the plan info after cancellation
    } catch (error) {
      logger.error('Error cancelling subscription:', error, {
        context: 'SubscriptionPlans',
      });
      showAlert('Error cancelling subscription', 'error');
    } finally {
      setLoading(prev => ({...prev, cancel: false}));
    }
  };

  const loadTabData = useCallback(() => {
    switch (selectedTab) {
      case 'Current Plan':
        refetch();
        break;
      case 'Upgrade Plans':
        fetchPlans();
        break;
      case 'Plans History':
        fetchPaymentHistory();
        break;
    }
  }, [selectedTab, isCurrentPlanModalVisible]);

  useFocusEffect(
    useCallback(() => {
      loadTabData();
      setExpandedPlanId(null);
    }, [loadTabData]),
  );

  const handleTabPress = tab => {
    setSelectedTab(tab);
    setExpandedPlanId(null);
  };

  const togglePlanExpansion = planId => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const tabs = ['Current Plan', 'Upgrade Plans', 'Plans History'];

  const planGradients = {
    attendance: ['#006EC2', '#00f2fe'],
    full: ['#667eea', '#764ba2'],
    yearly: ['#ff9966', '#ff5e62'],
    static: ['#006EC2', '#006EC2'],
  };

  const planColors = {
    attendance: '#006EC2',
    full: '#8E2DE2',
    yearly: '#ff5e62',
  };

  // Helper function to format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to get plan type for styling
  const getPlanType = plan => {
    if (plan.plan_id.includes('attendance_yearly')) return 'yearly';
    if (plan.plan_id.includes('full_yearly')) return 'full';
    return 'attendance';
  };

  const GradientButton = ({planType, onPress, children, style = {}}) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.gradientButtonContainer,
        Platform.OS === 'ios' && styles.iosButtonShadow,
        {width: '100%'},
        style,
      ]}>
      <LinearGradient
        colors={planGradients[planType] || planGradients.static}
        style={[styles.gradientButton]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.gradientButtonText}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  console.log(planDetails);
  const renderCurrentPlanTab = () => {
    if (!planDetails) {
      return (
        <View style={styles.tabContainer}>
          <Text style={styles.sectionTitle}>
            {t('Current Subscription Plan')}
          </Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {t('No active subscription found')}
            </Text>
          </View>
        </View>
      );
    }

    const pricingBreakdown =
      planDetails?.pricing_info?.current_pricing_breakdown;
    const subscriptionStatus = planDetails?.subscription_status;

    return (
      <ScrollView
        style={styles.tabContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {t('Current Subscription Plan')}
        </Text>

        <TouchableOpacity
          style={styles.planCard2}
          onPress={() => togglePlanExpansion('current')}
          activeOpacity={0.7}>
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planName}>
                {planDetails.current_plan?.name}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                {t(
                  subscriptionStatus?.detailed_status === 'active_subscription'
                    ? 'Active Subscription'
                    : subscriptionStatus?.status || 'Inactive',
                )}
              </Text>
            </View>
          </View>

          <View style={styles.expandedContent}>
            <Text style={styles.subsectionTitle}>{t('Pricing Details')}</Text>

            {pricingBreakdown ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Employee Count')}:</Text>
                  <Text style={styles.detailValue}>
                    {pricingBreakdown.worker_count}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Base Amount')}:</Text>
                  <Text style={styles.detailValue}>
                    ${pricingBreakdown.base_amount}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('Per Employee Amount')}:
                  </Text>
                  <Text style={styles.detailValue}>
                    ${pricingBreakdown.per_worker_amount}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('Additional Employee Cost')}:
                  </Text>
                  <Text style={styles.detailValue}>
                    ${pricingBreakdown.additional_worker_cost}
                  </Text>
                </View>
                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={[styles.detailLabel, styles.totalLabel]}>
                    {t('Total Amount')}:
                  </Text>
                  <Text style={[styles.detailValue, styles.totalValue]}>
                    ${pricingBreakdown.total_amount}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Plan Amount')}:</Text>
                <Text style={styles.detailValue}>
                  ${planDetails.current_plan?.amount}{' '}
                  {planDetails.current_plan?.currency}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.renewalContainer}>
              <Text style={styles.totalText}>
                {t(
                  subscriptionStatus?.next_due_date
                    ? 'Next Renewal'
                    : 'Subscription Status',
                )}
                :
              </Text>
              <Text style={styles.renewalText}>
                {subscriptionStatus?.next_due_date
                  ? t(`Your Plan Renews on `) +
                    formatDate(subscriptionStatus.next_due_date)
                  : subscriptionStatus?.detailed_status?.replace(/_/g, ' ') ||
                    'N/A'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtonContainer}>
          <View style={styles.actionButtons}>
            <GradientButton
              planType="static"
              style={styles.actionButton}
              onPress={() => setIsCurrentPlanModalVisible(true)}>
              {t('Add Employees')}
            </GradientButton>
            <GradientButton
              planType="static"
              style={styles.actionButton}
              onPress={handleUpdatePaymentMethod}>
              {t(loading.payment ? 'Processing...' : 'Change Payment Method')}
            </GradientButton>
          </View>
        </View>

        <Modal visible={showWebView} animationType="slide">
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                backgroundColor: Colors.primary,
              }}>
              <TouchableOpacity onPress={() => setShowWebView(false)}>
                <Ionicons name="close" size={30} color="#000" />
              </TouchableOpacity>
              <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>
                {t('Update Payment Method')}
              </Text>
              <TouchableOpacity onPress={() => setShowWebView(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <WebView
              source={{uri: webViewUrl}}
              onNavigationStateChange={navState => {
                if (
                  navState.url.includes('success') ||
                  navState.url.includes('payment-method-updated')
                ) {
                  showAlert(
                    'Payment method updated successfully! Closing...',
                    'success',
                  );
                  setTimeout(() => {
                    setShowWebView(false);
                    refetch();
                    fetchPlans();
                  }, 6000);
                }
              }}
              startInLoadingState={true}
            />
          </View>
        </Modal>

        <UpdateWorkerCountModal
          visible={isCurrentPlanModalVisible}
          onClose={() => setIsCurrentPlanModalVisible(false)}
          planId={planDetails?.current_plan?.plan_id}
          addWorkers={true}
        />
      </ScrollView>
    );
  };

  const renderPlanCard = (plan, isFeatured = false) => {
    const planType = getPlanType(plan);
    const isExpanded = expandedPlanId === plan.plan_id;

    return (
      <TouchableOpacity
        style={[styles.planCard]}
        onPress={() => togglePlanExpansion(plan.plan_id)}
        activeOpacity={0.7}
        key={plan.plan_id}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planCardTitle}>{plan.name}</Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={
                isDarkMode
                  ? Colors.darkTheme.primaryTextColor
                  : Colors.lightTheme.primaryTextColor
              }
            />
          </View>
        </View>

        {isFeatured && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>{t('Most Popular')}</Text>
          </View>
        )}

        <Text style={styles.planCardPrice}>
          ${plan.amount} {plan.currency}/{plan.billing_cycle}
        </Text>
        <Text style={styles.planCardDescription}>{plan.description}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.subsectionTitle}>{t('Plan Features')}</Text>
            {plan.features?.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={planColors[planType] || '#22c55e'}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.subsectionTitle}>{t('Plan Details')}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Duration')}:</Text>
              <Text style={styles.detailValue}>
                {plan.duration_days} {t('days')} ({plan.duration_type})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Max Users')}:</Text>
              <Text style={styles.detailValue}>{plan.max_users}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Trial Period')}:</Text>
              <Text style={styles.detailValue}>
                {t(
                  plan.trial_period
                    ? `${plan.trial_days} ` + `days`
                    : 'No trial',
                )}
              </Text>
            </View>
          </View>
        )}

        <GradientButton
          planType={planType}
          style={styles.actionButton}
          onPress={() => {
            if (
              planDetails?.current_plan?.plan_id === plan.plan_id &&
              planDetails?.subscription_status?.status !== 'cancelled'
            ) {
              setCancelModalVisible(true);
            }
            // Otherwise → open worker modal for subscribing
            else {
              setSelectedPlanId(plan?.plan_id);
              setWorkerModalVisible(true);
            }
          }}>
          {t(
            planDetails?.current_plan?.plan_id === plan.plan_id &&
              planDetails?.subscription_status?.status !== 'cancelled'
              ? 'Cancel Subscription'
              : 'Subscribe',
          )}
        </GradientButton>

        <Modal
          visible={isCancelModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCancelModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.cancelModalContainer}>
              <Text style={styles.cancelModalTitle}>
                {t('Cancel Subscription?')}
              </Text>
              <Text style={styles.cancelModalText}>
                {t('Are you sure you want to cancel your subscription?')}
              </Text>
              <View style={styles.cancelModalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: '#a0a0a0'}]}
                  onPress={() => setCancelModalVisible(false)}>
                  <Text style={styles.modalButtonText}>{t('No')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: isDarkMode
                        ? Colors.darkTheme.primaryColor
                        : Colors.lightTheme.primaryColor,
                    },
                  ]}
                  onPress={handleCancelSubscription}>
                  <Text style={styles.modalButtonText}>
                    {t(loading.cancel ? 'Cancelling...' : 'Yes, Cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    );
  };

  const renderUpgradePlansTab = () => {
    if (loading.plans) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0072ff" />
          <Text style={styles.loadingText}>{t('Loading plans...')}</Text>
        </View>
      );
    }

    const monthlyPlans = plans.filter(plan => plan.billing_cycle === 'monthly');
    const yearlyPlans = plans.filter(plan => plan.billing_cycle === 'yearly');

    return (
      <View style={styles.tabContainer}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'Monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => setBillingCycle('Monthly')}>
            <Text
              style={[
                styles.toggleText,
                billingCycle === 'Monthly' && styles.toggleTextActive,
              ]}>
              {t('Monthly')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'Yearly' && styles.toggleButtonActive,
            ]}
            onPress={() => setBillingCycle('Yearly')}>
            <Text
              style={[
                styles.toggleText,
                billingCycle === 'Yearly' && styles.toggleTextActive,
              ]}>
              {t('Yearly')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {billingCycle === 'Monthly'
            ? monthlyPlans.map(plan => renderPlanCard(plan))
            : yearlyPlans.map(plan => renderPlanCard(plan))}

          {((billingCycle === 'Monthly' && monthlyPlans.length === 0) ||
            (billingCycle === 'Yearly' && yearlyPlans.length === 0)) && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('No plans available')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderPlansHistoryTab = () => {
    if (loading.history) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0072ff" />
          <Text style={styles.loadingText}>
            {t('Loading payment history...')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContainer}>
        <FlatList
          data={paymentHistory}
          keyExtractor={item => item.txn_id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => togglePlanExpansion(`history-${item.txn_id}`)}
              activeOpacity={0.7}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                <Text style={styles.historyType}>
                  {t(capitalize(item.status))}
                </Text>
              </View>
              <Text style={styles.historyPlanName}>{item.plan_name}</Text>
              <Text style={styles.historyPrice}>
                ${item.amount} {t(capitalize(item.status))}
              </Text>

              {expandedPlanId === `history-${item.txn_id}` && (
                <View style={styles.expandedContent}>
                  <View style={styles.historyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        {t('Payment Method')}:
                      </Text>
                      <Text style={styles.detailValue}>
                        {item.payment_method}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('Status')}:</Text>
                      <Text
                        style={[styles.detailValue, styles.statusCompleted]}>
                        {t(capitalize(item.status))}
                      </Text>
                    </View>
                    {item.subscription_id && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {t('Subscription ID')}:
                        </Text>
                        <Text style={styles.detailValue}>
                          {item.subscription_id}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {t('No payment history found')}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SubscriptionAlertBanner
        onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
      />
      <StackHeader
        title="Subscription & Plans"
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
      />

      <TabSelector
        tabs={tabs}
        selectedTab={selectedTab}
        onTabPress={handleTabPress}
        isScrollable={true}
      />

      {selectedTab === 'Current Plan' && renderCurrentPlanTab()}
      {selectedTab === 'Upgrade Plans' && renderUpgradePlansTab()}
      {selectedTab === 'Plans History' && renderPlansHistoryTab()}

      <UpdateWorkerCountModal
        visible={isWorkerModalVisible}
        onClose={() => setWorkerModalVisible(false)}
        planId={selectedPlanId}
        addWorkers={false}
        fetchCurrentPlan={refetch}
        currentPlan={planDetails}
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    headerContainer: {
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    ScreenHeading: {
      paddingTop: hp(1.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    tabContainer: {
      flex: 1,
      padding: wp(4),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: hp(2),
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    noDataText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
      textAlign: 'center',
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(2),
    },
    planCard: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: hp(1.5),
      padding: wp(4),
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    planCard2: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: hp(1.5),
      padding: wp(4),
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1),
    },
    planTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    planName: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginRight: wp(2),
    },
    activeBadge: {
      backgroundColor: '#22c55e',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(1),
    },
    activeBadgeText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
      color: '#ffffff',
    },
    popularBadge: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: hp(0.5),
      width: wp(18),
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'absolute',
      top: 40,
      right: 5,
    },
    popularBadgeText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1),
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    expandedContent: {},
    subsectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1.5),
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    featureIcon: {
      marginRight: wp(2),
    },
    featureText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor + '50'
        : Colors.lightTheme.BorderGrayColor + '50',
      marginVertical: hp(2),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor + '20'
        : Colors.lightTheme.BorderGrayColor + '20',
    },
    detailLabel: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
    },
    detailValue: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    statusCompleted: {
      color: '#22c55e',
    },
    totalContainer: {
      marginTop: hp(1),
      paddingTop: hp(1),
      borderTopWidth: 2,
      borderTopColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    totalText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    renewalContainer: {
      marginTop: hp(2),
      padding: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor + '20'
        : Colors.lightTheme.primaryColor + '20',
      borderRadius: hp(1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    renewalText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    planActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(2),
    },
    detailsButton: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3),
      borderRadius: hp(1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      flex: 1,
      marginLeft: wp(2),
      alignItems: 'center',
    },
    detailsButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    historyDetails: {
      marginBottom: hp(2),
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(1),
      borderRadius: hp(1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    downloadButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      marginLeft: wp(1),
    },
    actionButtonContainer: {
      alignItems: 'center',
      marginTop: hp(2),
      paddingBottom: hp(4),
    },
    plusButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtons: {
      marginTop: hp(2),
      width: '100%',
      maxWidth: Platform.OS === 'ios' ? wp(90) : '100%',
      alignSelf: 'center',
    },
    actionButton: {
      marginBottom: hp(1),
      width: '100%',
    },
    actionButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    toggleContainer: {
      flexDirection: 'row',
      borderRadius: hp(31),
      marginBottom: hp(3),
      marginHorizontal: wp(15),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: hp(1.2),
      borderRadius: hp(31),
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    toggleText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    toggleTextActive: {
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    planCardTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginRight: wp(2),
      flex: 1,
    },
    planCardPrice: {
      fontFamily: Fonts.PoppinsBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      marginBottom: hp(1),
    },
    planCardDescription: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
      lineHeight: hp(2),
    },
    featuredPlan: {
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderWidth: 2,
      transform: [{scale: 1.02}],
    },
    selectButton: {
      marginTop: hp(1),
    },
    selectButtonText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    gradientButtonContainer: {
      borderRadius: hp(1),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    gradientButton: {
      borderRadius: hp(1),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'red',
    },
    gradientButtonText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: '#ffffff',
      textAlign: 'center',
      paddingVertical: hp(1.5),
    },
    iosButtonShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    historyList: {
      paddingBottom: hp(2),
    },
    historyCard: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: hp(1.5),
      padding: wp(4),
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    historyDate: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    historyType: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor + '20'
        : Colors.lightTheme.primaryColor + '20',
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: hp(0.5),
    },
    historyPlanName: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    historyPrice: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    // Add these styles to the dynamicStyles function
    totalRow: {
      borderBottomWidth: 0,
      marginTop: hp(1),
      paddingTop: hp(1),
      borderTopWidth: 1,
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor + '50'
        : Colors.lightTheme.BorderGrayColor + '50',
    },
    totalLabel: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    totalValue: {
      fontFamily: Fonts.PoppinsBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    daysRemainingText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.3),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
      textAlign: 'center',
      marginTop: hp(0.5),
    },
    alertsContainer: {
      marginBottom: hp(2),
    },
    alertItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: wp(3),
      borderRadius: hp(1),
      marginBottom: hp(1),
      borderWidth: 1,
    },
    alertError: {
      backgroundColor: isDarkMode ? '#7f1d1d20' : '#fef2f2',
      borderColor: isDarkMode ? '#dc262650' : '#fecaca',
    },
    alertWarning: {
      backgroundColor: isDarkMode ? '#78350f20' : '#fffbeb',
      borderColor: isDarkMode ? '#f59e0b50' : '#fed7aa',
    },
    alertIcon: {
      marginRight: wp(2),
      marginTop: hp(0.2),
    },
    alertContent: {
      flex: 1,
    },
    alertMessage: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      lineHeight: hp(2),
    },
    actionRequiredText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
      color: '#dc2626',
      marginTop: hp(0.5),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelModalContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      width: '85%',
      alignItems: 'center',
    },
    cancelModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: 10,
    },
    cancelModalText: {
      fontSize: 14,
      color: '#555',
      textAlign: 'center',
      marginBottom: 20,
    },
    cancelModalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default SubscriptionPlans;
