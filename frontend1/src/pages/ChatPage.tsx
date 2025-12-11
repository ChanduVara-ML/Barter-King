import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Search, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { createRequest } from "@/services/requestService";
import {
  getMessages as getChatMessages,
  getConversations as getChatConversations,
  getConversationFromPost,
  searchUsers,
  getConversationFromUser,
  ChatMessage as ApiChatMessage,
  Conversation,
  User,
} from "@/services/chatService";

type ChatMessage = ApiChatMessage & {
  own?: boolean;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const postId = searchParams.get("postId");
  const initialConversationId = searchParams.get("conversationId");

  const { user, token } = useAuthStore();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Propose trade state (when a post is linked)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [offeredValue, setOfferedValue] = useState("");
  const [requestedValue, setRequestedValue] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const selectedPost = useMemo(
    () => activeConversation?.post || null,
    [activeConversation]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Load conversations for the current user
  useEffect(() => {
    const loadConversations = async () => {
      if (!token || !user) return;

      try {
        const { conversations } = await getChatConversations(token);
        setConversations(conversations);

        // If a conversationId is present in URL, keep it; otherwise, default to first
        // if (!activeConversationId && conversations.length > 0) {
        //   setActiveConversationId(conversations[0].id);
        // }
      } catch (error: unknown) {
        console.error(error);
      }
    };

    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // When there is a postId, ensure a conversation exists for that post and user
  useEffect(() => {
    const ensureConversationFromPost = async () => {
      if (!token || !user || !postId) return;

      try {
        const { conversation, messages: initialMessages } =
          await getConversationFromPost(token, postId, 200);

        setActiveConversationId(conversation.id);
        setMessages(
          initialMessages.map((m) => ({
            ...m,
            own: m.senderId === user.id,
          }))
        );

        setConversations((prev) => {
          const existing = prev.find((c) => c.id === conversation.id);
          if (existing) {
            return prev.map((c) =>
              c.id === conversation.id ? conversation : c
            );
          }
          return [conversation, ...prev];
        });

        // Keep URL in sync with conversationId
        const params = new URLSearchParams(location.search);
        params.set("conversationId", conversation.id);
        navigate({ search: params.toString() }, { replace: true });
      } catch (error: unknown) {
        console.error(error);
      }
    };

    ensureConversationFromPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, token, user]);

  // Load messages whenever activeConversationId changes (if not already loaded from post)
  useEffect(() => {
    const loadMessages = async () => {
      if (!token || !user || !activeConversationId) return;

      try {
        const { messages: apiMessages } = await getChatMessages(token, {
          conversationId: activeConversationId,
          limit: 200,
        });

        setMessages(
          apiMessages.map((m) => ({
            ...m,
            own: m.senderId === user.id,
          }))
        );
      } catch (error: unknown) {
        console.error(error);
      }
    };

    loadMessages();
  }, [activeConversationId, token, user]);

  // WebSocket (Socket.IO) connection
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    setConnecting(true);

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnecting(false);
      if (activeConversationId) {
        socket.emit("join-room", { conversationId: activeConversationId });
      }
    });

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          own: msg.senderId === user.id,
        },
      ]);
    });

    socket.on("disconnect", () => {
      setConnecting(false);
    });

    socket.on("connect_error", () => {
      setConnecting(false);
      toast({
        title: "Connection error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, toast]);

  // Join the active conversation room when it changes
  useEffect(() => {
    if (socketRef.current && activeConversationId) {
      socketRef.current.emit("join-room", {
        conversationId: activeConversationId,
      });
    }
  }, [activeConversationId]);

  // Search users with debounce
  useEffect(() => {
    if (!token || !searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { users } = await searchUsers(token, searchQuery.trim(), 20);
        setSearchResults(users);
        setShowSearchResults(true);
      } catch (error: unknown) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSearchResults]);

  const handleSendMessage = () => {
    if (
      !messageInput.trim() ||
      !socketRef.current ||
      !user ||
      !activeConversationId
    )
      return;

    socketRef.current.emit("chat:message:send", {
      text: messageInput.trim(),
      conversationId: activeConversationId,
      senderId: user.id,
      senderName: user.name,
    });

    setMessageInput("");
  };

  const handleOpenTradeDialog = () => {
    if (!token || !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to propose a trade",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPost) return;

    setOfferedValue(selectedPost.tradeValue.toString());
    setRequestedValue(selectedPost.tradeValue.toString());
    setTradeMessage("");
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPost || !token) return;

    if (!offeredValue || !requestedValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createRequest(
        {
          postId: selectedPost.id,
          offeredValue: parseInt(offeredValue),
          requestedValue: parseInt(requestedValue),
          message: tradeMessage,
        },
        token
      );

      toast({
        title: "Success",
        description: "Your trade request has been sent!",
      });

      setRequestDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserClick = async (selectedUser: User) => {
    if (!token || !user) return;

    try {
      const { conversation, messages: initialMessages } =
        await getConversationFromUser(token, selectedUser.id, 200);

      setActiveConversationId(conversation.id);
      setMessages(
        initialMessages.map((m) => ({
          ...m,
          own: m.senderId === user.id,
        }))
      );

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === conversation.id);
        if (existing) {
          return prev.map((c) =>
            c.id === conversation.id ? conversation : c
          );
        }
        return [conversation, ...prev];
      });

      // Update URL
      const params = new URLSearchParams();
      params.set("conversationId", conversation.id);
      navigate({ search: params.toString() }, { replace: true });

      // Clear search
      setSearchQuery("");
      setShowSearchResults(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)]">
        {/* Left column: Post info & (future) conversation list */}
        <div className="w-full sm:w-96 bg-white border-b sm:border-b-0 sm:border-r border-border overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-[#1a472a]">Messages</h2>
            {connecting && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
              </p>
            )}
          </div>

          {/* Search Users */}
          <div className="p-4 border-b border-border relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() && searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((resultUser) => (
                      <button
                        key={resultUser.id}
                        type="button"
                        onClick={() => handleUserClick(resultUser)}
                        className="w-full text-left px-4 py-3 hover:bg-[#f5f3f0] transition-colors flex items-center gap-3"
                      >
                        <Avatar className="w-8 h-8 bg-[#d4a574] text-[#1a472a]">
                          <AvatarFallback className="text-xs font-bold">
                            {resultUser.name.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a472a] truncate">
                            {resultUser.name}
                          </p>
                          {resultUser.profession && (
                            <p className="text-xs text-muted-foreground truncate">
                              {resultUser.profession}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Conversation list */}
          <div className="divide-y flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left px-4 py-3 flex flex-col gap-1 hover:bg-[#f5f3f0] transition-colors ${
                    isActive
                      ? "bg-[#d4a574]/10 border-l-4 border-l-[#d4a574]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 bg-[#d4a574] text-[#1a472a]">
                      <AvatarFallback className="text-xs font-bold">
                        {conv.otherUser.name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a472a]">
                        {conv.otherUser.name}
                      </p>
                      {conv.post && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {conv.post.offeringDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {!conversations.length && (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No conversations yet. Start by messaging someone from the
                marketplace.
              </p>
            )}
          </div>

          {/* Selected post details, if any */}
          {selectedPost && (
            <div className="p-4 border-t border-border mt-auto">
              <Card className="bg-[#f5f3f0] border-none shadow-none">
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-semibold text-[#1a472a] uppercase tracking-wide">
                    Related Trade
                  </p>
                  <p className="text-sm font-semibold text-[#1a472a]">
                    {selectedPost.offeringDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🎯 {selectedPost.seekingDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💰 {selectedPost.tradeValue} Coins · 📍{" "}
                    {selectedPost.location}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60 mt-2">
                    <Avatar className="w-7 h-7 bg-[#d4a574] text-[#1a472a]">
                      <AvatarFallback className="text-xs font-bold">
                        {selectedPost.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-[#1a472a]">
                        {selectedPost.user?.name || "Unknown"}
                      </p>
                      {selectedPost.user?.profession && (
                        <p className="text-[10px] text-muted-foreground">
                          {selectedPost.user.profession}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#1a472a] hover:bg-[#2d6a4f] text-white"
                    onClick={handleOpenTradeDialog}
                    disabled={!token || selectedPost.userId === user?.id}
                  >
                    Propose Trade
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 bg-[#f5f3f0]"
          >
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.own ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.own
                        ? "bg-[#1a472a] text-white rounded-br-none"
                        : "bg-white text-foreground rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.senderName && (
                      <p className="text-[10px] font-semibold mb-1 opacity-80">
                        {msg.own ? "You" : msg.senderName}
                      </p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-border p-4">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                placeholder={
                  token && user
                    ? "Type your message..."
                    : "Login to start messaging"
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
                disabled={!token || !user}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#1a472a] hover:bg-[#2d6a4f] text-white"
                disabled={!token || !user || !messageInput.trim()}
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Propose Trade Dialog (when navigated with postId) */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose a Trade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>What you're offering (Coins)</Label>
              <Input
                type="number"
                value={offeredValue}
                onChange={(e) => setOfferedValue(e.target.value)}
                placeholder="Amount you'll give"
                min={0}
              />
            </div>
            <div>
              <Label>What you're requesting (Coins)</Label>
              <Input
                type="number"
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
                placeholder="Amount you want to receive"
                min={0}
              />
            </div>
            <div>
              <Label>Message (Optional)</Label>
              <Input
                value={tradeMessage}
                onChange={(e) => setTradeMessage(e.target.value)}
                placeholder="Add a message to your request"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="bg-[#1a472a] hover:bg-[#2d6a4f]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
