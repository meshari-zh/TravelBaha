import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import ReviewForm from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, MapPin, User, Clock, Star } from "lucide-react";
import type { Booking } from "@shared/schema";

export default function Bookings() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

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
              <h3 className="font-semibold mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-muted-foreground">حدث خطأ أثناء تحميل الحجوزات</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">حجوزاتي</h1>
          <p className="text-lg text-muted-foreground">إدارة حجوزات الرحلات السياحية</p>
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
                جميع الحجوزات
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                data-testid="filter-pending"
              >
                في الانتظار
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("confirmed")}
                data-testid="filter-confirmed"
              >
                مؤكدة
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                data-testid="filter-completed"
              >
                مكتملة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            عرض {filteredBookings.length} من {bookings.length} حجز
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
              <h3 className="font-semibold mb-2">لا توجد حجوزات</h3>
              <p className="text-muted-foreground mb-4" data-testid="empty-state-message">
                {filter === "all" 
                  ? 'لا يوجد لديك أي حجوزات حالياً'
                  : `لا توجد حجوزات ${getStatusText(filter)}`}
              </p>
              <Button asChild>
                <a href="/guides" data-testid="button-browse-guides">
                  تصفح المرشدين
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
                      رحلة سياحية - {booking.id.slice(0, 8)}
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
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm" data-testid={`booking-dates-${booking.id}`}>
                        {new Date(booking.startDate).toLocaleDateString('ar-SA')} - {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-secondary" data-testid={`booking-amount-${booking.id}`}>
                        {booking.totalAmount} ر.س
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground" data-testid={`booking-notes-${booking.id}`}>
                        ملاحظات: {booking.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" data-testid={`booking-details-${booking.id}`}>
                      عرض التفاصيل
                    </Button>
                    {booking.status === "pending" && (
                      <Button variant="destructive" size="sm" data-testid={`booking-cancel-${booking.id}`}>
                        إلغاء الحجز
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
                            تقييم المرشد
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <ReviewForm
                            bookingId={booking.id}
                            guideId={booking.guideId}
                            guideName={`المرشد - ${booking.guideId.slice(0, 8)}`}
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
    </div>
  );
}