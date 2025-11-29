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
import { Plus, Edit, Trash2, Users, MapPin, MessageCircle, TrendingUp, UserCheck, UserX, Key, Copy } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Place, Guide, InsertPlace, Booking, User, Invite, TeamMember, InsertTeamMember } from "@shared/schema";

// مكون تعديل محتوى الخريطة
function MapContentEditorComponent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});

  // جلب المحتوى الحالي للخريطة
  const { data: mapTitle = '', refetch: refetchTitle } = useQuery({
    queryKey: ['/api/site-content/map_title', language],
    select: (data: any) => data?.content || (language === 'ar' ? 'خريطة المملكة التفاعلية' : 'Interactive Kingdom Map')
  });

  const { data: mapSubtitle = '', refetch: refetchSubtitle } = useQuery({
    queryKey: ['/api/site-content/map_subtitle', language],
    select: (data: any) => data?.content || (language === 'ar' ? 'استكشف جمال منطقة الباحة والمدن السعودية' : 'Explore the beauty of Al Bahah region and Saudi cities')
  });

  const { data: mapDescription = '', refetch: refetchDescription } = useQuery({
    queryKey: ['/api/site-content/map_description', language],
    select: (data: any) => data?.content || (language === 'ar' ? 'تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة' : 'Browse roads and tourist attractions with modern interactive technology')
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
        title: language === 'ar' ? "تم التحديث بنجاح" : "Updated Successfully",
        description: language === 'ar' ? "تم حفظ التغييرات على المحتوى" : "Content changes have been saved",
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
        title: language === 'ar' ? "خطأ في التحديث" : "Update Error",
        description: language === 'ar' ? "لم يتم حفظ التغييرات" : "Changes could not be saved",
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
        title: language === 'ar' ? "خطأ في البيانات" : "Data Error",
        description: language === 'ar' ? "المحتوى لا يمكن أن يكون فارغاً" : "Content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateContentMutation.mutate({ key, title, content });
  };

  const contentItems = [
    {
      key: 'map_title',
      title: language === 'ar' ? 'عنوان الخريطة' : 'Map Title',
      description: language === 'ar' ? 'العنوان الرئيسي المعروض في أعلى صفحة الخريطة' : 'Main title displayed at the top of the map page',
      currentValue: mapTitle,
      icon: '🗺️'
    },
    {
      key: 'map_subtitle', 
      title: language === 'ar' ? 'العنوان الفرعي للخريطة' : 'Map Subtitle',
      description: language === 'ar' ? 'النص الثانوي المعروض تحت العنوان الرئيسي' : 'Secondary text displayed under the main title',
      currentValue: mapSubtitle,
      icon: '📍'
    },
    {
      key: 'map_description',
      title: language === 'ar' ? 'وصف الخريطة' : 'Map Description',
      description: language === 'ar' ? 'النص التوضيحي الذي يوضح فائدة الخريطة' : 'Explanatory text describing the map benefits',
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
                {isEditing[item.key] ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
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
                  <Label htmlFor={`content-${item.key}`}>{language === 'ar' ? 'المحتوى الجديد' : 'New Content'}</Label>
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
                    {updateContentMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(prev => ({ ...prev, [item.key]: false }))}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
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
          <h4 className="font-medium text-blue-900 dark:text-blue-100">{language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}</h4>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {language === 'ar' 
            ? 'التغييرات المحفوظة ستظهر فوراً على صفحة الخريطة للمستخدمين. تأكد من مراجعة المحتوى قبل الحفظ.'
            : 'Saved changes will appear immediately on the map page for users. Make sure to review the content before saving.'}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
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
              <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'غير مصرح' : 'Unauthorized'}</h2>
              <p className="text-muted-foreground">{language === 'ar' ? 'هذه الصفحة مخصصة للمشرفين فقط' : 'This page is for administrators only'}</p>
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
        title: language === 'ar' ? "تم إنشاء المكان بنجاح" : "Place Created Successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
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
      setIsPlaceDialogOpen(false);
      setEditingPlace(null);
      toast({
        title: language === 'ar' ? "تم تحديث المكان بنجاح" : "Place Updated Successfully",
        description: language === 'ar' ? "تم حفظ التغييرات" : "Changes have been saved",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث المكان" : "Failed to update place",
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
        title: language === 'ar' ? "تم حذف المكان" : "Place Deleted",
        description: language === 'ar' ? "تم حذف المكان السياحي بنجاح" : "Tourist place has been deleted successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف المكان" : "Failed to delete place",
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
        title: language === 'ar' ? "تم إضافة معالم الباحة بنجاح" : "Al Bahah Landmarks Added Successfully",
        description: language === 'ar' ? `تم إضافة ${data?.places?.length || 28} معلم سياحي بنجاح` : `${data?.places?.length || 28} tourist landmarks added successfully`,
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة معالم الباحة" : "Failed to add Al Bahah landmarks",
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
        title: language === 'ar' ? "تم إنشاء رمز الدعوة" : "Invite Code Created",
        description: language === 'ar' 
          ? `تم إنشاء رمز دعوة جديد لدور ${data.role === 'guide' ? 'مرشد' : 'مشرف'}`
          : `New invite code created for ${data.role === 'guide' ? 'guide' : 'admin'} role`,
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إنشاء رمز الدعوة" : "Failed to create invite code",
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
        title: language === 'ar' ? "تم حذف رمز الدعوة" : "Invite Code Deleted",
        description: language === 'ar' ? "تم حذف رمز الدعوة بنجاح" : "Invite code has been deleted successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف رمز الدعوة" : "Failed to delete invite code",
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
        title: language === 'ar' ? "تم تحديث الدور" : "Role Updated",
        description: language === 'ar' ? "تم تحديث دور المستخدم بنجاح" : "User role has been updated successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث دور المستخدم" : "Failed to update user role",
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
        title: language === 'ar' ? "تم حذف المستخدم" : "User Deleted",
        description: language === 'ar' ? "تم حذف المستخدم وجميع بياناته بنجاح" : "User and all their data have been deleted successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف المستخدم" : "Failed to delete user",
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
        title: language === 'ar' ? "تم إضافة عضو الفريق" : "Team Member Added",
        description: language === 'ar' ? "تم إضافة عضو جديد لفريق العمل بنجاح" : "New team member has been added successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة عضو الفريق" : "Failed to add team member",
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
        title: language === 'ar' ? "تم تحديث عضو الفريق" : "Team Member Updated",
        description: language === 'ar' ? "تم تحديث بيانات عضو الفريق بنجاح" : "Team member data has been updated successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث عضو الفريق" : "Failed to update team member",
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
        title: language === 'ar' ? "تم حذف عضو الفريق" : "Team Member Deleted",
        description: language === 'ar' ? "تم حذف عضو الفريق بنجاح" : "Team member has been deleted successfully",
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف عضو الفريق" : "Failed to delete team member",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: language === 'ar' ? "تم النسخ" : "Copied",
        description: language === 'ar' ? "تم نسخ رمز الدعوة إلى الحافظة" : "Invite code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: language === 'ar' ? "خطأ في النسخ" : "Copy Error",
        description: language === 'ar' ? "فشل في نسخ رمز الدعوة" : "Failed to copy invite code",
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
    const confirmMsg = language === 'ar' 
      ? "هل أنت متأكد من إضافة جميع معالم الباحة السياحية؟ سيتم إضافة 28 معلم سياحي."
      : "Are you sure you want to add all Al Bahah tourist landmarks? 28 landmarks will be added.";
    if (confirm(confirmMsg)) {
      seedPlacesMutation.mutate();
    }
  };

  const handleDeletePlace = (place: Place) => {
    const confirmMsg = language === 'ar' 
      ? `هل أنت متأكد من حذف "${place.name}"؟`
      : `Are you sure you want to delete "${place.name}"?`;
    if (confirm(confirmMsg)) {
      deletePlaceMutation.mutate(place.id);
    }
  };

  const handleSubmitTeamMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertTeamMember = {
      name: formData.get("name") as string,
      nameEn: formData.get("nameEn") as string || null,
      role: formData.get("role") as string,
      roleEn: formData.get("roleEn") as string || null,
      description: formData.get("description") as string,
      descriptionEn: formData.get("descriptionEn") as string || null,
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
    const confirmMsg = language === 'ar' 
      ? `هل أنت متأكد من حذف "${member.name}"؟`
      : `Are you sure you want to delete "${member.name}"?`;
    if (confirm(confirmMsg)) {
      deleteTeamMemberMutation.mutate(member.id);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground">{language === 'ar' ? 'إدارة المنصة والمحتوى والمستخدمين' : 'Manage platform, content, and users'}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-places">{stats.totalPlaces}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'الأماكن السياحية' : 'Tourist Places'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-guides">{stats.totalGuides}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'المرشدين السياحيين' : 'Tour Guides'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-bookings">{stats.totalBookings}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold" data-testid="stat-pending">{stats.pendingBookings}</h3>
              <p className="text-muted-foreground">{language === 'ar' ? 'حجوزات في الانتظار' : 'Pending Bookings'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full overflow-x-auto -mx-4 px-4">
            <TabsTrigger value="places" data-testid="tab-places" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'الأماكن السياحية' : 'Tourist Places'}</TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'المرشدين السياحيين' : 'Tour Guides'}</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'الحجوزات' : 'Bookings'}</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</TabsTrigger>
            <TabsTrigger value="team" data-testid="tab-team" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'فريق العمل' : 'Team'}</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'محتوى الموقع' : 'Website Content'}</TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites" className="shrink-0 whitespace-nowrap">{language === 'ar' ? 'رموز الدعوة' : 'Invite Codes'}</TabsTrigger>
          </TabsList>

          {/* Places Management */}
          <TabsContent value="places">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{language === 'ar' ? 'إدارة الأماكن السياحية' : 'Tourist Places Management'}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSeedPlaces}
                      variant="outline"
                      disabled={seedPlacesMutation.isPending}
                      data-testid="button-seed-places"
                    >
                      {seedPlacesMutation.isPending 
                        ? (language === 'ar' ? 'جاري إضافة المعالم...' : 'Adding landmarks...') 
                        : (language === 'ar' ? 'إضافة معالم الباحة' : 'Add Al Bahah Landmarks')}
                    </Button>
                    <Dialog open={isPlaceDialogOpen} onOpenChange={setIsPlaceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setEditingPlace(null)}
                          data-testid="button-add-place"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          {language === 'ar' ? 'إضافة مكان جديد' : 'Add New Place'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPlace 
                            ? (language === 'ar' ? 'تعديل المكان السياحي' : 'Edit Tourist Place') 
                            : (language === 'ar' ? 'إضافة مكان سياحي جديد' : 'Add New Tourist Place')}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmitPlace} className="space-y-4 pb-4">
                        <div>
                          <Label htmlFor="name">{language === 'ar' ? 'اسم المكان' : 'Place Name'}</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingPlace?.name || ""}
                            required
                            data-testid="input-place-name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={editingPlace?.description || ""}
                            required
                            data-testid="input-place-description"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label>{language === 'ar' ? 'صورة المكان' : 'Place Image'}</Label>
                          <ImageUploader
                            value={placeImageUrl}
                            onChange={setPlaceImageUrl}
                            preview={true}
                            className="w-full"
                          />
                          <div className="text-center text-sm text-muted-foreground">{language === 'ar' ? 'أو' : 'or'}</div>
                          <div>
                            <Label htmlFor="imageUrl">{language === 'ar' ? 'رابط الصورة (URL)' : 'Image URL'}</Label>
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
                              {language === 'ar' ? 'يمكنك إدخال رابط صورة من الإنترنت مباشرة' : 'You can enter an image URL directly from the internet'}
                            </p>
                          </div>
                          {placeImageUrl && (
                            <div className="mt-2 p-2 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-2">{language === 'ar' ? 'معاينة الصورة:' : 'Image Preview:'}</p>
                              <img 
                                src={placeImageUrl} 
                                alt={language === 'ar' ? 'معاينة' : 'Preview'} 
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
                          <Label htmlFor="location">{language === 'ar' ? 'الموقع' : 'Location'}</Label>
                          <Input
                            id="location"
                            name="location"
                            defaultValue={editingPlace?.location || ""}
                            data-testid="input-place-location"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">{language === 'ar' ? 'الفئة' : 'Category'}</Label>
                          <Input
                            id="category"
                            name="category"
                            defaultValue={editingPlace?.category || ""}
                            placeholder={language === 'ar' ? 'مثال: طبيعة، تراث، جبال' : 'e.g., Nature, Heritage, Mountains'}
                            data-testid="input-place-category"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="websiteUrl">{language === 'ar' ? 'رابط الموقع الإلكتروني' : 'Website URL'}</Label>
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
                            {language === 'ar' ? 'رابط الموقع الإلكتروني الرسمي للمكان (اختياري)' : 'Official website URL for the place (optional)'}
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                          <Label className="text-blue-800 dark:text-blue-200 font-semibold mb-2 block">
                            📍 {language === 'ar' ? 'إحداثيات الموقع على الخريطة' : 'Map Coordinates'}
                          </Label>
                          <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
                            {language === 'ar' 
                              ? 'يمكنك الحصول على الإحداثيات من Google Maps بالضغط بزر الماوس الأيمن على الموقع'
                              : 'You can get coordinates from Google Maps by right-clicking on the location'}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="latitude" className="text-sm">خط العرض (Latitude)</Label>
                              <Input
                                id="latitude"
                                name="latitude"
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9.-]*"
                                defaultValue={editingPlace?.latitude ? parseFloat(editingPlace.latitude).toString() : ""}
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
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9.-]*"
                                defaultValue={editingPlace?.longitude ? parseFloat(editingPlace.longitude).toString() : ""}
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
                            {createPlaceMutation.isPending || updatePlaceMutation.isPending 
                              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                              : editingPlace 
                                ? (language === 'ar' ? 'تحديث' : 'Update') 
                                : (language === 'ar' ? 'إضافة' : 'Add')}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsPlaceDialogOpen(false)}
                            data-testid="button-cancel-place"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
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
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد أماكن سياحية' : 'No tourist places'}</p>
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
                <CardTitle>{language === 'ar' ? 'إدارة المرشدين السياحيين' : 'Tour Guides Management'}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {guides.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا يوجد مرشدين سياحيين' : 'No tour guides'}</p>
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
                <CardTitle>{language === 'ar' ? 'إدارة الحجوزات' : 'Bookings Management'}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold mb-1" data-testid={`booking-id-${booking.id}`}>
                                {language === 'ar' ? `حجز رقم: ${booking.id.slice(-6)}` : `Booking #${booking.id.slice(-6)}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' 
                                  ? `من ${new Date(booking.startDate).toLocaleDateString('ar-SA')} إلى ${new Date(booking.endDate).toLocaleDateString('ar-SA')}`
                                  : `From ${new Date(booking.startDate).toLocaleDateString('en-US')} to ${new Date(booking.endDate).toLocaleDateString('en-US')}`}
                              </p>
                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {language === 'ar' ? `ملاحظات: ${booking.notes}` : `Notes: ${booking.notes}`}
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
                                {language === 'ar'
                                  ? (booking.status === 'confirmed' ? 'مؤكد' :
                                     booking.status === 'pending' ? 'في الانتظار' :
                                     booking.status === 'completed' ? 'مكتمل' : 'ملغي')
                                  : (booking.status === 'confirmed' ? 'Confirmed' :
                                     booking.status === 'pending' ? 'Pending' :
                                     booking.status === 'completed' ? 'Completed' : 'Cancelled')}
                              </Badge>
                              <p className="text-sm font-semibold mt-2" data-testid={`booking-amount-${booking.id}`}>
                                {language === 'ar' ? `${booking.totalAmount} ر.س` : `${booking.totalAmount} SAR`}
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
                <CardTitle>{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا يوجد مستخدمين' : 'No users'}</p>
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
                                {language === 'ar'
                                  ? (u.role === 'tourist' ? 'سائح' : u.role === 'guide' ? 'مرشد' : 'مشرف')
                                  : (u.role === 'tourist' ? 'Tourist' : u.role === 'guide' ? 'Guide' : 'Admin')}
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
                                  {language === 'ar' ? 'سائح' : 'Tourist'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateUserRoleMutation.mutate({ userId: u.id, role: "guide" })}
                                  disabled={u.role === "guide"}
                                  data-testid={`button-role-guide-${u.id}`}
                                >
                                  {language === 'ar' ? 'مرشد' : 'Guide'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateUserRoleMutation.mutate({ userId: u.id, role: "admin" })}
                                  disabled={u.role === "admin"}
                                  data-testid={`button-role-admin-${u.id}`}
                                >
                                  {language === 'ar' ? 'مشرف' : 'Admin'}
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
                                    <AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {language === 'ar' 
                                        ? `هل أنت متأكد من حذف المستخدم "${u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}"؟ سيتم حذف جميع البيانات المرتبطة به (الحجوزات، الرسائل، التقييمات) ولا يمكن التراجع عن هذا الإجراء.`
                                        : `Are you sure you want to delete user "${u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}"? All associated data (bookings, messages, reviews) will be deleted and this action cannot be undone.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(u.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      data-testid={`button-confirm-delete-user-${u.id}`}
                                    >
                                      {language === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}
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
                  <CardTitle>{language === 'ar' ? 'إدارة فريق العمل' : 'Team Management'}</CardTitle>
                  <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setEditingTeamMember(null)}
                        data-testid="button-add-team-member"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        {language === 'ar' ? 'إضافة عضو جديد' : 'Add New Member'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg w-[95vw] h-[95vh] p-0 flex flex-col">
                      <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle>
                          {editingTeamMember 
                            ? (language === 'ar' ? 'تعديل عضو الفريق' : 'Edit Team Member') 
                            : (language === 'ar' ? 'إضافة عضو جديد للفريق' : 'Add New Team Member')}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto px-6 pb-4" style={{minHeight: 0}}>
                          <form id="team-member-form" onSubmit={handleSubmitTeamMember} className="space-y-6 pb-24">
                            {/* Arabic Fields */}
                            <div className="border-b pb-4">
                              <h3 className="text-lg font-semibold mb-4 text-primary">{language === 'ar' ? 'البيانات بالعربية' : 'Arabic Data'}</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name">{language === 'ar' ? 'اسم العضو (عربي)' : 'Member Name (Arabic)'}</Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingTeamMember?.name || ""}
                                    required
                                    dir="rtl"
                                    data-testid="input-team-member-name"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="role">{language === 'ar' ? 'المنصب (عربي)' : 'Position (Arabic)'}</Label>
                                  <Input
                                    id="role"
                                    name="role"
                                    defaultValue={editingTeamMember?.role || ""}
                                    required
                                    dir="rtl"
                                    data-testid="input-team-member-role"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="description">{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                                  <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={editingTeamMember?.description || ""}
                                    data-testid="input-team-member-description"
                                    rows={2}
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* English Fields */}
                            <div className="border-b pb-4">
                              <h3 className="text-lg font-semibold mb-4 text-primary">{language === 'ar' ? 'البيانات بالإنجليزية' : 'English Data'}</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nameEn">{language === 'ar' ? 'اسم العضو (إنجليزي)' : 'Member Name (English)'}</Label>
                                  <Input
                                    id="nameEn"
                                    name="nameEn"
                                    defaultValue={editingTeamMember?.nameEn || ""}
                                    dir="ltr"
                                    data-testid="input-team-member-name-en"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="roleEn">{language === 'ar' ? 'المنصب (إنجليزي)' : 'Position (English)'}</Label>
                                  <Input
                                    id="roleEn"
                                    name="roleEn"
                                    defaultValue={editingTeamMember?.roleEn || ""}
                                    dir="ltr"
                                    data-testid="input-team-member-role-en"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="descriptionEn">{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                                  <Textarea
                                    id="descriptionEn"
                                    name="descriptionEn"
                                    defaultValue={editingTeamMember?.descriptionEn || ""}
                                    data-testid="input-team-member-description-en"
                                    rows={2}
                                    dir="ltr"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>{language === 'ar' ? 'صورة العضو' : 'Member Photo'}</Label>
                              <ImageUploader
                                value={teamMemberImageUrl}
                                onChange={setTeamMemberImageUrl}
                                preview={true}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="orderIndex">{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
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
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button 
                          type="submit" 
                          form="team-member-form"
                          disabled={createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending}
                          data-testid="button-save-team-member"
                        >
                          {createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending 
                            ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                            : editingTeamMember 
                              ? (language === 'ar' ? 'تحديث' : 'Update') 
                              : (language === 'ar' ? 'إضافة' : 'Add')
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
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا يوجد أعضاء في الفريق' : 'No team members'}</p>
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
                                  alt={language === 'en' && member.nameEn ? member.nameEn : member.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold">
                                  {(language === 'en' && member.nameEn ? member.nameEn : member.name).charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate" data-testid={`team-member-name-${member.id}`}>
                                {language === 'en' && member.nameEn ? member.nameEn : member.name}
                              </h4>
                              <p className="text-sm text-primary font-medium" data-testid={`team-member-role-${member.id}`}>
                                {language === 'en' && member.roleEn ? member.roleEn : member.role}
                              </p>
                              {(member.description || member.descriptionEn) && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`team-member-description-${member.id}`}>
                                  {language === 'en' && member.descriptionEn ? member.descriptionEn : member.description}
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
                  {language === 'ar' ? 'إدارة محتوى الموقع' : 'Website Content Management'}
                </CardTitle>
                <p className="text-muted-foreground">{language === 'ar' ? 'تعديل النصوص والمحتوى القابل للتحرير في الموقع' : 'Edit texts and editable content on the website'}</p>
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
                  <CardTitle>{language === 'ar' ? 'إدارة رموز الدعوة' : 'Invite Codes Management'}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createInviteMutation.mutate("guide")}
                      disabled={createInviteMutation.isPending}
                      data-testid="button-create-guide-invite"
                    >
                      <Key className="w-4 h-4 ml-2" />
                      {language === 'ar' ? 'رمز دعوة مرشد' : 'Guide Invite Code'}
                    </Button>
                    <Button
                      onClick={() => createInviteMutation.mutate("admin")}
                      disabled={createInviteMutation.isPending}
                      data-testid="button-create-admin-invite"
                    >
                      <UserCheck className="w-4 h-4 ml-2" />
                      {language === 'ar' ? 'رمز دعوة مشرف' : 'Admin Invite Code'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invites.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد رموز دعوة' : 'No invite codes'}</p>
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
                                {language === 'ar' 
                                  ? `نوع الدور: ${invite.role === 'guide' ? 'مرشد' : 'مشرف'} • تم الإنشاء: ${invite.createdAt ? new Date(invite.createdAt).toLocaleDateString('ar-SA') : 'غير معروف'}`
                                  : `Role: ${invite.role === 'guide' ? 'Guide' : 'Admin'} • Created: ${invite.createdAt ? new Date(invite.createdAt).toLocaleDateString('en-US') : 'Unknown'}`}
                              </p>
                              {invite.isUsed && (
                                <p className="text-sm text-green-600 mt-1" data-testid={`invite-used-${invite.id}`}>
                                  {language === 'ar' 
                                    ? `تم الاستخدام في: ${invite.usedAt ? new Date(invite.usedAt).toLocaleDateString('ar-SA') : 'غير معروف'}`
                                    : `Used on: ${invite.usedAt ? new Date(invite.usedAt).toLocaleDateString('en-US') : 'Unknown'}`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={invite.isUsed ? "secondary" : "default"}
                                data-testid={`invite-status-${invite.id}`}
                              >
                                {language === 'ar' 
                                  ? (invite.isUsed ? 'مستخدم' : 'متاح')
                                  : (invite.isUsed ? 'Used' : 'Available')}
                              </Badge>
                              {invite.isUsed && invite.usedBy && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(language === 'ar' 
                                      ? 'هل أنت متأكد من إزالة صلاحيات هذا المستخدم وتحويله لزائر عادي؟' 
                                      : 'Are you sure you want to revoke this user\'s privileges and make them a regular visitor?')) {
                                      updateUserRoleMutation.mutate({ userId: invite.usedBy!, role: "tourist" });
                                    }
                                  }}
                                  disabled={updateUserRoleMutation.isPending}
                                  data-testid={`button-revoke-role-${invite.id}`}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <UserX className="w-4 h-4" />
                                  <span className="mr-1 text-xs">
                                    {language === 'ar' ? 'إزالة الصلاحيات' : 'Revoke'}
                                  </span>
                                </Button>
                              )}
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
              <DialogTitle>{language === 'ar' ? 'رمز الدعوة الجديد' : 'New Invite Code'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? 'رمز الدعوة:' : 'Invite Code:'}</p>
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
                {language === 'ar' 
                  ? 'شارك هذا الرمز مع الشخص المناسب لتحديث دوره في المنصة'
                  : 'Share this code with the appropriate person to update their role on the platform'}
              </p>
              <Button 
                onClick={() => setIsInviteDialogOpen(false)} 
                className="w-full"
                data-testid="button-close-invite-dialog"
              >
                {language === 'ar' ? 'حسناً' : 'OK'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
