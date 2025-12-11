import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuthStore } from "@/stores/authStore";

const HomePage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const { user } = useAuthStore();

  const features = [
    {
      icon: "🔍",
      title: "Post Your Skills",
      description:
        "Share the skills or items you can offer. Describe what you want in exchange.",
    },
    {
      icon: "🤝",
      title: "Find Partners",
      description:
        "Browse offers from community members. Find perfect matches for your needs.",
    },
    {
      icon: "💰",
      title: "Trade with SkillX",
      description:
        "Use our SkillX coin system to balance exchanges and ensure fair trades.",
    },
    {
      icon: "💬",
      title: "Communicate",
      description:
        "Message partners directly. Discuss terms and finalize your barter agreement.",
    },
    {
      icon: "⭐",
      title: "Build Trust",
      description:
        "Rate and review partners. Build your reputation in the community.",
    },
    {
      icon: "🎯",
      title: "Complete Exchange",
      description: "Execute trades, complete exchanges, and earn trust points.",
    },
  ];

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a472a]/90 to-[#2d6a4f]/90 text-white py-24 px-4 sm:px-6 lg:px-8 min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Cdefs%3E%3Cpattern id='dots' x='0' y='0' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='25' cy='25' r='2' fill='%23d4a574' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1200' height='600' fill='%231a472a'/%3E%3Crect width='1200' height='600' fill='url(%23dots)'/%3E%3C/svg%3E")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Barter King
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-[#d4a574]">
            Trade Skills, Not Bills.
          </p>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Connect with your community. Exchange skills and items fairly. No
            money needed.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-[#d4a574] text-[#1a472a] hover:bg-[#e8b86a] px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => setLoginOpen(true)}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1a472a] px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1a472a] mb-12">
            How Barter King Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-[#d4a574]"
              >
                <CardContent className="pt-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-[#1a472a] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
};

export default HomePage;
