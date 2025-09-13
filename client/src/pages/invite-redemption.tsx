import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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

const inviteSchema = z.object({
  code: z.string().min(1, "كود الدعوة مطلوب").max(20, "كود الدعوة طويل جداً"),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function InviteRedemption() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string>("");

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
      setSuccessMessage(data.message || "تم تفعيل كود الدعوة بنجاح!");
      toast({
        title: "تم استخدام الكود بنجاح!",
        description: data.message || "تم تحديث دورك في النظام",
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
      const errorMessage = error.message || "حدث خطأ أثناء استخدام كود الدعوة";
      toast({
        variant: "destructive",
        title: "فشل في استخدام الكود",
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
              <CardTitle className="text-2xl">استخدام كود الدعوة</CardTitle>
              <CardDescription>
                أدخل كود الدعوة لترقية حسابك إلى مرشد سياحي أو مشرف
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {successMessage ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage} - سيتم توجيهك إلى لوحة التحكم خلال ثوانٍ...
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
                          <FormLabel>كود الدعوة</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="أدخل كود الدعوة هنا" 
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
                            جاري التحقق...
                          </>
                        ) : (
                          "استخدام الكود"
                        )}
                      </Button>

                      <div className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setLocation("/")}
                          data-testid="button-back-home"
                        >
                          العودة للرئيسية
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
                    <p><strong>ملاحظة:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>كود الدعوة يستخدم مرة واحدة فقط</li>
                      <li>سيتم ترقية حسابك تلقائياً بعد إدخال الكود الصحيح</li>
                      <li>إذا كان لديك كود مرشد، ستحصل على حساب مرشد سياحي</li>
                      <li>إذا كان لديك كود إداري، ستحصل على صلاحيات المشرف</li>
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