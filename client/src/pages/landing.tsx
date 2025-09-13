import { useState } from "react";
import Hero from "@/components/hero";
import PlaceCard from "@/components/place-card";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Place, Guide } from "@shared/schema";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";
import heroVideo from "@assets/واجهت الموقع_1757794048716.mp4";
import videoPoster from "@assets/رغدان_1757793151105.jpg";

export default function Landing() {
  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const featuredPlaces = places.slice(0, 3);
  const featuredGuides = guides.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <img 
                src={siteLogo} 
                alt="لوجو إرشاد سياحي - منطقة الباحة" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">إرشاد سياحي</h1>
                <p className="text-sm text-muted-foreground">منطقة الباحة</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <a href="#" className="text-foreground hover:text-primary transition-colors">الرئيسية</a>
              <a href="#places" className="text-muted-foreground hover:text-primary transition-colors">الأماكن السياحية</a>
              <a href="#guides" className="text-muted-foreground hover:text-primary transition-colors">المرشدين السياحيين</a>
              <a href="#messages" className="text-muted-foreground hover:text-primary transition-colors">الرسائل</a>
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                تسجيل الدخول
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-register"
              >
                إنشاء حساب
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Video Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">اكتشف جمال منطقة الباحة</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              تمتع بمشاهدة أروع المناظر الطبيعية والمعالم السياحية في منطقة الباحة
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster={videoPoster}
                data-testid="hero-video"
              >
                <source src={heroVideo} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">مرحباً بكم في منصة الباحة السياحية</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              نحن نربط بين السياح والمرشدين السياحيين المحليين في منطقة الباحة، لنقدم لكم تجربة سياحية متميزة تجمع بين جمال الطبيعة وأصالة التراث السعودي. منصتنا تضمن لكم الحصول على أفضل المرشدين المحليين الذين يعرفون أسرار المنطقة وتاريخها العريق.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏔️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">أماكن طبيعية خلابة</h3>
                <p className="text-muted-foreground">اكتشف الجبال والغابات والقرى التراثية</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧭</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">مرشدين محليين خبراء</h3>
                <p className="text-muted-foreground">مرشدين معتمدين يعرفون المنطقة بتفاصيلها</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">تواصل مباشر وآمن</h3>
                <p className="text-muted-foreground">نظام رسائل متطور للتواصل والحجز</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Places Section */}
      <section id="places" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">الأماكن السياحية المميزة</h2>
            <p className="text-lg text-muted-foreground">اكتشف أجمل الوجهات السياحية في منطقة الباحة</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPlaces.length > 0 ? (
              featuredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} showGuideCount />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">لا توجد أماكن سياحية متاحة حالياً</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" data-testid="button-view-all-places">
              عرض جميع الأماكن السياحية
            </Button>
          </div>
        </div>
      </section>

      {/* Tour Guides Section */}
      <section id="guides" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">المرشدين السياحيين المعتمدين</h2>
            <p className="text-lg text-muted-foreground">تعرف على فريق المرشدين المحليين الخبراء</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGuides.length > 0 ? (
              featuredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">لا يوجد مرشدين متاحين حالياً</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" data-testid="button-view-all-guides">
              عرض جميع المرشدين
            </Button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">انضم إلينا</h2>
            <p className="text-lg text-muted-foreground">اختر الدور المناسب لك في منصتنا</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Tourist Role */}
            <Card className="text-center border-2 border-transparent hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🧳</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">السائح</h3>
                <p className="text-muted-foreground mb-6">
                  اكتشف أجمل الأماكن السياحية في الباحة مع أفضل المرشدين المحليين
                </p>
                <ul className="text-right space-y-2 mb-8 text-muted-foreground">
                  <li>• استعراض الأماكن السياحية</li>
                  <li>• اختيار المرشد المناسب</li>
                  <li>• إجراء الحجوزات</li>
                  <li>• التواصل مع المرشدين</li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-tourist"
                >
                  انضم كسائح
                </Button>
              </CardContent>
            </Card>

            {/* Guide Role */}
            <Card className="text-center border-2 border-transparent hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🧭</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">المرشد السياحي</h3>
                <p className="text-muted-foreground mb-6">
                  شارك خبرتك المحلية واربح من خلال إرشاد السياح في منطقة الباحة
                </p>
                <ul className="text-right space-y-2 mb-8 text-muted-foreground">
                  <li>• تعديل الملف الشخصي</li>
                  <li>• تحديد اللغات والتخصصات</li>
                  <li>• إدارة الأسعار</li>
                  <li>• استقبال الحجوزات</li>
                </ul>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-guide"
                >
                  انضم كمرشد
                </Button>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="text-center border-2 border-transparent hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">المشرف</h3>
                <p className="text-muted-foreground mb-6">
                  إدارة المنصة والإشراف على المحتوى وضمان جودة الخدمة
                </p>
                <ul className="text-right space-y-2 mb-8 text-muted-foreground">
                  <li>• إدارة الأماكن السياحية</li>
                  <li>• متابعة المرشدين</li>
                  <li>• مراقبة الرسائل</li>
                  <li>• إدارة النظام</li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-join-admin"
                >
                  دخول المشرف
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Messaging Preview */}
      <section id="messages" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">نظام الرسائل المتطور</h2>
            <p className="text-lg text-muted-foreground">تواصل آمن ومباشر بين السياح والمرشدين</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4 flex items-center">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center ml-3">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold">محادثة مع المرشد أحمد السعيد</h3>
                  <p className="text-sm opacity-90">متصل الآن</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4 bg-muted/50 h-80 overflow-y-auto">
                {/* Sample messages for demonstration */}
                <div className="flex justify-start">
                  <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-foreground">مرحباً بك! يسعدني مساعدتك في استكشاف الباحة. ما هي اهتماماتك السياحية؟</p>
                    <span className="text-xs text-muted-foreground">أحمد • 10:30 ص</span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-primary p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-primary-foreground">أهلاً! أريد زيارة غابات الباحة وقرية ذي عين. هل يمكنك ترتيب جولة لمدة يومين؟</p>
                    <span className="text-xs text-primary-foreground/70">أنت • 10:35 ص</span>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-card p-3 rounded-lg max-w-xs shadow-sm">
                    <p className="text-sm text-foreground">بالطبع! سأرتب لك برنامج رائع يشمل الغابات، القرية التراثية، وبعض الأماكن المميزة الأخرى. السعر 500 ريال لليومين شامل النقل.</p>
                    <span className="text-xs text-muted-foreground">أحمد • 10:40 ص</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-card">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input 
                    type="text" 
                    placeholder="اكتب رسالتك هنا..." 
                    className="flex-1 border border-input rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
                    disabled
                    data-testid="input-message" 
                  />
                  <Button disabled data-testid="button-send-message">
                    إرسال
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">ب</span>
                </div>
                <span className="text-lg font-bold">منصة الباحة السياحية</span>
              </div>
              <p className="text-background/80 text-sm leading-relaxed">
                نربط السياح بأفضل المرشدين المحليين في منطقة الباحة لتجربة سياحية أصيلة ومميزة.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">الأماكن السياحية</a></li>
                <li><a href="#" className="hover:text-background transition-colors">المرشدين السياحيين</a></li>
                <li><a href="#" className="hover:text-background transition-colors">كيف يعمل الموقع</a></li>
                <li><a href="#" className="hover:text-background transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">للمرشدين</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">انضم كمرشد</a></li>
                <li><a href="#" className="hover:text-background transition-colors">متطلبات الانضمام</a></li>
                <li><a href="#" className="hover:text-background transition-colors">دليل المرشد</a></li>
                <li><a href="#" className="hover:text-background transition-colors">الدعم والمساعدة</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-background/80">
                <li>البريد: info@albaha-tourism.sa</li>
                <li>الهاتف: +966 17 123 4567</li>
                <li>العنوان: الباحة، المملكة العربية السعودية</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-background/80 text-sm">
              © 2024 منصة الباحة السياحية. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
