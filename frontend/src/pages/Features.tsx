
import Navbar from "@/components/Navbar";
import { Music2, AudioLines, CloudRain, Share2, Lock, Library } from "lucide-react";

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="pt-24 pb-16 container">
        <h1 className="text-4xl font-bold text-center mb-16 animate-fade-in">
          Powerful Features for Your Music
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Music2 className="w-8 h-8 text-primary" />,
              title: "Smart Playlists",
              description: "Automatically organize your music based on your preferences and listening habits."
            },
            {
              icon: <AudioLines className="w-8 h-8 text-primary" />,
              title: "Lossless Audio",
              description: "Experience your music in pristine quality with support for high-resolution audio formats."
            },
            {
              icon: <CloudRain className="w-8 h-8 text-primary" />,
              title: "Multi-Cloud Support",
              description: "Connect to multiple cloud storage providers and manage your music from one place."
            },
            {
              icon: <Share2 className="w-8 h-8 text-primary" />,
              title: "Secure Sharing",
              description: "Share your music with friends and family using end-to-end encrypted links."
            },
            {
              icon: <Lock className="w-8 h-8 text-primary" />,
              title: "Privacy First",
              description: "Your music stays private with client-side encryption and zero server processing."
            },
            {
              icon: <Library className="w-8 h-8 text-primary" />,
              title: "Library Management",
              description: "Powerful tools for organizing, tagging, and managing your music collection."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-foreground/10 animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 200}ms`, animationFillMode: "forwards" }}
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
              <p className="text-foreground/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
