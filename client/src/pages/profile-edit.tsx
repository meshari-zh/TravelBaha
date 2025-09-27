import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Settings, Save, ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const profileSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50, "الاسم الأول طويل جداً"),
  lastName: z.string().min(1, "اسم العائلة مطلوب").max(50, "اسم العائلة طويل جداً"),
  profileImageUrl: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileEdit() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      profileImageUrl: user?.profileImageUrl || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || "",
      });
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PUT", "/api/users/profile", data);
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: language === 'ar' ? "تم تحديث الملف الشخصي!" : "Profile Updated!",
        description: language === 'ar' ? "تم حفظ تغييراتك بنجاح" : "Your changes have been saved successfully",
      });
      
      // Update the cached user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Navigate back after a brief delay
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "حدث خطأ أثناء تحديث الملف الشخصي";
      toast({
        variant: "destructive",
        title: "فشل في التحديث",
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    const updatedData = {
      ...data,
      profileImageUrl,
    };
    updateProfileMutation.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <Alert>
              <AlertDescription>
                يرجى تسجيل الدخول لتعديل ملفك الشخصي
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">تعديل الملف الشخصي</CardTitle>
              <CardDescription>
                قم بتحديث معلوماتك الشخصية
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Profile Picture Preview */}
                  <div className="flex justify-center mb-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={profileImageUrl || user?.profileImageUrl || undefined} 
                        alt={`${user?.firstName} ${user?.lastName}`} 
                      />
                      <AvatarFallback className="text-lg">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الأول</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل اسمك الأول" 
                            {...field}
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العائلة</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل اسم عائلتك" 
                            {...field}
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>الصورة الشخصية (اختياري)</FormLabel>
                    <ImageUploader
                      value={profileImageUrl}
                      onChange={setProfileImageUrl}
                      preview={true}
                      className="w-full mt-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLocation("/")}
                        data-testid="button-back-home"
                      >
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        العودة للرئيسية
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>ملاحظات:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>يمكنك رفع صورة شخصية جديدة أو ترك الحقل فارغاً لاستخدام الصورة الافتراضية</li>
                    <li>يمكنك سحب الصورة وإفلاتها أو النقر لاختيارها من جهازك</li>
                    <li>سيتم حفظ التغييرات فوراً بعد الضغط على زر الحفظ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}