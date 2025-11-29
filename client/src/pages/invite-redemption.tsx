import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ticket, AlertCircle, CheckCircle } from "lucide-react";

const getInviteSchema = (language: 'ar' | 'en') => z.object({
  code: z.string()
    .min(1, language === 'ar' ? "كود الدعوة مطلوب" : "Invite code is required")
    .max(20, language === 'ar' ? "كود الدعوة طويل جداً" : "Invite code is too long"),
});

type InviteForm = { code: string };

export default function InviteRedemption() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  const inviteSchema = getInviteSchema(language);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      code: "",
    },
  });

  const redeemInviteMutation = useMutation({
    mutationFn: async (data: InviteForm) => {
      const response = await apiRequest("POST", `/api/invites/use`, data);
      return await response.json();
    },
    onSuccess: async (data) => {
      setSuccessMessage(data.message || (language === 'ar' ? "تم تفعيل كود الدعوة بنجاح!" : "Invite code activated successfully!"));
      toast({
        title: language === 'ar' ? "تم استخدام الكود بنجاح!" : "Code Used Successfully!",
        description: data.message || (language === 'ar' ? "تم تحديث دورك في النظام" : "Your role has been updated"),
      });
      
      // Refetch user data to get updated role
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect based on new role after a short delay
      setTimeout(() => {
        if (data.user?.role === "guide") {
          setLocation("/dashboard");
        } else if (data.user?.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || (language === 'ar' ? "حدث خطأ أثناء استخدام كود الدعوة" : "An error occurred while using the invite code");
      toast({
        variant: "destructive",
        title: language === 'ar' ? "فشل في استخدام الكود" : "Failed to Use Code",
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: InviteForm) => {
    redeemInviteMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{language === 'ar' ? 'استخدام كود الدعوة' : 'Use Invite Code'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'أدخل كود الدعوة لترقية حسابك إلى مرشد سياحي أو مشرف'
                  : 'Enter the invite code to upgrade your account to a tour guide or admin'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {successMessage ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage} - {language === 'ar' ? 'سيتم توجيهك إلى لوحة التحكم خلال ثوانٍ...' : 'Redirecting to dashboard in a few seconds...'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'ar' ? 'كود الدعوة' : 'Invite Code'}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={language === 'ar' ? "أدخل كود الدعوة هنا" : "Enter invite code here"} 
                              {...field}
                              data-testid="input-invite-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={redeemInviteMutation.isPending}
                        data-testid="button-redeem-invite"
                      >
                        {redeemInviteMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                            {language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                          </>
                        ) : (
                          language === 'ar' ? "استخدام الكود" : "Use Code"
                        )}
                      </Button>

                      <div className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setLocation("/")}
                          data-testid="button-back-home"
                        >
                          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              )}

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      {language === 'ar' ? (
                        <>
                          <li>كود الدعوة يستخدم مرة واحدة فقط</li>
                          <li>سيتم ترقية حسابك تلقائياً بعد إدخال الكود الصحيح</li>
                          <li>إذا كان لديك كود مرشد، ستحصل على حساب مرشد سياحي</li>
                          <li>إذا كان لديك كود إداري، ستحصل على صلاحيات المشرف</li>
                        </>
                      ) : (
                        <>
                          <li>Invite codes can only be used once</li>
                          <li>Your account will be automatically upgraded after entering the correct code</li>
                          <li>If you have a guide code, you will get a tour guide account</li>
                          <li>If you have an admin code, you will get admin privileges</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}