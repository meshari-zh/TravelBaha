import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Eye, Lightbulb, CheckCircle, MapPin, Users, Calendar, MessageCircle } from "lucide-react";

export default function AboutProject() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      titleAr: "استكشاف الأماكن السياحية",
      titleEn: "Explore Tourist Places",
      descAr: "تصفح مجموعة واسعة من الأماكن السياحية في منطقة الباحة",
      descEn: "Browse a wide range of tourist places in Al Bahah region"
    },
    {
      icon: <Users className="w-6 h-6" />,
      titleAr: "مرشدين محترفين",
      titleEn: "Professional Guides",
      descAr: "تواصل مع مرشدين محليين ذوي خبرة عالية",
      descEn: "Connect with highly experienced local guides"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      titleAr: "نظام حجز متكامل",
      titleEn: "Integrated Booking System",
      descAr: "احجز رحلاتك بسهولة وأمان",
      descEn: "Book your trips easily and securely"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      titleAr: "تواصل مباشر",
      titleEn: "Direct Communication",
      descAr: "تواصل مباشر مع المرشدين عبر نظام الرسائل",
      descEn: "Direct communication with guides through messaging system"
    }
  ];

  const milestones = [
    {
      yearAr: "٢٠٢٤",
      yearEn: "2024",
      titleAr: "إطلاق المنصة",
      titleEn: "Platform Launch",
      descAr: "إطلاق النسخة الأولى من منصة سياحة الباحة",
      descEn: "Launch of the first version of Al Bahah Tourism Platform"
    },
    {
      yearAr: "٢٠٢٤",
      yearEn: "2024",
      titleAr: "إضافة نظام الحجز",
      titleEn: "Booking System Added",
      descAr: "تطوير نظام حجز متكامل وآمن",
      descEn: "Development of integrated and secure booking system"
    },
    {
      yearAr: "٢٠٢٥",
      yearEn: "2025",
      titleAr: "خريطة تفاعلية",
      titleEn: "Interactive Map",
      descAr: "إضافة خريطة تفاعلية لعرض المواقع السياحية",
      descEn: "Adding interactive map to display tourist locations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="text-center mb-12">
          <div className="hero-gradient text-white p-8 rounded-2xl shadow-lg mb-8">
            <div className="max-w-4xl mx-auto">
              <Info className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-about-project-title">
                {language === 'ar' ? 'نبذة عن المشروع' : 'About the Project'}
              </h1>
              <p className="text-xl opacity-90">
                {language === 'ar' 
                  ? 'منصة سياحية شاملة تهدف لتعزيز السياحة في منطقة الباحة' 
                  : 'A comprehensive tourism platform aimed at promoting tourism in Al Bahah region'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-green-600" />
                {language === 'ar' ? 'الرسالة' : 'Mission'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'نسعى لتقديم تجربة سياحية متكاملة تربط السياح بالمرشدين المحليين في منطقة الباحة، مع التركيز على الأصالة والجودة والابتكار في تقديم الخدمات السياحية.'
                  : 'We strive to provide an integrated tourism experience that connects tourists with local guides in Al Bahah region, focusing on authenticity, quality, and innovation in delivering tourism services.'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                {language === 'ar' ? 'الرؤية' : 'Vision'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'أن نكون المنصة الرائدة والأولى في مجال السياحة الرقمية لمنطقة الباحة، ونساهم في تعزيز السياحة المحلية وتنمية الاقتصاد السياحي في المنطقة.'
                  : 'To be the leading and first platform in digital tourism for Al Bahah region, contributing to promoting local tourism and developing the tourism economy in the region.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800 dark:text-green-200 flex items-center justify-center gap-3">
            <Lightbulb className="w-8 h-8" />
            {language === 'ar' ? 'مميزات المنصة' : 'Platform Features'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold mb-2">
                    {language === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? feature.descAr : feature.descEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800 dark:text-green-200 flex items-center justify-center gap-3">
            <CheckCircle className="w-8 h-8" />
            {language === 'ar' ? 'مراحل التطوير' : 'Development Milestones'}
          </h2>
          <div className="relative">
            <div className="absolute right-1/2 transform translate-x-1/2 h-full w-1 bg-green-200 dark:bg-green-800 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <Card className="flex-1 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {language === 'ar' ? milestone.yearAr : milestone.yearEn}
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {language === 'ar' ? milestone.titleAr : milestone.titleEn}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'ar' ? milestone.descAr : milestone.descEn}
                      </p>
                    </CardContent>
                  </Card>
                  <div className="hidden md:block w-4 h-4 bg-green-600 rounded-full z-10"></div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
