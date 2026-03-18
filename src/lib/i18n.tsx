import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'hi' | 'kn';

// Language configuration
export const LANGUAGES = {
  en: { name: 'English', code: 'en', flag: '🇬🇧' },
  hi: { name: 'हिंदी', code: 'hi', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', code: 'kn', flag: '🇮🇳' }
} as const;

// Translation cache
const translationCache = new Map<string, Record<string, any>>();

// Load translations dynamically
const loadTranslations = async (language: Language): Promise<Record<string, any>> => {
  if (translationCache.has(language)) {
    return translationCache.get(language)!;
  }

  try {
    const translations = await import(`../locales/${language}.json`);
    translationCache.set(language, translations.default);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to English
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
};

// Get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
};

// Interpolation function for dynamic values
const interpolate = (text: string, values: Record<string, any>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
};

// Translation context
interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, any>) => string;
  isLoading: boolean;
  availableLanguages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// I18n Provider Component
interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider = ({ 
  children, 
  defaultLanguage = 'en' 
}: I18nProviderProps) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('krama-language') as Language;
    if (storedLanguage && Object.keys(LANGUAGES).includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const loadLanguage = async () => {
      setIsLoading(true);
      try {
        const translationsData = await loadTranslations(language);
        setTranslations(translationsData);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [language]);

  // Set language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('krama-language', newLanguage);
  };

  // Translation function
  const t = (key: string, values?: Record<string, any>): string => {
    if (isLoading) return key; // Return key during loading
    
    const translation = getNestedValue(translations, key);
    
    // If translation not found, return the key itself
    if (translation === key) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Apply interpolation if values provided
    return values ? interpolate(translation, values) : translation;
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    isLoading,
    availableLanguages: LANGUAGES
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use translations
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Export translation function for non-component usage
export let globalT: ((key: string, values?: Record<string, any>) => string) = () => '';

// Set global translation function (called by I18nProvider)
export const setGlobalT = (tFunction: typeof globalT) => {
  globalT = tFunction;
};
