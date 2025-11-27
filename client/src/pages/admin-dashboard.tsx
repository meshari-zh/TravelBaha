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
import GuideCard from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, MapPin, MessageCircle, TrendingUp, UserCheck, Key, Copy } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Place, Guide, InsertPlace, Booking, User, Invite, TeamMember, InsertTeamMember } from "@shared/schema";

// مكون تعديل محتوى الخريطة
function MapContentEditorComponent() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});

  // جلب المحتوى الحالي للخريطة
  const { data: mapTitle = '', refetch: refetchTitle } = useQuery({
    queryKey: ['/api/site-content/map_title'],
    select: (data: any) => data?.content || 'خريطة المملكة التفاعلية'
  });

  const { data: mapSubtitle = '', refetch: refetchSubtitle } = useQuery({
    queryKey: ['/api/site-content/map_subtitle'],
    select: (data: any) => data?.content || 'استكشف جمال منطقة الباحة والمدن السعودية'
  });

  const { data: mapDescription = '', refetch: refetchDescription } = useQuery({
    queryKey: ['/api/site-content/map_description'],
    select: (data: any) => data?.content || 'تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة'
  });

  // Mutation لتحديث المحتوى
  const updateContentMutation = useMutation({
    mutationFn: async ({ key, title, content }: { key: string; title: string; content: string }) => {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, title, content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update content');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ التغييرات على المحتوى",
      });
      setIsEditing(prev => ({ ...prev, [variables.key]: false }));
      
      // Refresh the queries
      if (variables.key === 'map_title') refetchTitle();
      if (variables.key === 'map_subtitle') refetchSubtitle();  
      if (variables.key === 'map_description') refetchDescription();
      
      // أيضا refresh cache للخريطة
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "خطأ في التحديث",
        description: "لم يتم حفظ التغييرات",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (key: string, title: string) => (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const content = formData.get('content') as string;
    
    if (!content.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "المحتوى لا يمكن أن يكون فارغاً",
        variant: "destructive"
      });
      return;
    }
    
    updateContentMutation.mutate({ key, title, content });
  };

  const contentItems = [
    {
      key: 'map_title',
      title: 'عنوان الخريطة',
      description: 'العنوان الرئيسي المعروض في أعلى صفحة الخريطة',
      currentValue: mapTitle,
      icon: '🗺️'
    },
    {
      key: 'map_subtitle', 
      title: 'العنوان الفرعي للخريطة',
      description: 'النص الثانوي المعروض تحت العنوان الرئيسي',
      currentValue: mapSubtitle,
      icon: '📍'
    },
    {
      key: 'map_description',
      title: 'وصف الخريطة',
      description: 'النص التوضيحي الذي يوضح فائدة الخريطة',
      currentValue: mapDescription,
      icon: '📝'
    }
  ];

  return (
    <div className="space-y-6">
      {contentItems.map((item) => (
        <Card key={item.key} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                data-testid={`button-edit-${item.key}`}
              >
                <Edit className="w-4 h-4 ml-1" />
                {isEditing[item.key] ? 'إلغاء' : 'تعديل'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {!isEditing[item.key] ? (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">{item.currentValue}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(item.key, item.title)} className="space-y-4">
                <div>
                  <Label htmlFor={`content-${item.key}`}>المحتوى الجديد</Label>
                  <Textarea
                    id={`content-${item.key}`}
                    name="content"
                    defaultValue={item.currentValue}
                    rows={3}
                    className="mt-1"
                    data-testid={`input-${item.key}`}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateContentMutation.isPending}
                    data-testid={`button-save-${item.key}`}
                  >
                    {updateContentMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(prev => ({ ...prev, [item.key]: false }))}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      ))}
      
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900 dark:text-blue-100">ملاحظة مهمة</h4>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          التغييرات المحفوظة ستظهر فوراً على صفحة الخريطة للمستخدمين. تأكد من مراجعة المحتوى قبل الحفظ.
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaceDialogOpen, setIsPlaceDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("places");
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [placeImageUrl, setPlaceImageUrl] = useState<string>("");
  const [teamMemberImageUrl, setTeamMemberImageUrl] = useState<string>("");

  // Handle URL parameters for direct tab access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['places', 'guides', 'bookings', 'users', 'team', 'content', 'invites'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Update image URLs when editing items
  useEffect(() => {
    if (editingPlace) {
      setPlaceImageUrl(editingPlace.imageUrl || "");
    } else {
      setPlaceImageUrl("");
    }
  }, [editingPlace]);

  useEffect(() => {
    if (editingTeamMember) {
      setTeamMemberImageUrl(editingTeamMember.imageUrl || "");
    } else {
      setTeamMemberImageUrl("");
    }
  }, [editingTeamMember]);

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

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
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

  const seedPlacesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/places/seed");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      toast({
        title: "تم إضافة معالم الباحة بنجاح",
        description: `تم إضافة ${data?.places?.length || 28} معلم سياحي بنجاح`,
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
        description: "فشل في إضافة معالم الباحة",
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم وجميع بياناته بنجاح",
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
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  // Team member mutations
  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      await apiRequest("POST", "/api/team-members", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsTeamDialogOpen(false);
      setEditingTeamMember(null);
      toast({
        title: "تم إضافة عضو الفريق",
        description: "تم إضافة عضو جديد لفريق العمل بنجاح",
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
        description: "فشل في إضافة عضو الفريق",
        variant: "destructive",
      });
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeamMember> }) => {
      await apiRequest("PUT", `/api/team-members/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsTeamDialogOpen(false);
      setEditingTeamMember(null);
      toast({
        title: "تم تحديث عضو الفريق",
        description: "تم تحديث بيانات عضو الفريق بنجاح",
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
        description: "فشل في تحديث عضو الفريق",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/team-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "تم حذف عضو الفريق",
        description: "تم حذف عضو الفريق بنجاح",
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
        description: "فشل في حذف عضو الفريق",
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
    
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;
    
    const data: InsertPlace = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      imageUrl: placeImageUrl,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      websiteUrl: formData.get("websiteUrl") as string || null,
      latitude: latitudeStr ? latitudeStr : null,
      longitude: longitudeStr ? longitudeStr : null,
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

  const handleSeedPlaces = () => {
    if (confirm("هل أنت متأكد من إضافة جميع معالم الباحة السياحية؟ سيتم إضافة 28 معلم سياحي.")) {
      seedPlacesMutation.mutate();
    }
  };

  const handleDeletePlace = (place: Place) => {
    if (confirm(`هل أنت متأكد من حذف "${place.name}"؟`)) {
      deletePlaceMutation.mutate(place.id);
    }
  };

  const handleSubmitTeamMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertTeamMember = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      description: formData.get("description") as string,
      imageUrl: teamMemberImageUrl,
      orderIndex: parseInt(formData.get("orderIndex") as string) || 0,
      isActive: true,
    };

    console.log("Team member data being submitted:", data);
    console.log("teamMemberImageUrl state:", teamMemberImageUrl);

    if (editingTeamMember) {
      updateTeamMemberMutation.mutate({ id: editingTeamMember.id, data });
    } else {
      createTeamMemberMutation.mutate(data);
    }
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setIsTeamDialogOpen(true);
  };

  const handleDeleteTeamMember = (member: TeamMember) => {
    if (confirm(`هل أنت متأكد من حذف "${member.name}"؟`)) {
      deleteTeamMemberMutation.mutate(member.id);
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 mb-8">
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
          <TabsList className="w-full overflow-x-auto -mx-4 px-4">
            <TabsTrigger value="places" data-testid="tab-places" className="shrink-0 whitespace-nowrap">الأماكن السياحية</TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides" className="shrink-0 whitespace-nowrap">المرشدين السياحيين</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings" className="shrink-0 whitespace-nowrap">الحجوزات</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="shrink-0 whitespace-nowrap">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="team" data-testid="tab-team" className="shrink-0 whitespace-nowrap">فريق العمل</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content" className="shrink-0 whitespace-nowrap">محتوى الموقع</TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites" className="shrink-0 whitespace-nowrap">رموز الدعوة</TabsTrigger>
          </TabsList>

          {/* Places Management */}
          <TabsContent value="places">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة الأماكن السياحية</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSeedPlaces}
                      variant="outline"
                      disabled={seedPlacesMutation.isPending}
                      data-testid="button-seed-places"
                    >
                      {seedPlacesMutation.isPending ? 'جاري إضافة المعالم...' : 'إضافة معالم الباحة'}
                    </Button>
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
                      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPlace ? 'تعديل المكان السياحي' : 'إضافة مكان سياحي جديد'}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmitPlace} className="space-y-4 pb-4">
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
                        
                        <div className="space-y-3">
                          <Label>صورة المكان</Label>
                          <ImageUploader
                            value={placeImageUrl}
                            onChange={setPlaceImageUrl}
                            preview={true}
                            className="w-full"
                          />
                          <div className="text-center text-sm text-muted-foreground">أو</div>
                          <div>
                            <Label htmlFor="imageUrl">رابط الصورة (URL)</Label>
                            <Input
                              id="imageUrl"
                              name="imageUrl"
                              type="url"
                              value={placeImageUrl}
                              onChange={(e) => setPlaceImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="mt-1"
                              dir="ltr"
                              data-testid="input-place-image-url"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              يمكنك إدخال رابط صورة من الإنترنت مباشرة
                            </p>
                          </div>
                          {placeImageUrl && (
                            <div className="mt-2 p-2 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-2">معاينة الصورة:</p>
                              <img 
                                src={placeImageUrl} 
                                alt="معاينة" 
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
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
                        
                        <div>
                          <Label htmlFor="websiteUrl">رابط الموقع الإلكتروني</Label>
                          <Input
                            id="websiteUrl"
                            name="websiteUrl"
                            type="url"
                            defaultValue={editingPlace?.websiteUrl || ""}
                            placeholder="https://example.com"
                            className="mt-1"
                            dir="ltr"
                            data-testid="input-place-website-url"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            رابط الموقع الإلكتروني الرسمي للمكان (اختياري)
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                          <Label className="text-blue-800 dark:text-blue-200 font-semibold mb-2 block">
                            📍 إحداثيات الموقع على الخريطة
                          </Label>
                          <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
                            يمكنك الحصول على الإحداثيات من Google Maps بالضغط بزر الماوس الأيمن على الموقع
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="latitude" className="text-sm">خط العرض (Latitude)</Label>
                              <Input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="0.000001"
                                defaultValue={editingPlace?.latitude || ""}
                                placeholder="20.0127"
                                className="mt-1"
                                dir="ltr"
                                data-testid="input-place-latitude"
                              />
                            </div>
                            <div>
                              <Label htmlFor="longitude" className="text-sm">خط الطول (Longitude)</Label>
                              <Input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="0.000001"
                                defaultValue={editingPlace?.longitude || ""}
                                placeholder="41.4676"
                                className="mt-1"
                                dir="ltr"
                                data-testid="input-place-longitude"
                              />
                            </div>
                          </div>
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
                            <div className="flex gap-2 flex-wrap">
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
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    data-testid={`button-delete-user-${u.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف المستخدم "{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}"؟
                                      سيتم حذف جميع البيانات المرتبطة به (الحجوزات، الرسائل، التقييمات) ولا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(u.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      data-testid={`button-confirm-delete-user-${u.id}`}
                                    >
                                      حذف نهائي
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

          {/* Team Management */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة فريق العمل</CardTitle>
                  <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setEditingTeamMember(null)}
                        data-testid="button-add-team-member"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة عضو جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg w-[95vw] h-[95vh] p-0 flex flex-col">
                      <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle>
                          {editingTeamMember ? 'تعديل عضو الفريق' : 'إضافة عضو جديد للفريق'}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto px-6 pb-4" style={{minHeight: 0}}>
                          <form id="team-member-form" onSubmit={handleSubmitTeamMember} className="space-y-6 pb-24">
                            <div className="space-y-2">
                              <Label htmlFor="name">اسم العضو</Label>
                              <Input
                                id="name"
                                name="name"
                                defaultValue={editingTeamMember?.name || ""}
                                required
                                data-testid="input-team-member-name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="role">المنصب</Label>
                              <Input
                                id="role"
                                name="role"
                                defaultValue={editingTeamMember?.role || ""}
                                required
                                data-testid="input-team-member-role"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="description">الوصف</Label>
                              <Textarea
                                id="description"
                                name="description"
                                defaultValue={editingTeamMember?.description || ""}
                                data-testid="input-team-member-description"
                                rows={3}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>صورة العضو</Label>
                              <ImageUploader
                                value={teamMemberImageUrl}
                                onChange={setTeamMemberImageUrl}
                                preview={true}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="orderIndex">ترتيب العرض</Label>
                              <Input
                                id="orderIndex"
                                name="orderIndex"
                                type="number"
                                defaultValue={editingTeamMember?.orderIndex || 0}
                                data-testid="input-team-member-order"
                              />
                            </div>
                          </form>
                      </div>
                        
                      <div className="shrink-0 bg-background px-6 py-4 border-t flex gap-4 justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsTeamDialogOpen(false)}
                          data-testid="button-cancel-team-member"
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          form="team-member-form"
                          disabled={createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending}
                          data-testid="button-save-team-member"
                        >
                          {createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending 
                            ? 'جاري الحفظ...' 
                            : editingTeamMember ? 'تحديث' : 'إضافة'
                          }
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">لا يوجد أعضاء في الفريق</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              {member.imageUrl ? (
                                <img 
                                  src={member.imageUrl} 
                                  alt={member.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold">
                                  {member.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate" data-testid={`team-member-name-${member.id}`}>
                                {member.name}
                              </h4>
                              <p className="text-sm text-primary font-medium" data-testid={`team-member-role-${member.id}`}>
                                {member.role}
                              </p>
                              {member.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`team-member-description-${member.id}`}>
                                  {member.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTeamMember(member)}
                              data-testid={`button-edit-team-member-${member.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTeamMember(member)}
                              disabled={deleteTeamMemberMutation.isPending}
                              data-testid={`button-delete-team-member-${member.id}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Content Management */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  إدارة محتوى الموقع
                </CardTitle>
                <p className="text-muted-foreground">تعديل النصوص والمحتوى القابل للتحرير في الموقع</p>
              </CardHeader>
              <CardContent>
                <MapContentEditorComponent />
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
