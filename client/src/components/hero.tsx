import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import heroVideo from "@assets/مقطع للباحه_1757969418986.mp4";

export default function Hero() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartJourney = () => {
    if (isLoading) return; // Prevent premature action
    
    if (isAuthenticated) {
      setLocation("/places");
    } else {
      window.location.href = "/api/login";
    }
  };

  const handleJoinGuide = () => {
    if (isLoading) return; // Prevent premature action
    
    if (isAuthenticated) {
      setLocation("/guides");
    } else {
      window.location.href = "/api/login";
    }
  };

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* فيديو الخلفية */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
      >
        <source src={heroVideo} type="video/mp4" />
        {/* في حالة عدم دعم الفيديو، عرض صورة بديلة */}
        <div className="absolute inset-0 bg-cover bg-center" 
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"}} />
      </video>
      
      {/* طبقة التعتيم */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      
      {/* المحتوى */}
      <div className="relative container mx-auto px-4 h-full flex items-center z-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            اكتشف جمال الباحة
            <span className="block text-secondary">مع أفضل المرشدين السياحيين</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            منصة تربط بين السياح والمرشدين السياحيين المحليين في منطقة الباحة لتجربة سياحية استثنائية وأصيلة
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="text-lg" 
              onClick={handleStartJourney}
              disabled={isLoading}
              data-testid="hero-start-journey"
            >
              ابدأ رحلتك الآن
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 text-lg"
              onClick={handleJoinGuide}
              disabled={isLoading}
              data-testid="hero-join-guide"
            >
              انضم كمرشد سياحي
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
