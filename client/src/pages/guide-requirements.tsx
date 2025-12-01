import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function GuideRequirements() {
  const { language } = useLanguage();

  const texts = language === 'ar' ? {
    pageTitle: 'متطلبات الانضمام',
    pageSubtitle: 'الشروط الأساسية للانضمام كمرشد سياحي',
    
    introTitle: 'شروط الانضمام كمرشد سياحي',
    introDesc: 'للانضمام إلى منصتنا كمرشد سياحي، يجب توفر الشروط الأساسية التالية:',
    
    requirements: [
      {
        title: 'رخصة إرشاد سياحي سارية',
        desc: 'أن يكون المتقدم حاصلاً على رخصة إرشاد سياحي سارية المفعول من وزارة السياحة السعودية.',
        icon: 'license'
      },
      {
        title: 'اجتياز البرامج التدريبية',
        desc: 'اجتياز البرامج التدريبية المخصصة للمرشدين السياحيين المعتمدة من الجهات الرسمية.',
        icon: 'training'
      },
      {
        title: 'إتقان اللغات',
        desc: 'إتقان لغة أو أكثر بحسب نوع الرخصة (العربية والإنجليزية كحد أدنى).',
        icon: 'language'
      },
      {
        title: 'الالتزام بالمعايير المهنية',
        desc: 'الالتزام بالمعايير المهنية وأخلاقيات الإرشاد السياحي المحددة من الوزارة.',
        icon: 'ethics'
      },
      {
        title: 'الهوية الوطنية أو الإقامة',
        desc: 'توفر الهوية الوطنية للسعوديين أو الإقامة سارية المفعول للمقيمين.',
        icon: 'id'
      }
    ],
    
    additionalTitle: 'متطلبات إضافية مفضلة',
    additionalItems: [
      'خبرة سابقة في مجال السياحة أو الإرشاد',
      'معرفة جيدة بتاريخ وثقافة منطقة الباحة',
      'مهارات تواصل ممتازة',
      'القدرة على التعامل مع مختلف الجنسيات والثقافات'
    ],
    
    joinNow: 'انضم الآن',
    viewManual: 'دليل المرشد',
  } : {
    pageTitle: 'Joining Requirements',
    pageSubtitle: 'Basic requirements to join as a tour guide',
    
    introTitle: 'Requirements to Join as a Tour Guide',
    introDesc: 'To join our platform as a tour guide, the following basic requirements must be met:',
    
    requirements: [
      {
        title: 'Valid Tourism Guide License',
        desc: 'The applicant must have a valid tourism guide license from the Saudi Ministry of Tourism.',
        icon: 'license'
      },
      {
        title: 'Complete Training Programs',
        desc: 'Completion of training programs designated for tour guides approved by official authorities.',
        icon: 'training'
      },
      {
        title: 'Language Proficiency',
        desc: 'Proficiency in one or more languages according to license type (Arabic and English as minimum).',
        icon: 'language'
      },
      {
        title: 'Professional Standards Compliance',
        desc: 'Commitment to professional standards and tourism guiding ethics specified by the Ministry.',
        icon: 'ethics'
      },
      {
        title: 'National ID or Residency',
        desc: 'Valid national ID for Saudis or valid residency permit for residents.',
        icon: 'id'
      }
    ],
    
    additionalTitle: 'Preferred Additional Requirements',
    additionalItems: [
      'Previous experience in tourism or guiding',
      'Good knowledge of Al Bahah region history and culture',
      'Excellent communication skills',
      'Ability to deal with different nationalities and cultures'
    ],
    
    joinNow: 'Join Now',
    viewManual: 'Guide Manual',
  };

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
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
          <Card className="border-l-4 border-l-amber-500" data-testid="intro-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-amber-600" />
                </div>
                {texts.introTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg mb-6">
                {texts.introDesc}
              </p>
              
              <div className="space-y-4">
                {texts.requirements.map((req, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-transparent hover:border-amber-500/30 transition-colors"
                    data-testid={`requirement-${index + 1}`}
                  >
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{req.title}</h4>
                      <p className="text-muted-foreground">{req.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="additional-section">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {texts.additionalTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {texts.additionalItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/join-guide">
              <Button size="lg" className="gap-2" data-testid="link-join">
                {texts.joinNow}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/guide-manual">
              <Button size="lg" variant="outline" className="gap-2" data-testid="link-manual">
                {texts.viewManual}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
