import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const roleRedirects: Record<string, string> = {
  'Finance Officer': '/dashboard/officer',
  'Finance Administrator': '/dashboard/admin',
  'Program Manager': '/dashboard/manager',
};

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRedirects[user.role] || '/login');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default Index;
