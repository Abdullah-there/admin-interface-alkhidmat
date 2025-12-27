import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { roles } from '@/lib/constants';
import type { User, Role } from "@/lib/constants"
import { toast } from 'sonner';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { useAuth } from '@/contexts/auth-context';

export const AdminUsers = () => {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [Loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const getUsersList = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*");
      if (!error) {
        const filterData = data.filter((d) => d.email !== session.user.email);
        setUsers(filterData); 
        setLoading(false)      
      } else {
        console.error("Error Fetching Users", error.message);
        setLoading(false)
      }
    }
    getUsersList();
  }, [session]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      toast.error('A user with this email already exists');
      return;
    }

    setIsLoading(true);

    const dataToAdd = {
      email: email,
      role: role,
      isAdmin: true,
      isLoggedIn: false,
      password: password,
    }
    const { error } = await supabase.from("users").insert(dataToAdd).select("*").single();

    if (error) {
      toast.error("Error Adding User")
      setIsLoading(false)
      return;
    }

    setUsers([...users, dataToAdd]);
    setEmail('');
    setPassword('');
    setRole('');
    toast.success('User added successfully!');
    setIsLoading(false)
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoadingDelete(true);
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      toast.error("Error Deleting User");
      setIsLoadingDelete(false);
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    toast.success('User deleted successfully!');
    setIsLoadingDelete(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Finance Administrator': return 'default';
      case 'Finance Officer': return 'secondary';
      case 'Program Manager': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Add and manage system users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus size={20} />
                Add New User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus size={16} className="mr-2" />
                  {isLoading ? "Adding" : "Add User"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isLoadingDelete}>
                                  <Trash2 size={16} className={`${isLoadingDelete ? "text-gray-500" : ""}`}/>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.email}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id as string)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : Loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Loading Users</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
