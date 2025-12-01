import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Search, Filter, Calendar as CalendarIcon, Users, Star, Gift } from "lucide-react";
import { z } from "zod";
import type { Guide } from "@shared/schema";

const getBookingFormSchema = (language: 'ar' | 'en') => z.object({
  startDate: z.date({
    required_error: language === 'ar' ? "يرجى تحديد تاريخ البداية" : "Please select a start date",
  }),
  endDate: z.date({
    required_error: language === 'ar' ? "يرجى تحديد تاريخ النهاية" : "Please select an end date",
  }),
  guests: z.coerce.number()
    .min(1, language === 'ar' ? "يجب أن يكون عدد الضيوف على الأقل 1" : "At least 1 guest is required")
    .max(50, language === 'ar' ? "الحد الأقصى 50 ضيف" : "Maximum 50 guests"),
  notes: z.string().optional(),
});

type BookingFormData = {
  startDate: Date;
  endDate: Date;
  guests: number;
  notes?: string;
};

export default function Guides() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const bookingFormSchema = getBookingFormSchema(language);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guests: 2,
      notes: "",
    },
  });

  const { data: guides = [], isLoading, error } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const bookingMutation = useMutation({
    mutationFn: (data: BookingFormData) => 
      apiRequest("POST", "/api/bookings", {
        guideId: selectedGuide?.id,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        notes: data.notes || "",
        totalAmount: "0",
      }),
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم إرسال طلب الحجز!" : "Booking Request Sent!",
        description: language === 'ar' ? "سيتم التواصل معك قريباً لتأكيد الحجز" : "We will contact you soon to confirm the booking",
      });
      form.reset();
      setIsBookingDialogOpen(false);
      setSelectedGuide(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ في إرسال الطلب" : "Request Error",
        description: error.message || (language === 'ar' ? "حدث خطأ أثناء إرسال طلب الحجز" : "An error occurred while sending the booking request"),
        variant: "destructive",
      });
    },
  });

  const handleBookGuide = (guide: Guide) => {
    if (!user) {
      setSelectedGuide(guide);
      setIsBookingDialogOpen(true);
      return;
    }
    if (user.role !== 'tourist') {
      toast({
        title: language === 'ar' ? "غير مسموح" : "Not Allowed",
        description: language === 'ar' ? "الحجز متاح للسياح فقط" : "Booking is only available for tourists",
        variant: "destructive",
      });
      return;
    }
    setSelectedGuide(guide);
    setIsBookingDialogOpen(true);
  };

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const getGuideDisplayName = (guide: Guide) => {
    if (!guide.user) return language === 'ar' ? 'مرشد سياحي' : 'Tour Guide';
    return [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ') || guide.user.email || (language === 'ar' ? 'مرشد سياحي' : 'Tour Guide');
  };

  const getGuideInitials = (guide: Guide) => {
    if (!guide.user) return language === 'ar' ? 'م' : 'G';
    const firstName = guide.user.firstName || '';
    const lastName = guide.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || guide.user.email?.charAt(0).toUpperCase() || (language === 'ar' ? 'م' : 'G');
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-semibold mb-2">{t('error')}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'حدث خطأ أثناء تحميل المرشدين السياحيين' : 'Error loading tourist guides'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract unique specialties and languages
  const allSpecialties = Array.from(new Set(guides.flatMap(guide => guide.specialties || [])));
  const allLanguages = Array.from(new Set(guides.flatMap(guide => guide.languages || [])));

  // Filter and sort guides
  const filteredGuides = guides
    .filter(guide => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        [guide.user?.firstName, guide.user?.lastName, guide.bio]
          .some(value => (value ?? "").toLowerCase().includes(searchTermLower));
      
      const matchesSpecialty = !selectedSpecialty || selectedSpecialty === "all" || 
        guide.specialties?.includes(selectedSpecialty);
      
      const matchesLanguage = !selectedLanguage || selectedLanguage === "all" || 
        guide.languages?.includes(selectedLanguage);
      
      return matchesSearch && matchesSpecialty && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
        case "price_low":
          return (parseFloat(a.dailyRate || "0") - parseFloat(b.dailyRate || "0"));
        case "price_high":
          return (parseFloat(b.dailyRate || "0") - parseFloat(a.dailyRate || "0"));
        case "reviews":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('guidesTitle')}</h1>
          <p className="text-lg text-muted-foreground">{t('guidesSubtitle')}</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('searchGuides')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-guides"
                />
              </div>

              {/* Specialty Filter */}
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger data-testid="select-specialty">
                  <SelectValue placeholder={language === 'ar' ? 'التخصص: الكل' : 'Specialty: All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  {allSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Language Filter */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue placeholder={language === 'ar' ? 'اللغة: الكل' : 'Language: All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  {allLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}</SelectItem>
                  <SelectItem value="price_low">{language === 'ar' ? 'السعر من الأقل للأعلى' : 'Price Low to High'}</SelectItem>
                  <SelectItem value="price_high">{language === 'ar' ? 'السعر من الأعلى للأقل' : 'Price High to Low'}</SelectItem>
                  <SelectItem value="reviews">{language === 'ar' ? 'الأكثر تقييماً' : 'Most Reviews'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {((selectedSpecialty && selectedSpecialty !== "all") || (selectedLanguage && selectedLanguage !== "all") || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
{language === 'ar' ? 'البحث:' : 'Search:'} {searchTerm}
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="text-xs hover:text-foreground"
                      data-testid="button-clear-search"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedSpecialty && selectedSpecialty !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedSpecialty}
                    <button 
                      onClick={() => setSelectedSpecialty("all")}
                      className="text-xs hover:text-foreground"
                      data-testid="button-clear-specialty"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedLanguage && selectedLanguage !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedLanguage}
                    <button 
                      onClick={() => setSelectedLanguage("all")}
                      className="text-xs hover:text-foreground"
                      data-testid="button-clear-language"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialty("all");
                    setSelectedLanguage("all");
                  }}
                  data-testid="button-clear-all-filters"
                >
{language === 'ar' ? 'مسح الكل' : 'Clear All'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
{language === 'ar' ? 
              `عرض ${filteredGuides.length} من ${guides.length} مرشد سياحي` : 
              `Showing ${filteredGuides.length} of ${guides.length} tourist guides`
            }
          </p>
        </div>

        {/* Guides Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="flex gap-1 mb-3">
                    <div className="h-5 w-12 bg-muted rounded"></div>
                    <div className="h-5 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGuides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا يوجد مرشدين' : 'No Guides Found'}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSpecialty || selectedLanguage 
                  ? (language === 'ar' ? 'لم يتم العثور على مرشدين يطابقون البحث' : 'No guides found matching your search criteria')
                  : (language === 'ar' ? 'لا يوجد مرشدين سياحيين متاحين حالياً' : 'No tourist guides are currently available')}
              </p>
              {(searchTerm || selectedSpecialty || selectedLanguage) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialty("");
                    setSelectedLanguage("");
                  }}
                  data-testid="button-reset-filters"
                >
{language === 'ar' ? 'إعادة تعيين البحث' : 'Reset Search'}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard 
                key={guide.id} 
                guide={guide} 
                showContactButton={user?.role === 'tourist'}
                showBookButton={!user || user?.role === 'tourist'}
                onBook={handleBookGuide}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={(open) => {
        setIsBookingDialogOpen(open);
        if (!open) {
          setSelectedGuide(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedGuide && (
                <>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedGuide.user?.profileImageUrl || undefined} />
                    <AvatarFallback>{getGuideInitials(selectedGuide)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{language === 'ar' ? 'احجز مع' : 'Book with'} {getGuideDisplayName(selectedGuide)}</span>
                    {selectedGuide.dailyRate && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-normal text-secondary">
                          {selectedGuide.dailyRate} {language === 'ar' ? 'ر.س/يوم' : 'SAR/day'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">
                            {selectedGuide.rating ? parseFloat(selectedGuide.rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {!user 
                ? (language === 'ar' 
                    ? 'سجل دخولك لإتمام الحجز والحصول على خصم 5% على أول حجز!'
                    : 'Login to complete your booking and get 5% off your first booking!')
                : (language === 'ar' 
                    ? 'أدخل تفاصيل الحجز الخاصة بك وسنتواصل معك لتأكيد الحجز'
                    : 'Enter your booking details and we will contact you to confirm the booking')}
            </DialogDescription>
          </DialogHeader>
          
          {!user ? (
            <div className="flex flex-col items-center py-8">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <Gift className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">
                {language === 'ar' ? 'سجل دخول لتحصل على خصم 5%' : 'Login to get 5% off'}
              </h3>
              <p className="text-muted-foreground text-center text-sm mb-6">
                {language === 'ar' 
                  ? 'أنشئ حسابك الآن واستمتع بخصم حصري على أول حجز لك'
                  : 'Create your account now and enjoy an exclusive discount on your first booking'}
              </p>
              <div className="flex gap-3 w-full">
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="dialog-button-login"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    setSelectedGuide(null);
                  }}
                  data-testid="dialog-button-cancel-login"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
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
                    <FormLabel>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="dialog-input-start-date"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{language === 'ar' ? 'اختر التاريخ' : 'Select date'}</span>
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
                    <FormLabel>{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="dialog-input-end-date"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{language === 'ar' ? 'اختر التاريخ' : 'Select date'}</span>
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
                    <FormLabel>{language === 'ar' ? 'عدد الضيوف' : 'Number of Guests'}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          className="pr-10"
                          data-testid="dialog-input-guests"
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
                    <FormLabel>{language === 'ar' ? 'ملاحظات خاصة (اختياري)' : 'Special Notes (Optional)'}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === 'ar' ? "أي ملاحظات أو طلبات خاصة للمرشد..." : "Any special notes or requests for the guide..."}
                        className="resize-none"
                        data-testid="dialog-input-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={bookingMutation.isPending}
                  data-testid="dialog-button-submit-booking"
                >
                  {bookingMutation.isPending 
                    ? (language === 'ar' ? "جاري الإرسال..." : "Sending...") 
                    : (language === 'ar' ? "إرسال طلب الحجز" : "Submit Booking")}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    setSelectedGuide(null);
                    form.reset();
                  }}
                  data-testid="dialog-button-cancel-booking"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
