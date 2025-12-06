import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import PlaceCard from "@/components/place-card";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Place, Guide, Booking } from "@shared/schema";
import newHeroVideo from "@assets/فديو جديد 2_1759000332280.mp4";
import videoPoster from "@assets/رغدان_1757793151105.jpg";

export default function Home() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const recentPlaces = places.slice(0, 3);
  const topGuides = guides.slice(0, 4);
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Video Section - Only for non-logged in users */}
      {!user && (
        <section className="relative py-20 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0">
            <video 
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              data-testid="hero-background-video"
            >
              <source src={newHeroVideo} type="video/mp4" />
            </video>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {language === 'ar' ? 'اكتشف جمال الباحة مع أفضل المرشدين السياحيين' : 'Discover the beauty of AlBaha with the best tour guides'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-lg">
              {language === 'ar' ? 'استمتع برحلة لا تُنسى في أجمل المناطق الطبيعية والتراثية في منطقة الباحة' : 'Enjoy an unforgettable journey through the most beautiful natural and heritage areas in AlBaha region'}
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link href="/places">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]" data-testid="button-explore-places-hero">
                  {language === 'ar' ? 'استكشف الأماكن' : 'Explore Places'}
                </Button>
              </Link>
              <Link href="/guides">
                <Button size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white hover:border-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]" data-testid="button-find-guides-hero">
                  {language === 'ar' ? 'اختر مرشدك' : 'Find Your Guide'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Welcome Section - Only for logged in users */}
      {user && (
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {language === 'ar' ? `أهلاً وسهلاً ${user?.firstName || "بك"}!` : `Welcome ${user?.firstName || ""}!`}
              </h1>
              <p className="text-lg text-muted-foreground">
                {user?.role === 'tourist' && (language === 'ar' ? "اكتشف جمال الباحة مع أفضل المرشدين السياحيين" : "Discover the beauty of AlBaha with the best tour guides")}
                {user?.role === 'guide' && (language === 'ar' ? "مرحباً بك في لوحة التحكم الخاصة بك" : "Welcome to your control panel")}
                {user?.role === 'admin' && (language === 'ar' ? "مرحباً بك في لوحة تحكم المشرف" : "Welcome to admin control panel")}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {user?.role === 'tourist' && (
                <>
                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🗺️</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{language === 'ar' ? 'استكشف الأماكن' : 'Explore Places'}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'اكتشف أجمل الوجهات السياحية في الباحة' : 'Discover the most beautiful tourist destinations in AlBaha'}</p>
                      <div className="mt-auto">
                        <Link href="/places">
                          <Button size="sm" className="w-full min-w-[160px]" data-testid="button-explore-places">
                            {language === 'ar' ? 'تصفح الأماكن' : 'Browse Places'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👨‍🏫</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{language === 'ar' ? 'اختر مرشدك' : 'Choose Your Guide'}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'تعرف على المرشدين المحليين الخبراء' : 'Meet expert local guides'}</p>
                      <div className="mt-auto">
                        <Link href="/guides">
                          <Button size="sm" variant="secondary" className="w-full min-w-[160px]" data-testid="button-find-guides">
                            {language === 'ar' ? 'البحث عن مرشد' : 'Find a Guide'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('messages')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'تواصل مع المرشدين واحجز رحلتك' : 'Communicate with guides and book your trip'}</p>
                      <div className="mt-auto">
                        <Link href="/messages">
                          <Button size="sm" variant="outline" className="w-full min-w-[160px]" data-testid="button-view-messages">
                            {language === 'ar' ? 'المحادثات' : 'Conversations'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {user?.role === 'guide' && (
                <>
                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👤</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('profile')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'إدارة معلوماتك وتخصصاتك' : 'Manage your information and specialties'}</p>
                      <div className="mt-auto">
                        <Link href="/dashboard">
                          <Button size="sm" className="w-full min-w-[160px]" data-testid="button-manage-profile">
                            {language === 'ar' ? 'إدارة الملف' : 'Manage Profile'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📅</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{language === 'ar' ? 'الحجوزات' : 'Bookings'}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'متابعة طلبات الحجز والجولات' : 'Track booking requests and tours'}</p>
                      <div className="mt-auto">
                        <Link href="/bookings">
                          <Button size="sm" variant="secondary" className="w-full min-w-[160px]" data-testid="button-view-bookings">
                            {language === 'ar' ? 'عرض الحجوزات' : 'View Bookings'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('messages')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'التواصل مع العملاء' : 'Communicate with customers'}</p>
                      <div className="mt-auto">
                        <Link href="/messages">
                          <Button size="sm" variant="outline" className="w-full min-w-[160px]" data-testid="button-guide-messages">
                            {language === 'ar' ? 'المحادثات' : 'Conversations'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('dashboard')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'إدارة المنصة والمحتوى' : 'Manage platform and content'}</p>
                      <div className="mt-auto">
                        <Link href="/admin">
                          <Button size="sm" className="w-full min-w-[160px]" data-testid="button-admin-dashboard">
                            {t('adminDashboard')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🗺️</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('places')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'إدارة الوجهات والمعالم' : 'Manage destinations and landmarks'}</p>
                      <div className="mt-auto">
                        <Link href="/places">
                          <Button size="sm" variant="secondary" className="w-full min-w-[160px]" data-testid="button-manage-places">
                            {t('managePlaces')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="font-semibold mb-2 min-h-[24px]">{t('guides')}</h3>
                      <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{language === 'ar' ? 'إدارة المرشدين السياحيين' : 'Manage tour guides'}</p>
                      <div className="mt-auto">
                        <Link href="/guides">
                          <Button size="sm" variant="outline" className="w-full min-w-[160px]" data-testid="button-manage-guides">
                            {t('manageGuides')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Video Section - For logged in users */}
      {user && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{t('welcomeTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'ar' ? 'تمتع بمشاهدة أروع المناظر الطبيعية والمعالم السياحية في منطقة الباحة' : 'Enjoy watching the most beautiful natural landscapes and tourist attractions in AlBaha region'}
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
                  <source src={newHeroVideo} type="video/mp4" />
                  {language === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو' : 'Your browser does not support video playback'}
                </video>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Places */}
      {recentPlaces.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">{language === 'ar' ? 'أحدث الأماكن السياحية' : 'Latest Tourist Places'}</h2>
              <Link href="/places">
                <Button variant="outline" size="sm" data-testid="button-view-all-places">
                  {language === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {recentPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Guides */}
      {topGuides.length > 0 && (
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">{language === 'ar' ? 'أفضل المرشدين السياحيين' : 'Top Tour Guides'}</h2>
              <Link href="/guides">
                <Button variant="outline" size="sm" data-testid="button-view-all-guides">
                  {language === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {topGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Bookings for Tourist/Guide */}
      {user?.role !== 'admin' && recentBookings.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {user?.role === 'tourist' ? 'حجوزاتك الأخيرة' : 'الحجوزات الحديثة'}
            </h2>
            
            <div className="grid gap-4">
              {recentBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold mb-2" data-testid={`text-booking-${booking.id}`}>
                          {language === 'ar' ? `حجز رقم: ${booking.id.slice(-6)}` : `Booking #${booking.id.slice(-6)}`}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {language === 'ar' 
                            ? `📅 من ${new Date(booking.startDate).toLocaleDateString('ar-SA')} إلى ${new Date(booking.endDate).toLocaleDateString('ar-SA')}`
                            : `📅 From ${new Date(booking.startDate).toLocaleDateString('en-US')} to ${new Date(booking.endDate).toLocaleDateString('en-US')}`}
                        </p>
                        {booking.timeSlot && (
                          <p className="text-muted-foreground text-sm">
                            {language === 'ar' ? `🕐 الوقت: ${booking.timeSlot}` : `🕐 Time: ${booking.timeSlot}`}
                          </p>
                        )}
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                          booking.status === 'pending' ? 'bg-secondary/10 text-secondary' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {language === 'ar' 
                            ? (booking.status === 'confirmed' ? 'مؤكد' :
                               booking.status === 'pending' ? 'في الانتظار' :
                               booking.status === 'completed' ? 'مكتمل' : 'ملغي')
                            : (booking.status === 'confirmed' ? 'Confirmed' :
                               booking.status === 'pending' ? 'Pending' :
                               booking.status === 'completed' ? 'Completed' : 'Cancelled')}
                        </span>
                        <p className="text-sm font-semibold mt-2">
                          💰 {booking.totalAmount || '0'} {language === 'ar' ? 'ر.س' : 'SAR'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {booking.paymentMethod === 'bank_transfer' 
                            ? (language === 'ar' ? '🏦 تحويل بنكي' : '🏦 Bank Transfer')
                            : (language === 'ar' ? '💵 كاش' : '💵 Cash')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
