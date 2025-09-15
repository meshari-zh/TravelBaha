import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { SiteContent, TeamMember } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building2 } from "lucide-react";
import Navbar from "@/components/navbar";

export default function About() {
  const { user } = useAuth();
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
                نبذة عنا
              </h1>
              <p className="text-lg text-muted-foreground">
                تعرف على فريق منصة الباحة السياحية ورسالتنا
              </p>
            </div>
            
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-about"
              >
                {isEditing ? 'إلغاء التعديل' : 'تعديل المحتوى'}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* فريق العمل */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-right flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  فريق العمل
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
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30" data-testid={`team-member-${member.id}`}>
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={member.imageUrl || undefined} />
                          <AvatarFallback className="text-lg">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-right">
                          <h3 className="font-semibold text-lg" data-testid={`team-member-name-${member.id}`}>
                            {member.name}
                          </h3>
                          <p className="text-sm text-primary font-medium mb-2" data-testid={`team-member-role-${member.id}`}>
                            {member.role}
                          </p>
                          {member.description && (
                            <p className="text-sm text-muted-foreground" data-testid={`team-member-description-${member.id}`}>
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لم يتم إضافة أعضاء الفريق بعد.</p>
                    {isAdmin && (
                      <p className="mt-2 text-sm">يمكنك إضافة أعضاء الفريق من لوحة الإدارة.</p>
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
                  نبذة عن المشروع
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
                  <div className="prose prose-lg max-w-none text-right" dir="rtl">
                    <div className="whitespace-pre-wrap">
                      {aboutContent.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-6 rounded-lg text-right" dir="rtl">
                    <h3 className="text-xl font-semibold mb-4">عن منصة الباحة السياحية</h3>
                    <p className="mb-4">
                      منصة الباحة السياحية هي منصة رقمية مبتكرة تهدف إلى الربط بين السياح والمرشدين السياحيين المحليين 
                      في منطقة الباحة الخلابة بالمملكة العربية السعودية.
                    </p>
                    <p className="mb-4">
                      نحن نؤمن بأن السياحة الأصيلة تبدأ من التواصل مع أهل المنطقة الذين يعرفون تفاصيلها وأسرارها. 
                      لذلك نوفر منصة آمنة وموثوقة تضمن تجربة سياحية لا تُنسى تجمع بين جمال الطبيعة وأصالة التراث.
                    </p>
                    <p>
                      من خلال منصتنا، يمكن للسياح اكتشاف أجمل الأماكن في الباحة، والتواصل مع مرشدين محليين خبراء، 
                      وحجز جولات سياحية مخصصة تناسب اهتماماتهم وميزانيتهم.
                    </p>
                  </div>
                )}
                
                {!aboutContent && !isLoading && isAdmin && (
                  <div className="text-center text-muted-foreground">
                    <p>يمكنك إضافة محتوى المشروع من خلال زر "تعديل المحتوى" أعلاه.</p>
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
    </>
  );
}

interface EditAboutFormProps {
  content?: SiteContent;
  onSave: () => void;
}

function EditAboutForm({ content, onSave }: EditAboutFormProps) {
  const [title, setTitle] = useState(content?.title || 'نبذة عنا');
  const [contentText, setContentText] = useState(content?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          content: contentText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>تعديل محتوى "نبذة عنا"</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              العنوان
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground text-right"
              dir="rtl"
              placeholder="عنوان الصفحة"
              required
              data-testid="input-about-title"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              المحتوى
            </label>
            <textarea
              id="content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={12}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground text-right"
              dir="rtl"
              placeholder="محتوى صفحة نبذة عنا..."
              required
              data-testid="textarea-about-content"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-testid="button-save-about"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}