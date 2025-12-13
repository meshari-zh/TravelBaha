import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import ReviewForm from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, MapPin, User, Clock, Star, AlertCircle } from "lucide-react";
import type { Booking } from "@shared/schema";

export default function Bookings() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => 
      apiRequest("PUT", `/api/bookings/${bookingId}`, {
        status: "cancelled"
      }),
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم إلغاء الحجز" : "Booking Cancelled",
        description: language === 'ar' ? "تم إلغاء حجزك بنجاح" : "Your booking has been cancelled successfully",
      });
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "فشل في إلغاء الحجز" : "Failed to cancel booking"),
        variant: "destructive",
      });
    },
  });

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id);
    }
  };

  const { data: bookings = [], isLoading, error } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case "confirmed": return "Confirmed";
        case "pending": return "Pending";
        case "completed": return "Completed";
        case "cancelled": return "Cancelled";
        default: return status;
      }
    }
    switch (status) {
      case "confirmed": return "مؤكد";
      case "pending": return "في الانتظار";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-semibold mb-2">{language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'حدث خطأ أثناء تحميل الحجوزات' : 'An error occurred while loading bookings'}</p>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{language === 'ar' ? 'حجوزاتي' : 'My Bookings'}</h1>
          <p className="text-lg text-muted-foreground">{language === 'ar' ? 'إدارة حجوزات الرحلات السياحية' : 'Manage your tour bookings'}</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                data-testid="filter-all"
              >
                {language === 'ar' ? 'جميع الحجوزات' : 'All Bookings'}
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                data-testid="filter-pending"
              >
                {language === 'ar' ? 'في الانتظار' : 'Pending'}
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("confirmed")}
                data-testid="filter-confirmed"
              >
                {language === 'ar' ? 'مؤكدة' : 'Confirmed'}
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                data-testid="filter-completed"
              >
                {language === 'ar' ? 'مكتملة' : 'Completed'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? `عرض ${filteredBookings.length} من ${bookings.length} حجز`
              : `Showing ${filteredBookings.length} of ${bookings.length} bookings`}
          </p>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا توجد حجوزات' : 'No Bookings'}</h3>
              <p className="text-muted-foreground mb-4" data-testid="empty-state-message">
                {filter === "all" 
                  ? (language === 'ar' ? 'لا يوجد لديك أي حجوزات حالياً' : 'You have no bookings at the moment')
                  : (language === 'ar' ? `لا توجد حجوزات ${getStatusText(filter)}` : `No ${getStatusText(filter).toLowerCase()} bookings`)}
              </p>
              <Button asChild>
                <a href="/guides" data-testid="button-browse-guides">
                  {language === 'ar' ? 'تصفح المرشدين' : 'Browse Guides'}
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="card-hover" data-testid={`booking-card-${booking.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg" data-testid={`booking-title-${booking.id}`}>
                      {language === 'ar' ? `رحلة سياحية - ${booking.id.slice(0, 8)}` : `Tour Trip - ${booking.id.slice(0, 8)}`}
                    </CardTitle>
                    <Badge 
                      variant={getStatusBadgeVariant(booking.status || "pending")}
                      data-testid={`booking-status-${booking.id}`}
                    >
                      {getStatusText(booking.status || "pending")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm" data-testid={`booking-dates-${booking.id}`}>
                          {new Date(booking.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(booking.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      {booking.timeSlot && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm" data-testid={`booking-time-${booking.id}`}>
                            {booking.timeSlot}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary" data-testid={`booking-amount-${booking.id}`}>
                        {language === 'ar' ? `💰 ${booking.totalAmount || '0'} ر.س` : `💰 ${booking.totalAmount || '0'} SAR`}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                    <span className="text-sm">
                      {language === 'ar' ? 'طريقة الدفع:' : 'Payment:'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {booking.paymentMethod === 'bank_transfer' 
                        ? (language === 'ar' ? '🏦 تحويل بنكي' : '🏦 Bank Transfer')
                        : (language === 'ar' ? '💵 كاش' : '💵 Cash')}
                    </Badge>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground" data-testid={`booking-notes-${booking.id}`}>
                        {language === 'ar' ? `ملاحظات: ${booking.notes}` : `Notes: ${booking.notes}`}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(booking)}
                      data-testid={`booking-details-${booking.id}`}
                    >
                      {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                    {booking.status === "pending" && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancelBooking(booking)}
                        data-testid={`booking-cancel-${booking.id}`}
                      >
                        {language === 'ar' ? 'إلغاء الحجز' : 'Cancel Booking'}
                      </Button>
                    )}
                    {booking.status === "completed" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex items-center gap-2"
                            data-testid={`booking-review-${booking.id}`}
                          >
                            <Star className="w-4 h-4" />
                            {language === 'ar' ? 'تقييم المرشد' : 'Rate Guide'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <ReviewForm
                            bookingId={booking.id}
                            guideId={booking.guideId}
                            guideName={language === 'ar' ? `المرشد - ${booking.guideId.slice(0, 8)}` : `Guide - ${booking.guideId.slice(0, 8)}`}
                            onSuccess={() => setSelectedBookingForReview(null)}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {language === 'ar' ? 'تأكيد إلغاء الحجز' : 'Confirm Cancellation'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          
          {bookingToCancel && (
            <div className="bg-muted/50 p-4 rounded-lg my-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(bookingToCancel.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(bookingToCancel.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ar' ? `رقم الحجز: ${bookingToCancel.id.slice(0, 8)}` : `Booking ID: ${bookingToCancel.id.slice(0, 8)}`}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setCancelDialogOpen(false);
                setBookingToCancel(null);
              }}
              data-testid="dialog-button-keep-booking"
            >
              {language === 'ar' ? 'الاحتفاظ بالحجز' : 'Keep Booking'}
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancelBooking}
              disabled={cancelBookingMutation.isPending}
              data-testid="dialog-button-confirm-cancel"
            >
              {cancelBookingMutation.isPending 
                ? (language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...') 
                : (language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'جميع تفاصيل حجزك' : 'All details about your booking'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking ID & Status */}
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'رقم الحجز' : 'Booking ID'}</p>
                  <p className="font-mono font-medium">{selectedBooking.id.slice(0, 8)}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedBooking.status || "pending")}>
                  {getStatusText(selectedBooking.status || "pending")}
                </Badge>
              </div>

              {/* Dates */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-medium">{language === 'ar' ? 'التواريخ' : 'Dates'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</p>
                    <p className="font-medium">{new Date(selectedBooking.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</p>
                    <p className="font-medium">{new Date(selectedBooking.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                </div>
                {selectedBooking.timeSlot && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedBooking.timeSlot}</span>
                    </div>
                  </div>
                )}
              </div>


              {/* Payment Info */}
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                    <p className="text-xl font-bold text-primary">
                      {selectedBooking.totalAmount || '0'} {language === 'ar' ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {selectedBooking.paymentMethod === 'bank_transfer' 
                      ? (language === 'ar' ? '🏦 تحويل بنكي' : '🏦 Bank Transfer')
                      : (language === 'ar' ? '💵 كاش' : '💵 Cash')}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{language === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Guide ID */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground">{language === 'ar' ? 'معرف المرشد' : 'Guide ID'}</p>
                <p className="font-mono">{selectedBooking.guideId.slice(0, 8)}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDetailsDialogOpen(false)}
              data-testid="dialog-button-close-details"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}