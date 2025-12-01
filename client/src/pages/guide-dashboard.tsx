import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
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
import type { Guide, InsertGuide, Booking, Review, User } from "@shared/schema";
import { Link } from "wouter";

type BookingWithTourist = Booking & { tourist?: User };

export default function GuideDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
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
              <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'غير مصرح' : 'Unauthorized'}</h2>
              <p className="text-muted-foreground">{language === 'ar' ? 'هذه الصفحة مخصصة للمرشدين السياحيين فقط' : 'This page is only for tour guides'}</p>
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

  const { data: bookings = [] } = useQuery<BookingWithTourist[]>({
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
        title: language === 'ar' ? "تم إنشاء الملف الشخصي" : "Profile Created",
        description: language === 'ar' ? "تم إنشاء ملفك الشخصي كمرشد سياحي بنجاح" : "Your tour guide profile has been created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: language === 'ar' ? "غير مصرح" : "Unauthorized",
          description: language === 'ar' ? "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى..." : "You have been logged out. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إنشاء الملف الشخصي" : "Failed to create profile",
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
        title: language === 'ar' ? "تم تحديث الملف الشخصي" : "Profile Updated",
        description: language === 'ar' ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: language === 'ar' ? "غير مصرح" : "Unauthorized",
          description: language === 'ar' ? "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى..." : "You have been logged out. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث الملف الشخصي" : "Failed to update profile",
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
        title: language === 'ar' ? "تم تحديث الحجز" : "Booking Updated",
        description: language === 'ar' ? "تم تحديث حالة الحجز بنجاح" : "Booking status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: language === 'ar' ? "غير مصرح" : "Unauthorized",
          description: language === 'ar' ? "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى..." : "You have been logged out. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث الحجز" : "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertGuide = {
      userId: user!.id,
      name: formData.get("name") as string,
      nameEn: formData.get("nameEn") as string,
      bio: formData.get("bio") as string,
      bioEn: formData.get("bioEn") as string,
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
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || (language === 'ar' ? 'مرشد سياحي' : 'Tour Guide');
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user?.email?.charAt(0).toUpperCase() || (language === 'ar' ? 'م' : 'G');
  };

  if (guideLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
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
            <p className="text-muted-foreground">{language === 'ar' ? 'مرشد سياحي في منطقة الباحة' : 'Tour Guide in AlBaha Region'}</p>
            {guide && (
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium" data-testid="guide-rating">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">({stats.totalReviews} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
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
              <p className="text-muted-foreground">{language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-pending-bookings">{stats.pendingBookings}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'حجوزات في الانتظار' : 'Pending Bookings'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-completed-bookings">{stats.completedBookings}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'جولات مكتملة' : 'Completed Tours'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-total-earnings">{stats.totalEarnings.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 px-1 sm:px-3" data-testid="tab-profile">
              {language === 'ar' ? 'الملف' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm py-2 px-1 sm:px-3" data-testid="tab-bookings">
              {language === 'ar' ? 'الحجوزات' : 'Bookings'}
              {stats.pendingBookings > 0 && (
                <Badge variant="destructive" className="mr-1 sm:mr-2 text-[10px] px-1">{stats.pendingBookings}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 px-1 sm:px-3" data-testid="tab-reviews">
              {language === 'ar' ? 'التقييمات' : 'Reviews'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Management */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'إدارة الملف الشخصي' : 'Profile Management'}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Arabic Name & Bio */}
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-3 text-primary">{language === 'ar' ? 'المعلومات بالعربية' : 'Arabic Information'}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">{language === 'ar' ? 'الاسم بالعربية' : 'Name in Arabic'}</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder={language === 'ar' ? "مثال: أحمد محمد" : "Example: أحمد محمد"}
                          defaultValue={guide?.name || ""}
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">{language === 'ar' ? 'نبذة عني بالعربية' : 'About Me in Arabic'}</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder={language === 'ar' ? "اكتب نبذة عن خبرتك ومعرفتك بمنطقة الباحة..." : "Write about your experience in Arabic..."}
                          defaultValue={guide?.bio || ""}
                          data-testid="input-bio"
                        />
                      </div>
                    </div>
                  </div>

                  {/* English Name & Bio */}
                  <div className="p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/30">
                    <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">{language === 'ar' ? 'المعلومات بالإنجليزية' : 'English Information'}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="nameEn">{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name in English'}</Label>
                        <Input
                          id="nameEn"
                          name="nameEn"
                          placeholder="Example: Ahmed Mohammed"
                          defaultValue={guide?.nameEn || ""}
                          data-testid="input-name-en"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bioEn">{language === 'ar' ? 'نبذة عني بالإنجليزية' : 'About Me in English'}</Label>
                        <Textarea
                          id="bioEn"
                          name="bioEn"
                          placeholder="Write about your experience and knowledge of AlBaha region..."
                          defaultValue={guide?.bioEn || ""}
                          data-testid="input-bio-en"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="dailyRate">{language === 'ar' ? 'السعر اليومي (ريال سعودي)' : 'Daily Rate (SAR)'}</Label>
                    <Input
                      id="dailyRate"
                      name="dailyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={language === 'ar' ? "مثال: 250.00" : "Example: 250.00"}
                      defaultValue={guide?.dailyRate || ""}
                      data-testid="input-daily-rate"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={createGuideMutation.isPending || updateGuideMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {createGuideMutation.isPending || updateGuideMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : 
                     guide ? (language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile') : (language === 'ar' ? 'إنشاء الملف الشخصي' : 'Create Profile')}
                  </Button>
                </form>
                
                <Separator />
                
                {/* Specialties */}
                <div>
                  <Label>{language === 'ar' ? 'التخصصات' : 'Specialties'}</Label>
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
                      placeholder={language === 'ar' ? "أضف تخصص جديد..." : "Add new specialty..."}
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
                  <Label>{language === 'ar' ? 'اللغات' : 'Languages'}</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {guide?.languages?.map((lang) => (
                      <Badge key={lang} variant="outline" className="flex items-center gap-1">
                        {lang}
                        <button 
                          onClick={() => removeLanguage(lang)}
                          className="hover:text-destructive"
                          data-testid={`remove-language-${lang}`}
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
                      placeholder={language === 'ar' ? "أضف لغة جديدة..." : "Add new language..."}
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
                <CardTitle>{language === 'ar' ? 'إدارة الحجوزات' : 'Bookings Management'}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا توجد حجوزات' : 'No Bookings'}</h3>
                    <p className="text-muted-foreground">{language === 'ar' ? 'ستظهر هنا الحجوزات المطلوبة من السياح' : 'Booking requests from tourists will appear here'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Tourist Info */}
                            {booking.tourist && (
                              <div className="flex items-center gap-3 p-2 bg-muted rounded-lg flex-wrap">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={booking.tourist.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-sm">
                                    {(booking.tourist.firstName?.charAt(0) || '') + (booking.tourist.lastName?.charAt(0) || '') || booking.tourist.email?.charAt(0) || 'س'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate" data-testid={`tourist-name-${booking.id}`}>
                                    {[booking.tourist.firstName, booking.tourist.lastName].filter(Boolean).join(' ') || booking.tourist.email || (language === 'ar' ? 'سائح' : 'Tourist')}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{booking.tourist.email}</p>
                                </div>
                                <Link href={`/messages?userId=${booking.touristId}`}>
                                  <Button size="sm" variant="outline" className="flex items-center gap-1" data-testid={`contact-tourist-${booking.id}`}>
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'ar' ? 'تواصل' : 'Contact'}</span>
                                  </Button>
                                </Link>
                              </div>
                            )}
                            
                            {/* Booking Details */}
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-semibold" data-testid={`booking-id-${booking.id}`}>
                                  {language === 'ar' ? `حجز رقم: ${booking.id.slice(-6)}` : `Booking #${booking.id.slice(-6)}`}
                                </h4>
                                <Badge 
                                  variant={
                                    booking.status === 'confirmed' ? 'default' :
                                    booking.status === 'pending' ? 'secondary' :
                                    booking.status === 'completed' ? 'outline' :
                                    'destructive'
                                  }
                                  data-testid={`booking-status-${booking.id}`}
                                >
                                  {language === 'ar' 
                                    ? (booking.status === 'confirmed' ? 'مؤكد' :
                                       booking.status === 'pending' ? 'في الانتظار' :
                                       booking.status === 'completed' ? 'مكتمل' : 'ملغي')
                                    : (booking.status === 'confirmed' ? 'Confirmed' :
                                       booking.status === 'pending' ? 'Pending' :
                                       booking.status === 'completed' ? 'Completed' : 'Cancelled')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' 
                                  ? `📅 من ${new Date(booking.startDate).toLocaleDateString('ar-SA')} إلى ${new Date(booking.endDate).toLocaleDateString('ar-SA')}`
                                  : `📅 From ${new Date(booking.startDate).toLocaleDateString('en-US')} to ${new Date(booking.endDate).toLocaleDateString('en-US')}`}
                              </p>
                              {booking.timeSlot && (
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? `🕐 الوقت: ${booking.timeSlot}` : `🕐 Time: ${booking.timeSlot}`}
                                </p>
                              )}
                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {language === 'ar' ? `ملاحظات: ${booking.notes}` : `Notes: ${booking.notes}`}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <p className="text-sm font-semibold" data-testid={`booking-amount-${booking.id}`}>
                                  {language === 'ar' ? `💰 المبلغ: ${booking.totalAmount || '0'} ر.س` : `💰 Amount: ${booking.totalAmount || '0'} SAR`}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {booking.paymentMethod === 'bank_transfer' 
                                    ? (language === 'ar' ? '🏦 تحويل بنكي' : '🏦 Bank Transfer')
                                    : (language === 'ar' ? '💵 كاش' : '💵 Cash')}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Action Buttons - Always visible */}
                            {booking.status === 'pending' && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <Button 
                                  size="default"
                                  className="flex-1 min-w-[100px]"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  data-testid={`button-confirm-${booking.id}`}
                                >
                                  {language === 'ar' ? 'قبول الحجز' : 'Accept Booking'}
                                </Button>
                                <Button 
                                  size="default"
                                  variant="destructive"
                                  className="flex-1 min-w-[100px]"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  data-testid={`button-cancel-${booking.id}`}
                                >
                                  {language === 'ar' ? 'رفض الحجز' : 'Reject Booking'}
                                </Button>
                              </div>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <div className="pt-2 border-t">
                                <Button 
                                  size="default"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  data-testid={`button-complete-${booking.id}`}
                                >
                                  {language === 'ar' ? 'تم الانتهاء من الجولة' : 'Mark Tour Complete'}
                                </Button>
                              </div>
                            )}
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
                <CardTitle>{language === 'ar' ? 'التقييمات والمراجعات' : 'Ratings & Reviews'}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا توجد تقييمات' : 'No Reviews'}</h3>
                    <p className="text-muted-foreground">{language === 'ar' ? 'ستظهر هنا تقييمات السياح بعد إكمال الجولات' : 'Tourist reviews will appear here after completing tours'}</p>
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
                              {new Date(review.createdAt!).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
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
