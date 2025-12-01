import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, CheckCircle, BookOpen, Users, Shield, Globe, Leaf } from "lucide-react";

interface SiteContent {
  id: string;
  key: string;
  content: string;
  contentEn: string | null;
}

export default function GuideInfo() {
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
    pageTitle: 'للمرشدين السياحيين',
    pageSubtitle: 'انضم إلينا وكن جزءاً من تجربة سياحية مميزة في منطقة الباحة',
    
    joinTitle: 'انضم كمرشد سياحي',
    joinDesc: 'هل لديك شغف بالسياحة ومعرفة عميقة بمنطقة الباحة؟ انضم إلى فريقنا من المرشدين المحترفين وساعد السياح في اكتشاف جمال المنطقة.',
    contactUs: 'تواصل معنا',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'رقم الهاتف',
    
    requirementsTitle: 'متطلبات الانضمام',
    requirementsDesc: 'للحصول على رخصة الإرشاد السياحي، يجب توفر الشروط الأساسية التالية:',
    req1: 'أن يكون المتقدم حاصلاً على رخصة إرشاد سياحي سارية المفعول من وزارة السياحة.',
    req2: 'اجتياز البرامج التدريبية المخصصة للمرشدين.',
    req3: 'إتقان لغة أو أكثر بحسب نوع الرخصة.',
    req4: 'الالتزام بالمعايير المهنية وأخلاقيات الإرشاد.',
    req5: 'توفر الهوية الوطنية أو الإقامة للغير سعوديين.',
    
    guideManualTitle: 'دليل المرشد السياحي',
    
    section1Title: 'واجبات ومسؤوليات المرشد',
    section1Items: [
      'توجيه الزوار وتقديم المعلومات التاريخية والسياحية بشكل صحيح.',
      'ضمان سلامة الزوار أثناء الجولات.',
      'الالتزام بسياسات وزارة السياحة والمعايير المهنية.'
    ],
    
    section2Title: 'إدارة المجموعات السياحية',
    section2Items: [
      'تنظيم حركة المجموعة وتحديد نقاط التجمع.',
      'الحفاظ على وقت الجولة.',
      'متابعة جميع أفراد المجموعة والتأكد من عدم فقدان أي شخص.'
    ],
    
    section3Title: 'قواعد السلامة للزوار',
    section3Items: [
      'شرح تعليمات السلامة قبل بدء الجولة.',
      'معرفة مواقع مخارج الطوارئ والإسعافات الأولية.',
      'التصرف السريع عند حدوث أي طارئ.'
    ],
    
    section4Title: 'اللوائح والسياسات التنظيمية',
    section4Items: [
      'الالتزام بلوائح وزارة السياحة.',
      'الالتزام بتعليمات الجهات المعنية في المواقع الأثرية والتراثية.',
      'المحافظة على البيئة السياحية وعدم الإضرار بالمواقع.'
    ],
    
    section5Title: 'التعامل مع السياح من ثقافات مختلفة',
    section5Items: [
      'احترام العادات والثقافات المتنوعة.',
      'التواصل بوضوح وتقديم المعلومات بطريقة مبسطة.',
      'تجنب أي كلمات أو عبارات غير لائقة أو ذات حساسية ثقافية.'
    ],
  } : {
    pageTitle: 'For Tour Guides',
    pageSubtitle: 'Join us and be part of a unique tourism experience in Al Bahah region',
    
    joinTitle: 'Join as a Tour Guide',
    joinDesc: 'Do you have a passion for tourism and deep knowledge of Al Bahah region? Join our team of professional guides and help tourists discover the beauty of the region.',
    contactUs: 'Contact Us',
    emailLabel: 'Email',
    phoneLabel: 'Phone Number',
    
    requirementsTitle: 'Joining Requirements',
    requirementsDesc: 'To obtain a tourism guide license, the following basic requirements must be met:',
    req1: 'The applicant must have a valid tourism guide license from the Ministry of Tourism.',
    req2: 'Completion of training programs designated for guides.',
    req3: 'Proficiency in one or more languages according to license type.',
    req4: 'Commitment to professional standards and guiding ethics.',
    req5: 'Valid national ID or residence permit for non-Saudis.',
    
    guideManualTitle: 'Tour Guide Manual',
    
    section1Title: 'Guide Duties and Responsibilities',
    section1Items: [
      'Guiding visitors and providing accurate historical and tourism information.',
      'Ensuring visitor safety during tours.',
      'Adhering to Ministry of Tourism policies and professional standards.'
    ],
    
    section2Title: 'Managing Tourist Groups',
    section2Items: [
      'Organizing group movement and designating meeting points.',
      'Maintaining tour schedule.',
      'Monitoring all group members and ensuring no one gets lost.'
    ],
    
    section3Title: 'Visitor Safety Rules',
    section3Items: [
      'Explaining safety instructions before starting the tour.',
      'Knowing locations of emergency exits and first aid.',
      'Quick response in case of any emergency.'
    ],
    
    section4Title: 'Regulatory Rules and Policies',
    section4Items: [
      'Compliance with Ministry of Tourism regulations.',
      'Following instructions of relevant authorities at archaeological and heritage sites.',
      'Preserving the tourism environment and not damaging sites.'
    ],
    
    section5Title: 'Dealing with Tourists from Different Cultures',
    section5Items: [
      'Respecting diverse customs and cultures.',
      'Communicating clearly and presenting information in a simplified manner.',
      'Avoiding any inappropriate words or culturally sensitive phrases.'
    ],
  };

  const sectionIcons = [BookOpen, Users, Shield, Leaf, Globe];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">
              {language === 'ar' ? 'المرشدين السياحيين' : 'Tour Guides'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="page-title">
              {texts.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {texts.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-12">
          <Card className="border-l-4 border-l-primary" data-testid="join-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                {texts.joinTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {texts.joinDesc}
              </p>
              
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">{texts.contactUs}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-3 p-4 bg-background rounded-lg border hover:border-primary transition-colors"
                    data-testid="contact-email-link"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{texts.emailLabel}</p>
                      <p className="font-medium">{contactEmail}</p>
                    </div>
                  </a>
                  
                  <a 
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-3 p-4 bg-background rounded-lg border hover:border-primary transition-colors"
                    data-testid="contact-phone-link"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{texts.phoneLabel}</p>
                      <p className="font-medium" dir="ltr">{contactPhone}</p>
                    </div>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500" data-testid="requirements-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
                {texts.requirementsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-lg">
                {texts.requirementsDesc}
              </p>
              
              <ul className="space-y-3">
                {[texts.req1, texts.req2, texts.req3, texts.req4, texts.req5].map((req, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div data-testid="guide-manual-section">
            <div className="text-center mb-8">
              <Badge className="mb-4" variant="outline">
                {language === 'ar' ? 'دليل شامل' : 'Comprehensive Guide'}
              </Badge>
              <h2 className="text-3xl font-bold">{texts.guideManualTitle}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: texts.section1Title, items: texts.section1Items, color: 'blue' },
                { title: texts.section2Title, items: texts.section2Items, color: 'green' },
                { title: texts.section3Title, items: texts.section3Items, color: 'red' },
                { title: texts.section4Title, items: texts.section4Items, color: 'purple' },
                { title: texts.section5Title, items: texts.section5Items, color: 'orange' },
              ].map((section, sectionIndex) => {
                const Icon = sectionIcons[sectionIndex];
                const colorClasses: Record<string, { bg: string; iconBg: string; icon: string; border: string }> = {
                  blue: { bg: 'bg-blue-50 dark:bg-blue-950', iconBg: 'bg-blue-100 dark:bg-blue-900', icon: 'text-blue-600', border: 'border-l-blue-500' },
                  green: { bg: 'bg-green-50 dark:bg-green-950', iconBg: 'bg-green-100 dark:bg-green-900', icon: 'text-green-600', border: 'border-l-green-500' },
                  red: { bg: 'bg-red-50 dark:bg-red-950', iconBg: 'bg-red-100 dark:bg-red-900', icon: 'text-red-600', border: 'border-l-red-500' },
                  purple: { bg: 'bg-purple-50 dark:bg-purple-950', iconBg: 'bg-purple-100 dark:bg-purple-900', icon: 'text-purple-600', border: 'border-l-purple-500' },
                  orange: { bg: 'bg-orange-50 dark:bg-orange-950', iconBg: 'bg-orange-100 dark:bg-orange-900', icon: 'text-orange-600', border: 'border-l-orange-500' },
                };
                const colors = colorClasses[section.color];
                
                return (
                  <Card 
                    key={sectionIndex} 
                    className={`border-l-4 ${colors.border} ${sectionIndex === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                    data-testid={`manual-section-${sectionIndex + 1}`}
                  >
                    <CardHeader className={colors.bg}>
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <span className="text-base">{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
