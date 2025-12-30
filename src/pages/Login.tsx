import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, User } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { useAuth } from '@/contexts/auth-context';
import LoadingScreen from '@/components/LoadingComponent';
import bcrypt from 'bcryptjs';

const roleRedirects: Record<string, string> = {
  'Finance Officer': '/dashboard/officer',
  'Finance Administrator': '/dashboard/admin',
  'Program Manager': '/dashboard/manager',
};

export const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const roles = [
    "Finance Officer",
    "Finance Administrator",
    "Program Manager"
  ]

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('Finance Officer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) navigate(roleRedirects[session.user.user_metadata.role])
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.from("users").select("*").eq("email", email);

    if (error) {
      toast.error('Invalid credentials. Please check your email, password, and role.');
      setIsLoading(false);
    } else {

      if (!error && data) {
        const filterOnRole = data.filter((entry) => entry.role === role);

        if (filterOnRole.length > 0) {
          const finalCheck = filterOnRole.filter((ent) => ent.isAdmin === true);
          console.log(finalCheck)

          if (finalCheck.length > 0) {
            const finalCheckForNewUser = finalCheck.filter((ent) => ent.isLoggedIn === true);
            console.log(finalCheckForNewUser)

            if (finalCheckForNewUser.length > 0) {
              const { error } = await supabase.auth.signInWithPassword({ email: email, password: password });

              if (error) {
                toast.error("Error Logging in");
                return;
              }
              toast.success('Login successful!');
              setIsLoading(false);
              navigate(roleRedirects[role] || '/dashboard');
              return;

            } else {
              const comparision = bcrypt.compareSync(password, finalCheck[0].password);
              if (!comparision) {
                toast.error("Password Is Incorrect");
                setIsLoading(false);
                return;
              }

              const displayName: string | null = prompt("Enter Your One Time Display Name");

              if (displayName === null) {
                toast.error("Error, No Name Provided");
                setIsLoading(false);
                return;
              }

              const { error } = await supabase.auth.signUp({
                email: email, password: password, options: {
                  data: {
                    full_name: displayName,
                    role: role,
                  }
                }
              })

              if (error) {
                toast.error("Error Logging In");
                setIsLoading(false);
                return;
              }
              await supabase.from("users").update({ isLoggedIn: true }).eq("email", email);

              toast.success('Login successful!');
              setIsLoading(false);
              navigate(roleRedirects[role] || '/dashboard');
              return;

            }
          } else {
            toast.error('You Are not An Admin');
            setIsLoading(false);
          }

        } else {
          toast.error('Invalid Role.');
          setIsLoading(false);
        }
      } else {
        toast.error('Error. No Admin Found');
        setIsLoading(false);
      }
    }

    setIsLoading(false);
  };

  if (loading) {
    <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground">
            Automated Donation & Finance Management
          </p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your admin account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {role == "" ? (
              <>
                <div className="flex gap-4">
                  {roles.map((r) => (
                    <div
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`cursor-pointer p-4 shadow-lg w-1/3 flex flex-col gap-3 border-2 transition-all rounded-lg
                      ${selectedRole === r ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}
                    >
                      <User />
                      <p className="font-medium">{r}</p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setRole(selectedRole)}
                  disabled={!selectedRole}
                  className={`mt-4 py-2 px-6 rounded-md text-white font-semibold self-start transition-colors
                  ${selectedRole ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Confirm Selection
                </Button>
              </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className='bg-background text-blue-600 hover:bg-background cursor-pointer hover:underline transition-all'
                      onClick={() => setRole("")}
                    >
                      Change Role
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn size={18} />
                        Sign In
                      </span>
                    )}
                  </Button>
                </form>
              )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Officer:</strong> extranamecr77@gmail.com</p>
                <p><strong>Administrator:</strong> extranamecr7@gmail.com</p>
                <p><strong>Manager:</strong> extranamecr@gmail.com</p>
                <p className="mt-1"><strong>Password:</strong> 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};
