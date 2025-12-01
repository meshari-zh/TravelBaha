import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Home, MapPin, Users, MessageCircle, Settings, LogOut, UserCog, Ticket, User, Info, Menu, Map, Globe, CalendarCheck, Gift, LogIn, ChevronDown, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (path: string) => location === path;

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
              onClick={() => window.location.href = "/api/login"}
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
                          {language === 'ar' ? 'مرحباً بك في منصة الباحة السياحية' : 'Welcome to Al Bahah Tourism Platform'}
                        </p>
                        <Button 
                          className="w-full" 
                          onClick={() => window.location.href = "/api/login"}
                          data-testid="mobile-login-button"
                        >
                          <LogIn className="w-4 h-4 ml-2" />
                          {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                        </Button>
                      </div>
                    )}
                    
                    {/* Navigation Links - Mobile */}
                    <nav className="space-y-2">
                      <SheetClose asChild>
                        <Link href="/">
                          <Button 
                            variant={isActive("/") ? "default" : "ghost"} 
                            size="sm"
                            className="w-full justify-start flex items-center gap-3"
                            data-testid="mobile-nav-home"
                          >
                            <Home className="w-4 h-4" />
                            {t('home')}
                          </Button>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/places">
                          <Button 
                            variant={isActive("/places") ? "default" : "ghost"} 
                            size="sm"
                            className="w-full justify-start flex items-center gap-3"
                            data-testid="mobile-nav-places"
                          >
                            <MapPin className="w-4 h-4" />
                            {t('places')}
                          </Button>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/guides">
                          <Button 
                            variant={isActive("/guides") ? "default" : "ghost"} 
                            size="sm"
                            className="w-full justify-start flex items-center gap-3"
                            data-testid="mobile-nav-guides"
                          >
                            <Users className="w-4 h-4" />
                            {t('guides')}
                          </Button>
                        </Link>
                      </SheetClose>
                      
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {t('about')}
                        </div>
                        <SheetClose asChild>
                          <Link href="/team">
                            <Button 
                              variant={isActive("/team") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3 pr-8"
                              data-testid="mobile-nav-team"
                            >
                              <Users className="w-4 h-4" />
                              {language === 'ar' ? 'فريق العمل' : 'Our Team'}
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/about-project">
                            <Button 
                              variant={isActive("/about-project") ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start flex items-center gap-3 pr-8"
                              data-testid="mobile-nav-about-project"
                            >
                              <FileText className="w-4 h-4" />
                              {language === 'ar' ? 'نبذة عن المشروع' : 'About the Project'}
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                      
                      <SheetClose asChild>
                        <Link href="/map">
                          <Button 
                            variant={isActive("/map") ? "default" : "ghost"} 
                            size="sm"
                            className="w-full justify-start flex items-center gap-3"
                            data-testid="mobile-nav-map"
                          >
                            <Map className="w-4 h-4" />
                            {t('map')}
                          </Button>
                        </Link>
                      </SheetClose>
                      
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
            <Link href="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-home"
              >
                <Home className="w-4 h-4" />
                {t('home')}
              </Button>
            </Link>
            
            <Link href="/places">
              <Button 
                variant={isActive("/places") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-places"
              >
                <MapPin className="w-4 h-4" />
                {t('places')}
              </Button>
            </Link>
            
            <Link href="/guides">
              <Button 
                variant={isActive("/guides") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-guides"
              >
                <Users className="w-4 h-4" />
                {t('guides')}
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={(isActive("/about") || isActive("/team") || isActive("/about-project")) ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-about-dropdown"
                >
                  <Info className="w-4 h-4" />
                  {t('about')}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/team" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    {language === 'ar' ? 'فريق العمل' : 'Our Team'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about-project" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    {language === 'ar' ? 'نبذة عن المشروع' : 'About the Project'}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/map">
              <Button 
                variant={isActive("/map") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-map"
              >
                <Map className="w-4 h-4" />
                {t('map')}
              </Button>
            </Link>
            
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
                onClick={() => window.location.href = "/api/login"}
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
    </>
  );
}