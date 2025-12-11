import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SignupModal from "@/components/auth/SignupModal";

const AboutPage = () => {
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a472a] mb-2">
            About Barter King
          </h1>
          <p className="text-muted-foreground">
            Reimagining how communities exchange value
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Barter King is revolutionizing how people exchange goods and
                services by building a fair, transparent, and community-driven
                platform. We believe that value exists beyond money, and that
                genuine connections can be built through mutual respect and
                reciprocal exchanges.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">
                SkillX Coin System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our innovative <strong>SkillX Coin</strong> system ensures fair
                valuations of all exchanges. Each skill or item is assigned a
                transparent SkillX value, allowing members to propose balanced
                trades without ambiguity. This blockchain-inspired approach
                creates accountability and trust within our community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">Why Barter King?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>Community First:</strong> Build genuine connections
                  with people in your area
                </li>
                <li>
                  <strong>Fair Exchanges:</strong> SkillX coins ensure equitable
                  valuations
                </li>
                <li>
                  <strong>No Hidden Costs:</strong> Free to join and trade
                  without fees
                </li>
                <li>
                  <strong>Sustainable:</strong> Reduce consumption and promote
                  circular economy
                </li>
                <li>
                  <strong>Trusted:</strong> Community ratings and verified
                  members
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">
                Get Started Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join thousands of members already trading skills and items. Sign
                up now and receive 500 starter SkillX coins!
              </p>
              <Button
                className="bg-[#1a472a] hover:bg-[#2d6a4f] text-white"
                onClick={() => setSignupOpen(true)}
              >
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </div>
  );
};

export default AboutPage;
