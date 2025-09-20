import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Place, InsertPlace } from "@shared/schema";

export default function Places() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
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
        title: "تم إنشاء المكان بنجاح",
        description: "تم إضافة المكان السياحي الجديد",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المكان",
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
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
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
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
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

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (confirm(`هل أنت متأكد من حذف "${place.name}"؟`)) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">الأماكن السياحية</h1>
            <p className="text-muted-foreground">اكتشف أجمل الوجهات السياحية في منطقة الباحة</p>
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingPlace(null)}
                  data-testid="button-add-place"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مكان جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlace ? 'تعديل المكان السياحي' : 'إضافة مكان سياحي جديد'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">اسم المكان</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingPlace?.name || ""}
                      required
                      data-testid="input-place-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingPlace?.description || ""}
                      required
                      data-testid="input-place-description"
                    />
                  </div>
                  
                  <div>
                    <Label>صورة المكان</Label>
                    <ImageUploader
                      value={placeImageUrl}
                      onChange={setPlaceImageUrl}
                      preview={true}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">الموقع</Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={editingPlace?.location || ""}
                      data-testid="input-place-location"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingPlace?.category || ""}
                      placeholder="مثال: طبيعة، تراث، جبال"
                      data-testid="input-place-category"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={createPlaceMutation.isPending || updatePlaceMutation.isPending}
                      data-testid="button-save-place"
                    >
                      {createPlaceMutation.isPending || updatePlaceMutation.isPending ? 'جاري الحفظ...' : 
                       editingPlace ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-place"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث في الأماكن السياحية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search-places"
          />
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
              <h3 className="font-semibold mb-2">لا توجد أماكن</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'لم يتم العثور على أماكن تطابق البحث' : 'لا توجد أماكن سياحية متاحة حالياً'}
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
