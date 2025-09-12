import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import MessageChat from "@/components/message-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle } from "lucide-react";
import type { Message, User, Guide } from "@shared/schema";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Fetch available users to chat with based on role
  const { data: availableUsers = [] } = useQuery<User[]>({
    queryKey: user?.role === 'tourist' ? ["/api/guides"] : ["/api/users"],
    select: (data: any[]) => {
      if (user?.role === 'tourist') {
        // For tourists, show guides
        return data.map((guide: Guide) => guide.user).filter(Boolean);
      } else {
        // For guides and admins, show all users except themselves
        return data.filter((u: User) => u.id !== user?.id);
      }
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUser?.id],
    enabled: !!selectedUser,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      await apiRequest("POST", "/api/messages", { receiverId, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUser?.id] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        // Refresh messages if this is the active conversation
        if (selectedUser && 
            (data.message.senderId === selectedUser.id || data.message.receiverId === selectedUser.id)) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUser.id] });
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [selectedUser, queryClient]);

  const handleSendMessage = (content: string) => {
    if (!selectedUser || !content.trim()) return;

    // Send via WebSocket for real-time delivery
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'send_message',
        senderId: user?.id,
        receiverId: selectedUser.id,
        content: content.trim(),
      }));
    } else {
      // Fallback to HTTP request
      sendMessageMutation.mutate({
        receiverId: selectedUser.id,
        content: content.trim(),
      });
    }
  };

  const filteredUsers = availableUsers.filter(u =>
    (u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUserDisplayName = (user: User) => {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'مستخدم';
  };

  const getUserInitials = (user: User) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'م';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                المحادثات
              </CardTitle>
              
              {/* Search Users */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-users"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'لا يوجد مستخدمين يطابقون البحث' : 'لا يوجد مستخدمين متاحين للمحادثة'}
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-3 text-right hover:bg-muted transition-colors border-r-2 ${
                        selectedUser?.id === u.id ? 'bg-muted border-primary' : 'border-transparent'
                      }`}
                      data-testid={`button-select-user-${u.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={u.profileImageUrl || undefined} />
                          <AvatarFallback>{getUserInitials(u)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" data-testid={`text-user-name-${u.id}`}>
                            {getUserDisplayName(u)}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                        {/* You could add unread count badge here */}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedUser ? (
              <MessageChat
                currentUser={user!}
                otherUser={selectedUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={messagesLoading}
                isConnected={socket?.readyState === WebSocket.OPEN}
              />
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">اختر محادثة</h3>
                  <p className="text-muted-foreground">
                    {user?.role === 'tourist' 
                      ? 'اختر مرشداً سياحياً للبدء في المحادثة'
                      : 'اختر مستخدماً للبدء في المحادثة'
                    }
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
