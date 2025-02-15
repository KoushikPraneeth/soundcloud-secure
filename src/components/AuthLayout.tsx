
import Navbar from "./Navbar";
import { Card, CardContent, CardHeader } from "./ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="container pt-24 pb-16">
        <Card className="max-w-md mx-auto animate-fade-in">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">{title}</h2>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
