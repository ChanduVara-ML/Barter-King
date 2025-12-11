import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { getAllPosts, Post } from "@/services/postService";
import { createRequest } from "@/services/requestService";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

const MarketplacePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [offeredValue, setOfferedValue] = useState("");
  const [requestedValue, setRequestedValue] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { token, user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, locationFilter, minPrice, maxPrice]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params: {
        category?: string;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {};
      if (categoryFilter && categoryFilter !== "all")
        params.category = categoryFilter;
      if (locationFilter) params.location = locationFilter;
      if (minPrice) params.minPrice = parseInt(minPrice);
      if (maxPrice) params.maxPrice = parseInt(maxPrice);

      const response = await getAllPosts(params);
      setPosts(response.posts);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProposeTradeClick = (post: Post) => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to propose a trade",
        variant: "destructive",
      });
      return;
    }

    setSelectedPost(post);
    setRequestedValue(post.tradeValue.toString());
    setOfferedValue(post.tradeValue.toString());
    setMessage("");
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
          message,
        },
        token
      );

      toast({
        title: "Success",
        description: "Your trade request has been sent!",
      });

      setRequestDialogOpen(false);
      setSelectedPost(null);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SKILLS":
        return "🎸";
      case "SERVICES":
        return "🧹";
      case "WORK":
        return "💼";
      case "ITEMS":
        return "📦";
      default:
        return "💰";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-[#1a472a] mb-8">
          Browse Available Trades
        </h1>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select
                value={categoryFilter || "all"}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SKILLS">Skills</SelectItem>
                  <SelectItem value="SERVICES">Services</SelectItem>
                  <SelectItem value="WORK">Work</SelectItem>
                  <SelectItem value="ITEMS">Items</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-[250px]"
              />
              <Input
                type="number"
                placeholder="Min price (coins)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full sm:w-[150px]"
                min="0"
              />
              <Input
                type="number"
                placeholder="Max price (coins)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full sm:w-[150px]"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1a472a]" />
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No posts found. Try adjusting your filters.
            </p>
          </Card>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#1a472a] to-[#2d6a4f] text-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#d4a574] text-[#1a472a] px-3 py-1 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="font-semibold text-[#1a472a] text-sm flex items-center gap-1">
                        {getCategoryIcon(post.category)} Offering:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.offeringDescription}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a472a] text-sm">
                        🎯 Seeking:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.seekingDescription}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a472a] text-sm">
                        📍 Location:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.location}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a472a] text-sm">
                        💰 SkillX Value:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.tradeValue} Coins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <Avatar className="w-9 h-9 bg-[#d4a574] text-[#1a472a]">
                      <AvatarFallback className="text-sm font-bold">
                        {post.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1a472a]">
                        {post.user?.name || "Unknown"}
                      </p>
                      {post.user?.profession && (
                        <p className="text-xs text-muted-foreground">
                          {post.user.profession}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#1a472a] hover:bg-[#2d6a4f] text-white"
                      onClick={() => handleProposeTradeClick(post)}
                      disabled={!token || post.userId === user?.id}
                    >
                      Propose Trade
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#1a472a] text-[#1a472a] hover:bg-[#f5f3f0]"
                      onClick={() =>
                        navigate(`/chat?postId=${encodeURIComponent(post.id)}`)
                      }
                      disabled={!token || post.userId === user?.id}
                    >
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Dialog */}
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
              />
            </div>
            <div>
              <Label>What you're requesting (Coins)</Label>
              <Input
                type="number"
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
                placeholder="Amount you want to receive"
              />
            </div>
            <div>
              <Label>Message (Optional)</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

export default MarketplacePage;
