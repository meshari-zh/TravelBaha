import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Shield, Leaf, Globe, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function GuideManual() {
  const { language } = useLanguage();

  const texts = language === 'ar' ? {
    pageTitle: 'دليل المرشد السياحي',
    pageSubtitle: 'كل ما تحتاج معرفته لتكون مرشداً سياحياً محترفاً',
    
    sections: [
      {
        title: 'واجبات ومسؤوليات المرشد',
        icon: BookOpen,
        color: 'blue',
        items: [
          'توجيه الزوار وتقديم المعلومات التاريخية والسياحية بشكل صحيح.',
          'ضمان سلامة الزوار أثناء الجولات.',
          'الالتزام بسياسات وزارة السياحة والمعايير المهنية.'
        ]
      },
      {
        title: 'إدارة المجموعات السياحية',
        icon: Users,
        color: 'green',
        items: [
          'تنظيم حركة المجموعة وتحديد نقاط التجمع.',
          'الحفاظ على وقت الجولة.',
          'متابعة جميع أفراد المجموعة والتأكد من عدم فقدان أي شخص.'
        ]
      },
      {
        title: 'قواعد السلامة للزوار',
        icon: Shield,
        color: 'red',
        items: [
          'شرح تعليمات السلامة قبل بدء الجولة.',
          'معرفة مواقع مخارج الطوارئ والإسعافات الأولية.',
          'التصرف السريع عند حدوث أي طارئ.'
        ]
      },
      {
        title: 'اللوائح والسياسات التنظيمية',
        icon: Leaf,
        color: 'purple',
        items: [
          'الالتزام بلوائح وزارة السياحة.',
          'الالتزام بتعليمات الجهات المعنية في المواقع الأثرية والتراثية.',
          'المحافظة على البيئة السياحية وعدم الإضرار بالمواقع.'
        ]
      },
      {
        title: 'التعامل مع السياح من ثقافات مختلفة',
        icon: Globe,
        color: 'orange',
        items: [
          'احترام العادات والثقافات المتنوعة.',
          'التواصل بوضوح وتقديم المعلومات بطريقة مبسطة.',
          'تجنب أي كلمات أو عبارات غير لائقة أو ذات حساسية ثقافية.'
        ]
      }
    ],
    
    joinNow: 'انضم الآن',
    viewRequirements: 'متطلبات الانضمام',
  } : {
    pageTitle: 'Tour Guide Manual',
    pageSubtitle: 'Everything you need to know to be a professional tour guide',
    
    sections: [
      {
        title: 'Guide Duties and Responsibilities',
        icon: BookOpen,
        color: 'blue',
        items: [
          'Guiding visitors and providing accurate historical and tourism information.',
          'Ensuring visitor safety during tours.',
          'Adhering to Ministry of Tourism policies and professional standards.'
        ]
      },
      {
        title: 'Managing Tourist Groups',
        icon: Users,
        color: 'green',
        items: [
          'Organizing group movement and designating meeting points.',
          'Maintaining tour schedule.',
          'Monitoring all group members and ensuring no one gets lost.'
        ]
      },
      {
        title: 'Visitor Safety Rules',
        icon: Shield,
        color: 'red',
        items: [
          'Explaining safety instructions before starting the tour.',
          'Knowing locations of emergency exits and first aid.',
          'Quick response in case of any emergency.'
        ]
      },
      {
        title: 'Regulatory Rules and Policies',
        icon: Leaf,
        color: 'purple',
        items: [
          'Compliance with Ministry of Tourism regulations.',
          'Following instructions of relevant authorities at archaeological and heritage sites.',
          'Preserving the tourism environment and not damaging sites.'
        ]
      },
      {
        title: 'Dealing with Tourists from Different Cultures',
        icon: Globe,
        color: 'orange',
        items: [
          'Respecting diverse customs and cultures.',
          'Communicating clearly and presenting information in a simplified manner.',
          'Avoiding any inappropriate words or culturally sensitive phrases.'
        ]
      }
    ],
    
    joinNow: 'Join Now',
    viewRequirements: 'Joining Requirements',
  };

  const colorClasses: Record<string, { bg: string; iconBg: string; icon: string; border: string; lightBg: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950', iconBg: 'bg-blue-100 dark:bg-blue-900', icon: 'text-blue-600', border: 'border-l-blue-500', lightBg: 'bg-blue-500/10' },
    green: { bg: 'bg-green-50 dark:bg-green-950', iconBg: 'bg-green-100 dark:bg-green-900', icon: 'text-green-600', border: 'border-l-green-500', lightBg: 'bg-green-500/10' },
    red: { bg: 'bg-red-50 dark:bg-red-950', iconBg: 'bg-red-100 dark:bg-red-900', icon: 'text-red-600', border: 'border-l-red-500', lightBg: 'bg-red-500/10' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950', iconBg: 'bg-purple-100 dark:bg-purple-900', icon: 'text-purple-600', border: 'border-l-purple-500', lightBg: 'bg-purple-500/10' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950', iconBg: 'bg-orange-100 dark:bg-orange-900', icon: 'text-orange-600', border: 'border-l-orange-500', lightBg: 'bg-orange-500/10' },
  };

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-blue-500/10 via-background to-purple-500/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {language === 'ar' ? 'دليل شامل' : 'Comprehensive Guide'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="page-title">
              {texts.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {texts.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {texts.sections.map((section, sectionIndex) => {
              const Icon = section.icon;
              const colors = colorClasses[section.color];
              
              return (
                <Card 
                  key={sectionIndex} 
                  className={`border-l-4 ${colors.border} ${sectionIndex === 4 ? 'md:col-span-2' : ''}`}
                  data-testid={`manual-section-${sectionIndex + 1}`}
                >
                  <CardHeader className={colors.bg}>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {language === 'ar' ? `القسم ${sectionIndex + 1}` : `Section ${sectionIndex + 1}`}
                        </Badge>
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={`flex items-start gap-3 p-3 ${colors.lightBg} rounded-lg`}>
                          <CheckCircle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/join-guide">
              <Button size="lg" className="gap-2" data-testid="link-join">
                {texts.joinNow}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/guide-requirements">
              <Button size="lg" variant="outline" className="gap-2" data-testid="link-requirements">
                {texts.viewRequirements}
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
