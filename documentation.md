# BiometricPro Company Admin App - Documentation

## Table of Contents
1. [Overview](#overview)
2. [Application Structure](#application-structure)
3. [Authentication Module](#authentication-module)
4. [Worker Management Module](#worker-management-module)
5. [Attendance Module](#attendance-module)
6. [Task Management Module](#task-management-module)
7. [Document Management Module](#document-management-module)
8. [Expense Management Module](#expense-management-module)
9. [Loan Management Module](#loan-management-module)
10. [Payroll Module](#payroll-module)
11. [Message/Chat Module](#messagechat-module)
12. [Request Management Module](#request-management-module)
13. [Reports & Analytics Module](#reports--analytics-module)
14. [Settings Module](#settings-module)
15. [Subscription Module](#subscription-module)
16. [Components Library](#components-library)
17. [Redux State Management](#redux-state-management)
18. [Utilities](#utilities)

---

## Overview

BiometricPro is a comprehensive React Native company administration application that enables organizations to manage their workforce, track attendance, assign tasks, handle expenses, and facilitate communication. The app supports both iOS and Android platforms with offline capabilities through SQLite.

### Key Features
- Worker/Employee management with biometric support
- Real-time attendance tracking
- Task creation and assignment
- Document management and upload
- Expense tracking and approval
- Payroll management
- Internal messaging system
- Request management and approvals
- Real-time notifications (FCM)
- Multi-language support (English, Spanish)
- Dark/Light theme support
- Offline mode with data synchronization

---

## Application Structure

### Entry Point
- **App.js**: Main application component with providers setup
  - Redux Provider
  - PersistGate for state persistence
  - AlertProvider for global alerts
  - NavigationContainer
  - ErrorBoundary

### Navigation Structure
```
├── Auth Stack
│   ├── Onboarding
│   ├── Login
│   ├── SignUp
│   ├── CreateCompanyProfile
│   ├── CreateUserProfile
│   ├── VerifyEmail
│   └── FaceVerified
│
├── Main Stack (Authenticated)
│   ├── Bottom Tabs
│   │   ├── Home
│   │   ├── Attendance
│   │   ├── Worker
│   │   ├── Messages
│   │   └── Menu
│   │
│   └── Detail Screens
│       ├── Employee Details
│       ├── Attendance Details
│       ├── Task Details
│       ├── Document Management
│       └── ... (80+ screens)
```

---

## Authentication Module

### Purpose
Handles user authentication, company setup, and role-based access control.

### Screens
- **Onboarding.js**: Initial app introduction screen
- **Welcome.js**: Welcome screen after onboarding
- **Login.js**: User login with email/password
- **SignUp.js**: New user registration
- **CreateCompanyProfile.js**: Company setup form
- **CreateUserProfile.js**: User profile creation
- **VerifyEmail.js**: Email verification
- **EmailVerified.js**: Email confirmed screen
- **FaceVerified.js**: Biometric verification
- **SelectRole.js**: Role selection (Admin, Account Executive, Worker)
- **ForgetPassword.js**: Password reset
- **CompanyInvitation.js**: Company invitation handling

### Redux State (authSlice.js)
```javascript
{
  userId: string,
  user: object,
  isLoggedIn: boolean,
  rememberMe: boolean,
  role: 'worker' | 'admin' | 'account_executive',
  language: object,
  token: string,
  savedAccounts: array,
  plan: object,
  trail: object,
  company: object,
  location: object,
  departments: array
}
```

---

## Worker Management Module

### Purpose
Comprehensive worker/employee management including personal details, employment information, and status tracking.

### Screens
- **Worker.js**: Main worker list screen
- **AddWorker.js**: Create new worker profile
- **EditWorker.js**: Edit worker information
- **WorkerDetails.js**: Detailed worker view
- **WorkerEmploymentDetails.js**: Employment history and details
- **UploadDocument.js**: Upload worker documents

### Features
- Worker CRUD operations
- Document upload and management
- Employment details tracking
- Department and team assignment
- Biometric data association

---

## Attendance Module

### Purpose
Track and manage employee attendance, time logs, and validation.

### Screens
- **Attendance.js**: Main attendance dashboard
- **AddManualPunch/**: Manual time entry
- **WorkerAttendenceDetails.js**: Individual worker attendance
- **UnvalidatedWorkerAttendenceDetails.js**: Pending validations
- **TodayLogsAttendenceDetails.js**: Today's attendance logs
- **ManualAttendanceDetails.js**: Manual entry details
- **AddAttendanceSettings.js**: Configure attendance rules
- **EditAttendanceSettings.js**: Modify attendance settings
- **AddDepartmentAttendanceSettings.js**: Department-specific settings

### Sub-modules
- **AttendanceHistory**: Historical attendance data
- **UnvalidatedPunches**: Pending attendance validations
- **ManualCorrections**: Attendance corrections
- **AttendanceSettings**: System configuration

### Features
- Biometric attendance tracking
- Manual punch entry
- Attendance validation workflow
- Department-specific settings
- Calendar-based attendance view
- Export attendance reports

---

## Task Management Module

### Purpose
Create, assign, and track tasks and projects across the organization.

### Screens
- **TaskManagement.js**: Main task dashboard
- **CreateTask.js**: Create new task
- **EditTask.js**: Modify existing task
- **TaskDetails.js**: Task details and updates
- **TaskCalender.js**: Calendar view of tasks
- **ProjectDetails.js**: Project information

### Features
- Task creation and assignment
- Due date tracking
- Priority management
- Status updates
- Calendar integration
- Task completion tracking

---

## Document Management Module

### Purpose
Handle document upload, storage, and sharing across the organization.

### Screens
- **DocumentManagement/**: Document library
- **DocumentDetails.js**: Document viewer
- **EditDocument.js**: Edit document metadata
- **UploadPolicy.js**: Upload policy documents

### Features
- Document upload (PDF, images, etc.)
- Document categorization
- Version control
- Access permissions
- Document sharing

---

## Expense Management Module

### Purpose
Track and manage employee expense claims and reimbursements.

### Screens
- **ExpenseManagement.js**: Expense dashboard
- **AddExpenseRecord.js**: Create expense claim
- **ExpenseRequestDetails.js**: Expense claim details

### Features
- Expense submission
- Receipt upload
- Approval workflow
- Expense categorization
- Reimbursement tracking

---

## Loan Management Module

### Purpose
Manage employee loans and repayments.

### Screens
- **MyLoans.js**: Employee loan overview
- **MyLoansDetails.js**: Loan details
- **LoanDetails.js**: General loan information
- **AddLoanRecord.js**: Create loan record

### Features
- Loan application
- Repayment schedule
- Interest calculation
- Payment tracking

---

## Payroll Module

### Purpose
Generate and manage payroll records.

### Screens
- **AddPayrollRecord.js**: Create payroll entry
- **PayrollDetails.js**: Payroll information

### Features
- Payroll generation
- Salary calculations
- Deductions management
- Payment history

---

## Message/Chat Module

### Purpose
Internal messaging system for communication between employees.

### Screens
- **Messages.js**: Message list
- **Conversation.js**: Individual chat
- **ConversationAccountExecutive.js**: AE conversation
- **GroupConversation.js**: Group chat
- **ChatProfileScreen.js**: Chat participant details
- **CreateGroup.js**: Create new group

### Redux State (messageSlice.js)
```javascript
{
  totalCount: number,
  pendingMessages: object, // { threadId: [messages] }
  isOnline: boolean,
  cachedThreads: array,
  threadsLastFetched: timestamp,
  threadsHasNext: boolean,
  threadsCurrentPage: number,
  threadsIsStale: boolean
}
```

### Features
- Real-time messaging
- Group chats
- Message status (read/unread)
- Offline message queuing
- File sharing
- Voice messages

---

## Request Management Module

### Purpose
Handle various types of requests (time off, schedule changes, HR requests).

### Screens
- **RequestManagement.js**: Request dashboard
- **RequestDetails.js**: Request details and approval

### Features
- Request submission
- Approval workflow
- Request status tracking
- HR request handling
- Schedule change requests

---

## Reports & Analytics Module

### Purpose
Generate and view various reports and statistics.

### Screens
- **Reports/**: Reports directory

### Features
- Attendance reports
- Payroll reports
- Expense reports
- Task completion reports
- Custom date range selection
- Export functionality

---

## Settings Module

### Purpose
Application configuration and user preferences.

### Screens
- **Settings/**: Main settings directory
  - **Profile.js**: User profile
  - **EditProfile.js**: Edit profile
  - **ChangePassword.js**: Password change
  - **AccountSecurityScreen.js**: Security settings
  - **NotificationPreferencesScreen.js**: Notification settings
  - **LoginActivityScreen.js**: Login history
  - **DocumentGenerationSettings.js**: Document settings
  - **WorkerSetting.js**: Worker module settings
  - **LoginActivityScreen.js**: Login activity

### Features
- Profile management
- Password change
- Notification preferences
- Security settings
- Login activity tracking
- Theme selection (Dark/Light)
- Language selection (English/Spanish)

---

## Subscription Module

### Purpose
Handle subscription plans and billing.

### Screens
- **SubscriptionPlans.js**: Available plans
- **Subscription.js**: Current subscription
- **PaypalWebView.js**: PayPal payment integration

### Redux State (subscriptionSlice.js)
```javascript
{
  features: array
}
```

### Features
- Plan comparison
- Subscription upgrade/downgrade
- Payment integration (PayPal)
- Feature management
- Billing history

---

## Components Library

### Button Components
- **customButton.js**: Reusable button component
- **CalenderBtn.js**: Calendar-specific button
- **CustomSwitch.js**: Toggle switch
- **LabeledSwitch.js**: Labeled toggle switch

### Input Components
- **Txtinput.js**: Custom text input
- **CustomDropDown.js**: Dropdown selector
- **MultipleSelectionDropDown.js**: Multi-select dropdown
- **CustomStatusDropDown.js**: Status selector
- **LabeledDropdown.js**: Labeled dropdown

### Calendar Components
- **CustomCalender.js**: Calendar widget
- **CalendarSwitcher.js**: Calendar navigation
- **YearlyCalender.js**: Year view
- **MonthlyCalender.js**: Month view
- **Taskcalender.js**: Task calendar
- **YearSwitcher.js**: Year navigation
- **MonthSwitcher.js**: Month navigation

### Card Components
- Various card components for displaying data

### Modal Components
- **CustomModal/**: Modal dialogs
- **DynamicAlert.js**: Global alert system

### List Components
- **MultiSelectButtonList.js**: Multi-select list

### Maps Components
- **LeafLetMap.js**: Map display

### Bottom Sheets
- **BottomSheets/**: Bottom sheet components

### Other Components
- Charts
- Lists
- Loaders
- CheckBox
- DateTimeModal
- Header
- TabSelector
- VoiceMessageComponent
- SemiCirlceProgressBar

---

## Redux State Management

### Store Structure
The application uses Redux Toolkit for state management with the following slices:

### 1. authSlice.js
Manages authentication state:
- User information
- Login status
- Role and permissions
- Company data
- Location data

### 2. messageSlice.js
Manages messaging state:
- Threads and conversations
- Pending messages
- Online status
- Cache management

### 3. Theme.js
Manages theme state:
- Dark/Light mode
- Color schemes
- Theme colors for both modes

### 4. errorSlice.js
Manages error state:
- Server status
- Connection state

### 5. globalStatesSlice.js
Manages global application state:
- Workers list
- Departments list
- Absence types

### 6. subscriptionSlice.js
Manages subscription state:
- Features
- Plan information

### 7. CreateAccSlice.js
Account creation state

### 8. CreateTasklocation.js
Task location data

### 9. UpdateLocationSlice.js
Location update state

---

## Utilities

### Helpers.js
Common helper functions:
- **fetchApis()**: API request handler with error handling
- **fetchFormDataApi()**: Form data upload handler
- **capitalize()**: String capitalization
- **isValidUrl()**: URL validation
- **formatChatDate()**: Date formatting for chat
- Network status checking

### LocationHelpers.js
Location-related utilities:
- Geocoding
- Address formatting
- Location permissions

### NotificationService.js
Firebase Cloud Messaging:
- Token management
- Foreground notification handling
- Background notification handling
- Notification click actions

### sqlite.js
SQLite database utilities:
- Database initialization
- CRUD operations
- Data synchronization

### exportUtils.js
Export functionality:
- Data export to various formats
- PDF generation
- Excel export

### LanguageInitializer.js
Internationalization setup:
- Language detection
- Translation loading

### responsive.js
Responsive design utilities

### socket.js
WebSocket connection for real-time features

### fireBaseConfig.js
Firebase configuration

### navigationRef.js
Navigation reference for programmatic navigation

### resetNavigation.js
Navigation reset utilities

### useBackHandler.js
Hardware back button handling

---

## Constants

### Screens.js
All screen names and navigation constants (80+ screens)

### urls.js
API endpoints configuration
- Base URL: `https://biometric-staging-backend.caprover-testing.mtechub.com/api`
- Image URL: `https://biometric-staging-backend.caprover-testing.mtechub.com`

### themeColors.js
Color definitions for both dark and light themes

### Languages.js
Supported languages and translations

### Fonts.js
Font family definitions

### Constants.js
General application constants

### DummyData.js
Mock data for development and testing

---

## Key Features by Module

### Offline Support
- SQLite database for local storage
- Network status monitoring
- Data synchronization when online
- Offline message queuing

### Deep Linking
- URL scheme: `biometricprocompanyadminapp://`
- Supported routes:
  - Registration: `biometricprocompanyadminapp://register?referral=...`
  - Home: `biometricprocompanyadminapp://home`

### Push Notifications
- Firebase Cloud Messaging integration
- Navigation from notifications
- Foreground and background handling
- Custom notification actions

### Internationalization
- i18next integration
- Supported languages: English, Spanish
- Dynamic language switching
- Translation management

### Security
- JWT token authentication
- Secure storage with react-native-keychain
- Face ID verification support
- Password change functionality
- Login activity tracking

---

## Development Guidelines

### Code Organization
- Feature-based module structure
- Separation of concerns (UI, Logic, State)
- Reusable component library
- Centralized navigation management

### State Management
- Redux Toolkit for predictable state updates
- Redux Persist for state persistence
- Slice-based architecture
- Immutable updates with Immer

### API Integration
- RESTful API calls
- Error handling and retry logic
- Network status checking
- Request/response interceptors

### Styling
- Responsive design with responsive-screen
- Dynamic theming (Dark/Light)
- Consistent component styles
- Platform-specific adjustments

---

## Testing

### Test Configuration
- Jest with react-native preset
- Test file pattern: `*.test.js` or `*.spec.js`
- Run tests: `yarn test`

### Test Types
- Unit tests for utilities
- Component tests for screens
- Integration tests for modules
- Redux state tests

---

## Build & Deployment

### Android
```bash
yarn generate-apk    # Release APK
yarn debug-apk       # Debug APK
yarn temp-release    # Build and open folder
yarn android-release # Run release build
```

### iOS
```bash
yarn ios             # Run on iOS simulator/device
yarn pod             # Install CocoaPods
```

### Development
```bash
yarn start           # Start Metro bundler
yarn lint            # Run ESLint
yarn test            # Run tests
```

---

## Dependencies

### Core
- react-native: 0.77.2
- react: 18.3.1
- typescript: 5.0.4

### State Management
- @reduxjs/toolkit: 2.8.2
- react-redux: 9.2.0
- redux-persist: 6.0.0

### Navigation
- @react-navigation/native: 7.1.14
- @react-navigation/native-stack: 7.3.21
- @react-navigation/bottom-tabs: 7.4.2

### Database & Storage
- react-native-sqlite-storage: 6.0.1
- @react-native-async-storage/async-storage: 2.2.0

### Firebase
- @react-native-firebase/app: 23.5.0
- @react-native-firebase/messaging: 23.5.0

### UI & Animation
- react-native-reanimated: 3.18.0
- react-native-gesture-handler: 2.27.1
- react-native-svg: 15.12.0

### Internationalization
- i18next: 25.3.2
- react-i18next: 15.6.0
- react-native-localize: 3.5.1

---

## Conclusion

This documentation provides a comprehensive overview of the BiometricPro Company Admin App. The application is built with a modular architecture, making it scalable and maintainable. Each module is designed to be independent while working seamlessly with others through Redux state management and shared components.

For detailed implementation of specific features, refer to the individual module files and their corresponding tests.
