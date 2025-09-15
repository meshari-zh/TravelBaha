import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Star, Calendar as CalendarIcon, Users, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guide, Review } from "@shared/schema";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

const bookingFormSchema = z.object({
  startDate: z.date({
    required_error: "يرجى تحديد تاريخ البداية",
  }),
  endDate: z.date({
    required_error: "يرجى تحديد تاريخ النهاية",
  }),
  guests: z.coerce.number().min(1, "يجب أن يكون عدد الضيوف على الأقل 1").max(50, "الحد الأقصى 50 ضيف"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function GuideProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBookingForm, setShowBookingForm] = useState(false);

  const { data: guide, isLoading, error } = useQuery<Guide>({
    queryKey: ["/api/guides", id],
    queryFn: () => fetch(`/api/guides/${id}`).then(res => res.json()),
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/guide", id],
    enabled: !!id,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guests: 2,
      notes: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: (data: BookingFormData) => 
      apiRequest("POST", "/api/bookings", {
        guideId: id,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        notes: data.notes || "",
        totalAmount: "0",
      }),
    onSuccess: () => {
      toast({
        title: "تم إرسال طلب الحجز!",
        description: "سيتم التواصل معك قريباً لتأكيد الحجز",
      });
      form.reset();
      setShowBookingForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message || "حدث خطأ أثناء إرسال طلب الحجز",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const getUserDisplayName = () => {
    if (!guide?.user) return 'مرشد سياحي';
    return [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ') || guide.user.email || 'مرشد سياحي';
  };

  const getUserInitials = () => {
    if (!guide?.user) return 'م';
    const firstName = guide.user.firstName || '';
    const lastName = guide.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || guide.user.email?.charAt(0).toUpperCase() || 'م';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-96 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-semibold mb-2">المرشد غير موجود</h3>
              <p className="text-muted-foreground mb-4">لم يتم العثور على المرشد المطلوب</p>
              <Link href="/guides">
                <Button variant="outline">العودة للمرشدين</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/guides" className="hover:text-foreground">المرشدين السياحيين</Link>
          <ArrowRight className="w-4 h-4" />
          <span>{getUserDisplayName()}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Guide Profile */}
          <div className="md:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={guide.user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-4xl">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2" data-testid="guide-profile-name">
                      {getUserDisplayName()}
                    </h1>
                    
                    {guide.bio && (
                      <p className="text-muted-foreground mb-4" data-testid="guide-profile-bio">
                        {guide.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-semibold" data-testid="guide-profile-rating">
                          {guide.rating ? parseFloat(guide.rating).toFixed(1) : '0.0'}
                        </span>
                        <span className="text-muted-foreground">
                          ({guide.reviewCount || 0} تقييم)
                        </span>
                      </div>
                      
                      {guide.dailyRate && (
                        <div className="text-xl font-bold text-secondary" data-testid="guide-profile-rate">
                          {guide.dailyRate} ر.س/يوم
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {user?.role === 'tourist' && (
                        <>
                          <Button 
                            onClick={() => setShowBookingForm(true)}
                            data-testid="button-book-guide"
                          >
                            احجز الآن
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            تواصل
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            {guide.specialties && guide.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>التخصصات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>اللغات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>التقييمات والمراجعات</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">لا توجد تقييمات</h3>
                    <p className="text-muted-foreground">كن أول من يقيم هذا المرشد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-l-4 border-l-secondary">
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
          </div>

          {/* Booking Form */}
          <div>
            {user?.role === 'tourist' && (
              <Card>
                <CardHeader>
                  <CardTitle>احجز جولة</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showBookingForm ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        احجز جولة مع {getUserDisplayName()} واكتشف جمال الباحة
                      </p>
                      <Button 
                        onClick={() => setShowBookingForm(true)}
                        className="w-full"
                        data-testid="button-show-booking-form"
                      >
                        ابدأ الحجز
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Start Date */}
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاريخ البداية</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="input-start-date"
                                    >
                                      <CalendarIcon className="ml-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>اختر التاريخ</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* End Date */}
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاريخ النهاية</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="input-end-date"
                                    >
                                      <CalendarIcon className="ml-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>اختر التاريخ</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => 
                                      date < new Date() || 
                                      (form.getValues().startDate && date <= form.getValues().startDate)
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Guests */}
                        <FormField
                          control={form.control}
                          name="guests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عدد الضيوف</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="pr-10"
                                    data-testid="input-guests"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Special Requests */}
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ملاحظات خاصة (اختياري)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="أي ملاحظات أو طلبات خاصة للمرشد..."
                                  className="resize-none"
                                  data-testid="input-notes"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            className="flex-1"
                            disabled={bookingMutation.isPending}
                            data-testid="button-submit-booking"
                          >
                            {bookingMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الحجز"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowBookingForm(false)}
                            data-testid="button-cancel-booking"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}