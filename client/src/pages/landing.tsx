import { useState } from "react";
import Hero from "@/components/hero";
import PlaceCard from "@/components/place-card";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Place, Guide } from "@shared/schema";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";
import heroVideo from "@assets/واجهت الموقع_1757794048716.mp4";
import videoPoster from "@assets/رغدان_1757793151105.jpg";
import { Globe, Gift } from "lucide-react";

export default function Landing() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const featuredPlaces = places.slice(0, 3);
  const featuredGuides = guides.slice(0, 4);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Translations
  const t = {
    ar: {
      home: 'الرئيسية',
      places: 'الأماكن السياحية',
      guides: 'المرشدين السياحيين',
      messages: 'الرسائل',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      discoverBahah: 'اكتشف جمال منطقة الباحة',
      enjoyViews: 'تمتع بمشاهدة أروع المناظر الطبيعية والمعالم السياحية في منطقة الباحة',
      browserNotSupport: 'متصفحك لا يدعم تشغيل الفيديو',
      welcomeTitle: 'مرحباً بكم في منصة الباحة السياحية',
      welcomeDesc: 'نحن نربط بين السياح والمرشدين السياحيين المحليين في منطقة الباحة، لنقدم لكم تجربة سياحية متميزة تجمع بين جمال الطبيعة وأصالة التراث السعودي. منصتنا تضمن لكم الحصول على أفضل المرشدين المحليين الذين يعرفون أسرار المنطقة وتاريخها العريق.',
      naturalPlaces: 'أماكن طبيعية خلابة',
      naturalPlacesDesc: 'اكتشف الجبال والغابات والقرى التراثية',
      expertGuides: 'مرشدين محليين خبراء',
      expertGuidesDesc: 'مرشدين معتمدين يعرفون المنطقة بتفاصيلها',
      safeMessaging: 'تواصل مباشر وآمن',
      safeMessagingDesc: 'نظام رسائل متطور للتواصل والحجز',
      featuredPlaces: 'الأماكن السياحية المميزة',
      featuredPlacesDesc: 'اكتشف أجمل الوجهات السياحية في منطقة الباحة',
      noPlaces: 'لا توجد أماكن سياحية متاحة حالياً',
      viewAllPlaces: 'عرض جميع الأماكن السياحية',
      certifiedGuides: 'المرشدين السياحيين المعتمدين',
      certifiedGuidesDesc: 'تعرف على فريق المرشدين المحليين الخبراء',
      noGuides: 'لا يوجد مرشدين متاحين حالياً',
      viewAllGuides: 'عرض جميع المرشدين',
      joinUs: 'انضم إلينا',
      chooseRole: 'اختر الدور المناسب لك في منصتنا',
      tourist: 'السائح',
      touristDesc: 'اكتشف أجمل الأماكن السياحية في الباحة مع أفضل المرشدين المحليين',
      browsePlace: 'استعراض الأماكن السياحية',
      chooseGuide: 'اختيار المرشد المناسب',
      makeBookings: 'إجراء الحجوزات',
      contactGuides: 'التواصل مع المرشدين',
      joinAsTourist: 'انضم كسائح',
      guide: 'المرشد السياحي',
      guideDesc: 'شارك خبرتك المحلية واربح من خلال إرشاد السياح في منطقة الباحة',
      editProfile: 'تعديل الملف الشخصي',
      setLanguages: 'تحديد اللغات والتخصصات',
      managePrices: 'إدارة الأسعار',
      receiveBookings: 'استقبال الحجوزات',
      joinAsGuide: 'انضم كمرشد',
      admin: 'المشرف',
      adminDesc: 'إدارة المنصة والإشراف على المحتوى وضمان جودة الخدمة',
      managePlaces: 'إدارة الأماكن السياحية',
      followGuides: 'متابعة المرشدين',
      monitorMessages: 'مراقبة الرسائل',
      manageSystem: 'إدارة النظام',
      adminLogin: 'دخول المشرف',
      advancedMessaging: 'نظام الرسائل المتطور',
      safeCommunication: 'تواصل آمن ومباشر بين السياح والمرشدين',
      chatWith: 'محادثة مع المرشد أحمد السعيد',
      onlineNow: 'متصل الآن',
      welcomeMessage: 'مرحباً بك! يسعدني مساعدتك في استكشاف الباحة. ما هي اهتماماتك السياحية؟',
      userMessage: 'أهلاً! أريد زيارة غابات الباحة وقرية ذي عين. هل يمكنك ترتيب جولة لمدة يومين؟',
      guideReply: 'بالطبع! سأرتب لك برنامج رائع يشمل الغابات، القرية التراثية، وبعض الأماكن المميزة الأخرى. السعر 500 ريال لليومين شامل النقل.',
      writeMessage: 'اكتب رسالتك هنا...',
      send: 'إرسال',
      platformName: 'منصة الباحة السياحية',
      platformDesc: 'نربط السياح بأفضل المرشدين المحليين في منطقة الباحة لتجربة سياحية أصيلة ومميزة.',
      quickLinks: 'روابط سريعة',
      howItWorks: 'كيف يعمل الموقع',
      faq: 'الأسئلة الشائعة',
      forGuides: 'للمرشدين',
      joinGuide: 'انضم كمرشد',
      requirements: 'متطلبات الانضمام',
      guideManual: 'دليل المرشد',
      support: 'الدعم والمساعدة',
      contactUs: 'تواصل معنا',
      email: 'البريد',
      phone: 'الهاتف',
      address: 'العنوان',
      addressValue: 'الباحة، المملكة العربية السعودية',
      copyright: '© 2024 منصة الباحة السياحية. جميع الحقوق محفوظة.',
      discountOffer: 'سجل دخولك واحصل على خصم 5% على أول حجز!',
      brandName: 'إرشاد سياحي',
      regionName: 'منطقة الباحة',
    },
    en: {
      home: 'Home',
      places: 'Tourist Places',
      guides: 'Tour Guides',
      messages: 'Messages',
      login: 'Login',
      register: 'Register',
      discoverBahah: 'Discover the Beauty of Al Bahah',
      enjoyViews: 'Enjoy watching the most beautiful natural landscapes and tourist attractions in Al Bahah region',
      browserNotSupport: 'Your browser does not support video playback',
      welcomeTitle: 'Welcome to Al Bahah Tourism Platform',
      welcomeDesc: 'We connect tourists with local tour guides in Al Bahah region, providing you with a distinctive tourism experience that combines natural beauty and authentic Saudi heritage. Our platform ensures you get the best local guides who know the secrets and rich history of the region.',
      naturalPlaces: 'Stunning Natural Places',
      naturalPlacesDesc: 'Discover mountains, forests and heritage villages',
      expertGuides: 'Expert Local Guides',
      expertGuidesDesc: 'Certified guides who know the region in detail',
      safeMessaging: 'Direct & Secure Communication',
      safeMessagingDesc: 'Advanced messaging system for communication and booking',
      featuredPlaces: 'Featured Tourist Places',
      featuredPlacesDesc: 'Discover the most beautiful tourist destinations in Al Bahah',
      noPlaces: 'No tourist places available currently',
      viewAllPlaces: 'View All Places',
      certifiedGuides: 'Certified Tour Guides',
      certifiedGuidesDesc: 'Meet the team of expert local guides',
      noGuides: 'No guides available currently',
      viewAllGuides: 'View All Guides',
      joinUs: 'Join Us',
      chooseRole: 'Choose the right role for you on our platform',
      tourist: 'Tourist',
      touristDesc: 'Discover the most beautiful places in Al Bahah with the best local guides',
      browsePlace: 'Browse tourist places',
      chooseGuide: 'Choose the right guide',
      makeBookings: 'Make bookings',
      contactGuides: 'Contact guides',
      joinAsTourist: 'Join as Tourist',
      guide: 'Tour Guide',
      guideDesc: 'Share your local expertise and earn by guiding tourists in Al Bahah',
      editProfile: 'Edit profile',
      setLanguages: 'Set languages and specialties',
      managePrices: 'Manage prices',
      receiveBookings: 'Receive bookings',
      joinAsGuide: 'Join as Guide',
      admin: 'Administrator',
      adminDesc: 'Manage the platform, oversee content and ensure service quality',
      managePlaces: 'Manage tourist places',
      followGuides: 'Monitor guides',
      monitorMessages: 'Monitor messages',
      manageSystem: 'System management',
      adminLogin: 'Admin Login',
      advancedMessaging: 'Advanced Messaging System',
      safeCommunication: 'Safe and direct communication between tourists and guides',
      chatWith: 'Chat with Guide Ahmed Al-Saeed',
      onlineNow: 'Online now',
      welcomeMessage: 'Welcome! I am happy to help you explore Al Bahah. What are your tourism interests?',
      userMessage: 'Hello! I want to visit Al Bahah forests and Dhi Ain village. Can you arrange a two-day tour?',
      guideReply: 'Of course! I will arrange a great program that includes the forests, heritage village, and some other special places. The price is 500 SAR for two days including transportation.',
      writeMessage: 'Write your message here...',
      send: 'Send',
      platformName: 'Al Bahah Tourism Platform',
      platformDesc: 'We connect tourists with the best local guides in Al Bahah for an authentic and distinctive tourism experience.',
      quickLinks: 'Quick Links',
      howItWorks: 'How it works',
      faq: 'FAQ',
      forGuides: 'For Guides',
      joinGuide: 'Join as guide',
      requirements: 'Requirements',
      guideManual: 'Guide manual',
      support: 'Support & Help',
      contactUs: 'Contact Us',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      addressValue: 'Al Bahah, Saudi Arabia',
      copyright: '© 2024 Al Bahah Tourism Platform. All rights reserved.',
      discountOffer: 'Login and get 5% off your first booking!',
      brandName: 'Tourism Guide',
      regionName: 'Al Bahah Region',
    }
  };

  const texts = t[language];

  return (
    <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Discount Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 text-center">
          <Gift className="w-5 h-5 animate-pulse" />
          <span className="font-medium">{texts.discountOffer}</span>
          <Button 
            size="sm" 
            variant="secondary" 
            className="mr-2"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-discount-login"
          >
            {texts.login}
          </Button>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
              <img 
                src={siteLogo} 
                alt={language === 'ar' ? 'لوجو إرشاد سياحي - منطقة الباحة' : 'Tourism Guide Logo - Al Bahah Region'} 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">{texts.brandName}</h1>
                <p className="text-sm text-muted-foreground">{texts.regionName}</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className={`hidden md:flex items-center gap-8 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
              <a href="#" className="text-foreground hover:text-primary transition-colors">{texts.home}</a>
              <a href="#places" className="text-muted-foreground hover:text-primary transition-colors">{texts.places}</a>
              <a href="#guides" className="text-muted-foreground hover:text-primary transition-colors">{texts.guides}</a>
              <a href="#messages" className="text-muted-foreground hover:text-primary transition-colors">{texts.messages}</a>
            </nav>
            
            {/* Language Toggle & Auth Buttons */}
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
              {/* Language Toggle */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2"
                data-testid="button-toggle-language"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'EN' : 'عربي'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                {texts.login}
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-register"
              >
                {texts.register}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Video Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">{texts.discoverBahah}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {texts.enjoyViews}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster={videoPoster}
                data-testid="hero-video"
              >
                <source src={heroVideo} type="video/mp4" />
                {texts.browserNotSupport}
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{texts.welcomeTitle}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {texts.welcomeDesc}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏔️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{texts.naturalPlaces}</h3>
                <p className="text-muted-foreground">{texts.naturalPlacesDesc}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧭</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{texts.expertGuides}</h3>
                <p className="text-muted-foreground">{texts.expertGuidesDesc}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{texts.safeMessaging}</h3>
                <p className="text-muted-foreground">{texts.safeMessagingDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Places Section */}
      <section id="places" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{texts.featuredPlaces}</h2>
            <p className="text-lg text-muted-foreground">{texts.featuredPlacesDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPlaces.length > 0 ? (
              featuredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} showGuideCount />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{texts.noPlaces}</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/places"}
              data-testid="button-view-all-places"
            >
              {texts.viewAllPlaces}
            </Button>
          </div>
        </div>
      </section>

      {/* Tour Guides Section */}
      <section id="guides" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{texts.certifiedGuides}</h2>
            <p className="text-lg text-muted-foreground">{texts.certifiedGuidesDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGuides.length > 0 ? (
              featuredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{texts.noGuides}</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/guides"}
              data-testid="button-view-all-guides"
            >
              {texts.viewAllGuides}
            </Button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{texts.joinUs}</h2>
            <p className="text-lg text-muted-foreground">{texts.chooseRole}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Tourist Role */}
            <Card className="text-center border-2 border-transparent hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🧳</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{texts.tourist}</h3>
                <p className="text-muted-foreground mb-6">
                  {texts.touristDesc}
                </p>
                <ul className={`space-y-2 mb-8 text-muted-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <li>• {texts.browsePlace}</li>
                  <li>• {texts.chooseGuide}</li>
                  <li>• {texts.makeBookings}</li>
                  <li>• {texts.contactGuides}</li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-tourist"
                >
                  {texts.joinAsTourist}
                </Button>
              </CardContent>
            </Card>

            {/* Guide Role */}
            <Card className="text-center border-2 border-transparent hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🧭</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{texts.guide}</h3>
                <p className="text-muted-foreground mb-6">
                  {texts.guideDesc}
                </p>
                <ul className={`space-y-2 mb-8 text-muted-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <li>• {texts.editProfile}</li>
                  <li>• {texts.setLanguages}</li>
                  <li>• {texts.managePrices}</li>
                  <li>• {texts.receiveBookings}</li>
                </ul>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-guide"
                >
                  {texts.joinAsGuide}
                </Button>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="text-center border-2 border-transparent hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{texts.admin}</h3>
                <p className="text-muted-foreground mb-6">
                  {texts.adminDesc}
                </p>
                <ul className={`space-y-2 mb-8 text-muted-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <li>• {texts.managePlaces}</li>
                  <li>• {texts.followGuides}</li>
                  <li>• {texts.monitorMessages}</li>
                  <li>• {texts.manageSystem}</li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-admin"
                >
                  {texts.adminLogin}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Messaging Preview */}
      <section id="messages" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{texts.advancedMessaging}</h2>
            <p className="text-lg text-muted-foreground">{texts.safeCommunication}</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className={`bg-primary text-primary-foreground p-4 flex items-center ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold">{texts.chatWith}</h3>
                  <p className="text-sm opacity-90">{texts.onlineNow}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4 bg-muted/50 h-80 overflow-y-auto">
                <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                  <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-foreground">{texts.welcomeMessage}</p>
                    <span className="text-xs text-muted-foreground">{language === 'ar' ? 'أحمد • 10:30 ص' : 'Ahmed • 10:30 AM'}</span>
                  </div>
                </div>
                
                <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-primary p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-primary-foreground">{texts.userMessage}</p>
                    <span className="text-xs text-primary-foreground/70">{language === 'ar' ? 'أنت • 10:35 ص' : 'You • 10:35 AM'}</span>
                  </div>
                </div>
                
                <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                  <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-foreground">{texts.guideReply}</p>
                    <span className="text-xs text-muted-foreground">{language === 'ar' ? 'أحمد • 10:40 ص' : 'Ahmed • 10:40 AM'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-card">
                <div className={`flex items-center gap-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                  <input 
                    type="text" 
                    placeholder={texts.writeMessage}
                    className="flex-1 border border-input rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
                    disabled
                    data-testid="input-message" 
                  />
                  <Button disabled data-testid="button-send-message">
                    {texts.send}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className={`flex items-center gap-3 mb-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">{language === 'ar' ? 'ب' : 'B'}</span>
                </div>
                <span className="text-lg font-bold">{texts.platformName}</span>
              </div>
              <p className="text-background/80 text-sm leading-relaxed">
                {texts.platformDesc}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{texts.quickLinks}</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#places" className="hover:text-background transition-colors">{texts.places}</a></li>
                <li><a href="#guides" className="hover:text-background transition-colors">{texts.guides}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{texts.howItWorks}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{texts.faq}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{texts.forGuides}</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">{texts.joinGuide}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{texts.requirements}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{texts.guideManual}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{texts.support}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{texts.contactUs}</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li>{texts.email}: info@albaha-tourism.sa</li>
                <li>{texts.phone}: +966 17 123 4567</li>
                <li>{texts.address}: {texts.addressValue}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-background/80 text-sm">
              {texts.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
