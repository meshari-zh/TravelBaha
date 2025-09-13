import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import PlaceCard from "@/components/place-card";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Place, Guide, Booking } from "@shared/schema";
import heroVideo from "@assets/واجهت الموقع_1757794048716.mp4";
import videoPoster from "@assets/رغدان_1757793151105.jpg";

export default function Home() {
  const { user } = useAuth();
  
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
      
      {/* Welcome Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              أهلاً وسهلاً {user?.firstName || "بك"}!
            </h1>
            <p className="text-lg text-muted-foreground">
              {user?.role === 'tourist' && "اكتشف جمال الباحة مع أفضل المرشدين السياحيين"}
              {user?.role === 'guide' && "مرحباً بك في لوحة التحكم الخاصة بك"}
              {user?.role === 'admin' && "مرحباً بك في لوحة تحكم المشرف"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {user?.role === 'tourist' && (
              <>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <h3 className="font-semibold mb-2">استكشف الأماكن</h3>
                    <p className="text-sm text-muted-foreground mb-4">اكتشف أجمل الوجهات السياحية في الباحة</p>
                    <Link href="/places">
                      <Button size="sm" className="w-full" data-testid="button-explore-places">
                        تصفح الأماكن
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👨‍🏫</span>
                    </div>
                    <h3 className="font-semibold mb-2">اختر مرشدك</h3>
                    <p className="text-sm text-muted-foreground mb-4">تعرف على المرشدين المحليين الخبراء</p>
                    <Link href="/guides">
                      <Button size="sm" variant="secondary" className="w-full" data-testid="button-find-guides">
                        البحث عن مرشد
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="font-semibold mb-2">الرسائل</h3>
                    <p className="text-sm text-muted-foreground mb-4">تواصل مع المرشدين واحجز رحلتك</p>
                    <Link href="/messages">
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-view-messages">
                        المحادثات
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            {user?.role === 'guide' && (
              <>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h3 className="font-semibold mb-2">الملف الشخصي</h3>
                    <p className="text-sm text-muted-foreground mb-4">إدارة معلوماتك وتخصصاتك</p>
                    <Link href="/dashboard">
                      <Button size="sm" className="w-full" data-testid="button-manage-profile">
                        إدارة الملف
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📅</span>
                    </div>
                    <h3 className="font-semibold mb-2">الحجوزات</h3>
                    <p className="text-sm text-muted-foreground mb-4">متابعة طلبات الحجز والجولات</p>
                    <Button size="sm" variant="secondary" className="w-full" data-testid="button-view-bookings">
                      عرض الحجوزات
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="font-semibold mb-2">الرسائل</h3>
                    <p className="text-sm text-muted-foreground mb-4">التواصل مع العملاء</p>
                    <Link href="/messages">
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-guide-messages">
                        المحادثات
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h3 className="font-semibold mb-2">لوحة التحكم</h3>
                    <p className="text-sm text-muted-foreground mb-4">إدارة المنصة والمحتوى</p>
                    <Link href="/admin">
                      <Button size="sm" className="w-full" data-testid="button-admin-dashboard">
                        لوحة الإدارة
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <h3 className="font-semibold mb-2">الأماكن السياحية</h3>
                    <p className="text-sm text-muted-foreground mb-4">إدارة الوجهات والمعالم</p>
                    <Link href="/places">
                      <Button size="sm" variant="secondary" className="w-full" data-testid="button-manage-places">
                        إدارة الأماكن
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="font-semibold mb-2">المرشدين</h3>
                    <p className="text-sm text-muted-foreground mb-4">إدارة المرشدين السياحيين</p>
                    <Link href="/guides">
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-manage-guides">
                        إدارة المرشدين
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

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

      {/* Recent Places */}
      {recentPlaces.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">أحدث الأماكن السياحية</h2>
              <Link href="/places">
                <Button variant="outline" size="sm" data-testid="button-view-all-places">
                  عرض الكل
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
              <h2 className="text-2xl font-bold text-foreground">أفضل المرشدين السياحيين</h2>
              <Link href="/guides">
                <Button variant="outline" size="sm" data-testid="button-view-all-guides">
                  عرض الكل
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
                          حجز رقم: {booking.id.slice(-6)}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          من {new Date(booking.startDate).toLocaleDateString('ar-SA')} 
                          إلى {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                          booking.status === 'pending' ? 'bg-secondary/10 text-secondary' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {booking.status === 'confirmed' ? 'مؤكد' :
                           booking.status === 'pending' ? 'في الانتظار' :
                           booking.status === 'completed' ? 'مكتمل' :
                           'ملغي'}
                        </span>
                        <p className="text-sm font-semibold mt-2">
                          {booking.totalAmount} ر.س
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
