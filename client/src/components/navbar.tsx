import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Home, MapPin, Users, MessageCircle, Settings, LogOut, UserCog, Ticket, User, Info, Menu, Map, Globe, CalendarCheck, Gift, LogIn, ChevronDown, FileText, UserPlus, Mail, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SiGoogle, SiGithub, SiX } from "react-icons/si";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";
import type { NavigationItem } from "@shared/schema";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: dynamicNavItems = [], isLoading: isLoadingNav } = useQuery<NavigationItem[]>({
    queryKey: ['/api/navigation'],
  });

  const visibleNavItems = dynamicNavItems.filter(item => item.isVisible);
  const parentNavItems = visibleNavItems
    .filter(item => !item.parentId)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const getChildItems = (parentId: string) => visibleNavItems
    .filter(item => item.parentId === parentId)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const isActive = (path: string) => location === path;

  const formatExternalUrl = (url: string | null): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };
  
  const handleLoginClick = () => {
    setShowLoginDialog(true);
  };
  
  const proceedToLogin = () => {
    setShowLoginDialog(false);
    window.location.href = "/api/login";
  };

  const getUserDisplayName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return firstName && lastName ? `${firstName} ${lastName}` : user?.email || 'مستخدم';
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'م';
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">{t('admin')}</Badge>;
      case 'guide':
        return <Badge variant="secondary" className="text-xs">{t('guide')}</Badge>;
      case 'tourist':
        return <Badge variant="outline" className="text-xs">{t('tourist')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Discount Banner for Visitors */}
      {!user && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 px-4">
          <div className="container mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
            <Gift className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'سجل دخولك واحصل على خصم 5% على أول حجز!' : 'Login and get 5% off your first booking!'}
            </span>
            <Button 
              size="sm" 
              variant="secondary"
              className="h-7 text-xs"
              onClick={handleLoginClick}
              data-testid="button-discount-login"
            >
              <LogIn className="w-3 h-3 ml-1" />
              {language === 'ar' ? 'سجل الآن' : 'Login Now'}
            </Button>
          </div>
        </div>
      )}
      
      <header className="bg-card shadow-md sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img 
                  src={siteLogo} 
                  alt="لوجو المنصة السياحية" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </Link>
          
            {/* Language Toggle & Mobile Menu */}
            <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="language-toggle"
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'ar' ? 'EN' : 'ع'}
              </span>
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">{language === 'ar' ? 'فتح القائمة' : 'Open Menu'}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="text-right">{language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-4">
                    {/* User Info - Mobile (Logged in users) */}
                    {user ? (
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.profileImageUrl || undefined} />
                          <AvatarFallback className="text-sm">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-medium" data-testid="mobile-user-name">{getUserDisplayName()}</p>
                          <div className="flex justify-end mt-1">
                            {getRoleBadge()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === 'ar' ? 'مرحباً بك في منصة الباحة السياحية' : 'Welcome to AlBaha Tourism Platform'}
                        </p>
                        <Button 
                          className="w-full" 
                          onClick={handleLoginClick}
                          data-testid="mobile-login-button"
                        >
                          <LogIn className="w-4 h-4 ml-2" />
                          {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                        </Button>
                      </div>
                    )}
                    
                    {/* Navigation Links - Mobile */}
                    <nav className="space-y-2">
                      {/* Dynamic Navigation Items - Mobile */}
                      {parentNavItems.map((item) => {
                        const children = getChildItems(item.id);
                        const itemLabel = language === 'ar' ? item.labelAr : (item.labelEn || item.labelAr);
                        const itemHref = item.path || item.externalUrl;
                        const isExternal = !!item.externalUrl;

                        if (item.type === 'dropdown' && children.length > 0) {
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                                {itemLabel}
                              </div>
                              {children.map((child) => {
                                const childLabel = language === 'ar' ? child.labelAr : (child.labelEn || child.labelAr);
                                const childHref = child.externalUrl ? formatExternalUrl(child.externalUrl) : (child.path || '#');
                                const isChildExternal = !!child.externalUrl;
                                return (
                                  <SheetClose key={child.id} asChild>
                                    {isChildExternal ? (
                                      <a
                                        href={childHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start flex items-center gap-3 pr-8"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                          {childLabel}
                                        </Button>
                                      </a>
                                    ) : (
                                      <Link href={childHref || '#'}>
                                        <Button
                                          variant={isActive(childHref || '') ? "default" : "ghost"}
                                          size="sm"
                                          className="w-full justify-start flex items-center gap-3 pr-8"
                                        >
                                          {childLabel}
                                        </Button>
                                      </Link>
                                    )}
                                  </SheetClose>
                                );
                              })}
                            </div>
                          );
                        }

                        const externalHref = isExternal ? formatExternalUrl(item.externalUrl) : (item.path || '#');
                        return (
                          <SheetClose key={item.id} asChild>
                            {isExternal ? (
                              <a
                                href={externalHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start flex items-center gap-3"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {itemLabel}
                                </Button>
                              </a>
                            ) : (
                              <Link href={itemHref || '#'}>
                                <Button
                                  variant={isActive(itemHref || '') ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start flex items-center gap-3"
                                >
                                  {itemLabel}
                                </Button>
                              </Link>
                            )}
                          </SheetClose>
                        );
                      })}
                      
                      {user && (
                        <SheetClose asChild>
                          <Link href="/invite">
                            <Button 
                              variant={isActive("/invite") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3"
                              data-testid="mobile-nav-invite"
                            >
                              <Ticket className="w-4 h-4" />
                              {t('inviteCode')}
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                      
                      {user && (
                        <SheetClose asChild>
                          <Link href="/messages">
                            <Button 
                              variant={isActive("/messages") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3"
                              data-testid="mobile-nav-messages"
                            >
                              <MessageCircle className="w-4 h-4" />
                              {t('messages')}
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                      
                      {user?.role === 'tourist' && (
                        <SheetClose asChild>
                          <Link href="/bookings">
                            <Button 
                              variant={isActive("/bookings") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3"
                              data-testid="mobile-nav-bookings"
                            >
                              <CalendarCheck className="w-4 h-4" />
                              {t('myBookings')}
                            </Button>
                          </Link>
                        </SheetClose>
                      )}

                      {user?.role === 'admin' && (
                        <SheetClose asChild>
                          <Link href="/admin">
                            <Button 
                              variant={isActive("/admin") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3"
                              data-testid="mobile-nav-admin"
                            >
                              <Settings className="w-4 h-4" />
                              {t('adminDashboard')}
                            </Button>
                          </Link>
                        </SheetClose>
                      )}

                      {user?.role === 'guide' && (
                        <SheetClose asChild>
                          <Link href="/dashboard">
                            <Button 
                              variant={isActive("/dashboard") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3"
                              data-testid="mobile-nav-dashboard"
                            >
                              <UserCog className="w-4 h-4" />
                              {t('guideDashboard')}
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                    </nav>
                    
                    {/* User Actions - Mobile */}
                    <div className="pt-4 border-t space-y-2">
                      <SheetClose asChild>
                        <Link href="/profile">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full justify-start flex items-center gap-3"
                            data-testid="mobile-nav-profile"
                          >
                            <User className="w-4 h-4" />
                            {t('profile')}
                          </Button>
                        </Link>
                      </SheetClose>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start flex items-center gap-3 text-destructive hover:text-destructive"
                        onClick={() => window.location.href = "/api/logout"}
                        data-testid="mobile-logout-button"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {/* Dynamic Navigation Items - Desktop */}
            {parentNavItems.map((item) => {
              const children = getChildItems(item.id);
              const itemLabel = language === 'ar' ? item.labelAr : (item.labelEn || item.labelAr);
              const itemHref = item.path || item.externalUrl;
              const isExternal = !!item.externalUrl;

              if (item.type === 'dropdown' && children.length > 0) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {itemLabel}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      {children.map((child) => {
                        const childLabel = language === 'ar' ? child.labelAr : (child.labelEn || child.labelAr);
                        const childHref = child.externalUrl ? formatExternalUrl(child.externalUrl) : (child.path || '#');
                        const isChildExternal = !!child.externalUrl;
                        return (
                          <DropdownMenuItem key={child.id} asChild>
                            {isChildExternal ? (
                              <a
                                href={childHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {childLabel}
                              </a>
                            ) : (
                              <Link href={childHref} className="flex items-center gap-2 cursor-pointer">
                                {childLabel}
                              </Link>
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              const desktopExternalHref = isExternal ? formatExternalUrl(item.externalUrl) : (item.path || '#');
              return isExternal ? (
                <a
                  key={item.id}
                  href={desktopExternalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {itemLabel}
                  </Button>
                </a>
              ) : (
                <Link key={item.id} href={desktopExternalHref}>
                  <Button
                    variant={isActive(itemHref || '') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {itemLabel}
                  </Button>
                </Link>
              );
            })}
            
            {user && (
              <Link href="/invite">
                <Button 
                  variant={isActive("/invite") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-invite"
                >
                  <Ticket className="w-4 h-4" />
                  {t('inviteCode')}
                </Button>
              </Link>
            )}
            
            {user && (
              <Link href="/messages">
                <Button 
                  variant={isActive("/messages") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-messages"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('messages')}
                </Button>
              </Link>
            )}
            
            {user?.role === 'tourist' && (
              <Link href="/bookings">
                <Button 
                  variant={isActive("/bookings") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-bookings"
                >
                  <CalendarCheck className="w-4 h-4" />
                  {t('myBookings')}
                </Button>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button 
                  variant={isActive("/admin") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-admin"
                >
                  <Settings className="w-4 h-4" />
                  {t('adminDashboard')}
                </Button>
              </Link>
            )}

            {user?.role === 'guide' && (
              <Link href="/dashboard">
                <Button 
                  variant={isActive("/dashboard") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-dashboard"
                >
                  <UserCog className="w-4 h-4" />
                  {t('guideDashboard')}
                </Button>
              </Link>
            )}
          </nav>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3" data-testid="user-menu">
                    <div className="text-right">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <div className="flex items-center gap-2">
                        {getRoleBadge()}
                      </div>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="user-display-name">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {user?.role === 'guide' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <UserCog className="w-4 h-4 ml-2" />
                        {t('guideDashboard')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="w-4 h-4 ml-2" />
                        {t('adminDashboard')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="w-4 h-4 ml-2" />
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = "/api/logout"}
                    className="text-destructive focus:text-destructive"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleLoginClick}
                className="flex items-center gap-2"
                data-testid="desktop-login-button"
              >
                <LogIn className="w-4 h-4" />
                {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Sign Up'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
    
    {/* Login Dialog with explanation */}
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="w-5 h-5" />
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </DialogTitle>
          <DialogDescription className="text-right pt-2">
            {language === 'ar' 
              ? 'يمكنك تسجيل الدخول باستخدام حسابك في Google أو GitHub أو X أو البريد الإلكتروني. إذا كانت هذه أول مرة، سيتم إنشاء حساب جديد لك تلقائياً.'
              : 'You can login using your Google, GitHub, X, or email account. If this is your first time, a new account will be created automatically.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <UserPlus className="w-10 h-10 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'ملاحظة: إذا لم يكن لديك حساب، سيتم إنشاء حساب جديد لك تلقائياً عند تسجيل الدخول لأول مرة.'
                : 'Note: If you don\'t have an account, a new account will be created automatically when you login for the first time.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">
              {language === 'ar' ? 'طرق تسجيل الدخول المتاحة:' : 'Available login methods:'}
            </p>
            <div className="flex justify-center flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SiGoogle className="w-4 h-4" />
                <span>Google</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SiGithub className="w-4 h-4" />
                <span>GitHub</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SiX className="w-4 h-4" />
                <span>X</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1"
              onClick={proceedToLogin}
              data-testid="dialog-proceed-login"
            >
              <LogIn className="w-4 h-4 ml-2" />
              {language === 'ar' ? 'متابعة تسجيل الدخول' : 'Proceed to Login'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              data-testid="dialog-cancel-login"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}