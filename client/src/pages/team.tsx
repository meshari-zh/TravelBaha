import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Heart, Star } from "lucide-react";

export default function Team() {
  const { language, t } = useLanguage();

  const teamMembers = [
    {
      nameAr: "أحمد محمد",
      nameEn: "Ahmed Mohammed",
      roleAr: "مؤسس ومدير المشروع",
      roleEn: "Founder & Project Manager",
      descriptionAr: "خبرة واسعة في مجال السياحة والتقنية",
      descriptionEn: "Extensive experience in tourism and technology",
      avatar: "🧑‍💼"
    },
    {
      nameAr: "فاطمة علي",
      nameEn: "Fatima Ali",
      roleAr: "مديرة تطوير المحتوى",
      roleEn: "Content Development Manager",
      descriptionAr: "متخصصة في المحتوى السياحي والثقافي",
      descriptionEn: "Specialized in tourism and cultural content",
      avatar: "👩‍💻"
    },
    {
      nameAr: "محمد سالم",
      nameEn: "Mohammed Salem",
      roleAr: "مطور تقني",
      roleEn: "Technical Developer",
      descriptionAr: "خبير في تطوير التطبيقات والمنصات الرقمية",
      descriptionEn: "Expert in app and digital platform development",
      avatar: "👨‍💻"
    },
    {
      nameAr: "نورة أحمد",
      nameEn: "Noura Ahmed",
      roleAr: "مسؤولة علاقات العملاء",
      roleEn: "Customer Relations Manager",
      descriptionAr: "متخصصة في خدمة العملاء والتواصل",
      descriptionEn: "Specialized in customer service and communication",
      avatar: "👩‍🔧"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      titleAr: "الشغف",
      titleEn: "Passion",
      descAr: "نحب ما نفعله ونسعى لتقديم أفضل تجربة سياحية",
      descEn: "We love what we do and strive to provide the best tourism experience"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-500" />,
      titleAr: "الجودة",
      titleEn: "Quality",
      descAr: "نلتزم بأعلى معايير الجودة في كل ما نقدمه",
      descEn: "We commit to the highest quality standards in everything we offer"
    },
    {
      icon: <Star className="w-8 h-8 text-blue-500" />,
      titleAr: "الابتكار",
      titleEn: "Innovation",
      descAr: "نستخدم أحدث التقنيات لتسهيل تجربة المستخدم",
      descEn: "We use the latest technologies to enhance user experience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="text-center mb-12">
          <div className="hero-gradient text-white p-8 rounded-2xl shadow-lg mb-8">
            <div className="max-w-4xl mx-auto">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-team-title">
                {language === 'ar' ? 'فريق العمل' : 'Our Team'}
              </h1>
              <p className="text-xl opacity-90">
                {language === 'ar' 
                  ? 'تعرف على الفريق الذي يعمل خلف الكواليس لتقديم أفضل تجربة سياحية' 
                  : 'Meet the team working behind the scenes to deliver the best tourism experience'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-team-member-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-full">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                    {language === 'ar' ? member.nameAr : member.nameEn}
                  </h3>
                </div>
                <div className="mb-3">
                  <span className="inline-block bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                    {language === 'ar' ? member.roleAr : member.roleEn}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ar' ? member.descriptionAr : member.descriptionEn}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800 dark:text-green-200">
            {language === 'ar' ? 'قيمنا' : 'Our Values'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'ar' ? value.titleAr : value.titleEn}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? value.descAr : value.descEn}
                  </p>
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
