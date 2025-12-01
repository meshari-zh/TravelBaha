import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SiteContent {
  id: string;
  key: string;
  content: string;
  contentEn: string | null;
}

export default function JoinGuide() {
  const { language } = useLanguage();

  const { data: siteContents = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContactInfo = (key: string) => {
    const content = siteContents.find(c => c.key === key);
    return content?.content || '';
  };

  const contactEmail = getContactInfo('contact_email') || 'MSSR1488@GMAIL.COM';
  const contactPhone = getContactInfo('contact_phone') || '+966531076021';

  const texts = language === 'ar' ? {
    pageTitle: 'انضم كمرشد سياحي',
    pageSubtitle: 'كن جزءاً من فريقنا وساعد السياح في اكتشاف جمال منطقة الباحة',
    
    mainDesc: 'هل لديك شغف بالسياحة ومعرفة عميقة بمنطقة الباحة؟ انضم إلى فريقنا من المرشدين المحترفين وساعد السياح في اكتشاف جمال المنطقة.',
    whyJoin: 'لماذا تنضم إلينا؟',
    reason1: 'فرصة للعمل مع سياح من مختلف أنحاء العالم',
    reason2: 'دخل إضافي مع مرونة في تحديد أوقات العمل',
    reason3: 'دعم مستمر وتدريب من فريق المنصة',
    reason4: 'المساهمة في تطوير السياحة في منطقة الباحة',
    
    contactUs: 'تواصل معنا للانضمام',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'رقم الهاتف',
    
    nextSteps: 'الخطوات التالية',
    step1: 'تواصل معنا عبر البريد أو الهاتف',
    step2: 'اطلع على متطلبات الانضمام',
    step3: 'راجع دليل المرشد السياحي',
    
    viewRequirements: 'متطلبات الانضمام',
    viewManual: 'دليل المرشد',
  } : {
    pageTitle: 'Join as a Tour Guide',
    pageSubtitle: 'Be part of our team and help tourists discover the beauty of Al Baha region',
    
    mainDesc: 'Do you have a passion for tourism and deep knowledge of Al Baha region? Join our team of professional guides and help tourists discover the beauty of the region.',
    whyJoin: 'Why Join Us?',
    reason1: 'Opportunity to work with tourists from around the world',
    reason2: 'Additional income with flexible working hours',
    reason3: 'Continuous support and training from the platform team',
    reason4: 'Contributing to tourism development in Al Baha region',
    
    contactUs: 'Contact Us to Join',
    emailLabel: 'Email',
    phoneLabel: 'Phone Number',
    
    nextSteps: 'Next Steps',
    step1: 'Contact us via email or phone',
    step2: 'Review joining requirements',
    step3: 'Read the tour guide manual',
    
    viewRequirements: 'Joining Requirements',
    viewManual: 'Guide Manual',
  };

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">
              {language === 'ar' ? 'للمرشدين' : 'For Guides'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="page-title">
              {texts.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {texts.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-8">
          <Card className="border-l-4 border-l-primary" data-testid="main-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                {texts.pageTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {texts.mainDesc}
              </p>
              
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">{texts.whyJoin}</h3>
                <ul className="space-y-3">
                  {[texts.reason1, texts.reason2, texts.reason3, texts.reason4].map((reason, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500" data-testid="contact-section">
            <CardHeader>
              <CardTitle className="text-xl">{texts.contactUs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border hover:border-primary transition-colors"
                  data-testid="contact-email-link"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{texts.emailLabel}</p>
                    <p className="font-medium">{contactEmail}</p>
                  </div>
                </a>
                
                <a 
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border hover:border-green-500 transition-colors"
                  data-testid="contact-phone-link"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{texts.phoneLabel}</p>
                    <p className="font-medium" dir="ltr">{contactPhone}</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="next-steps-section">
            <CardHeader>
              <CardTitle className="text-xl">{texts.nextSteps}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[texts.step1, texts.step2, texts.step3].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 pt-4">
                <Link href="/guide-requirements">
                  <Button variant="outline" className="gap-2" data-testid="link-requirements">
                    {texts.viewRequirements}
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/guide-manual">
                  <Button variant="outline" className="gap-2" data-testid="link-manual">
                    {texts.viewManual}
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
