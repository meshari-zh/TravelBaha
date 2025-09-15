import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, DollarSign, MessageCircle, Plus, X } from "lucide-react";
import type { Guide, InsertGuide, Booking, Review } from "@shared/schema";

export default function GuideDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  // Redirect non-guide users
  if (user?.role !== 'guide') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">غير مصرح</h2>
              <p className="text-muted-foreground">هذه الصفحة مخصصة للمرشدين السياحيين فقط</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: guide, isLoading: guideLoading } = useQuery<Guide>({
    queryKey: ["/api/guides/user", user?.id],
    retry: false,
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!guide,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews/guide", guide?.id],
    enabled: !!guide?.id,
  });

  // Statistics
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalEarnings: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0),
    averageRating: guide?.rating ? parseFloat(guide.rating) : 0,
    totalReviews: guide?.reviewCount || 0,
  };

  const createGuideMutation = useMutation({
    mutationFn: async (data: InsertGuide) => {
      await apiRequest("POST", "/api/guides", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides/user", user?.id] });
      toast({
        title: "تم إنشاء الملف الشخصي",
        description: "تم إنشاء ملفك الشخصي كمرشد سياحي بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const updateGuideMutation = useMutation({
    mutationFn: async (data: Partial<InsertGuide>) => {
      await apiRequest("PUT", `/api/guides/${guide?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides/user", user?.id] });
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "تم تحديث الحجز",
        description: "تم تحديث حالة الحجز بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحجز",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertGuide = {
      userId: user!.id,
      bio: formData.get("bio") as string,
      specialties: guide?.specialties || [],
      languages: guide?.languages || [],
      dailyRate: formData.get("dailyRate") as string,
    };

    if (guide) {
      updateGuideMutation.mutate(data);
    } else {
      createGuideMutation.mutate(data);
    }
  };

  const addSpecialty = () => {
    if (!specialtyInput.trim()) return;
    const currentSpecialties = guide?.specialties || [];
    if (!currentSpecialties.includes(specialtyInput.trim())) {
      updateGuideMutation.mutate({
        specialties: [...currentSpecialties, specialtyInput.trim()],
      });
    }
    setSpecialtyInput("");
  };

  const removeSpecialty = (specialty: string) => {
    const currentSpecialties = guide?.specialties || [];
    updateGuideMutation.mutate({
      specialties: currentSpecialties.filter(s => s !== specialty),
    });
  };

  const addLanguage = () => {
    if (!languageInput.trim()) return;
    const currentLanguages = guide?.languages || [];
    if (!currentLanguages.includes(languageInput.trim())) {
      updateGuideMutation.mutate({
        languages: [...currentLanguages, languageInput.trim()],
      });
    }
    setLanguageInput("");
  };

  const removeLanguage = (language: string) => {
    const currentLanguages = guide?.languages || [];
    updateGuideMutation.mutate({
      languages: currentLanguages.filter(l => l !== language),
    });
  };

  const updateBookingStatus = (bookingId: string, status: string) => {
    updateBookingMutation.mutate({ id: bookingId, status });
  };

  const getUserDisplayName = () => {
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'مرشد سياحي';
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'م';
  };

  if (guideLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="guide-display-name">
              {getUserDisplayName()}
            </h1>
            <p className="text-muted-foreground">مرشد سياحي في منطقة الباحة</p>
            {guide && (
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium" data-testid="guide-rating">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">({stats.totalReviews} تقييم)</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-total-bookings">{stats.totalBookings}</h3>
              <p className="text-muted-foreground">إجمالي الحجوزات</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-pending-bookings">{stats.pendingBookings}</h3>
              <p className="text-muted-foreground">حجوزات في الانتظار</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-completed-bookings">{stats.completedBookings}</h3>
              <p className="text-muted-foreground">جولات مكتملة</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-total-earnings">{stats.totalEarnings.toFixed(2)} ر.س</h3>
              <p className="text-muted-foreground">إجمالي الأرباح</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">التقييمات</TabsTrigger>
          </TabsList>

          {/* Profile Management */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الملف الشخصي</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="bio">نبذة عني</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="اكتب نبذة عن خبرتك ومعرفتك بمنطقة الباحة..."
                      defaultValue={guide?.bio || ""}
                      data-testid="input-bio"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dailyRate">السعر اليومي (ريال سعودي)</Label>
                    <Input
                      id="dailyRate"
                      name="dailyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="مثال: 250.00"
                      defaultValue={guide?.dailyRate || ""}
                      data-testid="input-daily-rate"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={createGuideMutation.isPending || updateGuideMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {createGuideMutation.isPending || updateGuideMutation.isPending ? 'جاري الحفظ...' : 
                     guide ? 'تحديث الملف الشخصي' : 'إنشاء الملف الشخصي'}
                  </Button>
                </form>
                
                <Separator />
                
                {/* Specialties */}
                <div>
                  <Label>التخصصات</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {guide?.specialties?.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <button 
                          onClick={() => removeSpecialty(specialty)}
                          className="hover:text-destructive"
                          data-testid={`remove-specialty-${specialty}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      placeholder="أضف تخصص جديد..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      data-testid="input-specialty"
                    />
                    <Button type="button" size="sm" onClick={addSpecialty} data-testid="button-add-specialty">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Languages */}
                <div>
                  <Label>اللغات</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {guide?.languages?.map((language) => (
                      <Badge key={language} variant="outline" className="flex items-center gap-1">
                        {language}
                        <button 
                          onClick={() => removeLanguage(language)}
                          className="hover:text-destructive"
                          data-testid={`remove-language-${language}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="أضف لغة جديدة..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      data-testid="input-language"
                    />
                    <Button type="button" size="sm" onClick={addLanguage} data-testid="button-add-language">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Management */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الحجوزات</CardTitle>
              </CardHeader>
              
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">لا توجد حجوزات</h3>
                    <p className="text-muted-foreground">ستظهر هنا الحجوزات المطلوبة من السياح</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1" data-testid={`booking-id-${booking.id}`}>
                                حجز رقم: {booking.id.slice(-6)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                من {new Date(booking.startDate).toLocaleDateString('ar-SA')} 
                                إلى {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                              </p>
                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  ملاحظات: {booking.notes}
                                </p>
                              )}
                              <p className="text-sm font-semibold mt-2" data-testid={`booking-amount-${booking.id}`}>
                                المبلغ: {booking.totalAmount} ر.س
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Badge 
                                variant={
                                  booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'pending' ? 'secondary' :
                                  booking.status === 'completed' ? 'outline' :
                                  'destructive'
                                }
                                data-testid={`booking-status-${booking.id}`}
                              >
                                {booking.status === 'confirmed' ? 'مؤكد' :
                                 booking.status === 'pending' ? 'في الانتظار' :
                                 booking.status === 'completed' ? 'مكتمل' :
                                 'ملغي'}
                              </Badge>
                              
                              {booking.status === 'pending' && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    data-testid={`button-confirm-${booking.id}`}
                                  >
                                    قبول
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                    data-testid={`button-cancel-${booking.id}`}
                                  >
                                    رفض
                                  </Button>
                                </div>
                              )}
                              
                              {booking.status === 'confirmed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  data-testid={`button-complete-${booking.id}`}
                                >
                                  تم الانتهاء
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>التقييمات والمراجعات</CardTitle>
              </CardHeader>
              
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">لا توجد تقييمات</h3>
                    <p className="text-muted-foreground">ستظهر هنا تقييمات السياح بعد إكمال الجولات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                              <span className="font-medium mr-2" data-testid={`review-rating-${review.id}`}>
                                {review.rating}/5
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt!).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                              {review.comment}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
