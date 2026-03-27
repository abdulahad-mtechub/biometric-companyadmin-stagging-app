import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getLocales} from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@translations/i18n';
import {setLanguage} from '@redux/Slices/authSlice';
import logger from '@utils/logger';

const LANGUAGE_STORAGE_KEY = 'user-language-preference';

export default function LanguageInitializer() {
  const dispatch = useDispatch();
  const language = useSelector(store => store.auth.language);

  // Initialize language on app start
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (savedLanguage) {
          // User has manually selected a language before
          const parsedLanguage = JSON.parse(savedLanguage);
          dispatch(setLanguage(parsedLanguage));
          i18n.changeLanguage(parsedLanguage.value);
          return;
        }

        // First time using app - use device language
        const locales = getLocales();
        const deviceLangCode = locales[0]?.languageCode || 'en';

        let appLanguage;
        if (deviceLangCode === 'es') {
          appLanguage = {label: 'Spanish', value: 'es'};
        } else {
          // Default to English for any other language
          appLanguage = {label: 'English', value: 'en'};
        }

        // Set initial language
        dispatch(setLanguage(appLanguage));
        i18n.changeLanguage(appLanguage.value);

        await AsyncStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          JSON.stringify(appLanguage),
        );
      } catch (error) {
        logger.error('Error initializing language:', error, { context:'LanguageInitializer' });
        // Fallback to English
        const fallbackLanguage = {label: 'English', value: 'en'};
        dispatch(setLanguage(fallbackLanguage));
        i18n.changeLanguage('en');
      }
    };

    initializeLanguage();
  }, [dispatch]);

  useEffect(() => {
    if (language?.value) {
      i18n.changeLanguage(language.value);

      const saveLanguagePreference = async () => {
        try {
          await AsyncStorage.setItem(
            LANGUAGE_STORAGE_KEY,
            JSON.stringify(language),
          );
        } catch (error) {
          logger.error('Error saving language preference:', error, { context:'LanguageInitializer' });
        }
      };

      saveLanguagePreference();
    }
  }, [language]);

  return null;
}
