# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native** company administration mobile application with biometric features. The app supports iOS and Android platforms and includes features like:
- Worker/employee management
- Attendance tracking
- Document management
- Expense management
- Message system
- Real-time notifications (Firebase Cloud Messaging)
- Offline capabilities (SQLite storage)
- Multi-language support (English, Spanish)
- Dark/Light theme support

## Technology Stack

- **Framework**: React Native 0.77.2 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v7 (Stack + Bottom Tabs)
- **Internationalization**: react-i18next
- **Database**: SQLite (react-native-sqlite-storage)
- **Push Notifications**: @react-native-firebase/messaging
- **Animations**: react-native-reanimated
- **Maps**: react-native-maps
- **Build System**: Gradle (Android), CocoaPods (iOS)

## Common Development Commands

### Running the App
```bash
# Start Metro bundler
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Install iOS pods (required after installing new native dependencies)
yarn pod
```

### Building for Production
```bash
# Generate Android release APK
yarn generate-apk

# Generate Android debug APK
yarn debug-apk

# Generate release APK and open folder
yarn temp-release

# Run Android release build
yarn android-release
```

### Code Quality
```bash
# Run ESLint
yarn lint

# Run tests
yarn test
```

### Node.js Requirement
- Node.js >= 18 required (see package.json:118)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BottomSheets/    # Bottom sheet components
│   ├── Buttons/         # Button components
│   ├── Cards/           # Card components
│   ├── Charts/          # Chart components
│   ├── CustomModal/     # Modal components
│   ├── TextInput/       # Text input components
│   ├── DynamicAlert.js  # Global alert system
│   └── ...              # Other UI components
├── Screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── BottomTabs/     # Bottom tab screens
│   └── MainStack/      # Main stack screens
├── redux/              # Redux state management
│   ├── Slices/         # Redux Toolkit slices
│   │   ├── authSlice.js
│   │   ├── messageSlice.js
│   │   ├── Theme.js
│   │   ├── errorSlice.js
│   │   └── ...
│   └── Store/          # Redux store configuration
├── navigations/        # Navigation configuration
│   ├── MainStack.js    # Main stack navigator
│   └── BottomTabBar.js # Bottom tab bar
├── Constants/          # App constants
│   ├── urls.js         # API endpoints (staging)
│   ├── Screens.js      # Screen names
│   ├── themeColors.js  # Theme colors
│   ├── Languages.js    # Language settings
│   └── ...
├── Providers/          # Context providers
│   └── AlertContext.js
├── Translations/       # i18n translations
│   └── i18n.js         # i18n configuration
└── utils/              # Utility functions
    ├── Helpers.js      # General helpers
    ├── LocationHelpers.js
    ├── NotificationService.js
    ├── sqlite.js       # SQLite utilities
    └── ...
```

## Key Architecture Patterns

### State Management (Redux)
- Redux Toolkit with RTK Query patterns in `src/redux/Slices/`
- Key slices: `authSlice.js` (authentication), `messageSlice.js` (messaging), `Theme.js` (theming)
- Persistent state using `redux-persist`
- Store configuration in `src/redux/Store/Store.js`

### Navigation
- React Navigation v7 with TypeScript support
- Deep linking configured with prefix `biometricprocompanyadminapp://`
- Main stack navigator in `src/navigations/MainStack.js`
- Bottom tabs in `src/navigations/BottomTabBar.js`

### Deep Linking
- Deep link handler in `App.js:62-111`
- Supported routes:
  - `biometricprocompanyadminapp://register?referral=...`
  - `biometricprocompanyadminapp://home`

### API Configuration
- Base URL configured in `src/Constants/urls.js:7-8`
- Currently pointing to staging: `https://biometric-staging-backend.caprover-testing.mtechub.com/api`
- API helper functions in `src/utils/Helpers.js`

### Offline Support
- SQLite database initialized in `src/utils/sqlite.js`
- Called in `App.js:188` during app initialization
- Network status monitoring with `@react-native-community/netinfo`

### Push Notifications
- Firebase Cloud Messaging integration
- Token management and handlers in `src/utils/NotificationService.js`
- Foreground/background notification handling in `App.js:239-250`
- Navigation from notifications in `App.js:209-237`

### Internationalization
- i18next configuration in `src/Translations/i18n.js`
- Language initializer component in `src/utils/LanguageInitializer.js`
- Supported languages: English, Spanish
- Language state managed in Redux (`authSlice.js`)

## Configuration Files

- **babel.config.js**: Babel configuration with react-native-reanimated plugin
- **jest.config.js**: Jest test configuration (preset: react-native)
- **.prettierrc.js**: Prettier formatting rules
- **react-native.config.js**: React Native CLI configuration
- **metro.config.js**: Metro bundler configuration
- **tsconfig.json**: TypeScript configuration

## Entry Point

- **App.js**: Main application entry point with providers and navigation setup
- **index.js**: React Native entry point

## Testing

- Jest configured with `react-native` preset
- Run tests with `yarn test`

## Important Notes

1. **iOS Pods**: Always run `yarn pod` after installing new native dependencies
2. **Firebase**: Configuration in `src/utils/fireBaseConfig.js`
3. **SQLite**: Database initialization happens on app start
4. **Theme**: Dark/Light mode managed in Redux with `Theme.js` slice
5. **Error Boundary**: Implemented in `src/Screens/MainStack/ErrorBoundary.js`
6. **Prettier**: Code formatting configured in `.prettierrc.js`
7. **Deep Linking**: Test with `yarn test-deeplink.html` for testing deep links

## Development Workflow Tips

- The app uses TypeScript but some files are still using `.js` extensions
- Redux slices follow RTK pattern with immer for immutable updates
- Components use responsive design utilities in `src/utils/responsive.js`
- Custom components are organized by type in `src/components/`
- Screen navigation is centralized in `src/Constants/Screens.js`
