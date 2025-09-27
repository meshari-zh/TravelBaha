import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import PlaceCard from "@/components/place-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Place, InsertPlace } from "@shared/schema";

export default function Places() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [placeImageUrl, setPlaceImageUrl] = useState("");

  const { data: places = [], isLoading } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const createPlaceMutation = useMutation({
    mutationFn: async (data: InsertPlace) => {
      await apiRequest("POST", "/api/places", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsDialogOpen(false);
      setEditingPlace(null);
      toast({
        title: language === 'ar' ? "تم إنشاء المكان بنجاح" : "Place created successfully",
        description: language === 'ar' ? "تم إضافة المكان السياحي الجديد" : "New tourist place has been added",
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
        title: t('error'),
        description: language === 'ar' ? "فشل في إنشاء المكان" : "Failed to create place",
        variant: "destructive",
      });
    },
  });

  const updatePlaceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlace> }) => {
      await apiRequest("PUT", `/api/places/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsDialogOpen(false);
      setEditingPlace(null);
      toast({
        title: "تم تحديث المكان بنجاح",
        description: "تم حفظ التغييرات",
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
        title: "خطأ",
        description: "فشل في تحديث المكان",
        variant: "destructive",
      });
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/places/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      toast({
        title: "تم حذف المكان",
        description: "تم حذف المكان السياحي بنجاح",
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
        title: "خطأ",
        description: "فشل في حذف المكان",
        variant: "destructive",
      });
    },
  });

  // Get unique categories from places
  const categories = Array.from(new Set(places.map(place => place.category).filter(Boolean))).sort();

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Update image URL when editing place
  useEffect(() => {
    if (editingPlace) {
      setPlaceImageUrl(editingPlace.imageUrl || "");
    } else {
      setPlaceImageUrl("");
    }
  }, [editingPlace]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertPlace = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      imageUrl: placeImageUrl,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
    };

    if (editingPlace) {
      updatePlaceMutation.mutate({ id: editingPlace.id, data });
    } else {
      createPlaceMutation.mutate(data);
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setIsDialogOpen(true);
  };

  const handleDelete = (place: Place) => {
    if (confirm(language === 'ar' ? `هل أنت متأكد من حذف "${place.name}"؟` : `Are you sure you want to delete "${place.name}"?`)) {
      deletePlaceMutation.mutate(place.id);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('placesTitle')}</h1>
            <p className="text-muted-foreground">{t('placesSubtitle')}</p>
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingPlace(null)}
                  data-testid="button-add-place"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  {language === 'ar' ? 'إضافة مكان جديد' : 'Add New Place'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold mb-2">
                    {editingPlace ? 
                      (language === 'ar' ? 'تعديل المكان السياحي' : 'Edit Tourist Place') : 
                      (language === 'ar' ? 'إضافة مكان سياحي جديد' : 'Add New Tourist Place')
                    }
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col h-[calc(90vh-80px)]">
                  <ScrollArea className="flex-1 pr-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {/* القسم الأساسي */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">{t('name')}</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingPlace?.name || ""}
                            placeholder={language === 'ar' ? 'اسم المكان السياحي' : 'Tourist place name'}
                            required
                            className="mt-1"
                            data-testid="input-place-name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="location" className="text-sm font-medium">{t('location')}</Label>
                          <Input
                            id="location"
                            name="location"
                            defaultValue={editingPlace?.location || ""}
                            placeholder={language === 'ar' ? 'الموقع الجغرافي' : 'Geographic location'}
                            className="mt-1"
                            data-testid="input-place-location"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="category" className="text-sm font-medium">{t('category')}</Label>
                        <Input
                          id="category"
                          name="category"
                          defaultValue={editingPlace?.category || ""}
                          placeholder={language === 'ar' ? "مثال: طبيعة، تراث، جبال" : "Example: Nature, Heritage, Mountains"}
                          className="mt-1"
                          data-testid="input-place-category"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">{t('description')}</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingPlace?.description || ""}
                          placeholder={language === 'ar' ? 'وصف تفصيلي للمكان...' : 'Detailed description of the place...'}
                          rows={4}
                          required
                          className="mt-1"
                          data-testid="input-place-description"
                        />
                      </div>
                    </div>
                    
                    {/* قسم الصورة */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {language === 'ar' ? 'الصورة' : 'Image'}
                      </h3>
                      
                      <div>
                        <Label className="text-sm font-medium">{language === 'ar' ? 'صورة المكان' : 'Place Image'}</Label>
                        <ImageUploader
                          value={placeImageUrl}
                          onChange={setPlaceImageUrl}
                          preview={true}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                    
                    {/* أزرار التحكم */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        type="submit" 
                        disabled={createPlaceMutation.isPending || updatePlaceMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-place"
                      >
                        {createPlaceMutation.isPending || updatePlaceMutation.isPending ? 
                          (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : 
                          editingPlace ? t('edit') : t('add')}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                        data-testid="button-cancel-place"
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                    </form>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('searchPlaces')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                data-testid="input-search-places"
              />
            </div>
            
            {/* Category Filter */}
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full" data-testid="select-category-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder={language === 'ar' ? 'جميع الفئات' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || ""}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المرشحات النشطة:' : 'Active filters:'}
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {searchTerm}
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-destructive"
                    data-testid="clear-search"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 hover:text-destructive"
                    data-testid="clear-category"
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
                  setSelectedCategory("all");
                }}
                className="text-muted-foreground hover:text-foreground"
                data-testid="clear-all-filters"
              >
                {language === 'ar' ? 'مسح الكل' : 'Clear All'}
              </Button>
            </div>
          )}
        </div>

        {/* Places Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا توجد أماكن' : 'No Places Found'}</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 
                  (language === 'ar' ? 'لم يتم العثور على أماكن تطابق البحث' : 'No places found matching your search') : 
                  t('noPlacesFound')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="relative group">
                <PlaceCard place={place} />
                {user?.role === 'admin' && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(place)}
                        data-testid={`button-edit-place-${place.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(place)}
                        data-testid={`button-delete-place-${place.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
