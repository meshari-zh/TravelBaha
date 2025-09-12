import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import type { Place } from "@shared/schema";

interface PlaceCardProps {
  place: Place;
  showGuideCount?: boolean;
  onSelect?: (place: Place) => void;
}

export default function PlaceCard({ place, showGuideCount = false, onSelect }: PlaceCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(place);
    }
  };

  return (
    <Card className="overflow-hidden card-hover cursor-pointer" onClick={handleClick} data-testid={`place-card-${place.id}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={place.imageUrl || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'} 
          alt={place.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          data-testid={`place-image-${place.id}`}
        />
        {place.category && (
          <Badge 
            className="absolute top-2 right-2 bg-primary/90 text-primary-foreground"
            data-testid={`place-category-${place.id}`}
          >
            {place.category}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" data-testid={`place-name-${place.id}`}>
          {place.name}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`place-description-${place.id}`}>
          {place.description}
        </p>
        
        {place.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span data-testid={`place-location-${place.id}`}>{place.location}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {showGuideCount && (
            <span className="text-primary font-semibold flex items-center gap-1">
              <Users className="w-4 h-4" />
              متاح للحجز
            </span>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className="text-accent hover:text-accent/80"
            data-testid={`place-details-${place.id}`}
          >
            عرض التفاصيل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
