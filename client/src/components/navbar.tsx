import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Home, MapPin, Users, MessageCircle, Settings, LogOut, UserCog, Ticket, User, Info, Menu } from "lucide-react";
import siteLogo from "@assets/لوقو الموقع_1757794549973.png";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const getUserDisplayName = () => {
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'مستخدم';
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'م';
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">مشرف</Badge>;
      case 'guide':
        return <Badge variant="secondary" className="text-xs">مرشد</Badge>;
      case 'tourist':
        return <Badge variant="outline" className="text-xs">سائح</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center space-x-4 space-x-reverse cursor-pointer">
              <img 
                src={siteLogo} 
                alt="لوجو إرشاد سياحي - منطقة الباحة" 
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">إرشاد سياحي</h1>
                <p className="text-sm text-muted-foreground">منطقة الباحة</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-foreground">إرشاد سياحي</h1>
              </div>
            </div>
          </Link>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">فتح القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-right">القائمة الرئيسية</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* User Info - Mobile */}
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
                          الرئيسية
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
                          الأماكن السياحية
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
                          المرشدين السياحيين
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link href="/about">
                        <Button 
                          variant={isActive("/about") ? "default" : "ghost"} 
                          size="sm"
                          className="w-full justify-start flex items-center gap-3"
                          data-testid="mobile-nav-about"
                        >
                          <Info className="w-4 h-4" />
                          نبذة عنا
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link href="/messages">
                        <Button 
                          variant={isActive("/messages") ? "default" : "ghost"} 
                          size="sm"
                          className="w-full justify-start flex items-center gap-3"
                          data-testid="mobile-nav-messages"
                        >
                          <MessageCircle className="w-4 h-4" />
                          الرسائل
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link href="/invite">
                        <Button 
                          variant={isActive("/invite") ? "default" : "ghost"} 
                          size="sm"
                          className="w-full justify-start flex items-center gap-3"
                          data-testid="mobile-nav-invite"
                        >
                          <Ticket className="w-4 h-4" />
                          كود الدعوة
                        </Button>
                      </Link>
                    </SheetClose>

                    {/* Role-based Links - Mobile */}
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
                            لوحة الإدارة
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
                            لوحة التحكم
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
                          تعديل الملف الشخصي
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
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
                الرئيسية
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
                الأماكن السياحية
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
                المرشدين السياحيين
              </Button>
            </Link>
            
            <Link href="/about">
              <Button 
                variant={isActive("/about") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-about"
              >
                <Info className="w-4 h-4" />
                نبذة عنا
              </Button>
            </Link>
            
            <Link href="/messages">
              <Button 
                variant={isActive("/messages") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-messages"
              >
                <MessageCircle className="w-4 h-4" />
                الرسائل
              </Button>
            </Link>
            
            {/* Invite code redemption for all users */}
            <Link href="/invite">
              <Button 
                variant={isActive("/invite") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
                data-testid="nav-invite"
              >
                <Ticket className="w-4 h-4" />
                كود الدعوة
              </Button>
            </Link>

            {/* Admin/Guide specific navigation */}
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button 
                  variant={isActive("/admin") ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="nav-admin"
                >
                  <Settings className="w-4 h-4" />
                  لوحة الإدارة
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
                  لوحة التحكم
                </Button>
              </Link>
            )}
          </nav>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
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
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="w-4 h-4 ml-2" />
                      لوحة الإدارة
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 ml-2" />
                    تعديل الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-destructive focus:text-destructive"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
