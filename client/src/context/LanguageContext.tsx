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
    view: 'عرض',
    viewDetails: 'عرض التفاصيل',
    bookNow: 'احجز الآن',
    contactGuide: 'تواصل مع المرشد',
    
    // Homepage
    welcomeTitle: 'اكتشف جمال الباحة',
    welcomeSubtitle: 'رحلة سياحية لا تُنسى في قلب المملكة العربية السعودية',
    welcomeDescription: 'انطلق في مغامرة استثنائية واستكشف المناظر الطبيعية الخلابة والثقافة الغنية في منطقة الباحة مع مرشدينا المحليين المتخصصين',
    exploreNow: 'اكتشف الآن',
    featuredPlaces: 'الأماكن المميزة',
    ourGuides: 'مرشدونا',
    howItWorks: 'كيف يعمل الموقع',
    step1Title: 'اختر وجهتك',
    step1Description: 'تصفح مجموعتنا الواسعة من الأماكن السياحية',
    step2Title: 'احجز مرشدك',
    step2Description: 'اختر مرشداً محلياً متخصصاً لرحلتك',
    step3Title: 'استمتع برحلتك',
    step3Description: 'اكتشف المعالم الخفية والثقافة المحلية',
    
    // Places page
    placesTitle: 'اكتشف الأماكن السياحية',
    placesSubtitle: 'جمال الطبيعة والتاريخ في الباحة',
    searchPlaces: 'البحث في الأماكن...',
    filterByCategory: 'تصفية حسب الفئة',
    allCategories: 'جميع الفئات',
    noPlacesFound: 'لا توجد أماكن سياحية متاحة حالياً',
    location: 'الموقع',
    
    // Guides page
    guidesTitle: 'مرشدونا السياحيون',
    guidesSubtitle: 'خبراء محليون لإرشادك في رحلتك',
    searchGuides: 'البحث في المرشدين...',
    filterBySpecialty: 'تصفية حسب التخصص',
    allSpecialties: 'جميع التخصصات',
    experience: 'الخبرة',
    years: 'سنوات',
    noGuidesFound: 'لا يوجد مرشدون متاحون حالياً',
    
    // About page
    aboutTitle: 'نبذة عنا',
    aboutSubtitle: 'منصة سياحية شاملة لمنطقة الباحة',
    ourMission: 'مهمتنا',
    ourMissionText: 'نهدف إلى ربط السياح بالمرشدين المحليين لتقديم تجربة سياحية أصيلة ومميزة في منطقة الباحة',
    ourVision: 'رؤيتنا',
    ourVisionText: 'أن نكون المنصة الرائدة للسياحة في منطقة الباحة والمملكة العربية السعودية',
    whyChooseUs: 'لماذا تختارنا؟',
    reason1: 'مرشدون محليون معتمدون',
    reason2: 'تجارب سياحية أصيلة',
    reason3: 'خدمة عملاء متميزة',
    reason4: 'أسعار تنافسية',
    
    // Admin Dashboard
    dashboard: 'لوحة التحكم',
    statistics: 'الإحصائيات',
    totalUsers: 'إجمالي المستخدمين',
    totalGuides: 'إجمالي المرشدين',
    totalPlaces: 'إجمالي الأماكن',
    totalBookings: 'إجمالي الحجوزات',
    recentActivity: 'النشاط الأخير',
    manageUsers: 'إدارة المستخدمين',
    managePlaces: 'إدارة الأماكن',
    manageGuides: 'إدارة المرشدين',
    manageBookings: 'إدارة الحجوزات',
    systemSettings: 'إعدادات النظام',
    siteContent: 'محتوى الموقع',
    
    // Profile
    personalInfo: 'المعلومات الشخصية',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    updateProfile: 'تحديث الملف الشخصي',
    changePassword: 'تغيير كلمة المرور',
    profileImage: 'صورة الملف الشخصي',
    
    // Map
    mapTitle: 'خريطة المملكة التفاعلية',
    mapSubtitle: 'استكشف جمال منطقة الباحة والمدن السعودية',
    mapDescription: 'تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة',
    interactiveMap: 'الخريطة التفاعلية',
    mapGuide: 'دليل الخريطة',
    albahaCenter: 'الباحة (المنطقة المركزية)',
    meccaCity: 'مكة المكرمة',
    riyadhCity: 'الرياض',
    touristPlaces: 'أماكن سياحية',
    albahaToMeccaRoad: 'طريق الباحة - مكة',
    albahaToRiyadhRoad: 'طريق الباحة - الرياض',
    touristPlacesInAlbaha: 'الأماكن السياحية في الباحة',
    distanceFromAlbaha: 'المسافة من الباحة',
    estimatedArrivalTime: 'وقت الوصول التقريبي',
    getDirections: 'التوجه عبر Google Maps',
    viewOnGoogleMaps: 'عرض في Google Maps',
    albahaCapital: 'عاصمة منطقة الباحة',
    albahaDescription: 'منطقة سياحية رائعة بمناخ معتدل',
    meccaHolyCity: 'أقدس مدينة في الإسلام',
    meccaDescription: 'قبلة المسلمين في العالم',
    riyadhCapital: 'عاصمة المملكة العربية السعودية',
    riyadhDescription: 'المركز السياسي والاقتصادي',
    km: 'كم',
    minute: 'دقيقة',
    hour: 'ساعة',
    and: 'و',
    
    // Forms
    name: 'الاسم',
    description: 'الوصف',
    category: 'الفئة',
    specialty: 'التخصص',
    price: 'السعر',
    website: 'الموقع الإلكتروني',
    required: 'مطلوب',
    optional: 'اختياري',
    
    // Messages
    success: 'تم بنجاح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    actionCannotBeUndone: 'لا يمكن التراجع عن هذا الإجراء',
    
    // Time
    today: 'اليوم',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض'
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
    view: 'View',
    viewDetails: 'View Details',
    bookNow: 'Book Now',
    contactGuide: 'Contact Guide',
    
    // Homepage
    welcomeTitle: 'Discover the Beauty of Al Bahah',
    welcomeSubtitle: 'An unforgettable tourist journey in the heart of Saudi Arabia',
    welcomeDescription: 'Embark on an exceptional adventure and explore the stunning natural landscapes and rich culture of Al Bahah region with our specialized local guides',
    exploreNow: 'Explore Now',
    featuredPlaces: 'Featured Places',
    ourGuides: 'Our Guides',
    howItWorks: 'How It Works',
    step1Title: 'Choose Your Destination',
    step1Description: 'Browse our wide collection of tourist attractions',
    step2Title: 'Book Your Guide',
    step2Description: 'Select a specialized local guide for your trip',
    step3Title: 'Enjoy Your Journey',
    step3Description: 'Discover hidden landmarks and local culture',
    
    // Places page
    placesTitle: 'Discover Tourist Places',
    placesSubtitle: 'Natural beauty and history in Al Bahah',
    searchPlaces: 'Search places...',
    filterByCategory: 'Filter by category',
    allCategories: 'All Categories',
    noPlacesFound: 'No tourist places are currently available',
    location: 'Location',
    
    // Guides page
    guidesTitle: 'Our Tour Guides',
    guidesSubtitle: 'Local experts to guide you on your journey',
    searchGuides: 'Search guides...',
    filterBySpecialty: 'Filter by specialty',
    allSpecialties: 'All Specialties',
    experience: 'Experience',
    years: 'years',
    noGuidesFound: 'No guides are currently available',
    
    // About page
    aboutTitle: 'About Us',
    aboutSubtitle: 'A comprehensive tourism platform for Al Bahah region',
    ourMission: 'Our Mission',
    ourMissionText: 'We aim to connect tourists with local guides to provide an authentic and distinctive tourism experience in Al Bahah region',
    ourVision: 'Our Vision',
    ourVisionText: 'To be the leading tourism platform in Al Bahah region and Saudi Arabia',
    whyChooseUs: 'Why Choose Us?',
    reason1: 'Certified local guides',
    reason2: 'Authentic tourism experiences',
    reason3: 'Excellent customer service',
    reason4: 'Competitive prices',
    
    // Admin Dashboard
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    totalUsers: 'Total Users',
    totalGuides: 'Total Guides',
    totalPlaces: 'Total Places',
    totalBookings: 'Total Bookings',
    recentActivity: 'Recent Activity',
    manageUsers: 'Manage Users',
    managePlaces: 'Manage Places',
    manageGuides: 'Manage Guides',
    manageBookings: 'Manage Bookings',
    systemSettings: 'System Settings',
    siteContent: 'Site Content',
    
    // Profile
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    updateProfile: 'Update Profile',
    changePassword: 'Change Password',
    profileImage: 'Profile Image',
    
    // Map
    mapTitle: 'Interactive Kingdom Map',
    mapSubtitle: 'Explore the Beauty of Al Bahah Region and Saudi Cities',
    mapDescription: 'Browse roads and tourist attractions with modern interactive technology',
    interactiveMap: 'Interactive Map',
    mapGuide: 'Map Guide',
    albahaCenter: 'Al Bahah (Central Region)',
    meccaCity: 'Mecca',
    riyadhCity: 'Riyadh',
    touristPlaces: 'Tourist Places',
    albahaToMeccaRoad: 'Al Bahah - Mecca Road',
    albahaToRiyadhRoad: 'Al Bahah - Riyadh Road',
    touristPlacesInAlbaha: 'Tourist Places in Al Bahah',
    distanceFromAlbaha: 'Distance from Al Bahah',
    estimatedArrivalTime: 'Estimated Arrival Time',
    getDirections: 'Get Directions via Google Maps',
    viewOnGoogleMaps: 'View on Google Maps',
    albahaCapital: 'Capital of Al Bahah Region',
    albahaDescription: 'A wonderful tourist area with moderate climate',
    meccaHolyCity: 'The holiest city in Islam',
    meccaDescription: 'The Qibla of Muslims worldwide',
    riyadhCapital: 'Capital of Saudi Arabia',
    riyadhDescription: 'Political and economic center',
    km: 'km',
    minute: 'min',
    hour: 'hour',
    and: 'and',
    
    // Forms
    name: 'Name',
    description: 'Description',
    category: 'Category',
    specialty: 'Specialty',
    price: 'Price',
    website: 'Website',
    required: 'Required',
    optional: 'Optional',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    confirmDelete: 'Are you sure you want to delete?',
    actionCannotBeUndone: 'This action cannot be undone',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
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