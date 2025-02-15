
import Navbar from "@/components/Navbar";
import { Shield, Lock, Key, FileKey, UserCheck, Server } from "lucide-react";

const Security = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="pt-24 pb-16 container">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">
            Bank-Grade Security for Your Music
          </h1>
          <p className="text-xl text-foreground/60">
            Your privacy and security are our top priorities. We use state-of-the-art
            encryption to keep your music collection safe and private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Lock className="w-8 h-8 text-primary" />,
              title: "End-to-End Encryption",
              description: "Your music is encrypted before it leaves your device, ensuring complete privacy."
            },
            {
              icon: <Key className="w-8 h-8 text-primary" />,
              title: "Zero-Knowledge Privacy",
              description: "We never see your encryption keys or unencrypted music data."
            },
            {
              icon: <FileKey className="w-8 h-8 text-primary" />,
              title: "Secure File Storage",
              description: "Files are encrypted and distributed across multiple secure storage providers."
            },
            {
              icon: <Shield className="w-8 h-8 text-primary" />,
              title: "Access Control",
              description: "Fine-grained permissions and time-limited access for shared content."
            },
            {
              icon: <UserCheck className="w-8 h-8 text-primary" />,
              title: "Two-Factor Authentication",
              description: "Additional security layer to protect your account access."
            },
            {
              icon: <Server className="w-8 h-8 text-primary" />,
              title: "Local Processing",
              description: "All sensitive operations happen on your device, not our servers."
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

export default Security;
