import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ShieldX, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 animate-fade-in">
        <Logo size="lg" />
        
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <ShieldX size={48} className="text-destructive" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <Button asChild>
          <Link to="/login">
            <ArrowLeft size={18} className="mr-2" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  );
};
