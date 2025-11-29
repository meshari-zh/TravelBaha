import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import type { Guide } from "@shared/schema";

interface GuideCardProps {
  guide: Guide;
  showContactButton?: boolean;
  showBookButton?: boolean;
  onContact?: (guide: Guide) => void;
  onBook?: (guide: Guide) => void;
}

export default function GuideCard({ guide, showContactButton = false, showBookButton = false, onContact, onBook }: GuideCardProps) {
  const { language, t } = useLanguage();
  
  const getUserDisplayName = () => {
    if (!guide.user) return language === 'ar' ? 'مرشد سياحي' : 'Tour Guide';
    return [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ') || guide.user.email || (language === 'ar' ? 'مرشد سياحي' : 'Tour Guide');
  };

  const getUserInitials = () => {
    if (!guide.user) return language === 'ar' ? 'م' : 'G';
    const firstName = guide.user.firstName || '';
    const lastName = guide.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || guide.user.email?.charAt(0).toUpperCase() || (language === 'ar' ? 'م' : 'G');
  };

  const handleContact = () => {
    if (onContact) {
      onContact(guide);
    }
  };

  const handleBook = () => {
    if (onBook) {
      onBook(guide);
    }
  };

  return (
    <Card className="overflow-hidden card-hover" data-testid={`guide-card-${guide.id}`}>
      <div className="relative h-48 bg-muted flex items-center justify-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={guide.user?.profileImageUrl || undefined} />
          <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
        </Avatar>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1" data-testid={`guide-name-${guide.id}`}>
          {getUserDisplayName()}
        </h3>
        
        {guide.bio && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2" data-testid={`guide-bio-${guide.id}`}>
            {guide.bio}
          </p>
        )}
        
        {/* Specialties */}
        {guide.specialties && guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {guide.specialties.slice(0, 2).map((specialty, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                data-testid={`guide-specialty-${guide.id}-${index}`}
              >
                {specialty}
              </Badge>
            ))}
            {guide.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{guide.specialties.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Languages */}
        {guide.languages && guide.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {guide.languages.slice(0, 2).map((language, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs"
                data-testid={`guide-language-${guide.id}-${index}`}
              >
                {language}
              </Badge>
            ))}
            {guide.languages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{guide.languages.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Rating and Price */}
        <div className="flex justify-between items-center mb-3">
          {guide.dailyRate && (
            <span className="text-secondary font-semibold text-sm" data-testid={`guide-rate-${guide.id}`}>
              {language === 'ar' ? `${guide.dailyRate} ر.س/يوم` : `${guide.dailyRate} SAR/day`}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium" data-testid={`guide-rating-${guide.id}`}>
              {guide.rating ? parseFloat(guide.rating).toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-muted-foreground">
              ({guide.reviewCount || 0})
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href={`/guide/${guide.id}`}>
            <Button 
              className="w-full" 
              size="sm"
              data-testid={`guide-profile-${guide.id}`}
            >
              {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
            </Button>
          </Link>
          
          {showBookButton && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full flex items-center gap-2 bg-secondary hover:bg-secondary/90"
              onClick={handleBook}
              data-testid={`guide-book-${guide.id}`}
            >
              <Calendar className="w-4 h-4" />
              {language === 'ar' ? 'احجز الآن' : 'Book Now'}
            </Button>
          )}
          
          {showContactButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2"
              onClick={handleContact}
              data-testid={`guide-contact-${guide.id}`}
            >
              <MessageCircle className="w-4 h-4" />
              {language === 'ar' ? 'التواصل' : 'Contact'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
