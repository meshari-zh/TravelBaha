import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import PlaceCard from "@/components/place-card";
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, MapPin, MessageCircle, TrendingUp, UserCheck, Key, Copy } from "lucide-react";
import type { Place, Guide, InsertPlace, Booking, User, Invite } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaceDialogOpen, setIsPlaceDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("places");

  // Handle URL parameters for direct tab access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['places', 'guides', 'bookings', 'users', 'invites'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">غير مصرح</h2>
              <p className="text-muted-foreground">هذه الصفحة مخصصة للمشرفين فقط</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: invites = [] } = useQuery<Invite[]>({
    queryKey: ["/api/invites"],
  });

  // Statistics
  const stats = {
    totalPlaces: places.length,
    totalGuides: guides.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
  };

  const createPlaceMutation = useMutation({
    mutationFn: async (data: InsertPlace) => {
      await apiRequest("POST", "/api/places", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      setIsPlaceDialogOpen(false);
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
      setIsPlaceDialogOpen(false);
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

  // Generate random invite code
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 7);
  };

  const createInviteMutation = useMutation({
    mutationFn: async (role: "guide" | "admin") => {
      const code = generateInviteCode();
      const response = await apiRequest("POST", "/api/invites", { code, role });
      return { code, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      setGeneratedInviteCode(data.code);
      setIsInviteDialogOpen(true);
      toast({
        title: "تم إنشاء رمز الدعوة",
        description: `تم إنشاء رمز دعوة جديد لدور ${data.role === 'guide' ? 'مرشد' : 'مشرف'}`,
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
        description: "فشل في إنشاء رمز الدعوة",
        variant: "destructive",
      });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await apiRequest("DELETE", `/api/invites/${inviteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      toast({
        title: "تم حذف رمز الدعوة",
        description: "تم حذف رمز الدعوة بنجاح",
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
        description: "فشل في حذف رمز الدعوة",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "tourist" | "guide" | "admin" }) => {
      await apiRequest("PUT", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم تحديث الدور",
        description: "تم تحديث دور المستخدم بنجاح",
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
        description: "فشل في تحديث دور المستخدم",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رمز الدعوة إلى الحافظة",
      });
    } catch (err) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ رمز الدعوة",
        variant: "destructive",
      });
    }
  };

  const handleSubmitPlace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertPlace = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
    };

    if (editingPlace) {
      updatePlaceMutation.mutate({ id: editingPlace.id, data });
    } else {
      createPlaceMutation.mutate(data);
    }
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setIsPlaceDialogOpen(true);
  };

  const handleDeletePlace = (place: Place) => {
    if (confirm(`هل أنت متأكد من حذف "${place.name}"؟`)) {
      deletePlaceMutation.mutate(place.id);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة تحكم المشرف</h1>
          <p className="text-muted-foreground">إدارة المنصة والمحتوى والمستخدمين</p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-places">{stats.totalPlaces}</h3>
              <p className="text-muted-foreground">الأماكن السياحية</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-guides">{stats.totalGuides}</h3>
              <p className="text-muted-foreground">المرشدين السياحيين</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-bookings">{stats.totalBookings}</h3>
              <p className="text-muted-foreground">إجمالي الحجوزات</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-pending">{stats.pendingBookings}</h3>
              <p className="text-muted-foreground">حجوزات في الانتظار</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="places" data-testid="tab-places">الأماكن السياحية</TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides">المرشدين السياحيين</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites">رموز الدعوة</TabsTrigger>
          </TabsList>

          {/* Places Management */}
          <TabsContent value="places">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة الأماكن السياحية</CardTitle>
                  <Dialog open={isPlaceDialogOpen} onOpenChange={setIsPlaceDialogOpen}>
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
                      
                      <form onSubmit={handleSubmitPlace} className="space-y-4">
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
                          <Label htmlFor="imageUrl">رابط الصورة</Label>
                          <Input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            defaultValue={editingPlace?.imageUrl || ""}
                            data-testid="input-place-image"
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
                            onClick={() => setIsPlaceDialogOpen(false)}
                            data-testid="button-cancel-place"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {places.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد أماكن سياحية</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {places.map((place) => (
                      <div key={place.id} className="relative group">
                        <PlaceCard place={place} />
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditPlace(place)}
                              data-testid={`button-edit-place-${place.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlace(place)}
                              data-testid={`button-delete-place-${place.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Management */}
          <TabsContent value="guides">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المرشدين السياحيين</CardTitle>
              </CardHeader>
              
              <CardContent>
                {guides.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد مرشدين سياحيين</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {guides.map((guide) => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Management */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الحجوزات</CardTitle>
              </CardHeader>
              
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد حجوزات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold mb-1" data-testid={`booking-id-${booking.id}`}>
                                حجز رقم: {booking.id.slice(-6)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                من {new Date(booking.startDate).toLocaleDateString('ar-SA')} 
                                إلى {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                              </p>
                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  ملاحظات: {booking.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-left">
                              <Badge 
                                variant={
                                  booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'pending' ? 'secondary' :
                                  booking.status === 'completed' ? 'outline' :
                                  'destructive'
                                }
                                data-testid={`booking-status-${booking.id}`}
                              >
                                {booking.status === 'confirmed' ? 'مؤكد' :
                                 booking.status === 'pending' ? 'في الانتظار' :
                                 booking.status === 'completed' ? 'مكتمل' :
                                 'ملغي'}
                              </Badge>
                              <p className="text-sm font-semibold mt-2" data-testid={`booking-amount-${booking.id}`}>
                                {booking.totalAmount} ر.س
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد مستخدمين</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <Card key={u.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold" data-testid={`user-name-${u.id}`}>
                                {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                              </h4>
                              <p className="text-sm text-muted-foreground" data-testid={`user-email-${u.id}`}>
                                {u.email}
                              </p>
                              <Badge variant="outline" className="mt-1" data-testid={`user-role-${u.id}`}>
                                {u.role === 'tourist' ? 'سائح' : u.role === 'guide' ? 'مرشد' : 'مشرف'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRoleMutation.mutate({ userId: u.id, role: "tourist" })}
                                disabled={u.role === "tourist"}
                                data-testid={`button-role-tourist-${u.id}`}
                              >
                                سائح
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRoleMutation.mutate({ userId: u.id, role: "guide" })}
                                disabled={u.role === "guide"}
                                data-testid={`button-role-guide-${u.id}`}
                              >
                                مرشد
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRoleMutation.mutate({ userId: u.id, role: "admin" })}
                                disabled={u.role === "admin"}
                                data-testid={`button-role-admin-${u.id}`}
                              >
                                مشرف
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invite Codes Management */}
          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة رموز الدعوة</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createInviteMutation.mutate("guide")}
                      disabled={createInviteMutation.isPending}
                      data-testid="button-create-guide-invite"
                    >
                      <Key className="w-4 h-4 ml-2" />
                      رمز دعوة مرشد
                    </Button>
                    <Button
                      onClick={() => createInviteMutation.mutate("admin")}
                      disabled={createInviteMutation.isPending}
                      data-testid="button-create-admin-invite"
                    >
                      <UserCheck className="w-4 h-4 ml-2" />
                      رمز دعوة مشرف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invites.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد رموز دعوة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite) => (
                      <Card key={invite.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="bg-muted px-2 py-1 rounded text-sm font-mono" data-testid={`invite-code-${invite.id}`}>
                                  {invite.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(invite.code)}
                                  data-testid={`button-copy-${invite.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                نوع الدور: {invite.role === 'guide' ? 'مرشد' : 'مشرف'} • 
                                تم الإنشاء: {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString('ar-SA') : 'غير معروف'}
                              </p>
                              {invite.isUsed && (
                                <p className="text-sm text-green-600 mt-1" data-testid={`invite-used-${invite.id}`}>
                                  تم الاستخدام في: {invite.usedAt ? new Date(invite.usedAt).toLocaleDateString('ar-SA') : 'غير معروف'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={invite.isUsed ? "secondary" : "default"}
                                data-testid={`invite-status-${invite.id}`}
                              >
                                {invite.isUsed ? 'مستخدم' : 'متاح'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteInviteMutation.mutate(invite.id)}
                                disabled={deleteInviteMutation.isPending}
                                data-testid={`button-delete-invite-${invite.id}`}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Code Generation Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>رمز الدعوة الجديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">رمز الدعوة:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-background px-3 py-2 rounded border flex-1 text-center font-mono">
                    {generatedInviteCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedInviteCode)}
                    data-testid="button-copy-generated-invite"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                شارك هذا الرمز مع الشخص المناسب لتحديث دوره في المنصة
              </p>
              <Button 
                onClick={() => setIsInviteDialogOpen(false)} 
                className="w-full"
                data-testid="button-close-invite-dialog"
              >
                حسناً
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
