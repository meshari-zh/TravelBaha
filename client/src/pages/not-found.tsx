import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";

export default function NotFound() {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
              </h2>
            </div>

            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
                : 'Sorry, the page you are looking for does not exist or has been moved.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto" data-testid="button-go-home">
                  <Home className="w-4 h-4 ml-2" />
                  {language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
                data-testid="button-go-back"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                {language === 'ar' ? 'العودة للخلف' : 'Go Back'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
