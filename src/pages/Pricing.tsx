
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="pt-24 pb-16 container">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core privacy and security features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Basic",
              price: "Free",
              description: "Perfect for getting started",
              features: [
                "Up to 1000 songs",
                "Basic encryption",
                "Single cloud storage",
                "Standard audio quality",
                "Basic playlist features"
              ]
            },
            {
              name: "Pro",
              price: "$9.99",
              period: "/month",
              description: "Best for music enthusiasts",
              featured: true,
              features: [
                "Unlimited songs",
                "Advanced encryption",
                "Multi-cloud support",
                "Lossless audio",
                "Smart playlists",
                "Secure sharing",
                "Priority support"
              ]
            },
            {
              name: "Family",
              price: "$14.99",
              period: "/month",
              description: "Share with up to 6 family members",
              features: [
                "Everything in Pro",
                "6 family accounts",
                "Family vault",
                "Parental controls",
                "Extended sharing",
                "Usage analytics"
              ]
            }
          ].map((plan, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl ${
                plan.featured 
                  ? "bg-primary/10 border-primary" 
                  : "bg-white/5 border-foreground/10"
              } backdrop-blur-lg border-2 animate-fade-in opacity-0 relative`}
              style={{ animationDelay: `${index * 200}ms`, animationFillMode: "forwards" }}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-lg font-normal text-foreground/60">
                    {plan.period}
                  </span>
                </div>
                <p className="text-foreground/60 mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-8 px-4 py-2 rounded-lg transition-colors ${
                plan.featured
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border border-primary/50 hover:border-primary text-primary"
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
