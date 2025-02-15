
import { Shield, Music, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <span className="inline-block animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            Revolutionizing Music Streaming
          </span>
        </span>
        
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
          Your Music, Your Privacy,
          <span className="text-primary"> Your Control</span>
        </h1>
        
        <p className="mt-6 text-xl text-foreground/60 max-w-3xl mx-auto animate-fade-in opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
          Stream your personal music collection with complete privacy and security.
          Multi-cloud support, lossless audio, and intelligent library management.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards]">
          <button 
            className="px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            onClick={() => navigate('/get-started')}
          >
            Get Started Free
          </button>
          <button 
            className="px-8 py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors"
            onClick={() => navigate('/features')}
          >
            Learn More
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-foreground/10 animate-fade-in opacity-0 [animation-delay:1000ms] [animation-fill-mode:forwards]">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
            <p className="text-foreground/60">End-to-end encryption ensures your music stays private and secure.</p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-foreground/10 animate-fade-in opacity-0 [animation-delay:1200ms] [animation-fill-mode:forwards]">
            <Cloud className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Cloud Support</h3>
            <p className="text-foreground/60">Connect and stream from any cloud storage provider of your choice.</p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-foreground/10 animate-fade-in opacity-0 [animation-delay:1400ms] [animation-fill-mode:forwards]">
            <Music className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lossless Audio</h3>
            <p className="text-foreground/60">Experience your music in pristine quality with lossless streaming.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
