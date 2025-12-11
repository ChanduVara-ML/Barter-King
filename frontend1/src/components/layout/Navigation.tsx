import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, Loader2 } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuthStore } from "@/stores/authStore";
import { getUser } from "@/services/authService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, setUser, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Fetch user details if token exists but user doesn't
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (token && !user && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          const data = await getUser(token);
          if (data.status === 1 && data.user) {
            setUser(data.user);
          }
        } catch (error) {
          // Token is invalid, clear auth
          clearAuth();
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const allNavLinks = [
    { path: "/", label: "Home" },
    { path: "/marketplace", label: "Browse" },
    { path: "/dashboard", label: "Dashboard", requiresAuth: true },
    { path: "/chat", label: "Messages", requiresAuth: true },
    { path: "/about", label: "About" },
  ];

  // Filter nav links based on auth state
  const navLinks = allNavLinks.filter((link) => !link.requiresAuth || user);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1a472a] to-[#2d6a4f] shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-[#d4a574] font-bold text-xl"
            >
              <div className="w-9 h-9 bg-[#d4a574] rounded-full flex items-center justify-center text-[#1a472a] font-bold">
                BK
              </div>
              Barter King
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-white font-medium transition-colors hover:text-[#d4a574] ${
                      isActive(link.path) ? "text-[#d4a574]" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth Buttons or User Icon */}
            <div className="hidden md:flex items-center gap-4">
              {isLoadingUser ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-white hover:text-[#d4a574] transition-colors cursor-pointer"
                    title={user.name}
                  >
                    <Avatar className="w-8 h-8 bg-[#d4a574] text-[#1a472a]">
                      <AvatarFallback className="text-sm font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-[#1a472a] rounded-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-[#1a472a] rounded-full"
                    onClick={() => setLoginOpen(true)}
                  >
                    Login
                  </Button>
                  <Button
                    className="bg-[#d4a574] text-[#1a472a] hover:bg-[#e8b86a] rounded-full"
                    onClick={() => setSignupOpen(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4">
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block text-white font-medium transition-colors hover:text-[#d4a574] ${
                        isActive(link.path) ? "text-[#d4a574]" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 mt-4">
                {isLoadingUser ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : user ? (
                  <>
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 justify-center text-white hover:text-[#d4a574] transition-colors cursor-pointer py-2"
                    >
                      <Avatar className="w-8 h-8 bg-[#d4a574] text-[#1a472a]">
                        <AvatarFallback className="text-sm font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </button>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-[#1a472a] rounded-full w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-[#1a472a] rounded-full w-full"
                      onClick={() => {
                        setLoginOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="bg-[#d4a574] text-[#1a472a] hover:bg-[#e8b86a] rounded-full w-full"
                      onClick={() => {
                        setSignupOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

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
    </>
  );
};

export default Navigation;
