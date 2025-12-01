import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";

interface SiteContent {
  id: string;
  key: string;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
}

export default function Footer() {
  const { language } = useLanguage();

  const { data: siteContents = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContactInfo = (key: string) => {
    const content = siteContents.find(c => c.key === key);
    if (!content) return null;
    return language === 'ar' ? content.content : (content.contentEn || content.content);
  };

  const contactEmail = getContactInfo('contact_email') || 'MSSR1488@GMAIL.COM';
  const contactPhone = getContactInfo('contact_phone') || '+966531076021';
  const contactAddress = getContactInfo('contact_address') || (language === 'ar' ? 'الباحة، المملكة العربية السعودية' : 'Al Bahah, Saudi Arabia');

  const texts = language === 'ar' ? {
    platformName: 'منصة الباحة السياحية',
    platformDesc: 'نربط السياح بأفضل المرشدين المحليين في منطقة الباحة لتجربة سياحية أصيلة ومميزة.',
    quickLinks: 'روابط سريعة',
    home: 'الرئيسية',
    places: 'الأماكن السياحية',
    guides: 'المرشدين السياحيين',
    map: 'الخريطة',
    about: 'نبذة عنا',
    forGuides: 'للمرشدين',
    joinGuide: 'انضم كمرشد',
    requirements: 'متطلبات الانضمام',
    guideManual: 'دليل المرشد',
    support: 'الدعم والمساعدة',
    contactUs: 'تواصل معنا',
    email: 'البريد',
    phone: 'الهاتف',
    address: 'العنوان',
    copyright: '© 2024 منصة الباحة السياحية. جميع الحقوق محفوظة.',
  } : {
    platformName: 'Al Bahah Tourism Platform',
    platformDesc: 'We connect tourists with the best local guides in Al Bahah for an authentic and distinctive tourism experience.',
    quickLinks: 'Quick Links',
    home: 'Home',
    places: 'Tourist Places',
    guides: 'Tour Guides',
    map: 'Map',
    about: 'About Us',
    forGuides: 'For Guides',
    joinGuide: 'Join as Guide',
    requirements: 'Requirements',
    guideManual: 'Guide Manual',
    support: 'Support',
    contactUs: 'Contact Us',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    copyright: '© 2024 Al Bahah Tourism Platform. All rights reserved.',
  };

  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className={`flex items-center gap-3 mb-4 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
              <img 
                src={siteLogo} 
                alt="لوجو المنصة السياحية" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-lg font-bold">{texts.platformName}</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              {texts.platformDesc}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{texts.quickLinks}</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <Link href="/" className="hover:text-background transition-colors">
                  {texts.home}
                </Link>
              </li>
              <li>
                <Link href="/places" className="hover:text-background transition-colors">
                  {texts.places}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-background transition-colors">
                  {texts.guides}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-background transition-colors">
                  {texts.map}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-background transition-colors">
                  {texts.about}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{texts.forGuides}</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li><span className="hover:text-background transition-colors cursor-pointer">{texts.joinGuide}</span></li>
              <li><span className="hover:text-background transition-colors cursor-pointer">{texts.requirements}</span></li>
              <li><span className="hover:text-background transition-colors cursor-pointer">{texts.guideManual}</span></li>
              <li><span className="hover:text-background transition-colors cursor-pointer">{texts.support}</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{texts.contactUs}</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-background transition-colors">
                  {texts.email}: {contactEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${contactPhone}`} className="hover:text-background transition-colors">
                  {texts.phone}: {contactPhone}
                </a>
              </li>
              <li>{texts.address}: {contactAddress}</li>
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
  );
}
