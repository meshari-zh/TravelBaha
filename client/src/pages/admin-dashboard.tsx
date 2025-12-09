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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, MapPin, MessageCircle, TrendingUp, UserCheck, UserX, Key, Copy, MessageCircleQuestion, CheckCircle, Clock, Menu, GripVertical, Eye, EyeOff, ExternalLink, ChevronDown, RefreshCw, Settings } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Place, Guide, InsertPlace, Booking, User, Invite, TeamMember, InsertTeamMember, QuickQuestion, NavigationItem, InsertNavigationItem, DynamicPage, InsertDynamicPage, SiteContent } from "@shared/schema";

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
    select: (data: any) => data?.content || (language === 'ar' ? 'استكشف جمال منطقة الباحة والمدن السعودية' : 'Explore the beauty of AlBaha region and Saudi cities')
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

// مكون إدارة محتوى الصفحة الرئيسية ولوحة التحكم
function HomeAndDashboardContentEditor() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
  const [showAddForm, setShowAddForm] = useState<{[key: string]: boolean}>({});
  const [newCardData, setNewCardData] = useState<{[key: string]: { titleAr: string; titleEn: string; contentAr: string; contentEn: string; imageUrl?: string; buttonLink?: string; buttonText?: string; buttonTextEn?: string; position?: string }}>({});

  const contentDefaults: { [key: string]: { ar: string; en: string } } = {
    'hero_title': { ar: 'اكتشف جمال الباحة مع أفضل المرشدين السياحيين', en: 'Discover the beauty of AlBaha with the best tour guides' },
    'hero_subtitle': { ar: 'استمتع برحلة لا تُنسى في أجمل المناطق الطبيعية والتراثية في منطقة الباحة', en: 'Enjoy an unforgettable journey through the most beautiful natural and heritage areas in AlBaha region' },
    'welcome_title': { ar: 'أهلاً وسهلاً', en: 'Welcome' },
    'tourist_subtitle': { ar: 'اكتشف جمال الباحة مع أفضل المرشدين السياحيين', en: 'Discover the beauty of AlBaha with the best tour guides' },
    'guide_subtitle': { ar: 'مرحباً بك في لوحة التحكم الخاصة بك', en: 'Welcome to your control panel' },
    'admin_subtitle': { ar: 'مرحباً بك في لوحة تحكم المشرف', en: 'Welcome to admin control panel' },
    'explore_places_title': { ar: 'استكشف الأماكن', en: 'Explore Places' },
    'explore_places_desc': { ar: 'اكتشف أجمل الوجهات السياحية في الباحة', en: 'Discover the most beautiful tourist destinations in AlBaha' },
    'find_guide_title': { ar: 'اختر مرشداً', en: 'Find a Guide' },
    'find_guide_desc': { ar: 'تواصل مع أفضل المرشدين المحليين', en: 'Connect with the best local guides' },
    'my_bookings_title': { ar: 'حجوزاتي', en: 'My Bookings' },
    'my_bookings_desc': { ar: 'تابع رحلاتك القادمة والسابقة', en: 'Track your upcoming and past trips' },
    'admin_dashboard_title': { ar: 'إدارة المنصة والمحتوى', en: 'Platform and Content Management' },
    'admin_panel_title': { ar: 'لوحة الإدارة', en: 'Admin Panel' },
    'places_management_title': { ar: 'الأماكن السياحية', en: 'Tourist Places' },
    'places_management_desc': { ar: 'إدارة الوجهات والمعالم', en: 'Manage destinations and landmarks' },
    'guides_management_title': { ar: 'المرشدين السياحيين', en: 'Tour Guides' },
    'guides_management_desc': { ar: 'إدارة المرشدين السياحيين', en: 'Manage tour guides' },
  };

  const { data: allContent = [] } = useQuery<SiteContent[]>({
    queryKey: ['/api/site-content'],
  });

  const getContentValue = (key: string) => {
    const item = allContent.find(c => c.key === key);
    const defaults = contentDefaults[key] || { ar: '', en: '' };
    const isHidden = item?.content === '__HIDDEN__';
    return {
      id: item?.id,
      ar: item?.content || defaults.ar,
      en: item?.contentEn || defaults.en,
      sectionKey: item?.sectionKey,
      isHidden
    };
  };

  const getDynamicCards = (sectionKey: string) => {
    return allContent.filter(c => c.sectionKey === sectionKey);
  };

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, title, content, contentEn }: { key: string; title: string; content: string; contentEn?: string }) => {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, content, contentEn }),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: language === 'ar' ? "تم التحديث بنجاح" : "Updated Successfully",
        description: language === 'ar' ? "تم حفظ التغييرات" : "Changes have been saved",
      });
      setIsEditing(prev => ({ ...prev, [variables.key]: false }));
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حفظ التغييرات" : "Failed to save changes",
        variant: "destructive"
      });
    }
  });

  const addCardMutation = useMutation({
    mutationFn: async ({ sectionKey, title, titleEn, content, contentEn, imageUrl, buttonLink, buttonText, buttonTextEn, position }: { 
      sectionKey: string; title: string; titleEn: string; content: string; contentEn: string;
      imageUrl?: string; buttonLink?: string; buttonText?: string; buttonTextEn?: string; position?: string;
    }) => {
      const key = `${sectionKey}_${Date.now()}`;
      const response = await fetch('/api/site-content/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, sectionKey, title, titleEn, content, contentEn, imageUrl, buttonLink, buttonText, buttonTextEn, position }),
      });
      if (!response.ok) throw new Error('Failed to add card');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: language === 'ar' ? "تمت الإضافة بنجاح" : "Card Added Successfully",
        description: language === 'ar' ? "تم إضافة البطاقة الجديدة" : "New card has been added",
      });
      setShowAddForm(prev => ({ ...prev, [variables.sectionKey]: false }));
      setNewCardData(prev => ({ ...prev, [variables.sectionKey]: { titleAr: '', titleEn: '', contentAr: '', contentEn: '', imageUrl: '', buttonLink: '', buttonText: '', buttonTextEn: '', position: 'grid' } }));
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة البطاقة" : "Failed to add card",
        variant: "destructive"
      });
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/site-content/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete card');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم الحذف بنجاح" : "Card Deleted Successfully",
        description: language === 'ar' ? "تم حذف البطاقة" : "Card has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف البطاقة" : "Failed to delete card",
        variant: "destructive"
      });
    }
  });

  const hideCardMutation = useMutation({
    mutationFn: async ({ key, title }: { key: string; title: string }) => {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, content: '__HIDDEN__', contentEn: '__HIDDEN__' }),
      });
      if (!response.ok) throw new Error('Failed to hide card');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم الإخفاء بنجاح" : "Card Hidden Successfully",
        description: language === 'ar' ? "تم إخفاء البطاقة" : "Card has been hidden",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إخفاء البطاقة" : "Failed to hide card",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (key: string, title: string) => (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const contentAr = formData.get('contentAr') as string;
    const contentEn = formData.get('contentEn') as string;
    
    if (!contentAr.trim()) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "المحتوى العربي مطلوب" : "Arabic content is required",
        variant: "destructive"
      });
      return;
    }
    
    updateContentMutation.mutate({ key, title, content: contentAr, contentEn });
  };

  const handleAddCard = (sectionKey: string) => {
    const data = newCardData[sectionKey];
    if (!data?.titleAr?.trim() || !data?.contentAr?.trim()) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "العنوان والمحتوى العربي مطلوبان" : "Arabic title and content are required",
        variant: "destructive"
      });
      return;
    }
    addCardMutation.mutate({
      sectionKey,
      title: data.titleAr,
      titleEn: data.titleEn || '',
      content: data.contentAr,
      contentEn: data.contentEn || '',
      imageUrl: data.imageUrl || '',
      buttonLink: data.buttonLink || '',
      buttonText: data.buttonText || '',
      buttonTextEn: data.buttonTextEn || '',
      position: data.position || 'grid'
    });
  };

  const sections = [
    {
      title: language === 'ar' ? 'محتوى الصفحة الرئيسية (للزوار)' : 'Home Page Content (Visitors)',
      icon: '🏠',
      sectionKey: 'hero',
      allowDynamic: true,
      items: [
        { key: 'hero_title', label: language === 'ar' ? 'العنوان الرئيسي' : 'Main Title' },
        { key: 'hero_subtitle', label: language === 'ar' ? 'العنوان الفرعي' : 'Subtitle' },
      ]
    },
    {
      title: language === 'ar' ? 'ترحيب المستخدمين المسجلين' : 'Welcome for Logged-in Users',
      icon: '👋',
      sectionKey: 'welcome',
      allowDynamic: true,
      items: [
        { key: 'welcome_title', label: language === 'ar' ? 'رسالة الترحيب' : 'Welcome Message' },
        { key: 'tourist_subtitle', label: language === 'ar' ? 'رسالة السائح' : 'Tourist Message' },
        { key: 'guide_subtitle', label: language === 'ar' ? 'رسالة المرشد' : 'Guide Message' },
        { key: 'admin_subtitle', label: language === 'ar' ? 'رسالة المشرف' : 'Admin Message' },
      ]
    },
    {
      title: language === 'ar' ? 'بطاقات قسم السائح' : 'Tourist Section Cards',
      icon: '🗺️',
      sectionKey: 'tourist_cards',
      allowDynamic: true,
      items: [
        { key: 'explore_places_title', label: language === 'ar' ? 'عنوان استكشف الأماكن' : 'Explore Places Title' },
        { key: 'explore_places_desc', label: language === 'ar' ? 'وصف استكشف الأماكن' : 'Explore Places Desc' },
        { key: 'find_guide_title', label: language === 'ar' ? 'عنوان اختر مرشد' : 'Find Guide Title' },
        { key: 'find_guide_desc', label: language === 'ar' ? 'وصف اختر مرشد' : 'Find Guide Desc' },
        { key: 'my_bookings_title', label: language === 'ar' ? 'عنوان حجوزاتي' : 'My Bookings Title' },
        { key: 'my_bookings_desc', label: language === 'ar' ? 'وصف حجوزاتي' : 'My Bookings Desc' },
      ]
    },
    {
      title: language === 'ar' ? 'بطاقات قسم المرشد' : 'Guide Section Cards',
      icon: '🎯',
      sectionKey: 'guide_cards',
      allowDynamic: true,
      items: [
        { key: 'guide_dashboard_title', label: language === 'ar' ? 'عنوان لوحة المرشد' : 'Guide Dashboard Title' },
        { key: 'guide_bookings_title', label: language === 'ar' ? 'عنوان حجوزات المرشد' : 'Guide Bookings Title' },
        { key: 'guide_bookings_desc', label: language === 'ar' ? 'وصف حجوزات المرشد' : 'Guide Bookings Desc' },
        { key: 'guide_profile_title', label: language === 'ar' ? 'عنوان ملف المرشد' : 'Guide Profile Title' },
        { key: 'guide_profile_desc', label: language === 'ar' ? 'وصف ملف المرشد' : 'Guide Profile Desc' },
        { key: 'guide_messages_title', label: language === 'ar' ? 'عنوان رسائل المرشد' : 'Guide Messages Title' },
        { key: 'guide_messages_desc', label: language === 'ar' ? 'وصف رسائل المرشد' : 'Guide Messages Desc' },
      ]
    },
    {
      title: language === 'ar' ? 'بطاقات قسم المشرف' : 'Admin Section Cards',
      icon: '⚙️',
      sectionKey: 'admin_cards',
      allowDynamic: true,
      items: [
        { key: 'admin_dashboard_title', label: language === 'ar' ? 'عنوان إدارة المنصة' : 'Platform Management Title' },
        { key: 'admin_panel_title', label: language === 'ar' ? 'عنوان لوحة الإدارة' : 'Admin Panel Title' },
        { key: 'places_management_title', label: language === 'ar' ? 'عنوان إدارة الأماكن' : 'Places Management Title' },
        { key: 'places_management_desc', label: language === 'ar' ? 'وصف إدارة الأماكن' : 'Places Management Desc' },
        { key: 'guides_management_title', label: language === 'ar' ? 'عنوان إدارة المرشدين' : 'Guides Management Title' },
        { key: 'guides_management_desc', label: language === 'ar' ? 'وصف إدارة المرشدين' : 'Guides Management Desc' },
      ]
    }
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          {language === 'ar' ? 'إدارة محتوى الصفحة الرئيسية ولوحة التحكم' : 'Home & Dashboard Content Management'}
        </CardTitle>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'تعديل العناوين والنصوص المعروضة للمستخدمين' : 'Edit titles and texts displayed to users'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => {
          const dynamicCards = getDynamicCards(section.sectionKey);
          
          return (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold flex items-center gap-2 text-lg">
                <span>{section.icon}</span>
                {section.title}
              </h3>
              {section.allowDynamic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(prev => ({ ...prev, [section.sectionKey]: !prev[section.sectionKey] }))}
                  data-testid={`button-add-card-${section.sectionKey}`}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  {language === 'ar' ? 'إضافة بطاقة' : 'Add Card'}
                </Button>
              )}
            </div>
            
            {showAddForm[section.sectionKey] && (
              <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{language === 'ar' ? 'إضافة بطاقة جديدة' : 'Add New Card'}</CardTitle>
                </CardHeader>
                <CardContent className="py-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>🇸🇦 {language === 'ar' ? 'العنوان العربي' : 'Arabic Title'}</Label>
                      <Input
                        value={newCardData[section.sectionKey]?.titleAr || ''}
                        onChange={(e) => setNewCardData(prev => ({
                          ...prev,
                          [section.sectionKey]: { ...prev[section.sectionKey], titleAr: e.target.value }
                        }))}
                        dir="rtl"
                        className="mt-1"
                        data-testid={`input-new-title-ar-${section.sectionKey}`}
                      />
                    </div>
                    <div>
                      <Label>🇬🇧 {language === 'ar' ? 'العنوان الإنجليزي' : 'English Title'}</Label>
                      <Input
                        value={newCardData[section.sectionKey]?.titleEn || ''}
                        onChange={(e) => setNewCardData(prev => ({
                          ...prev,
                          [section.sectionKey]: { ...prev[section.sectionKey], titleEn: e.target.value }
                        }))}
                        dir="ltr"
                        className="mt-1"
                        data-testid={`input-new-title-en-${section.sectionKey}`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>🇸🇦 {language === 'ar' ? 'المحتوى العربي' : 'Arabic Content'}</Label>
                    <Textarea
                      value={newCardData[section.sectionKey]?.contentAr || ''}
                      onChange={(e) => setNewCardData(prev => ({
                        ...prev,
                        [section.sectionKey]: { ...prev[section.sectionKey], contentAr: e.target.value }
                      }))}
                      dir="rtl"
                      rows={2}
                      className="mt-1"
                      data-testid={`input-new-content-ar-${section.sectionKey}`}
                    />
                  </div>
                  <div>
                    <Label>🇬🇧 {language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content'}</Label>
                    <Textarea
                      value={newCardData[section.sectionKey]?.contentEn || ''}
                      onChange={(e) => setNewCardData(prev => ({
                        ...prev,
                        [section.sectionKey]: { ...prev[section.sectionKey], contentEn: e.target.value }
                      }))}
                      dir="ltr"
                      rows={2}
                      className="mt-1"
                      data-testid={`input-new-content-en-${section.sectionKey}`}
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-3">{language === 'ar' ? 'خيارات إضافية (اختيارية)' : 'Additional Options (Optional)'}</p>
                    
                    <div>
                      <Label>🖼️ {language === 'ar' ? 'رابط الصورة' : 'Image URL'}</Label>
                      <Input
                        value={newCardData[section.sectionKey]?.imageUrl || ''}
                        onChange={(e) => setNewCardData(prev => ({
                          ...prev,
                          [section.sectionKey]: { ...prev[section.sectionKey], imageUrl: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'https://...' : 'https://...'}
                        className="mt-1"
                        data-testid={`input-new-image-${section.sectionKey}`}
                      />
                    </div>
                    
                    <div className="mt-3">
                      <Label>🔗 {language === 'ar' ? 'رابط الزر (اختياري)' : 'Button Link (Optional)'}</Label>
                      <Input
                        value={newCardData[section.sectionKey]?.buttonLink || ''}
                        onChange={(e) => setNewCardData(prev => ({
                          ...prev,
                          [section.sectionKey]: { ...prev[section.sectionKey], buttonLink: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? '/page أو https://...' : '/page or https://...'}
                        className="mt-1"
                        data-testid={`input-new-button-link-${section.sectionKey}`}
                      />
                    </div>
                    
                    {newCardData[section.sectionKey]?.buttonLink && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label>🇸🇦 {language === 'ar' ? 'نص الزر بالعربي' : 'Arabic Button Text'}</Label>
                          <Input
                            value={newCardData[section.sectionKey]?.buttonText || ''}
                            onChange={(e) => setNewCardData(prev => ({
                              ...prev,
                              [section.sectionKey]: { ...prev[section.sectionKey], buttonText: e.target.value }
                            }))}
                            dir="rtl"
                            className="mt-1"
                            data-testid={`input-new-button-text-ar-${section.sectionKey}`}
                          />
                        </div>
                        <div>
                          <Label>🇬🇧 {language === 'ar' ? 'نص الزر بالإنجليزي' : 'English Button Text'}</Label>
                          <Input
                            value={newCardData[section.sectionKey]?.buttonTextEn || ''}
                            onChange={(e) => setNewCardData(prev => ({
                              ...prev,
                              [section.sectionKey]: { ...prev[section.sectionKey], buttonTextEn: e.target.value }
                            }))}
                            dir="ltr"
                            className="mt-1"
                            data-testid={`input-new-button-text-en-${section.sectionKey}`}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <Label>📍 {language === 'ar' ? 'موضع البطاقة' : 'Card Position'}</Label>
                      <Select
                        value={newCardData[section.sectionKey]?.position || 'grid'}
                        onValueChange={(value) => setNewCardData(prev => ({
                          ...prev,
                          [section.sectionKey]: { ...prev[section.sectionKey], position: value }
                        }))}
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-position-${section.sectionKey}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">{language === 'ar' ? 'في الشبكة (الجانب)' : 'In Grid (Side)'}</SelectItem>
                          <SelectItem value="bottom">{language === 'ar' ? 'في الأسفل' : 'At Bottom'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleAddCard(section.sectionKey)}
                      disabled={addCardMutation.isPending}
                      data-testid={`button-save-new-card-${section.sectionKey}`}
                    >
                      {addCardMutation.isPending ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : (language === 'ar' ? 'إضافة' : 'Add')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(prev => ({ ...prev, [section.sectionKey]: false }))}
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {section.items.map((item) => {
                const currentValue = getContentValue(item.key);
                
                if (currentValue.isHidden) {
                  return (
                    <Card key={item.key} className="border-l-4 border-l-destructive/50 opacity-60">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">{language === 'ar' ? 'محذوف' : 'Deleted'}</Badge>
                            <CardTitle className="text-base line-through">{item.label}</CardTitle>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => currentValue.id && deleteCardMutation.mutate(currentValue.id)}
                            data-testid={`button-restore-${item.key}`}
                          >
                            <RefreshCw className="w-4 h-4 ml-1" />
                            {language === 'ar' ? 'استعادة' : 'Restore'}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                }
                
                return (
                  <Card key={item.key} className="border-l-4 border-l-primary/50">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{item.label}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            data-testid={`button-edit-${item.key}`}
                          >
                            <Edit className="w-4 h-4 ml-1" />
                            {isEditing[item.key] ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" data-testid={`button-delete-${item.key}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'ar' ? 'هل أنت متأكد من حذف هذه البطاقة؟' : 'Are you sure you want to delete this card?'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (currentValue.id) {
                                      deleteCardMutation.mutate(currentValue.id);
                                    } else {
                                      hideCardMutation.mutate({ key: item.key, title: item.label });
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {language === 'ar' ? 'حذف' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      {!isEditing[item.key] ? (
                        <div className="space-y-2">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">🇸🇦 عربي</p>
                            <p className="text-sm">{currentValue.ar}</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">🇬🇧 English</p>
                            <p className="text-sm">{currentValue.en}</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit(item.key, item.label)} className="space-y-4">
                          <div>
                            <Label htmlFor={`contentAr-${item.key}`}>🇸🇦 {language === 'ar' ? 'المحتوى العربي' : 'Arabic Content'}</Label>
                            <Textarea
                              id={`contentAr-${item.key}`}
                              name="contentAr"
                              defaultValue={currentValue.ar}
                              rows={2}
                              className="mt-1"
                              dir="rtl"
                              data-testid={`input-ar-${item.key}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contentEn-${item.key}`}>🇬🇧 {language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content'}</Label>
                            <Textarea
                              id={`contentEn-${item.key}`}
                              name="contentEn"
                              defaultValue={currentValue.en}
                              rows={2}
                              className="mt-1"
                              dir="ltr"
                              data-testid={`input-en-${item.key}`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={updateContentMutation.isPending} data-testid={`button-save-${item.key}`}>
                              {updateContentMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(prev => ({ ...prev, [item.key]: false }))}>
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {dynamicCards.map((card) => (
                <Card key={card.id} className="border-l-4 border-l-green-500/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{language === 'ar' ? 'مخصص' : 'Custom'}</Badge>
                        <CardTitle className="text-base">{language === 'ar' ? card.title : (card.titleEn || card.title)}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                          data-testid={`button-edit-dynamic-${card.id}`}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          {isEditing[card.id] ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" data-testid={`button-delete-dynamic-${card.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === 'ar' ? 'هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this card? This action cannot be undone.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCardMutation.mutate(card.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    {!isEditing[card.id] ? (
                      <div className="space-y-2">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">🇸🇦 عربي</p>
                          <p className="text-sm">{card.content}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">🇬🇧 English</p>
                          <p className="text-sm">{card.contentEn || '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(card.key, card.title)} className="space-y-4">
                        <div>
                          <Label>🇸🇦 {language === 'ar' ? 'المحتوى العربي' : 'Arabic Content'}</Label>
                          <Textarea
                            name="contentAr"
                            defaultValue={card.content}
                            rows={2}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label>🇬🇧 {language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content'}</Label>
                          <Textarea
                            name="contentEn"
                            defaultValue={card.contentEn || ''}
                            rows={2}
                            className="mt-1"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={updateContentMutation.isPending}>
                            {updateContentMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsEditing(prev => ({ ...prev, [card.id]: false }))}>
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )})}
      </CardContent>
    </Card>
  );
}

// مكون إدارة الأسئلة السريعة
function QuickQuestionsManagement({ language, toast }: { language: string; toast: any }) {
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
  const [answerEnText, setAnswerEnText] = useState<{ [key: string]: string }>({});
  const [questionEnText, setQuestionEnText] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ question: string; questionEn: string; answer: string; answerEn: string }>({
    question: '', questionEn: '', answer: '', answerEn: ''
  });

  const { data: positionSetting } = useQuery<{ key: string; value: string | null }>({
    queryKey: ['/api/settings/quickQuestionsPosition'],
  });

  const positionMutation = useMutation({
    mutationFn: async (position: string) => {
      const response = await fetch('/api/settings/quickQuestionsPosition', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: position }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update position');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث موضع الأسئلة السريعة' : 'Quick questions position updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/quickQuestionsPosition'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الموضع' : 'Failed to update position',
        variant: 'destructive',
      });
    },
  });

  const { data: unansweredQuestions = [], isLoading: loadingUnanswered } = useQuery<QuickQuestion[]>({
    queryKey: ['/api/quick-questions/unanswered'],
  });

  const { data: answeredQuestions = [], isLoading: loadingAnswered } = useQuery<QuickQuestion[]>({
    queryKey: ['/api/quick-questions/answered'],
  });

  const answerMutation = useMutation({
    mutationFn: async ({ id, answer, answerEn, questionEn }: { id: string; answer: string; answerEn?: string; questionEn?: string }) => {
      if (questionEn) {
        const translationResponse = await fetch(`/api/quick-questions/${id}/translation`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionEn }),
          credentials: 'include',
        });
        if (!translationResponse.ok) throw new Error('Failed to update question translation');
      }
      const response = await fetch(`/api/quick-questions/${id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, answerEn }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to answer question');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم الرد بنجاح' : 'Answer Submitted',
        description: language === 'ar' ? 'تم إرسال الرد على السؤال مع الترجمة' : 'Your answer and translation have been submitted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/unanswered'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/answered'] });
      setAnswerText({});
      setAnswerEnText({});
      setQuestionEnText({});
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إرسال الرد أو الترجمة' : 'Failed to submit answer or translation',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quick-questions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete question');
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف السؤال بنجاح' : 'Question deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/unanswered'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/answered'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف السؤال' : 'Failed to delete question',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { question?: string; questionEn?: string; answer?: string; answerEn?: string } }) => {
      const response = await fetch(`/api/quick-questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update question');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث السؤال والإجابة بنجاح' : 'Question and answer updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/unanswered'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quick-questions/answered'] });
      setEditingId(null);
      setEditForm({ question: '', questionEn: '', answer: '', answerEn: '' });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث السؤال' : 'Failed to update question',
        variant: 'destructive',
      });
    },
  });

  const startEditing = (q: QuickQuestion) => {
    setEditingId(q.id);
    setEditForm({
      question: q.question || '',
      questionEn: q.questionEn || '',
      answer: q.answer || '',
      answerEn: q.answerEn || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ question: '', questionEn: '', answer: '', answerEn: '' });
  };

  const saveEditing = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      updates: editForm,
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              {language === 'ar' ? 'إعدادات الأسئلة السريعة' : 'Quick Questions Settings'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label className="min-w-fit">{language === 'ar' ? 'موضع الأسئلة السريعة:' : 'Quick Questions Position:'}</Label>
            <Select
              value={positionSetting?.value || 'left'}
              onValueChange={(value) => positionMutation.mutate(value)}
              disabled={positionMutation.isPending}
            >
              <SelectTrigger className="w-48" data-testid="select-quick-questions-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{language === 'ar' ? 'يسار' : 'Left'}</SelectItem>
                <SelectItem value="right">{language === 'ar' ? 'يمين' : 'Right'}</SelectItem>
                <SelectItem value="center">{language === 'ar' ? 'وسط' : 'Center'}</SelectItem>
              </SelectContent>
            </Select>
            {positionMutation.isPending && (
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              {language === 'ar' ? 'الأسئلة الجديدة (بانتظار الرد)' : 'New Questions (Pending Answer)'}
              <Badge variant="secondary" className="mr-2">{unansweredQuestions.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUnanswered ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" />
            </div>
          ) : unansweredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircleQuestion className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد أسئلة جديدة' : 'No new questions'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unansweredQuestions.map((q) => (
                <Card key={q.id} className="border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            {language === 'ar' ? 'جديد' : 'New'}
                          </Badge>
                          {q.askerName && (
                            <span className="text-sm text-muted-foreground">{q.askerName}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
                        </div>
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            {language === 'ar' ? 'السؤال (عربي):' : 'Question (Arabic):'}
                          </Label>
                          <p className="text-lg font-medium bg-gray-50 dark:bg-gray-800 p-2 rounded">{q.question || (language === 'ar' ? '(لا يوجد - السؤال بالإنجليزية)' : '(None - Question in English)')}</p>
                        </div>
                        {q.questionEn && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              {language === 'ar' ? 'السؤال الأصلي (إنجليزي):' : 'Original Question (English):'}
                            </Label>
                            <p className="text-lg font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-blue-800 dark:text-blue-200">{q.questionEn}</p>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            {language === 'ar' ? 'ترجمة السؤال (إنجليزي):' : 'Question Translation (English):'}
                          </Label>
                          <Input
                            placeholder={language === 'ar' ? 'اكتب ترجمة السؤال بالإنجليزية...' : 'Write question translation in English...'}
                            value={questionEnText[q.id] || q.questionEn || ''}
                            onChange={(e) => setQuestionEnText(prev => ({ ...prev, [q.id]: e.target.value }))}
                            data-testid={`input-question-en-${q.id}`}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              {language === 'ar' ? 'الرد (عربي):' : 'Answer (Arabic):'}
                            </Label>
                            <Textarea
                              placeholder={language === 'ar' ? 'اكتب الرد بالعربية...' : 'Write answer in Arabic...'}
                              value={answerText[q.id] || ''}
                              onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                              rows={3}
                              data-testid={`input-answer-${q.id}`}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              {language === 'ar' ? 'الرد (إنجليزي):' : 'Answer (English):'}
                            </Label>
                            <Textarea
                              placeholder={language === 'ar' ? 'اكتب الرد بالإنجليزية...' : 'Write answer in English...'}
                              value={answerEnText[q.id] || ''}
                              onChange={(e) => setAnswerEnText(prev => ({ ...prev, [q.id]: e.target.value }))}
                              rows={3}
                              data-testid={`input-answer-en-${q.id}`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => answerMutation.mutate({ 
                                id: q.id, 
                                answer: answerText[q.id] || '', 
                                answerEn: answerEnText[q.id] || '',
                                questionEn: questionEnText[q.id] || ''
                              })}
                              disabled={!answerText[q.id]?.trim() || answerMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`button-submit-answer-${q.id}`}
                            >
                              <CheckCircle className="w-4 h-4 ml-2" />
                              {answerMutation.isPending 
                                ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                                : (language === 'ar' ? 'إرسال الرد' : 'Submit Answer')}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 hover:bg-red-50" data-testid={`button-delete-question-${q.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{language === 'ar' ? 'حذف السؤال' : 'Delete Question'}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === 'ar' 
                                      ? 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.'
                                      : 'Are you sure you want to delete this question? This action cannot be undone.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate(q.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {language === 'ar' ? 'حذف' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'الأسئلة المجابة' : 'Answered Questions'}
            <Badge variant="secondary" className="mr-2">{answeredQuestions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAnswered ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" />
            </div>
          ) : answeredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{language === 'ar' ? 'لا توجد أسئلة مجابة' : 'No answered questions'}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {answeredQuestions.map((q) => (
                  <Card key={q.id} className="border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      {editingId === q.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              {language === 'ar' ? 'وضع التعديل' : 'Edit Mode'}
                            </Badge>
                          </div>
                          <div className="grid gap-3">
                            <div>
                              <Label className="text-sm font-medium">{language === 'ar' ? 'السؤال (عربي):' : 'Question (Arabic):'}</Label>
                              <Textarea
                                value={editForm.question}
                                onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                                rows={2}
                                className="mt-1"
                                data-testid={`edit-question-${q.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{language === 'ar' ? 'السؤال (إنجليزي):' : 'Question (English):'}</Label>
                              <Textarea
                                value={editForm.questionEn}
                                onChange={(e) => setEditForm(prev => ({ ...prev, questionEn: e.target.value }))}
                                rows={2}
                                className="mt-1"
                                placeholder={language === 'ar' ? 'ترجمة السؤال...' : 'Question translation...'}
                                data-testid={`edit-question-en-${q.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{language === 'ar' ? 'الإجابة (عربي):' : 'Answer (Arabic):'}</Label>
                              <Textarea
                                value={editForm.answer}
                                onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                                rows={3}
                                className="mt-1"
                                data-testid={`edit-answer-${q.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{language === 'ar' ? 'الإجابة (إنجليزي):' : 'Answer (English):'}</Label>
                              <Textarea
                                value={editForm.answerEn}
                                onChange={(e) => setEditForm(prev => ({ ...prev, answerEn: e.target.value }))}
                                rows={3}
                                className="mt-1"
                                placeholder={language === 'ar' ? 'ترجمة الإجابة...' : 'Answer translation...'}
                                data-testid={`edit-answer-en-${q.id}`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={cancelEditing} data-testid={`cancel-edit-${q.id}`}>
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button 
                              onClick={saveEditing} 
                              disabled={updateMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`save-edit-${q.id}`}
                            >
                              {updateMutation.isPending 
                                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                                : (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                {language === 'ar' ? 'تمت الإجابة' : 'Answered'}
                              </Badge>
                              {q.askerName && (
                                <span className="text-sm text-muted-foreground">{q.askerName}</span>
                              )}
                            </div>
                            <div className="mb-2 space-y-1">
                              <div>
                                <span className="text-green-700 dark:text-green-400 font-bold ml-1">س (عربي):</span>
                                <span>{q.question}</span>
                              </div>
                              {q.questionEn && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-bold ml-1">Q (English):</span>
                                  <span>{q.questionEn}</span>
                                </div>
                              )}
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                              <div>
                                <span className="text-green-700 dark:text-green-400 font-bold ml-1">ج (عربي):</span>
                                <span>{q.answer}</span>
                              </div>
                              {q.answerEn && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 border-t pt-2 mt-2">
                                  <span className="font-bold ml-1">A (English):</span>
                                  <span>{q.answerEn}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>{language === 'ar' ? 'تاريخ الرد:' : 'Answered on:'} {formatDate(q.answeredAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:bg-blue-50" 
                              onClick={() => startEditing(q)}
                              data-testid={`button-edit-${q.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`button-delete-answered-${q.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{language === 'ar' ? 'حذف السؤال' : 'Delete Question'}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === 'ar' 
                                      ? 'هل أنت متأكد من حذف هذا السؤال والرد عليه؟'
                                      : 'Are you sure you want to delete this question and answer?'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate(q.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {language === 'ar' ? 'حذف' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// مكون تعديل بيانات المشرف على المشروع
function SupervisorEditorComponent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [supervisorImageUrl, setSupervisorImageUrl] = useState("");

  // جلب البيانات الحالية للمشرف
  const { data: supervisorName, refetch: refetchName } = useQuery({
    queryKey: ['/api/site-content/supervisor_name'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorNameEn, refetch: refetchNameEn } = useQuery({
    queryKey: ['/api/site-content/supervisor_name_en'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorRole, refetch: refetchRole } = useQuery({
    queryKey: ['/api/site-content/supervisor_role'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorRoleEn, refetch: refetchRoleEn } = useQuery({
    queryKey: ['/api/site-content/supervisor_role_en'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorBio, refetch: refetchBio } = useQuery({
    queryKey: ['/api/site-content/supervisor_bio'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorBioEn, refetch: refetchBioEn } = useQuery({
    queryKey: ['/api/site-content/supervisor_bio_en'],
    select: (data: any) => data?.content || ''
  });
  const { data: supervisorImage, refetch: refetchImage } = useQuery({
    queryKey: ['/api/site-content/supervisor_image'],
    select: (data: any) => data?.content || ''
  });

  useEffect(() => {
    if (supervisorImage) {
      setSupervisorImageUrl(supervisorImage);
    }
  }, [supervisorImage]);

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, title, content }: { key: string; title: string; content: string }) => {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, content }),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await Promise.all([
        updateContentMutation.mutateAsync({ key: 'supervisor_name', title: 'اسم المشرف', content: formData.get('supervisor_name') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_name_en', title: 'Supervisor Name', content: formData.get('supervisor_name_en') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_role', title: 'منصب المشرف', content: formData.get('supervisor_role') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_role_en', title: 'Supervisor Role', content: formData.get('supervisor_role_en') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_bio', title: 'سيرة المشرف', content: formData.get('supervisor_bio') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_bio_en', title: 'Supervisor Bio', content: formData.get('supervisor_bio_en') as string }),
        updateContentMutation.mutateAsync({ key: 'supervisor_image', title: 'صورة المشرف', content: supervisorImageUrl }),
      ]);
      
      toast({
        title: language === 'ar' ? "تم الحفظ بنجاح" : "Saved Successfully",
        description: language === 'ar' ? "تم تحديث بيانات المشرف" : "Supervisor data has been updated",
      });
      
      setIsEditing(false);
      refetchName(); refetchNameEn(); refetchRole(); refetchRoleEn();
      refetchBio(); refetchBioEn(); refetchImage();
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حفظ البيانات" : "Failed to save data",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <CardTitle className="text-lg">{language === 'ar' ? 'المشرف على المشروع' : 'Project Supervisor'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'تعديل بيانات المشرف على المشروع التي تظهر في صفحة فريق العمل' : 'Edit supervisor data displayed on the team page'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-supervisor"
          >
            <Edit className="w-4 h-4 ml-1" />
            {isEditing ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!isEditing ? (
          <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
            {supervisorImage ? (
              <img src={supervisorImage} alt="Supervisor" className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl">👨‍🏫</div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">{supervisorName || (language === 'ar' ? 'لم يتم تحديد اسم' : 'Name not set')}</h4>
              <p className="text-primary text-sm">{supervisorRole || (language === 'ar' ? 'لم يتم تحديد المنصب' : 'Role not set')}</p>
              <p className="text-muted-foreground text-sm mt-1">{supervisorBio || (language === 'ar' ? 'لم يتم إضافة سيرة' : 'No bio added')}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 border-l pl-4">
                <h4 className="font-semibold text-primary">{language === 'ar' ? 'البيانات بالعربية' : 'Arabic Data'}</h4>
                <div>
                  <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input name="supervisor_name" defaultValue={supervisorName} dir="rtl" data-testid="input-supervisor-name" />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'المنصب (عربي)' : 'Role (Arabic)'}</Label>
                  <Input name="supervisor_role" defaultValue={supervisorRole} dir="rtl" data-testid="input-supervisor-role" />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'السيرة (عربي)' : 'Bio (Arabic)'}</Label>
                  <Textarea name="supervisor_bio" defaultValue={supervisorBio} dir="rtl" rows={3} data-testid="input-supervisor-bio" />
                </div>
              </div>
              
              <div className="space-y-4 border-l pl-4">
                <h4 className="font-semibold text-primary">{language === 'ar' ? 'البيانات بالإنجليزية' : 'English Data'}</h4>
                <div>
                  <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input name="supervisor_name_en" defaultValue={supervisorNameEn} dir="ltr" data-testid="input-supervisor-name-en" />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'المنصب (إنجليزي)' : 'Role (English)'}</Label>
                  <Input name="supervisor_role_en" defaultValue={supervisorRoleEn} dir="ltr" data-testid="input-supervisor-role-en" />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'السيرة (إنجليزي)' : 'Bio (English)'}</Label>
                  <Textarea name="supervisor_bio_en" defaultValue={supervisorBioEn} dir="ltr" rows={3} data-testid="input-supervisor-bio-en" />
                </div>
              </div>
            </div>
            
            <div>
              <Label>{language === 'ar' ? 'صورة المشرف' : 'Supervisor Image'}</Label>
              <div className="mt-2">
                <ImageUploader
                  value={supervisorImageUrl}
                  onChange={setSupervisorImageUrl}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={updateContentMutation.isPending} data-testid="button-save-supervisor">
                {updateContentMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ البيانات' : 'Save Data')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// مكون تعديل معلومات التواصل
function ContactInfoEditorComponent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const { data: contactEmail, refetch: refetchEmail } = useQuery({
    queryKey: ['/api/site-content/contact_email'],
    select: (data: any) => data?.content || 'MSSR1488@GMAIL.COM'
  });
  const { data: contactPhone, refetch: refetchPhone } = useQuery({
    queryKey: ['/api/site-content/contact_phone'],
    select: (data: any) => data?.content || '+966531076021'
  });
  const { data: contactAddress, refetch: refetchAddress } = useQuery({
    queryKey: ['/api/site-content/contact_address'],
    select: (data: any) => data?.content || ''
  });
  const { data: contactAddressEn, refetch: refetchAddressEn } = useQuery({
    queryKey: ['/api/site-content/contact_address_en'],
    select: (data: any) => data?.contentEn || ''
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, title, content, contentEn }: { key: string; title: string; content: string; contentEn?: string }) => {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, content, contentEn }),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-content'] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await Promise.all([
        updateContentMutation.mutateAsync({ 
          key: 'contact_email', 
          title: 'البريد الإلكتروني', 
          content: formData.get('contact_email') as string 
        }),
        updateContentMutation.mutateAsync({ 
          key: 'contact_phone', 
          title: 'رقم الهاتف', 
          content: formData.get('contact_phone') as string 
        }),
        updateContentMutation.mutateAsync({ 
          key: 'contact_address', 
          title: 'العنوان', 
          content: formData.get('contact_address') as string,
          contentEn: formData.get('contact_address_en') as string
        }),
      ]);
      
      toast({
        title: language === 'ar' ? "تم الحفظ بنجاح" : "Saved Successfully",
        description: language === 'ar' ? "تم تحديث معلومات التواصل" : "Contact info has been updated",
      });
      
      setIsEditing(false);
      refetchEmail(); refetchPhone(); refetchAddress(); refetchAddressEn();
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حفظ البيانات" : "Failed to save data",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'البريد الإلكتروني ورقم الهاتف والعنوان في ذيل الموقع' : 'Email, phone, and address in the footer'}
              </p>
            </div>
          </div>
          <Button
            variant={isEditing ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-contact-info"
          >
            <Edit className="w-4 h-4 ml-2" />
            {isEditing ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{language === 'ar' ? 'البريد:' : 'Email:'}</span>
              <span className="text-muted-foreground">{contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
              <span className="text-muted-foreground">{contactPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{language === 'ar' ? 'العنوان:' : 'Address:'}</span>
              <span className="text-muted-foreground">{contactAddress}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input 
                name="contact_email" 
                defaultValue={contactEmail} 
                type="email"
                dir="ltr"
                data-testid="input-contact-email" 
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
              <Input 
                name="contact_phone" 
                defaultValue={contactPhone} 
                dir="ltr"
                data-testid="input-contact-phone" 
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}</Label>
                <Input 
                  name="contact_address" 
                  defaultValue={contactAddress} 
                  dir="rtl"
                  data-testid="input-contact-address" 
                />
              </div>
              <div>
                <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}</Label>
                <Input 
                  name="contact_address_en" 
                  defaultValue={contactAddressEn} 
                  dir="ltr"
                  data-testid="input-contact-address-en" 
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={updateContentMutation.isPending} data-testid="button-save-contact">
                {updateContentMutation.isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ البيانات' : 'Save Data')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// مكون إدارة الصفحات الديناميكية
function PagesManagement({ language, toast }: { language: string; toast: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    isPublished: true,
  });

  const { data: pages = [], isLoading } = useQuery<DynamicPage[]>({
    queryKey: ['/api/pages'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertDynamicPage> }) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update page');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث الصفحة بنجاح' : 'Page updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الصفحة' : 'Failed to update page',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete page');
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الصفحة بنجاح' : 'Page deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف الصفحة' : 'Failed to delete page',
        variant: 'destructive',
      });
    },
  });

  const openEditDialog = (page: DynamicPage) => {
    setEditingPage(page);
    setFormData({
      titleAr: page.titleAr,
      titleEn: page.titleEn || '',
      contentAr: page.contentAr || '',
      contentEn: page.contentEn || '',
      isPublished: page.isPublished ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    updateMutation.mutate({
      id: editingPage.id,
      data: {
        titleAr: formData.titleAr.trim(),
        titleEn: formData.titleEn.trim() || undefined,
        contentAr: formData.contentAr.trim() || undefined,
        contentEn: formData.contentEn.trim() || undefined,
        isPublished: formData.isPublished,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="w-5 h-5 text-primary" />
          {language === 'ar' ? 'إدارة الصفحات' : 'Pages Management'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? 'يمكنك تعديل محتوى الصفحات التي تم إنشاؤها من قسم القوائم' 
            : 'You can edit content of pages created from Navigation section'}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Menu className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد صفحات' : 'No pages'}</p>
            <p className="text-sm">{language === 'ar' ? 'أضف صفحة جديدة من قسم "القوائم" باختيار "إنشاء صفحة جديدة"' : 'Add a new page from "Navigation" section by choosing "Create new page"'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <div key={page.id} className={`flex items-center gap-3 p-4 border rounded-lg ${page.isPublished ? 'bg-background' : 'bg-muted/50'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{page.titleAr}</span>
                    {page.titleEn && <span className="text-muted-foreground text-sm">({page.titleEn})</span>}
                    {!page.isPublished && <Badge variant="secondary" className="text-xs">{language === 'ar' ? 'غير منشور' : 'Unpublished'}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground" dir="ltr">/page/{page.slug}</p>
                  {page.contentAr && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{page.contentAr.substring(0, 100)}...</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(page)}
                    data-testid={`button-edit-page-${page.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" data-testid={`button-delete-page-${page.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{language === 'ar' ? 'حذف الصفحة' : 'Delete Page'}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {language === 'ar'
                            ? `هل أنت متأكد من حذف "${page.titleAr}"؟ سيتم أيضاً تحديث عنصر القائمة المرتبط.`
                            : `Are you sure you want to delete "${page.titleAr}"? The associated navigation item will also be updated.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(page.id)} className="bg-red-600 hover:bg-red-700">
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'تعديل محتوى الصفحة' : 'Edit Page Content'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                    dir="rtl"
                    data-testid="input-page-title-ar"
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    dir="ltr"
                    data-testid="input-page-title-en"
                  />
                </div>
              </div>
              <div>
                <Label>{language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentAr: e.target.value }))}
                  className="w-full min-h-[200px] p-3 border rounded-md text-sm"
                  dir="rtl"
                  placeholder={language === 'ar' ? 'اكتب المحتوى هنا...' : 'Write content here...'}
                  data-testid="textarea-page-content-ar"
                />
              </div>
              <div>
                <Label>{language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentEn: e.target.value }))}
                  className="w-full min-h-[200px] p-3 border rounded-md text-sm"
                  dir="ltr"
                  placeholder="Write content here..."
                  data-testid="textarea-page-content-en"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4"
                  data-testid="checkbox-page-published"
                />
                <span className="text-sm">{language === 'ar' ? 'منشور' : 'Published'}</span>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1" data-testid="button-save-page">
                  {updateMutation.isPending
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                    : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// مكون إدارة عناصر القوائم
function NavigationManagement({ language, toast }: { language: string; toast: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [linkType, setLinkType] = useState<'internal' | 'external' | 'page'>('internal');
  const [formData, setFormData] = useState({
    labelAr: '',
    labelEn: '',
    path: '',
    externalUrl: '',
    type: 'link' as 'link' | 'dropdown',
    parentId: null as string | null,
    orderIndex: 0,
    isVisible: true,
    icon: '',
    pageSlug: '',
  });

  const { data: navItems = [], isLoading } = useQuery<NavigationItem[]>({
    queryKey: ['/api/navigation'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertNavigationItem>) => {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create navigation item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تمت الإضافة' : 'Added',
        description: language === 'ar' ? 'تمت إضافة عنصر القائمة بنجاح' : 'Navigation item added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إضافة عنصر القائمة' : 'Failed to add navigation item',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertNavigationItem> }) => {
      const response = await fetch(`/api/navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update navigation item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث عنصر القائمة بنجاح' : 'Navigation item updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث عنصر القائمة' : 'Failed to update navigation item',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/navigation/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete navigation item');
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف عنصر القائمة بنجاح' : 'Navigation item deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف عنصر القائمة' : 'Failed to delete navigation item',
        variant: 'destructive',
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const response = await fetch(`/api/navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to toggle visibility');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
    },
  });

  const resetForm = () => {
    setFormData({
      labelAr: '',
      labelEn: '',
      path: '',
      externalUrl: '',
      type: 'link',
      parentId: null,
      orderIndex: navItems.length,
      isVisible: true,
      icon: '',
      pageSlug: '',
    });
    setLinkType('internal');
    setEditingItem(null);
  };

  const openEditDialog = (item: NavigationItem) => {
    setEditingItem(item);
    const itemLinkType = item.externalUrl ? 'external' : (item.path?.startsWith('/page/') ? 'page' : 'internal');
    setLinkType(itemLinkType);
    setFormData({
      labelAr: item.labelAr,
      labelEn: item.labelEn || '',
      path: item.path || '',
      externalUrl: item.externalUrl || '',
      type: item.type,
      parentId: item.parentId,
      orderIndex: item.orderIndex ?? 0,
      isVisible: item.isVisible ?? true,
      icon: item.icon || '',
      pageSlug: item.path?.startsWith('/page/') ? item.path.replace('/page/', '') : '',
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const createPageMutation = useMutation({
    mutationFn: async (data: { slug: string; titleAr: string; titleEn: string; navigationItemId?: string }) => {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.labelAr.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يجب ملء الاسم العربي' : 'Arabic name is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.type === 'link') {
      if (linkType === 'internal' && !formData.path.trim()) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'يجب ملء الرابط الداخلي' : 'Internal link is required',
          variant: 'destructive',
        });
        return;
      }
      if (linkType === 'external' && !formData.externalUrl.trim()) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'يجب ملء الرابط الخارجي' : 'External link is required',
          variant: 'destructive',
        });
        return;
      }
      if (linkType === 'page' && !formData.pageSlug.trim()) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'يجب ملء رابط الصفحة' : 'Page slug is required',
          variant: 'destructive',
        });
        return;
      }
    }

    let pathValue = formData.path.trim() || undefined;
    let externalUrlValue = formData.externalUrl.trim() || undefined;

    if (linkType === 'page') {
      pathValue = `/page/${formData.pageSlug.trim()}`;
      externalUrlValue = undefined;
    } else if (linkType === 'internal') {
      externalUrlValue = undefined;
    } else if (linkType === 'external') {
      pathValue = undefined;
    }

    const data = {
      labelAr: formData.labelAr.trim(),
      labelEn: formData.labelEn.trim() || undefined,
      path: pathValue,
      externalUrl: externalUrlValue,
      type: formData.type,
      parentId: formData.parentId || undefined,
      orderIndex: formData.orderIndex,
      isVisible: formData.isVisible,
      icon: formData.icon.trim() || undefined,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      if (linkType === 'page') {
        try {
          const navItem = await createMutation.mutateAsync(data);
          await createPageMutation.mutateAsync({
            slug: formData.pageSlug.trim(),
            titleAr: formData.labelAr.trim(),
            titleEn: formData.labelEn.trim() || formData.labelAr.trim(),
            navigationItemId: navItem.id,
          });
          toast({
            title: language === 'ar' ? 'تمت الإضافة' : 'Added',
            description: language === 'ar' ? 'تمت إضافة الصفحة بنجاح، يمكنك تعديل المحتوى من تبويب الصفحات' : 'Page added successfully, you can edit content from Pages tab',
          });
          setIsDialogOpen(false);
          resetForm();
        } catch {
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: language === 'ar' ? 'فشل في إنشاء الصفحة' : 'Failed to create page',
            variant: 'destructive',
          });
        }
      } else {
        createMutation.mutate(data);
      }
    }
  };

  const parentItems = navItems.filter(item => !item.parentId && item.id !== editingItem?.id);
  const childItems = (parentId: string) => navItems.filter(item => item.parentId === parentId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'إدارة قوائم الموقع' : 'Website Navigation Management'}
          </CardTitle>
          <Button onClick={openAddDialog} data-testid="button-add-nav-item">
            <Plus className="w-4 h-4 ml-2" />
            {language === 'ar' ? 'إضافة عنصر جديد' : 'Add New Item'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : navItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Menu className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد عناصر قائمة' : 'No navigation items'}</p>
            <p className="text-sm">{language === 'ar' ? 'اضغط على "إضافة عنصر جديد" للبدء' : 'Click "Add New Item" to get started'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parentItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className={`flex items-center gap-3 p-3 ${item.isVisible ? 'bg-background' : 'bg-muted/50'}`}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.labelAr}</span>
                      {item.labelEn && <span className="text-muted-foreground text-sm">({item.labelEn})</span>}
                      {!item.isVisible && <Badge variant="secondary" className="text-xs">{language === 'ar' ? 'مخفي' : 'Hidden'}</Badge>}
                      {item.externalUrl && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                      {item.type === 'dropdown' && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground" dir="ltr">{item.path || item.externalUrl || (item.type === 'dropdown' ? '(dropdown)' : '')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibilityMutation.mutate({ id: item.id, isVisible: !item.isVisible })}
                      data-testid={`button-toggle-nav-${item.id}`}
                    >
                      {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                      data-testid={`button-edit-nav-${item.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" data-testid={`button-delete-nav-${item.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{language === 'ar' ? 'حذف عنصر القائمة' : 'Delete Navigation Item'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === 'ar'
                              ? `هل أنت متأكد من حذف "${item.labelAr}"؟ سيتم أيضاً فصل العناصر الفرعية.`
                              : `Are you sure you want to delete "${item.labelAr}"? Child items will be unlinked.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-red-600 hover:bg-red-700">
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {childItems(item.id).length > 0 && (
                  <div className="border-t bg-muted/20 pr-8">
                    {childItems(item.id).map((child) => (
                      <div key={child.id} className={`flex items-center gap-3 p-3 border-b last:border-b-0 ${child.isVisible ? '' : 'opacity-50'}`}>
                        <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{child.labelAr}</span>
                            {child.labelEn && <span className="text-muted-foreground text-xs">({child.labelEn})</span>}
                            {!child.isVisible && <Badge variant="secondary" className="text-xs">{language === 'ar' ? 'مخفي' : 'Hidden'}</Badge>}
                            {child.externalUrl && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                          </div>
                          <p className="text-xs text-muted-foreground" dir="ltr">{child.path || child.externalUrl}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVisibilityMutation.mutate({ id: child.id, isVisible: !child.isVisible })}
                          >
                            {child.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(child)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{language === 'ar' ? 'حذف عنصر القائمة' : 'Delete Navigation Item'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'ar' ? `هل أنت متأكد من حذف "${child.labelAr}"؟` : `Are you sure you want to delete "${child.labelAr}"?`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(child.id)} className="bg-red-600 hover:bg-red-700">
                                  {language === 'ar' ? 'حذف' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? (language === 'ar' ? 'تعديل عنصر القائمة' : 'Edit Navigation Item')
                  : (language === 'ar' ? 'إضافة عنصر قائمة جديد' : 'Add New Navigation Item')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</Label>
                  <Input
                    value={formData.labelAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, labelAr: e.target.value }))}
                    placeholder={language === 'ar' ? 'الأماكن السياحية' : 'Tourist Places'}
                    required
                    dir="rtl"
                    data-testid="input-nav-label-ar"
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={formData.labelEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, labelEn: e.target.value }))}
                    placeholder="Tourist Places"
                    dir="ltr"
                    data-testid="input-nav-label-en"
                  />
                </div>
              </div>
              <div>
                <Label>{language === 'ar' ? 'نوع العنصر' : 'Item Type'}</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'link' | 'dropdown' }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  data-testid="select-nav-type"
                >
                  <option value="link">{language === 'ar' ? 'رابط' : 'Link'}</option>
                  <option value="dropdown">{language === 'ar' ? 'قائمة منسدلة' : 'Dropdown Menu'}</option>
                </select>
              </div>
              {formData.type === 'link' && (
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'نوع الرابط' : 'Link Type'}</Label>
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value as 'internal' | 'external' | 'page')}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      data-testid="select-link-type"
                    >
                      <option value="internal">{language === 'ar' ? 'صفحة موجودة في الموقع' : 'Existing site page'}</option>
                      <option value="page">{language === 'ar' ? 'إنشاء صفحة جديدة' : 'Create new page'}</option>
                      <option value="external">{language === 'ar' ? 'رابط خارجي' : 'External link'}</option>
                    </select>
                  </div>
                  
                  {linkType === 'internal' && (
                    <div>
                      <Label>{language === 'ar' ? 'الرابط الداخلي' : 'Internal Link'}</Label>
                      <Input
                        value={formData.path}
                        onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                        placeholder="/places"
                        dir="ltr"
                        data-testid="input-nav-path"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'مثل: /places أو /guides أو /about' : 'Like: /places or /guides or /about'}
                      </p>
                    </div>
                  )}
                  
                  {linkType === 'page' && (
                    <div>
                      <Label>{language === 'ar' ? 'رابط الصفحة (slug)' : 'Page Slug'}</Label>
                      <Input
                        value={formData.pageSlug}
                        onChange={(e) => setFormData(prev => ({ ...prev, pageSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                        placeholder="about-us"
                        dir="ltr"
                        data-testid="input-page-slug"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'سيتم إنشاء صفحة جديدة على: /page/about-us' : 'A new page will be created at: /page/about-us'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {language === 'ar' ? 'يمكنك تعديل محتوى الصفحة من تبويب "الصفحات" بعد الإنشاء' : 'You can edit page content from "Pages" tab after creation'}
                      </p>
                    </div>
                  )}
                  
                  {linkType === 'external' && (
                    <div>
                      <Label>{language === 'ar' ? 'الرابط الخارجي' : 'External Link'}</Label>
                      <Input
                        value={formData.externalUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                        placeholder="https://example.com"
                        dir="ltr"
                        data-testid="input-nav-external-url"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'يفتح في نافذة جديدة' : 'Opens in new tab'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <Label>{language === 'ar' ? 'القائمة الأب (للقوائم الفرعية)' : 'Parent Menu (for submenu)'}</Label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  data-testid="select-nav-parent"
                >
                  <option value="">{language === 'ar' ? 'بدون أب (قائمة رئيسية)' : 'No parent (main menu)'}</option>
                  {parentItems.map(item => (
                    <option key={item.id} value={item.id}>{item.labelAr}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="w-4 h-4"
                    data-testid="checkbox-nav-visible"
                  />
                  <span className="text-sm">{language === 'ar' ? 'مرئي' : 'Visible'}</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1" data-testid="button-save-nav">
                  {(createMutation.isPending || updateMutation.isPending)
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                    : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
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
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [placeImageUrl, setPlaceImageUrl] = useState<string>("");
  const [teamMemberImageUrl, setTeamMemberImageUrl] = useState<string>("");

  // Handle URL parameters for direct tab access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['places', 'guides', 'bookings', 'users', 'team', 'content', 'invites', 'questions', 'navigation', 'pages'].includes(tab)) {
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
        title: language === 'ar' ? "تم إضافة معالم الباحة بنجاح" : "AlBaha Landmarks Added Successfully",
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
        description: language === 'ar' ? "فشل في إضافة معالم الباحة" : "Failed to add AlBaha landmarks",
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

  // Booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      await apiRequest("PUT", `/api/bookings/${bookingId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: language === 'ar' ? "تم تحديث الحجز" : "Booking Updated",
        description: language === 'ar' ? "تم تحديث حالة الحجز بنجاح" : "Booking status has been updated successfully",
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
        description: language === 'ar' ? "فشل في تحديث حالة الحجز" : "Failed to update booking status",
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
      : "Are you sure you want to add all AlBaha tourist landmarks? 28 landmarks will be added.";
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
            <TabsTrigger value="questions" data-testid="tab-questions" className="shrink-0 whitespace-nowrap flex items-center gap-1">
              <MessageCircleQuestion className="w-4 h-4" />
              {language === 'ar' ? 'الأسئلة السريعة' : 'Quick Questions'}
            </TabsTrigger>
            <TabsTrigger value="navigation" data-testid="tab-navigation" className="shrink-0 whitespace-nowrap flex items-center gap-1">
              <Menu className="w-4 h-4" />
              {language === 'ar' ? 'قوائم الموقع' : 'Navigation'}
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-pages" className="shrink-0 whitespace-nowrap flex items-center gap-1">
              <Edit className="w-4 h-4" />
              {language === 'ar' ? 'الصفحات' : 'Pages'}
            </TabsTrigger>
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
                        : (language === 'ar' ? 'إضافة معالم الباحة' : 'Add AlBaha Landmarks')}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{language === 'ar' ? 'إدارة الحجوزات' : 'Bookings Management'}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={bookingFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingFilter("all")}
                      data-testid="booking-filter-all"
                    >
                      {language === 'ar' ? 'الكل' : 'All'} ({bookings.length})
                    </Button>
                    <Button
                      variant={bookingFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingFilter("pending")}
                      data-testid="booking-filter-pending"
                    >
                      {language === 'ar' ? 'في الانتظار' : 'Pending'} ({bookings.filter(b => b.status === 'pending').length})
                    </Button>
                    <Button
                      variant={bookingFilter === "confirmed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingFilter("confirmed")}
                      data-testid="booking-filter-confirmed"
                    >
                      {language === 'ar' ? 'مؤكدة' : 'Confirmed'} ({bookings.filter(b => b.status === 'confirmed').length})
                    </Button>
                    <Button
                      variant={bookingFilter === "completed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingFilter("completed")}
                      data-testid="booking-filter-completed"
                    >
                      {language === 'ar' ? 'مكتملة' : 'Completed'} ({bookings.filter(b => b.status === 'completed').length})
                    </Button>
                    <Button
                      variant={bookingFilter === "cancelled" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingFilter("cancelled")}
                      data-testid="booking-filter-cancelled"
                    >
                      {language === 'ar' ? 'ملغية' : 'Cancelled'} ({bookings.filter(b => b.status === 'cancelled').length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {(bookingFilter === "all" ? bookings : bookings.filter(b => b.status === bookingFilter)).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(bookingFilter === "all" ? bookings : bookings.filter(b => b.status === bookingFilter)).map((booking) => {
                      const guide = guides.find(g => g.id === booking.guideId);
                      const tourist = users.find(u => u.id === booking.touristId);
                      const guideUser = users.find(u => u.id === guide?.userId);
                      return (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold" data-testid={`booking-id-${booking.id}`}>
                                    {language === 'ar' ? `حجز رقم: ${booking.id.slice(-6)}` : `Booking #${booking.id.slice(-6)}`}
                                  </h4>
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
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {language === 'ar' ? 'السائح:' : 'Tourist:'} {tourist?.firstName && tourist?.lastName ? `${tourist.firstName} ${tourist.lastName}` : tourist?.email || (language === 'ar' ? 'غير معروف' : 'Unknown')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {language === 'ar' ? 'المرشد:' : 'Guide:'} {guideUser?.firstName && guideUser?.lastName 
                                        ? `${guideUser.firstName} ${guideUser.lastName}` 
                                        : guideUser?.email || (language === 'ar' ? 'غير معروف' : 'Unknown')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {language === 'ar' 
                                        ? `📅 من ${new Date(booking.startDate).toLocaleDateString('ar-SA')} إلى ${new Date(booking.endDate).toLocaleDateString('ar-SA')}`
                                        : `📅 From ${new Date(booking.startDate).toLocaleDateString('en-US')} to ${new Date(booking.endDate).toLocaleDateString('en-US')}`}
                                    </span>
                                  </div>
                                  {booking.timeSlot && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">
                                        {language === 'ar' ? `🕐 الوقت: ${booking.timeSlot}` : `🕐 Time: ${booking.timeSlot}`}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary" data-testid={`booking-amount-${booking.id}`}>
                                      {language === 'ar' ? `💰 ${booking.totalAmount || '0'} ر.س` : `💰 ${booking.totalAmount || '0'} SAR`}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {booking.paymentMethod === 'bank_transfer' 
                                        ? (language === 'ar' ? '🏦 تحويل بنكي' : '🏦 Bank Transfer')
                                        : (language === 'ar' ? '💵 كاش' : '💵 Cash')}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {booking.notes && (
                                  <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                                    {language === 'ar' ? `ملاحظات: ${booking.notes}` : `Notes: ${booking.notes}`}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                                      disabled={updateBookingStatusMutation.isPending}
                                      data-testid={`booking-confirm-${booking.id}`}
                                    >
                                      {language === 'ar' ? 'تأكيد' : 'Confirm'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                                      disabled={updateBookingStatusMutation.isPending}
                                      data-testid={`booking-cancel-${booking.id}`}
                                    >
                                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                                      disabled={updateBookingStatusMutation.isPending}
                                      data-testid={`booking-complete-${booking.id}`}
                                    >
                                      {language === 'ar' ? 'إكمال' : 'Complete'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                                      disabled={updateBookingStatusMutation.isPending}
                                      data-testid={`booking-cancel-${booking.id}`}
                                    >
                                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                  </>
                                )}
                                {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'pending' })}
                                    disabled={updateBookingStatusMutation.isPending}
                                    data-testid={`booking-reopen-${booking.id}`}
                                  >
                                    {language === 'ar' ? 'إعادة فتح' : 'Reopen'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
            <div className="space-y-6">
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
                  <HomeAndDashboardContentEditor />
                </CardContent>
              </Card>
              
              <SupervisorEditorComponent />
              <ContactInfoEditorComponent />
            </div>
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

          {/* Quick Questions Management */}
          <TabsContent value="questions">
            <QuickQuestionsManagement language={language} toast={toast} />
          </TabsContent>

          {/* Navigation Management */}
          <TabsContent value="navigation">
            <NavigationManagement language={language} toast={toast} />
          </TabsContent>
          
          <TabsContent value="pages">
            <PagesManagement language={language} toast={toast} />
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
