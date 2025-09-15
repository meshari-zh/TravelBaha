import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Home, MapPin, Users, MessageCircle, Settings, LogOut, UserCog, Ticket, User, Info } from "lucide-react";
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
              <div>
                <h1 className="text-xl font-bold text-foreground">إرشاد سياحي</h1>
                <p className="text-sm text-muted-foreground">منطقة الباحة</p>
              </div>
            </div>
          </Link>
          
          {/* Navigation Menu */}
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
          
          {/* User Menu */}
          <div className="flex items-center">
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
