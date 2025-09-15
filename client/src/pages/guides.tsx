import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Guide } from "@shared/schema";

export default function Guides() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");

  const { data: guides = [], isLoading, error } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-semibold mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-muted-foreground">حدث خطأ أثناء تحميل المرشدين السياحيين</p>
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
      
      const matchesSpecialty = !selectedSpecialty || 
        guide.specialties?.includes(selectedSpecialty);
      
      const matchesLanguage = !selectedLanguage || 
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">المرشدين السياحيين</h1>
          <p className="text-lg text-muted-foreground">تعرف على فريق المرشدين المحليين الخبراء في منطقة الباحة</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث عن مرشد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-guides"
                />
              </div>

              {/* Specialty Filter */}
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger data-testid="select-specialty">
                  <SelectValue placeholder="التخصص: الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
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
                  <SelectValue placeholder="اللغة: الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
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
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                  <SelectItem value="price_low">السعر من الأقل للأعلى</SelectItem>
                  <SelectItem value="price_high">السعر من الأعلى للأقل</SelectItem>
                  <SelectItem value="reviews">الأكثر تقييماً</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(selectedSpecialty || selectedLanguage || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    البحث: {searchTerm}
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="text-xs hover:text-foreground"
                      data-testid="button-clear-search"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedSpecialty && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedSpecialty}
                    <button 
                      onClick={() => setSelectedSpecialty("")}
                      className="text-xs hover:text-foreground"
                      data-testid="button-clear-specialty"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedLanguage && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedLanguage}
                    <button 
                      onClick={() => setSelectedLanguage("")}
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
                    setSelectedSpecialty("");
                    setSelectedLanguage("");
                  }}
                  data-testid="button-clear-all-filters"
                >
                  مسح الكل
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            عرض {filteredGuides.length} من {guides.length} مرشد سياحي
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
              <h3 className="font-semibold mb-2">لا يوجد مرشدين</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSpecialty || selectedLanguage 
                  ? 'لم يتم العثور على مرشدين يطابقون البحث' 
                  : 'لا يوجد مرشدين سياحيين متاحين حالياً'}
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
                  إعادة تعيين البحث
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
