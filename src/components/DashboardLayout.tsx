import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Users,
  ClipboardList,
  Send,
  CheckCircle,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  'Finance Officer': [
    { label: 'Dashboard', path: '/dashboard/officer', icon: <LayoutDashboard size={18} /> },
    { label: 'User Acknowledgment', path: '/dashboard/officer/messages', icon: <MessageSquare size={18} /> },
    { label: 'Share Reports', path: '/dashboard/officer/reports', icon: <FileText size={18} /> },
    { label: 'Donations', path: '/dashboard/officer/donations', icon: <DollarSign size={18} /> },
    { label: 'Reports', path: '/dashboard/officer/reportsSub', icon: <FileText size={18} /> },
  ],
  'Finance Administrator': [
    { label: 'Dashboard', path: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Review Reports', path: '/dashboard/admin/reports', icon: <FileText size={18} /> },
    { label: 'Share Reports', path: '/dashboard/admin/share', icon: <Share2 size={18} /> },
    { label: 'Manage Budget', path: '/dashboard/admin/requests', icon: <ClipboardList size={18} /> },
    { label: 'Users', path: '/dashboard/admin/users', icon: <Users size={18} /> },
  ],
  'Program Manager': [
    { label: 'Dashboard', path: '/dashboard/manager', icon: <LayoutDashboard size={18} /> },
    { label: 'Request Funds', path: '/dashboard/manager/request', icon: <Send size={18} /> },
    { label: 'Recieved Funds', path: '/dashboard/manager/approved', icon: <CheckCircle size={18} /> },
    { label: 'Distributions', path: '/dashboard/manager/distribute', icon: <DollarSign size={18} /> },
    { label: 'Share Reports', path: '/dashboard/manager/reports', icon: <FileText size={18} /> },
  ],
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { session, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = session ? roleNavItems[session.user.user_metadata.role] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{session?.user.email}</p>
                <p className="text-xs text-muted-foreground">{session?.user.user_metadata.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-card border-r border-border">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-xl animate-slide-up">
              <div className="p-4 border-b border-border">
                <Logo size="sm" />
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="absolute inset-0" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
