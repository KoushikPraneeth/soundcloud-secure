
import Navbar from "@/components/Navbar";
import { Cloud, Lock, Music, PlayCircle } from "lucide-react";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="pt-24 pb-16 container">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Get Started with SoundVault Pro</h1>
          <p className="text-xl text-foreground/60">
            Follow these simple steps to start enjoying your music with complete privacy and security.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {[
            {
              icon: <Cloud className="w-8 h-8 text-primary" />,
              title: "Connect Your Cloud Storage",
              description: "Link your preferred cloud storage providers to SoundVault Pro. We support all major services including Google Drive, Dropbox, and OneDrive."
            },
            {
              icon: <Lock className="w-8 h-8 text-primary" />,
              title: "Set Up Encryption",
              description: "Generate your encryption keys and set up two-factor authentication for enhanced security. Don't worry, we'll guide you through the process."
            },
            {
              icon: <Music className="w-8 h-8 text-primary" />,
              title: "Import Your Music",
              description: "Upload your music collection or import it from your connected cloud storage. We'll handle the encryption and organization automatically."
            },
            {
              icon: <PlayCircle className="w-8 h-8 text-primary" />,
              title: "Start Listening",
              description: "That's it! Start enjoying your music with the peace of mind that comes with complete privacy and security."
            }
          ].map((step, index) => (
            <div
              key={index}
              className="flex gap-6 mb-12 animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 200}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground/60">{step.description}</p>
              </div>
            </div>
          ))}

          <div className="text-center mt-16 animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg transition-colors">
              Create Your Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
