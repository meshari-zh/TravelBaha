import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Heart, Star } from "lucide-react";
import type { TeamMember, SiteContent } from "@shared/schema";

export default function Team() {
  const { language } = useLanguage();

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const { data: supervisorName } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_name'],
  });
  const { data: supervisorNameEn } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_name_en'],
  });
  const { data: supervisorRole } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_role'],
  });
  const { data: supervisorRoleEn } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_role_en'],
  });
  const { data: supervisorBio } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_bio'],
  });
  const { data: supervisorBioEn } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_bio_en'],
  });
  const { data: supervisorImage } = useQuery<SiteContent>({
    queryKey: ['/api/site-content/supervisor_image'],
  });

  const activeMembers = teamMembers.filter(m => m.isActive);

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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : activeMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              {language === 'ar' ? 'لا يوجد أعضاء في الفريق حالياً' : 'No team members available'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-12">
              {[...activeMembers]
                .sort((a, b) => {
                  const aHasPosition = !!(a.position || a.positionEn);
                  const bHasPosition = !!(b.position || b.positionEn);
                  if (aHasPosition && !bHasPosition) return -1;
                  if (!aHasPosition && bHasPosition) return 1;
                  return (a.orderIndex || 0) - (b.orderIndex || 0);
                })
                .map((member: TeamMember) => {
                  const displayName = language === 'ar' ? member.name : (member.nameEn || member.name);
                  const displayPosition = language === 'ar' ? member.position : (member.positionEn || member.position);
                  return (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow" data-testid={`card-team-member-${member.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {member.imageUrl ? (
                            <img 
                              src={member.imageUrl} 
                              alt={displayName}
                              className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-green-200"
                            />
                          ) : (
                            <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-full shrink-0">
                              👤
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                              {displayName}
                              {displayPosition && (
                                <span className="text-muted-foreground font-normal"> ({displayPosition})</span>
                              )}
                            </h3>
                            <div>
                              <span className="inline-block bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                                {language === 'ar' ? member.role : (member.roleEn || member.role)}
                              </span>
                            </div>
                            {(member.description || member.descriptionEn) && (
                              <p className="text-muted-foreground leading-relaxed">
                                {language === 'ar' ? member.description : (member.descriptionEn || member.description)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {(supervisorName?.content || supervisorNameEn?.content) && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-green-800 dark:text-green-200">
                  {language === 'ar' ? 'المشرف على المشروع' : 'Project Supervisor'}
                </h2>
                <Card className="max-w-2xl mx-auto hover:shadow-lg transition-shadow border-2 border-primary/20" data-testid="card-supervisor">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {supervisorImage?.content ? (
                        <img 
                          src={supervisorImage.content} 
                          alt={language === 'ar' ? supervisorName?.content : (supervisorNameEn?.content || supervisorName?.content)}
                          className="w-24 h-24 rounded-full object-cover shrink-0 border-4 border-yellow-400"
                        />
                      ) : (
                        <div className="text-6xl w-24 h-24 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-full shrink-0 border-4 border-yellow-400">
                          👨‍🏫
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {language === 'ar' ? supervisorName?.content : (supervisorNameEn?.content || supervisorName?.content)}
                        </h3>
                        <div>
                          <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-medium px-4 py-1.5 rounded-full text-sm">
                            {language === 'ar' ? supervisorRole?.content : (supervisorRoleEn?.content || supervisorRole?.content)}
                          </span>
                        </div>
                        {(supervisorBio?.content || supervisorBioEn?.content) && (
                          <p className="text-muted-foreground leading-relaxed">
                            {language === 'ar' ? supervisorBio?.content : (supervisorBioEn?.content || supervisorBio?.content)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

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
