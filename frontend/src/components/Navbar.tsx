
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed w-full bg-background/80 backdrop-blur-lg z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              SoundVault Pro
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/features" 
              className={`${isActive('/features') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
            >
              Features
            </Link>
            <Link 
              to="/security"
              className={`${isActive('/security') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
            >
              Security
            </Link>
            <Link 
              to="/pricing"
              className={`${isActive('/pricing') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
            >
              Pricing
            </Link>
            <Link 
              to="/get-started"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
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
            <Link
              to="/features"
              className={`block px-3 py-2 ${isActive('/features') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/security"
              className={`block px-3 py-2 ${isActive('/security') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Security
            </Link>
            <Link
              to="/pricing"
              className={`block px-3 py-2 ${isActive('/pricing') ? 'text-primary' : 'text-foreground/80'} hover:text-primary transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/get-started"
              className="block w-full text-left bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
