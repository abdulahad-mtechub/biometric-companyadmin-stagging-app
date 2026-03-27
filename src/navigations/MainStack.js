import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabBar';
import {SCREENS} from '@constants/Screens';
import Onboarding from '@screens/auth/Onboarding';
import Login from '@screens/auth/Login';
import Welcome from '@screens/auth/Welcome';
import SignUp from '@screens/auth/SignUp';
import CompanyInvitation from '@screens/auth/CompanyInvitation';
import FaceVerified from '@screens/auth/FaceVerified';
import Subscription from '@screens/MainStack/Subscription';
import ForgetPassword from '@screens/auth/ForgetPassword';
import VerifyEmail from '@screens/auth/VerifyEmail';
import AddWorker from '@screens/MainStack/AddWorker';
import WorkerEmploymentDetails from '@screens/MainStack/WorkerEmploymentDetails';
import WorkerDetails from '@screens/MainStack/WorkerDetails';
import AddDepartment from '@screens/MainStack/AddDepartment';
import DepartmentDetails from '@screens/MainStack/DepartmentDetails';
import AddTeam from '@screens/MainStack/AddTeam';
import TeamDetails from '@screens/MainStack/TeamDetails';
import WorkerAttendenceDetails from '@screens/MainStack/WorkerAttendenceDetails';
import AddManualPunch from '@screens/MainStack/AddManualPunch/AddManualPunch';
import ManualAttendanceDetails from '@screens/MainStack/ManualAttendanceDetails';
import CreateTask from '@screens/MainStack/CreateTask';
import TaskDetails from '@screens/MainStack/TaskDetails';
import UploadDocument from '@screens/MainStack/UploadDocument';
import UpdateDocument from '@screens/MainStack/UpdateDocument';
import ProjectDetails from '@screens/MainStack/ProjectDetails';
import RequestManagement from '@screens/MainStack/RequestManagement';
import RequestDetails from '@screens/MainStack/RequestDetails';
import ChatProfileScreen from '@screens/MainStack/ChatProfileScreen';
import NotificationScreen from '@screens/MainStack/Notifications';
import ExpenseManagement from '@screens/MainStack/ExpenseManagement';
import AddExpenseRecord from '@screens/MainStack/AddExpenseRecord';
import AddLoanRecord from '@screens/MainStack/AddLoanRecord';
import PayrollDetails from '@screens/MainStack/PayrollDetails';
import ExpenseRequestDetails from '@screens/MainStack/ExpenseRequestDetails';
import LoanDetails from '@screens/MainStack/LoanDetails';
import DocumentManagement from '@screens/MainStack/DocumentManagement/DocumentManagement';
import DocumentDetails from '@screens/MainStack/DocumentDetails';
import UploadPolicy from '@screens/MainStack/UploadPolicy';
import MyLoans from '@screens/MainStack/MyLoans';
import MyLoanDetails from '@screens/MainStack/MyLoanDetails';
import Profile from '@screens/MainStack/Profile';
import EditProfile from '@screens/MainStack/EditProfile';
import ChangePassword from '@screens/MainStack/ChangePassword';
import TermsAndConditions from '@screens/MainStack/Terms';
import PrivacyPolicy from '@screens/MainStack/PrivacyPolicy';
import ReportsStatistics from '@screens/MainStack/Reports/ReportsStatistics';
import GlobalSearch from '@screens/MainStack/GlobalSearch';
import ProfileDetail from '@screens/MainStack/ProfileDetail';
import Settings from '@screens/MainStack/Settings/Settings';
import GeneralSettingsScreen from '@screens/MainStack/Settings/GeneralSettingsScreen';
import NotificationPreferencesScreen from '@screens/MainStack/Settings/NotificationPreferencesScreen';
import LoginSecurityScreen from '@screens/MainStack/Settings/LoginSecurityScreen';
import LoginActivityScreen from '@screens/MainStack/Settings/LoginActivityScreen';
import TaskSetting from '@screens/MainStack/Settings/TaskSetting';
import InboxSetting from '@screens/MainStack/Settings/InboxSetting';
import WorkerSetting from '@screens/MainStack/Settings/WorkerSetting';
import AttendenceSetting from '@screens/MainStack/Settings/AttendenceSetting';
import Map from '@screens/MainStack/Maps/Map';
import CreateGroup from '@screens/MainStack/CreateGroup';
import GroupConversation from '@screens/MainStack/GroupConversation';
import ErrorScreen from '@screens/MainStack/ErrorScreen';
import EmailVerified from '@screens/auth/EmailVerified';
import PaypalWebView from '@screens/MainStack/PaypalWebView';
import {useSelector} from 'react-redux';
import EditWorker from '@screens/MainStack/EditWorker';
import UpdateLocation from '@screens/MainStack/UpdateLocation';
import AddPayrollRecord from '@screens/MainStack/AddPayrollRecord';
import UnvalidatedWorkerAttendenceDetails from '@screens/MainStack/UnvalidatedWorkerAttendenceDetails';
import EditAttendanceSettings from '@screens/MainStack/EditAttendanceSettings';
import EditTask from '@screens/MainStack/EditTask';
import TodayLogsAttendenceDetails from '@screens/MainStack/TodayLogsAttendenceDetails';
import Conversation from '@screens/MainStack/Conversation';
import SubscriptionPlans from '@screens/MainStack/SubscriptionPlans';
import DocumentGenerationSettings from '@screens/MainStack/Settings/DocumentGenerationSettings';
import AbscenceManagement from '@screens/MainStack/AbscenceManagement';
import AddAbscence from '@screens/MainStack/AddAbscence';
import AbsenceDetails from '@screens/MainStack/AbsenceDetails';
import AddAttendanceSettings from '@screens/MainStack/AddAttendanceSettings';
import AddDepartmentAttendanceSettings from '@screens/MainStack/AddDepartmentAttendanceSettings';
import logger from '@utils/logger';
import Messages from '@screens/MainStack/Messages';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const {isLoggedIn, onboardingShown} = useSelector(store => store.auth);

  const getInitialRouteName = () => {
    if (isLoggedIn) {
      return SCREENS.DASHBOARD;
    }
    return onboardingShown ? SCREENS.ONBOARDING : SCREENS.LOGIN;
  };


  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={SCREENS.ONBOARDING} component={Onboarding} />
      <Stack.Screen name={SCREENS.LOGIN} component={Login} />
      <Stack.Screen name={SCREENS.WELCOME} component={Welcome} />
      <Stack.Screen
        name={SCREENS.COMPANYINVITATION}
        component={CompanyInvitation}
      />
      <Stack.Screen name={SCREENS.FACEIDVERIFIED} component={FaceVerified} />
      <Stack.Screen name={SCREENS.SUBSCRIPTION} component={Subscription} />
      <Stack.Screen name={SCREENS.DASHBOARD} component={BottomTabNavigator} />
      <Stack.Screen
        name={SCREENS.SUBSCRIPTIONPLANS}
        component={SubscriptionPlans}
      />
      <Stack.Screen name={SCREENS.SIGNUP} component={SignUp} />
      <Stack.Screen name={SCREENS.VERIFYEMAIL} component={VerifyEmail} />
      <Stack.Screen name={SCREENS.FORGET} component={ForgetPassword} />
      <Stack.Screen name={SCREENS.ADDWORKER} component={AddWorker} />
      <Stack.Screen
        name={SCREENS.WORKEREMPLOYMENTDETAILS}
        component={WorkerEmploymentDetails}
      />
      <Stack.Screen name={SCREENS.WORKERDETAILS} component={WorkerDetails} />
      <Stack.Screen name={SCREENS.ADDDEPARTMENT} component={AddDepartment} />
      <Stack.Screen
        name={SCREENS.DEPARTMENTDETAILS}
        component={DepartmentDetails}
      />
      <Stack.Screen name={SCREENS.ADDTEAM} component={AddTeam} />
      <Stack.Screen name={SCREENS.TEAMDETAILS} component={TeamDetails} />
      <Stack.Screen
        name={SCREENS.WORKERATTENDENCEDETAILS}
        component={WorkerAttendenceDetails}
      />
      <Stack.Screen name={SCREENS.ADDMANUALPUNCH} component={AddManualPunch} />
      <Stack.Screen
        name={SCREENS.MANUALATTENDANCEDETAILS}
        component={ManualAttendanceDetails}
      />
      <Stack.Screen name={SCREENS.MESSAGES} component={Messages} />
      <Stack.Screen name={SCREENS.CREATETASK} component={CreateTask} />
      <Stack.Screen name={SCREENS.TASKDETAILS} component={TaskDetails} />
      <Stack.Screen name={SCREENS.PROJECTDETAILS} component={ProjectDetails} />
      <Stack.Screen name={SCREENS.UPLOADDOCUMENT} component={UploadDocument} />
      <Stack.Screen name={SCREENS.UPDATEDOCUMENT} component={UpdateDocument} />
      <Stack.Screen
        name={SCREENS.REQUESTMANAGEMENT}
        component={RequestManagement}
      />
      <Stack.Screen name={SCREENS.REQUESTDETAILS} component={RequestDetails} />
      <Stack.Screen name={SCREENS.CONVERSATION} component={Conversation} />
      <Stack.Screen
        name={SCREENS.NOTIFICATIONS}
        component={NotificationScreen}
      />
      <Stack.Screen
        name={SCREENS.EXPENSEMANAGEMENT}
        component={ExpenseManagement}
      />
      <Stack.Screen
        name={SCREENS.ADDPAYROLLRECORD}
        component={AddPayrollRecord}
      />
      <Stack.Screen
        name={SCREENS.ADDEXPENSERECORD}
        component={AddExpenseRecord}
      />
      <Stack.Screen name={SCREENS.ADDLONERECORD} component={AddLoanRecord} />
      <Stack.Screen name={SCREENS.PAYROLLDETAILS} component={PayrollDetails} />
      <Stack.Screen
        name={SCREENS.EXPENSEREQUESTDETAILS}
        component={ExpenseRequestDetails}
      />
      <Stack.Screen name={SCREENS.LOANDETAILS} component={LoanDetails} />
      <Stack.Screen
        name={SCREENS.DOCUMENTMANAGEMENT}
        component={DocumentManagement}
      />
      <Stack.Screen
        name={SCREENS.DOCUMENTDETAILS}
        component={DocumentDetails}
      />
      <Stack.Screen name={SCREENS.UPLOADPOLICY} component={UploadPolicy} />
      <Stack.Screen name={SCREENS.MYLOANS} component={MyLoans} />
      <Stack.Screen name={SCREENS.MYLOANSDETAILS} component={MyLoanDetails} />
      <Stack.Screen name={SCREENS.PROFILE} component={Profile} />
      <Stack.Screen name={SCREENS.EDITPROFILE} component={EditProfile} />
      <Stack.Screen name={SCREENS.CHANGEPASSWORD} component={ChangePassword} />
      <Stack.Screen
        name={SCREENS.TERMSANDCONDITIONS}
        component={TermsAndConditions}
      />
      <Stack.Screen name={SCREENS.PRIVACYPOLICY} component={PrivacyPolicy} />
      <Stack.Screen
        name={SCREENS.REPORTSSTATISTICS}
        component={ReportsStatistics}
      />
      <Stack.Screen name={SCREENS.GLOBALSEARCH} component={GlobalSearch} />
      <Stack.Screen name={SCREENS.PROFILEDETAILS} component={ProfileDetail} />
      <Stack.Screen name={SCREENS.SETTINGS} component={Settings} />
      <Stack.Screen
        name={SCREENS.GENERALSETTINGS}
        component={GeneralSettingsScreen}
      />
      <Stack.Screen
        name={SCREENS.NOTIFICATIONPREFERENCES}
        component={NotificationPreferencesScreen}
      />
      <Stack.Screen
        name={SCREENS.LOGINSECURITY}
        component={LoginSecurityScreen}
      />
      <Stack.Screen
        name={SCREENS.LOGINACTIVITY}
        component={LoginActivityScreen}
      />
      <Stack.Screen name={SCREENS.TASKSETTING} component={TaskSetting} />
      <Stack.Screen name={SCREENS.INBOXSETTING} component={InboxSetting} />
      <Stack.Screen name={SCREENS.WORKERSETTING} component={WorkerSetting} />
      <Stack.Screen
        name={SCREENS.ATTENDANCESETTING}
        component={AttendenceSetting}
      />
      <Stack.Screen name={SCREENS.MAP} component={Map} />
      <Stack.Screen name={SCREENS.CREATEGROUP} component={CreateGroup} />
      <Stack.Screen
        name={SCREENS.GROUPCONVERSATION}
        component={GroupConversation}
      />
      <Stack.Screen name={SCREENS.ERRORSCREEN} component={ErrorScreen} />
      <Stack.Screen name={SCREENS.EMAILVERIFIED} component={EmailVerified} />
      <Stack.Screen name={SCREENS.PAYPALWEBVIEW} component={PaypalWebView} />
      <Stack.Screen name={SCREENS.EDITWORKER} component={EditWorker} />
      <Stack.Screen name={SCREENS.UPDATELOCATION} component={UpdateLocation} />
      <Stack.Screen
        name={SCREENS.UNVALIDATEDWORKERATTENDENCEDETAILS}
        component={UnvalidatedWorkerAttendenceDetails}
      />
      <Stack.Screen
        name={SCREENS.EDITATTENDANCESETTINGS}
        component={EditAttendanceSettings}
      />
      <Stack.Screen name={SCREENS.EDITTASK} component={EditTask} />
      <Stack.Screen
        name={SCREENS.TODAYLOGSATTENDENCEDETAILS}
        component={TodayLogsAttendenceDetails}
      />

      <Stack.Screen
        name={SCREENS.CHATPROFILESCREEN}
        component={ChatProfileScreen}
      />
      <Stack.Screen
        name={SCREENS.DOCUMENTGENERATIONSETTINGS}
        component={DocumentGenerationSettings}
      />
      <Stack.Screen
        name={SCREENS.ABSCENCEMANAGEMENT}
        component={AbscenceManagement}
      />
      <Stack.Screen name={SCREENS.ADDABSCENCE} component={AddAbscence} />
      <Stack.Screen name={SCREENS.ABSENCEDETAILS} component={AbsenceDetails} />
      <Stack.Screen
        name={SCREENS.ADDATTENDANCESETTINGS}
        component={AddAttendanceSettings}
      />
      <Stack.Screen
        name={SCREENS.ADDDEPARTMENTATTENDANCESETTINGS}
        component={AddDepartmentAttendanceSettings}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
