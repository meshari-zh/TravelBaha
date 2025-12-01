import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
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
import Team from "@/pages/team";
import AboutProject from "@/pages/about-project";
import SaudiMap from "@/pages/saudi-map";
import JoinGuide from "@/pages/join-guide";
import GuideRequirements from "@/pages/guide-requirements";
import GuideManual from "@/pages/guide-manual";
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
      {/* Common routes for all users (visitors and authenticated) */}
      <Route path="/" component={Home} />
      <Route path="/places" component={Places} />
      <Route path="/places/:id" component={PlaceDetails} />
      <Route path="/guides" component={Guides} />
      <Route path="/guide/:id" component={GuideProfile} />
      <Route path="/about" component={About} />
      <Route path="/team" component={Team} />
      <Route path="/about-project" component={AboutProject} />
      <Route path="/map" component={SaudiMap} />
      <Route path="/join-guide" component={JoinGuide} />
      <Route path="/guide-requirements" component={GuideRequirements} />
      <Route path="/guide-manual" component={GuideManual} />
      <Route path="/landing" component={Landing} />
      
      {/* Routes requiring authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/messages" component={Messages} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/invite" component={InviteRedemption} />
          <Route path="/profile" component={ProfileEdit} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/admin/invites">
            {() => {
              window.location.href = '/admin?tab=invites';
              return null;
            }}
          </Route>
          {user?.role === 'guide' && (
            <Route path="/dashboard" component={GuideDashboard} />
          )}
        </>
      ) : (
        <>
          <Route path="/login">
            {() => {
              window.location.href = '/api/login';
              return null;
            }}
          </Route>
          <Route path="/messages">
            {() => {
              window.location.href = '/api/login';
              return null;
            }}
          </Route>
          <Route path="/bookings">
            {() => {
              window.location.href = '/api/login';
              return null;
            }}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { language } = useLanguage();

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-background font-arabic">
      <Router />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
