import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Message } from '@/lib/constants';
import { toast } from 'sonner';
import { Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { useAuth } from "@/contexts/auth-context"

export const OfficerMessages = () => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const getAllMessages = async () => {
      console.log(session.user.email)
      setLoading(true)
      const { data, error } = await supabase.from("acknowledgment").select("*").eq("message_by", session?.user.email);

      if (error) {
        toast.error("Error Getting Messages");
        setLoading(false)
        return;
      } 
      setMessages(data);
      setLoading(false);
    }
    getAllMessages();
  }, [session]);

  const SendAcknowledgment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim() || !userEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // const newMessage = addMessage({ title, message, user_email: userEmail });
    setIsProcessing(true);

    const dataToAdd = {
      user_email: userEmail,
      title: title,
      message: message,
      message_by: session?.user.email as string
    };
    
    const { error } = await supabase.from("acknowledgment").insert(dataToAdd).single();
    
    if (error) {
      toast.error("Error Creating New Message");
    setIsProcessing(false);
      return;
    }
    setMessages([{...dataToAdd, created_at: new Date().toISOString()}, ...messages]);
    setTitle('');
    setMessage('');
    setUserEmail('');
    toast.success('Message sent successfully!');
    setIsProcessing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Acknowledgment</h1>
          <p className="text-muted-foreground">Send messages to users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send size={20} />
                New Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={SendAcknowledgment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Recipient Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Message title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your message..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isProcessing}>
                  <Send size={16} className="mr-2" />
                  {isProcessing ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Sent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell className="font-medium">{msg.user_email}</TableCell>
                          <TableCell>{msg.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Loading Messages</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages sent yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
