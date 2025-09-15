import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Places from "@/pages/places";
import PlaceDetails from "@/pages/place-details";
import Guides from "@/pages/guides";
import Messages from "@/pages/messages";
import Bookings from "@/pages/bookings";
import AdminDashboard from "@/pages/admin-dashboard";
import GuideDashboard from "@/pages/guide-dashboard";
import GuideProfile from "@/pages/guide-profile";
import InviteRedemption from "@/pages/invite-redemption";
import ProfileEdit from "@/pages/profile-edit";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/about" component={About} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/places" component={Places} />
          <Route path="/places/:id" component={PlaceDetails} />
          <Route path="/guides" component={Guides} />
          <Route path="/guide/:id" component={GuideProfile} />
          <Route path="/messages" component={Messages} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/invite" component={InviteRedemption} />
          <Route path="/profile" component={ProfileEdit} />
          <Route path="/about" component={About} />
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/invites">
                {() => {
                  window.location.href = '/admin?tab=invites';
                  return null;
                }}
              </Route>
            </>
          )}
          {user?.role === 'guide' && (
            <Route path="/dashboard" component={GuideDashboard} />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div dir="rtl" className="min-h-screen bg-background font-arabic">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
