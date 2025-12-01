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
      stepAr: "١",
      stepEn: "1",
      titleAr: "مرحلة توليد الفكرة",
      titleEn: "Idea Generation Phase",
      descAr: "بدأ المشروع بتحديد مشكلة حقيقية تتمثل في صعوبة وصول الزوار والمهتمين إلى المرشدين السياحيين في منطقة الباحة، مما أدى إلى ظهور فكرة إنشاء منصة إلكترونية تجمع المرشدين وتعرض خدماتهم بطريقة سهلة وواضحة.",
      descEn: "The project started by identifying a real problem: the difficulty for visitors to reach tour guides in Al Bahah region, which led to the idea of creating an electronic platform that brings together guides and displays their services in an easy and clear way."
    },
    {
      stepAr: "٢",
      stepEn: "2",
      titleAr: "كتابة وتطوير فكرة المشروع",
      titleEn: "Writing and Developing the Project Idea",
      descAr: "تم صياغة الفكرة بشكل رسمي ودقيق، وكتابة وصف شامل يوضح: أهداف المنصة، الفئة المستهدفة، المشكلة والحل المقترح، والقيمة المضافة التي يقدمها المشروع.",
      descEn: "The idea was formally and precisely formulated, with a comprehensive description covering: platform objectives, target audience, problem and proposed solution, and the added value the project provides."
    },
    {
      stepAr: "٣",
      stepEn: "3",
      titleAr: "تصميم رسومات الـ UML",
      titleEn: "UML Diagrams Design",
      descAr: "تم إعداد المخططات الأساسية للمشروع، وتشمل: Use Case Diagram، Sequence Diagram، Activity Diagram، Class Diagram، وذلك بهدف توضيح طريقة عمل النظام قبل بدء البرمجة.",
      descEn: "Basic project diagrams were prepared, including: Use Case Diagram, Sequence Diagram, Activity Diagram, Class Diagram, to clarify how the system works before starting programming."
    },
    {
      stepAr: "٤",
      stepEn: "4",
      titleAr: "إنشاء النموذج الأولي (Wireframe / Prototype)",
      titleEn: "Creating Wireframe / Prototype",
      descAr: "تم تصميم صورة تقريبية لشكل الموقع قبل البدء بالبرمجة، تشمل: شكل الصفحة الرئيسية، صفحة المرشدين، صفحة الأماكن السياحية، صفحة تسجيل الدخول، وشكل لوحة التحكم.",
      descEn: "An approximate design of the website was created before programming, including: homepage layout, guides page, tourist places page, login page, and dashboard layout."
    },
    {
      stepAr: "٥",
      stepEn: "5",
      titleAr: "بدء إنشاء وتنفيذ المشروع",
      titleEn: "Starting Project Implementation",
      descAr: "تم البدء ببرمجة الموقع باستخدام الأدوات المناسبة، وبناء الهيكلة الأساسية للصفحات.",
      descEn: "Website programming began using appropriate tools, building the basic structure of pages."
    },
    {
      stepAr: "٦",
      stepEn: "6",
      titleAr: "إضافة الأماكن السياحية",
      titleEn: "Adding Tourist Places",
      descAr: "تم إدراج مجموعة من المواقع السياحية في منطقة الباحة داخل المنصة، مع: صور، وصف، موقع جغرافي، ومعلومات مختصرة لكل موقع.",
      descEn: "A collection of tourist sites in Al Bahah region was added to the platform, with: images, descriptions, geographic locations, and brief information for each site."
    },
    {
      stepAr: "٧",
      stepEn: "7",
      titleAr: "إضافة المرشدين السياحيين",
      titleEn: "Adding Tour Guides",
      descAr: "تم إضافة حسابات مرشدين سياحيين تشمل: الاسم، الخبرة، التخصص، طريقة التواصل، وإمكانية حجز الجولات.",
      descEn: "Tour guide accounts were added including: name, experience, specialty, contact method, and tour booking capability."
    },
    {
      stepAr: "٨",
      stepEn: "8",
      titleAr: "اختيار طريقة الدخول عبر كود دعوة",
      titleEn: "Invitation Code Login Method",
      descAr: "تم اعتماد طريقة دخول خاصة لحماية النظام أثناء التطوير، بحيث: يمكن للمرشد الدخول عبر كود دعوة، يتم التحكم في عدد المستخدمين، ويتم ضمان الخصوصية والتنظيم.",
      descEn: "A special login method was adopted to protect the system during development: guides can login via invitation code, user count is controlled, and privacy and organization are ensured."
    },
    {
      stepAr: "٩",
      stepEn: "9",
      titleAr: "إضافة الخريطة التفاعلية",
      titleEn: "Adding Interactive Map",
      descAr: "تم دمج خريطة تفاعلية لعرض: الأماكن السياحية، مواقع المرشدين، والمسارات المقترحة، وذلك لتعزيز تجربة المستخدم.",
      descEn: "An interactive map was integrated to display: tourist places, guide locations, and suggested routes, to enhance user experience."
    },
    {
      stepAr: "١٠",
      stepEn: "10",
      titleAr: "تجهيز العرض النهائي وتقديم المشروع",
      titleEn: "Final Presentation Preparation",
      descAr: "بعد إكمال جميع مراحل التطوير، تم إعداد: تقرير المشروع، عرض البوربوينت، العرض الشفهي للمشروع الأول. والآن يجري العمل على مشروع 2.",
      descEn: "After completing all development phases, the following were prepared: project report, PowerPoint presentation, oral presentation for Project 1. Now working on Project 2."
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
            {language === 'ar' ? 'مراحل التطوير' : 'Development Phases'}
          </h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {language === 'ar' ? milestone.stepAr : milestone.stepEn}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-primary">
                        {language === 'ar' ? milestone.titleAr : milestone.titleEn}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {language === 'ar' ? milestone.descAr : milestone.descEn}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
