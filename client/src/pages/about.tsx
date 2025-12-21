import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { SiteContent, TeamMember } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building2 } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function About() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const { data: aboutContent, isLoading, refetch } = useQuery<SiteContent>({
    queryKey: ['/api/site-content', 'about_us'],
    queryFn: async () => {
      const response = await fetch('/api/site-content/about_us');
      if (!response.ok) {
        throw new Error('Failed to fetch about content');
      }
      return response.json();
    },
  });

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t('aboutTitle')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('aboutSubtitle')}
              </p>
            </div>
            
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-about"
              >
{isEditing ? 
                  (language === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit') : 
                  (language === 'ar' ? 'تعديل المحتوى' : 'Edit Content')
                }
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* فريق العمل */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-right flex items-center gap-3">
                  <Users className="w-6 h-6" />
{language === 'ar' ? 'فريق العمل' : 'Our Team'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {teamLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...teamMembers]
                      .sort((a, b) => {
                        const aHasPosition = !!(a.position || a.positionEn);
                        const bHasPosition = !!(b.position || b.positionEn);
                        if (aHasPosition && !bHasPosition) return -1;
                        if (!aHasPosition && bHasPosition) return 1;
                        return (a.orderIndex || 0) - (b.orderIndex || 0);
                      })
                      .map((member) => {
                        const displayName = language === 'en' && member.nameEn ? member.nameEn : member.name;
                        const displayPosition = language === 'en' && member.positionEn ? member.positionEn : member.position;
                        return (
                          <div key={member.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30" data-testid={`team-member-${member.id}`}>
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={member.imageUrl || undefined} />
                              <AvatarFallback className="text-lg">
                                {displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h3 className="font-semibold text-lg" data-testid={`team-member-name-${member.id}`}>
                                {displayName}
                                {displayPosition && (
                                  <span className="text-muted-foreground font-normal"> ({displayPosition})</span>
                                )}
                              </h3>
                              <p className="text-sm text-primary font-medium mb-2" data-testid={`team-member-role-${member.id}`}>
                                {language === 'en' && member.roleEn ? member.roleEn : member.role}
                              </p>
                              {(member.description || member.descriptionEn) && (
                                <p className="text-sm text-muted-foreground" data-testid={`team-member-description-${member.id}`}>
                                  {language === 'en' && member.descriptionEn ? member.descriptionEn : member.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{language === 'ar' ? 'لم يتم إضافة أعضاء الفريق بعد.' : 'No team members have been added yet.'}</p>
                    {isAdmin && (
                      <p className="mt-2 text-sm">{language === 'ar' ? 'يمكنك إضافة أعضاء الفريق من لوحة الإدارة.' : 'You can add team members from the admin panel.'}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* نبذة عن المشروع */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-right flex items-center gap-3">
                  <Building2 className="w-6 h-6" />
{language === 'ar' ? 'نبذة عن المشروع' : 'About the Project'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : aboutContent?.content ? (
                  <div className={`prose prose-lg max-w-none ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="whitespace-pre-wrap">
                      {language === 'en' && aboutContent.contentEn ? aboutContent.contentEn : aboutContent.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-6 rounded-lg text-right" dir="rtl">
                    <h3 className="text-xl font-semibold mb-4">
                      {language === 'ar' ? 'عن منصة الباحة السياحية' : 'About AlBaha Tourism Platform'}
                    </h3>
                    <p className="mb-4">
                      {language === 'ar' ? 
                        'منصة الباحة السياحية هي منصة رقمية مبتكرة تهدف إلى الربط بين السياح والمرشدين السياحيين المحليين في منطقة الباحة الخلابة بالمملكة العربية السعودية.' :
                        'AlBaha Tourism Platform is an innovative digital platform that aims to connect tourists with local tour guides in the beautiful AlBaha region of Saudi Arabia.'
                      }
                    </p>
                    <p className="mb-4">
                      {language === 'ar' ? 
                        'نحن نؤمن بأن السياحة الأصيلة تبدأ من التواصل مع أهل المنطقة الذين يعرفون تفاصيلها وأسرارها. لذلك نوفر منصة آمنة وموثوقة تضمن تجربة سياحية لا تُنسى تجمع بين جمال الطبيعة وأصالة التراث.' :
                        'We believe that authentic tourism starts with connecting with the local people who know the region\'s details and secrets. Therefore, we provide a safe and reliable platform that ensures an unforgettable tourism experience that combines natural beauty with heritage authenticity.'
                      }
                    </p>
                    <p>
                      {language === 'ar' ? 
                        'من خلال منصتنا، يمكن للسياح اكتشاف أجمل الأماكن في الباحة، والتواصل مع مرشدين محليين خبراء، وحجز جولات سياحية مخصصة تناسب اهتماماتهم وميزانيتهم.' :
                        'Through our platform, tourists can discover the most beautiful places in AlBaha, communicate with expert local guides, and book customized tours that suit their interests and budget.'
                      }
                    </p>
                  </div>
                )}
                
                {!aboutContent && !isLoading && isAdmin && (
                  <div className="text-center text-muted-foreground">
                    <p>{language === 'ar' ? 'يمكنك إضافة محتوى المشروع من خلال زر "تعديل المحتوى" أعلاه.' : 'You can add project content using the "Edit Content" button above.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {isEditing && isAdmin && (
            <div className="mt-8">
              <EditAboutForm 
                content={aboutContent} 
                onSave={() => {
                  setIsEditing(false);
                  refetch();
                }}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

interface EditAboutFormProps {
  content?: SiteContent;
  onSave: () => void;
}

function EditAboutForm({ content, onSave }: EditAboutFormProps) {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState(content?.title || '');
  const [titleEn, setTitleEn] = useState(content?.titleEn || '');
  const [contentText, setContentText] = useState(content?.content || '');
  const [contentTextEn, setContentTextEn] = useState(content?.contentEn || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when content changes
  useEffect(() => {
    if (content) {
      setTitle(content.title || '');
      setTitleEn(content.titleEn || '');
      setContentText(content.content || '');
      setContentTextEn(content.contentEn || '');
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'about_us',
          title,
          titleEn,
          content: contentText,
          contentEn: contentTextEn,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ المحتوى' : 'An error occurred while saving content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{language === 'ar' ? 'تعديل محتوى "نبذة عنا"' : 'Edit "About Us" Content'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Arabic Content */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">{language === 'ar' ? 'المحتوى بالعربية' : 'Arabic Content'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground text-right"
                  dir="rtl"
                  placeholder={language === 'ar' ? 'عنوان الصفحة بالعربية' : 'Page Title in Arabic'}
                  required
                  data-testid="input-about-title"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                </label>
                <textarea
                  id="content"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground text-right"
                  dir="rtl"
                  placeholder={language === 'ar' ? 'محتوى صفحة نبذة عنا بالعربية...' : 'About us page content in Arabic...'}
                  required
                  data-testid="textarea-about-content"
                />
              </div>
            </div>
          </div>
          
          {/* English Content */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">{language === 'ar' ? 'المحتوى بالإنجليزية' : 'English Content'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                </label>
                <input
                  id="titleEn"
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground text-left"
                  dir="ltr"
                  placeholder={language === 'ar' ? 'عنوان الصفحة بالإنجليزية' : 'Page Title in English'}
                  data-testid="input-about-title-en"
                />
              </div>
              
              <div>
                <label htmlFor="contentEn" className="block text-sm font-medium mb-2">
                  {language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                </label>
                <textarea
                  id="contentEn"
                  value={contentTextEn}
                  onChange={(e) => setContentTextEn(e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground text-left"
                  dir="ltr"
                  placeholder={language === 'ar' ? 'محتوى صفحة نبذة عنا بالإنجليزية...' : 'About us page content in English...'}
                  data-testid="textarea-about-content-en"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-testid="button-save-about"
            >
              {isSubmitting ? 
                (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : 
                (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}