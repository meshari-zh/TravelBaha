import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { DynamicPage } from '@shared/schema';
import { Loader2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function DynamicPageView() {
  const params = useParams();
  const slug = params.slug;
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const { data: page, isLoading, error } = useQuery<DynamicPage>({
    queryKey: ['/api/pages', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col justify-center items-center min-h-[400px] text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'الصفحة التي تبحث عنها غير موجودة أو تم حذفها' 
                : 'The page you are looking for does not exist or has been removed'}
            </p>
            <Link href="/">
              <Button variant="default" className="gap-2" data-testid="button-back-home">
                {language === 'ar' ? (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    العودة للرئيسية
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </>
                )}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!page.isPublished) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col justify-center items-center min-h-[400px] text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'الصفحة غير متاحة' : 'Page Unavailable'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'هذه الصفحة غير متاحة حالياً' 
                : 'This page is currently not available'}
            </p>
            <Link href="/">
              <Button variant="default" className="gap-2" data-testid="button-back-home-unavailable">
                {language === 'ar' ? (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    العودة للرئيسية
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </>
                )}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = language === 'ar' ? page.titleAr : (page.titleEn || page.titleAr);
  const content = language === 'ar' ? page.contentAr : (page.contentEn || page.contentAr);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-page-title">
              {title}
            </h1>
          </header>
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            data-testid="content-page-body"
          >
            {content ? (
              content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4 text-foreground/90">
                    {paragraph}
                  </p>
                ) : (
                  <br key={index} />
                )
              ))
            ) : (
              <p className="text-muted-foreground italic">
                {language === 'ar' ? 'لا يوجد محتوى متاح لهذه الصفحة.' : 'No content available for this page.'}
              </p>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
