import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { SiteContent } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

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

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {aboutContent?.title || 'نبذة عنا'}
            </h1>
            <p className="text-lg text-muted-foreground">
              تعرف على منصة الباحة السياحية ورسالتنا
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

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-right">معلومات عنا</CardTitle>
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
              <div className="text-center py-12 text-muted-foreground">
                <p>لم يتم إضافة محتوى "نبذة عنا" بعد.</p>
                {isAdmin && (
                  <p className="mt-2">يمكنك إضافة المحتوى من خلال زر "تعديل المحتوى" أعلاه.</p>
                )}
              </div>
            )}

            {!aboutContent && !isLoading && (
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
          </CardContent>
        </Card>

        {isEditing && isAdmin && (
          <EditAboutForm 
            content={aboutContent} 
            onSave={() => {
              setIsEditing(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
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