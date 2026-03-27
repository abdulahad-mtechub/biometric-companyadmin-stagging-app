module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@screens': './src/Screens',
          '@utils': './src/utils',
          '@constants': './src/Constants',
          '@assets': './src/assets',
          '@redux': './src/redux',
          '@providers': './src/Providers',
          '@navigations': './src/navigations',
          '@translations': './src/Translations',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        'moduleName': '@env',
        'path': '.env',
        'blacklist': null,
        'whitelist': null,
        'safe': false,
        'allowUndefined': true,
      },
    ],
  ],
};
