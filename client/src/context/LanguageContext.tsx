import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    places: 'الأماكن السياحية',
    guides: 'المرشدين السياحيين',
    about: 'نبذة عنا',
    map: 'خريطة المملكة',
    messages: 'الرسائل',
    inviteCode: 'كود الدعوة',
    profile: 'تعديل الملف الشخصي',
    adminDashboard: 'لوحة الإدارة',
    guideDashboard: 'لوحة التحكم',
    logout: 'تسجيل الخروج',
    
    // Roles
    admin: 'مشرف',
    guide: 'مرشد',
    tourist: 'سائح',
    
    // General
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    search: 'بحث',
    
    // Map
    mapTitle: 'خريطة المملكة التفاعلية',
    mapSubtitle: 'استكشف جمال منطقة الباحة والمدن السعودية',
    mapDescription: 'تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة'
  },
  en: {
    // Navigation
    home: 'Home',
    places: 'Tourist Places',
    guides: 'Tour Guides',
    about: 'About Us',
    map: 'Kingdom Map',
    messages: 'Messages',
    inviteCode: 'Invite Code',
    profile: 'Edit Profile',
    adminDashboard: 'Admin Dashboard',
    guideDashboard: 'Guide Dashboard',
    logout: 'Logout',
    
    // Roles
    admin: 'Admin',
    guide: 'Guide',
    tourist: 'Tourist',
    
    // General
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    
    // Map
    mapTitle: 'Interactive Kingdom Map',
    mapSubtitle: 'Explore the Beauty of Al Bahah Region and Saudi Cities',
    mapDescription: 'Browse roads and tourist attractions with modern interactive technology'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language to localStorage and update document direction
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}