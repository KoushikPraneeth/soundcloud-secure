
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-background/80 backdrop-blur-lg z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              SoundVault Pro
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#security" className="text-foreground/80 hover:text-primary transition-colors">
              Security
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">
              Pricing
            </a>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#security"
              className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Security
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <button className="w-full text-left bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
