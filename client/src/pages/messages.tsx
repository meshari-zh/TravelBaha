import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MessageChat from "@/components/message-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Lock } from "lucide-react";
import type { Message, User, Guide } from "@shared/schema";

export default function Messages() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isSocketAuthenticated, setIsSocketAuthenticated] = useState(false);

  // Fetch guides for visitors (always fetch guides)
  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  // Fetch available users to chat with based on role
  const { data: availableUsers = [] } = useQuery<User[]>({
    queryKey: user?.role === 'tourist' ? ["/api/guides"] : ["/api/users"],
    enabled: !!user,
    select: (data: any[]) => {
      if (user?.role === 'tourist') {
        // For tourists, show guides
        return data.map((guide: Guide) => guide.user).filter(Boolean);
      } else {
        // For guides and admins, show only guides and admins (not tourists)
        return data.filter((u: User) => u.id !== user?.id && (u.role === 'guide' || u.role === 'admin'));
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
          title: language === 'ar' ? "غير مصرح" : "Unauthorized",
          description: language === 'ar' ? "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى..." : "You have been logged out. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected - server will authenticate automatically');
      // Server authenticates immediately using session - no need to send auth message
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'authenticated') {
        if (data.success) {
          console.log('WebSocket authenticated successfully for user:', data.userId);
          setIsSocketAuthenticated(true);
          setSocket(ws);
        } else {
          console.error('WebSocket authentication failed:', data.error);
          setIsSocketAuthenticated(false);
          ws.close();
        }
        return;
      }
      
      if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
        if (data.message === 'Authentication required') {
          setIsSocketAuthenticated(false);
        }
        return;
      }
      
      if (data.type === 'new_message') {
        // Refresh messages if this is the active conversation
        if (selectedUser && 
            (data.message.senderId === selectedUser.id || data.message.receiverId === selectedUser.id || 
             data.message.senderId === user.id)) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUser.id] });
        }
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      if (event.code === 1008) {
        console.error('WebSocket connection rejected: Unauthorized');
        toast({
          title: language === 'ar' ? "اتصال غير مصرح" : "Unauthorized Connection",
          description: language === 'ar' ? "فشل في تسجيل الدخول للدردشة. سيتم تحديث الصفحة..." : "Failed to authenticate chat. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
      }
      setSocket(null);
      setIsSocketAuthenticated(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      setSocket(null);
      setIsSocketAuthenticated(false);
    };

    return () => {
      ws.close();
    };
  }, [user?.id, selectedUser, queryClient]);

  const handleSendMessage = (content: string) => {
    if (!selectedUser || !content.trim()) return;

    // Send via WebSocket for real-time delivery if authenticated
    if (socket && socket.readyState === WebSocket.OPEN && isSocketAuthenticated) {
      socket.send(JSON.stringify({
        type: 'send_message',
        // Don't send senderId - server will derive it from authenticated session
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

  const getUserDisplayName = (u: User) => {
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || (language === 'ar' ? 'مستخدم' : 'User');
  };

  const getUserInitials = (u: User) => {
    const firstName = u.firstName || '';
    const lastName = u.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || u.email?.charAt(0).toUpperCase() || (language === 'ar' ? 'م' : 'U');
  };

  const getGuideDisplayName = (guide: Guide) => {
    if (!guide.user) return language === 'ar' ? 'مرشد سياحي' : 'Tour Guide';
    return [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ') || guide.user.email || (language === 'ar' ? 'مرشد سياحي' : 'Tour Guide');
  };

  const getGuideInitials = (guide: Guide) => {
    if (!guide.user) return language === 'ar' ? 'م' : 'G';
    const firstName = guide.user.firstName || '';
    const lastName = guide.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || guide.user.email?.charAt(0).toUpperCase() || (language === 'ar' ? 'م' : 'G');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 flex-1">
          {/* Login Required Banner */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {language === 'ar' ? 'يجب تسجيل الدخول للمراسلة' : 'Login Required to Message'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'سجل دخولك للتواصل مع المرشدين السياحيين'
                    : 'Login to chat with tour guides'}
                </p>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">
            {language === 'ar' ? 'المرشدين السياحيين المتاحين' : 'Available Tour Guides'}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <Card key={guide.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={guide.user?.profileImageUrl || undefined} />
                      <AvatarFallback>{getGuideInitials(guide)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{getGuideDisplayName(guide)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {guide.languages?.slice(0, 2).join(', ')}
                      </p>
                      {guide.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">{parseFloat(guide.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    {language === 'ar' ? 'سجل دخولك للمراسلة' : 'Login to Message'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {guides.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا يوجد مرشدين متاحين حالياً' : 'No guides available at the moment'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
    );
  }

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
                {language === 'ar' ? 'المحادثات' : 'Conversations'}
              </CardTitle>
              
              {/* Search Users */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={language === 'ar' ? "البحث عن مستخدم..." : "Search users..."}
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
                    {searchTerm 
                      ? (language === 'ar' ? 'لا يوجد مستخدمين يطابقون البحث' : 'No users match your search')
                      : (language === 'ar' ? 'لا يوجد مستخدمين متاحين للمحادثة' : 'No users available for chat')}
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
                isConnected={socket?.readyState === WebSocket.OPEN && isSocketAuthenticated}
              />
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{language === 'ar' ? 'اختر محادثة' : 'Select a Conversation'}</h3>
                  <p className="text-muted-foreground">
                    {user?.role === 'tourist' 
                      ? (language === 'ar' ? 'اختر مرشداً سياحياً للبدء في المحادثة' : 'Select a tour guide to start chatting')
                      : (language === 'ar' ? 'اختر مستخدماً للبدء في المحادثة' : 'Select a user to start chatting')
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
