import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1a472a] text-white mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h4 className="text-[#d4a574] font-semibold mb-4 text-lg">
              Barter King
            </h4>
            <p className="text-white/80 text-sm">
              Revolutionizing community trading through fair exchanges and
              mutual value.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#d4a574] font-semibold mb-4 text-lg">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[#d4a574] font-semibold mb-4 text-lg">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-[#d4a574] transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* SkillX Coin */}
          <div>
            <h4 className="text-[#d4a574] font-semibold mb-4 text-lg">
              SkillX Coin
            </h4>
            <p className="text-white/80 text-sm">
              Our blockchain-inspired credit system for fair and transparent
              exchanges.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/80 text-sm">
            &copy; 2025 Barter King. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
