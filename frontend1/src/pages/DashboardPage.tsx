import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Plus,
  LayoutDashboard,
  FileText,
  Inbox,
  Briefcase,
  User,
} from "lucide-react";
import {
  getDashboard,
  updateProfile,
  DashboardData,
} from "@/services/userService";
import { createPost, Post } from "@/services/postService";
import {
  acceptRequest,
  rejectRequest,
  Request,
} from "@/services/requestService";
import { markTaskComplete, getMyTrades, Trade } from "@/services/tradeService";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

interface ActivePost extends Post {
  _count?: {
    requests: number;
  };
}

interface PendingRequest extends Request {
  requester: {
    id: string;
    name: string;
    profession?: string;
  };
}

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Post form state
  const [category, setCategory] = useState<string>("");
  const [offeringDescription, setOfferingDescription] = useState("");
  const [seekingDescription, setSeekingDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tradeValue, setTradeValue] = useState("");

  // Profile form state
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const { token, user, setUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Get active tab from query params
  const searchParams = useMemo(
    () => new URLSearchParams(routerLocation.search),
    [routerLocation.search]
  );
  const activeTab = searchParams.get("tab") || "overview";

  // Tab navigation handler
  const handleTabChange = (tab: string) => {
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadDashboard();
    loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const loadDashboard = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getDashboard(token);
      setDashboard(response.dashboard);
      setName(response.dashboard.user.name);
      setProfession(response.dashboard.user.profession || "");
      setSkillsInput(response.dashboard.user.skills?.join(", ") || "");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTrades = async () => {
    if (!token) return;

    try {
      const response = await getMyTrades(token);
      setTrades(response.trades);
    } catch (error: unknown) {
      console.error("Failed to load trades:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (
      !category ||
      !offeringDescription ||
      !seekingDescription ||
      !location ||
      !tradeValue
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createPost(
        {
          category: category as "SKILLS" | "SERVICES" | "WORK" | "ITEMS",
          offeringDescription,
          seekingDescription,
          location,
          tradeValue: parseInt(tradeValue),
        },
        token
      );

      toast({
        title: "Success",
        description: "Your post has been created!",
      });

      setPostDialogOpen(false);
      resetPostForm();
      loadDashboard();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const response = await updateProfile({ name, profession, skills }, token);

      setUser(response.user);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setProfileDialogOpen(false);
      loadDashboard();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!token) return;

    try {
      await acceptRequest(requestId, token);
      toast({
        title: "Success",
        description: "Request accepted! Trade has been created.",
      });
      loadDashboard();
      loadTrades();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!token) return;

    try {
      await rejectRequest(requestId, token);
      toast({
        title: "Success",
        description: "Request rejected.",
      });
      loadDashboard();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (tradeId: string) => {
    if (!token) return;

    try {
      await markTaskComplete(tradeId, token);
      toast({
        title: "Success",
        description: "Task marked as complete!",
      });
      loadTrades();
      loadDashboard();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to mark task as complete",
        variant: "destructive",
      });
    }
  };

  const resetPostForm = () => {
    setCategory("");
    setOfferingDescription("");
    setSeekingDescription("");
    setLocation("");
    setTradeValue("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a472a]" />
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect via useEffect
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a472a]" />
      </div>
    );
  }

  // Tab definitions
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "posts",
      label: "Posts",
      icon: FileText,
    },
    {
      id: "requests",
      label: "Requests",
      icon: Inbox,
    },
    {
      id: "trades",
      label: "Trades",
      icon: Briefcase,
    },
    // {
    //   id: "profile",
    //   label: "Profile",
    //   icon: User,
    // },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Profile Card */}
              <Card className="border-l-4 border-l-[#d4a574]">
                <CardHeader>
                  <CardTitle className="text-[#1a472a]">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <Avatar className="w-16 h-16 mb-4 bg-[#d4a574] text-[#1a472a] text-2xl font-bold">
                    <AvatarFallback>
                      {dashboard.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold mb-1">{dashboard.user.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {dashboard.user.profession || "No profession set"}
                  </p>
                  {dashboard.user.skills &&
                    dashboard.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {dashboard.user.skills.map(
                          (skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-[#d4a574] text-[#1a472a] px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfileDialogOpen(true)}
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Coins Card */}
              <Card className="border-l-4 border-l-[#d4a574]">
                <CardHeader>
                  <CardTitle className="text-[#1a472a]">Your Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#ffed4e] p-6 rounded-lg text-center text-[#1a472a]">
                    <div className="text-sm opacity-80 mb-2">
                      Available Balance
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {dashboard.user.coins}
                    </div>
                    <div className="text-sm opacity-80">Coins</div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="border-l-4 border-l-[#d4a574]">
                <CardHeader>
                  <CardTitle className="text-[#1a472a]">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Total Posts:</strong> {dashboard.stats.totalPosts}
                  </p>
                  <p>
                    <strong>Active Posts:</strong> {dashboard.stats.activePosts}
                  </p>
                  <p>
                    <strong>Pending Requests:</strong>{" "}
                    {dashboard.stats.pendingRequests}
                  </p>
                  <p>
                    <strong>Completed Trades:</strong>{" "}
                    {dashboard.stats.completedTrades}
                  </p>
                  <p>
                    <strong>Active Trades:</strong>{" "}
                    {dashboard.stats.activeTrades}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "posts":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1a472a]">
                Your Active Posts
              </h2>
              <Button
                onClick={() => setPostDialogOpen(true)}
                className="bg-[#1a472a] hover:bg-[#2d6a4f]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                {dashboard.activePosts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No active posts yet
                    </p>
                    <Button
                      onClick={() => setPostDialogOpen(true)}
                      className="bg-[#1a472a] hover:bg-[#2d6a4f]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.activePosts.map((post: ActivePost) => (
                      <Card
                        key={post.id}
                        className="border-l-4 border-l-[#1a472a]"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#d4a574] text-[#1a472a] px-2 py-1 rounded text-xs font-semibold">
                              {post.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {post._count?.requests || 0} requests
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#1a472a] mb-1">
                            Offering:{" "}
                            {post.offeringDescription.substring(0, 50)}
                            ...
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Seeking: {post.seekingDescription.substring(0, 50)}
                            ...
                          </p>
                          <p className="text-sm font-semibold">
                            {post.tradeValue} Coins
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "requests":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1a472a]">
              Pending Requests
            </h2>
            <Card>
              <CardContent className="pt-6">
                {dashboard.pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.pendingRequests.map(
                      (request: PendingRequest) => (
                        <Card
                          key={request.id}
                          className="border-l-4 border-l-[#d4a574]"
                        >
                          <CardContent className="pt-4">
                            <div className="mb-3">
                              <p className="font-semibold text-sm">
                                {request.requester.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.requester.profession}
                              </p>
                            </div>
                            <p className="text-sm mb-2">
                              Offers: <strong>{request.offeredValue}</strong>{" "}
                              coins
                            </p>
                            <p className="text-sm mb-3">
                              Requests:{" "}
                              <strong>{request.requestedValue}</strong> coins
                            </p>
                            {request.message && (
                              <p className="text-sm text-muted-foreground mb-3 italic">
                                "{request.message}"
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-[#1a472a] hover:bg-[#2d6a4f]"
                                onClick={() => handleAcceptRequest(request.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "trades":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1a472a]">Active Trades</h2>
            {trades.filter(
              (trade) =>
                trade.status !== "COMPLETED" && trade.status !== "CANCELLED"
            ).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active trades</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {trades
                      .filter(
                        (trade) =>
                          trade.status !== "COMPLETED" &&
                          trade.status !== "CANCELLED"
                      )
                      .map((trade) => {
                        const isProvider = trade.providerId === user?.id;
                        const partner = isProvider
                          ? trade.seeker
                          : trade.provider;
                        const myCompleted = isProvider
                          ? trade.providerCompleted
                          : trade.seekerCompleted;

                        return (
                          <Card
                            key={trade.id}
                            className="border-l-4 border-l-[#1a472a]"
                          >
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold">
                                    Trade with {partner.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {partner.profession}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    trade.status === "IN_PROGRESS"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {trade.status.replace("_", " ")}
                                </span>
                              </div>
                              <div className="text-sm mb-3">
                                <p>
                                  You {isProvider ? "provide" : "receive"}:{" "}
                                  {isProvider
                                    ? trade.providerValue
                                    : trade.seekerValue}{" "}
                                  coins
                                </p>
                                <p>
                                  You {isProvider ? "receive" : "provide"}:{" "}
                                  {isProvider
                                    ? trade.seekerValue
                                    : trade.providerValue}{" "}
                                  coins
                                </p>
                              </div>
                              {!myCompleted && (
                                <Button
                                  size="sm"
                                  className="w-full bg-[#1a472a] hover:bg-[#2d6a4f]"
                                  onClick={() => handleCompleteTask(trade.id)}
                                >
                                  Mark as Complete
                                </Button>
                              )}
                              {myCompleted && (
                                <p className="text-sm text-center text-muted-foreground">
                                  Waiting for {partner.name} to complete their
                                  task
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1a472a]">
                Profile Settings
              </h2>
              <Button
                onClick={() => setProfileDialogOpen(true)}
                className="bg-[#1a472a] hover:bg-[#2d6a4f]"
              >
                Edit Profile
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-[#d4a574]">
                <CardHeader>
                  <CardTitle className="text-[#1a472a]">
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 bg-[#d4a574] text-[#1a472a] text-3xl font-bold">
                      <AvatarFallback>
                        {dashboard.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-semibold">
                        {dashboard.user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dashboard.user.profession || "No profession set"}
                      </p>
                    </div>
                  </div>
                  {dashboard.user.skills &&
                    dashboard.user.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {dashboard.user.skills.map(
                            (skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-[#d4a574] text-[#1a472a] px-3 py-1 rounded-md text-sm"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#d4a574]">
                <CardHeader>
                  <CardTitle className="text-[#1a472a]">
                    Account Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#ffed4e] p-8 rounded-lg text-center text-[#1a472a]">
                    <div className="text-sm opacity-80 mb-2">
                      Available Balance
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {dashboard.user.coins}
                    </div>
                    <div className="text-sm opacity-80">Coins</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a472a] mb-2">
            Welcome Back, {dashboard.user.name}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your profile and barter offers
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-border">
            <div className="flex flex-wrap gap-2 sm:gap-0 overflow-x-auto scrollbar-hide -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium transition-colors
                      border-b-2 whitespace-nowrap
                      ${
                        isActive
                          ? "border-[#d4a574] text-[#1a472a] bg-[#d4a574]/10"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-[#d4a574]/50"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">{renderTabContent()}</div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SKILLS">Skills</SelectItem>
                  <SelectItem value="SERVICES">Services</SelectItem>
                  <SelectItem value="WORK">Work</SelectItem>
                  <SelectItem value="ITEMS">Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What are you offering?</Label>
              <Textarea
                value={offeringDescription}
                onChange={(e) => setOfferingDescription(e.target.value)}
                placeholder="Describe what you're offering..."
                rows={3}
              />
            </div>
            <div>
              <Label>What are you seeking?</Label>
              <Textarea
                value={seekingDescription}
                onChange={(e) => setSeekingDescription(e.target.value)}
                placeholder="Describe what you're looking for..."
                rows={3}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label>Trade Value (Coins)</Label>
              <Input
                type="number"
                value={tradeValue}
                onChange={(e) => setTradeValue(e.target.value)}
                placeholder="100"
                min="1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPostDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1a472a] hover:bg-[#2d6a4f]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Profession</Label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Web Developer, Teacher, etc."
              />
            </div>
            <div>
              <Label>Skills (comma separated)</Label>
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="JavaScript, Guitar, Photography"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfileDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1a472a] hover:bg-[#2d6a4f]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
