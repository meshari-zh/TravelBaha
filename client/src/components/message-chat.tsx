import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Wifi, WifiOff } from "lucide-react";
import type { Message, User } from "@shared/schema";

interface MessageChatProps {
  currentUser: User;
  otherUser: User;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  isConnected?: boolean;
}

export default function MessageChat({ 
  currentUser, 
  otherUser, 
  messages, 
  onSendMessage, 
  isLoading = false,
  isConnected = false 
}: MessageChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getUserDisplayName = (user: User) => {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'مستخدم';
  };

  const getUserInitials = (user: User) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'م';
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage("");
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <>
      {/* Chat Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.profileImageUrl || undefined} />
              <AvatarFallback>{getUserInitials(otherUser)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold" data-testid={`chat-user-name-${otherUser.id}`}>
                {getUserDisplayName(otherUser)}
              </h3>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    متصل
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    غير متصل
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري تحميل الرسائل...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">لا توجد رسائل</h3>
                <p className="text-sm text-muted-foreground">ابدأ المحادثة بإرسال رسالة</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isFromCurrentUser = message.senderId === currentUser.id;
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      isFromCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border'
                    } p-3 rounded-lg shadow-sm`}>
                      <p className="text-sm break-words" data-testid={`message-content-${message.id}`}>
                        {message.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${
                          isFromCurrentUser 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.sender ? getUserDisplayName(message.sender) : (isFromCurrentUser ? 'أنت' : getUserDisplayName(otherUser))}
                        </span>
                        <span className={`text-xs ${
                          isFromCurrentUser 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`} data-testid={`message-time-${message.id}`}>
                          {formatTime(message.createdAt!)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1"
            data-testid="input-new-message"
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || !isConnected}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {!isConnected && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            الاتصال منقطع - جاري إعادة المحاولة...
          </p>
        )}
      </div>
    </>
  );
}
