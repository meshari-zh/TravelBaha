import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, Calendar } from "lucide-react";
import { resolveAssetUrl } from "@/utils/assets";
import type { Place, Guide } from "@shared/schema";

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: place, isLoading: placeLoading } = useQuery<Place>({
    queryKey: ["/api/places", id],
    enabled: !!id,
  });

  const { data: guides = [], isLoading: guidesLoading } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  if (placeLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
            <div className="h-96 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">المكان غير موجود</h3>
              <p className="text-muted-foreground mb-4">لم يتم العثور على المكان المطلوب</p>
              <Link href="/places">
                <Button data-testid="button-back-to-places">
                  العودة للأماكن السياحية
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availableGuides = guides.filter(guide => guide.isActive);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/places">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للأماكن السياحية
          </Button>
        </Link>

        {/* Place Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <img
              src={resolveAssetUrl(place.imageUrl)}
              alt={place.name}
              className="w-full h-full object-cover"
              data-testid="place-detail-image"
            />
            {place.category && (
              <Badge 
                className="absolute top-4 right-4 bg-primary/90 text-primary-foreground"
                data-testid="place-detail-category"
              >
                {place.category}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="place-detail-name">
                {place.name}
              </h1>
              
              {place.location && (
                <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5" />
                  <span data-testid="place-detail-location">{place.location}</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">وصف المكان</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="place-detail-description">
                {place.description}
              </p>
            </div>

            {/* Available Guides */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                المرشدين المتاحين ({availableGuides.length})
              </h2>
              
              {guidesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : availableGuides.length > 0 ? (
                <div className="space-y-3">
                  {availableGuides.slice(0, 3).map((guide) => (
                    <Card key={guide.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium" data-testid={`guide-name-${guide.id}`}>
                              {guide.bio ? guide.bio.split(' ').slice(0, 2).join(' ') : 'مرشد سياحي'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {guide.dailyRate && parseFloat(guide.dailyRate) > 0 
                                ? `${guide.dailyRate} ر.س/يوم` 
                                : 'السعر حسب الاتفاق'}
                            </p>
                          </div>
                        </div>
                        <Link href={`/guide/${guide.id}`}>
                          <Button size="sm" data-testid={`button-view-guide-${guide.id}`}>
                            عرض الملف الشخصي
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                  
                  {availableGuides.length > 3 && (
                    <Link href="/guides">
                      <Button variant="outline" className="w-full" data-testid="button-view-all-guides">
                        عرض جميع المرشدين ({availableGuides.length})
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">لا يوجد مرشدين متاحين حالياً</p>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/guides">
                <Button className="flex-1" data-testid="button-find-guide">
                  <Calendar className="w-4 h-4 ml-2" />
                  احجز مع مرشد
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline" className="flex-1" data-testid="button-my-bookings">
                  حجوزاتي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}