import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import type { Place } from "@shared/schema";
import { resolveAssetUrl } from "@/utils/assets";

interface PlaceCardProps {
  place: Place;
  showGuideCount?: boolean;
  onSelect?: (place: Place) => void;
}

export default function PlaceCard({ place, showGuideCount = false, onSelect }: PlaceCardProps) {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(place);
    } else {
      setLocation(`/places/${place.id}`);
    }
  };

  const placeName = language === 'en' && place.nameEn ? place.nameEn : place.name;
  const placeDesc = language === 'en' && place.descriptionEn ? place.descriptionEn : place.description;
  const placeLocation = language === 'en' && place.locationEn ? place.locationEn : place.location;
  const placeCategory = language === 'en' && place.categoryEn ? place.categoryEn : place.category;

  return (
    <Card className="overflow-hidden card-hover cursor-pointer" onClick={handleClick} data-testid={`place-card-${place.id}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={resolveAssetUrl(place.imageUrl)} 
          alt={placeName}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          data-testid={`place-image-${place.id}`}
        />
        {placeCategory && (
          <Badge 
            className="absolute top-2 right-2 bg-primary/90 text-primary-foreground"
            data-testid={`place-category-${place.id}`}
          >
            {placeCategory}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" data-testid={`place-name-${place.id}`}>
          {placeName}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`place-description-${place.id}`}>
          {placeDesc}
        </p>
        
        {placeLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span data-testid={`place-location-${place.id}`}>{placeLocation}</span>
          </div>
        )}
        
        {showGuideCount && (
          <div className="flex justify-start">
            <span className="text-primary font-semibold flex items-center gap-1">
              <Users className="w-4 h-4" />
              {t('availableForBooking')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
