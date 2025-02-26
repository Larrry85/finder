import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  ChevronRight,
  Home,
  UserCircle,
  Sparkles,
  Target,
  Menu,
  X,
} from "lucide-react";
import MessengerPanel from "../components/Chat/MessengerPanel";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showMessenger, setShowMessenger] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMessengerClose = () => {
    setShowMessenger(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile/tablet */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-purple-500 text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Navigation */}
      <nav
        className={`fixed w-64 h-screen bg-[#1a1b26] flex flex-col justify-between py-8 overflow-hidden z-40 transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col space-y-6">
          <div className="px-6 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center">
              <span className="text-black font-medium">k/</span>
            </div>
            <h1 className="text-xl font-bold text-white">TaskBuddy</h1>
          </div>

          {/* Main Navigation Links - Centered */}
          <div className="flex-1 flex flex-col space-y-2">
            <Link
              to="/home"
              className="px-6 py-3 text-gray-300 hover:bg-[#383850] hover:text-white transition-colors flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 text-gray-300 hover:bg-[#383850] hover:text-white transition-colors flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <UserCircle size={20} />
              <span>Profile</span>
            </Link>
            <Link
              to="/recommendation"
              className="px-6 py-3 text-gray-300 hover:bg-[#383850] hover:text-white transition-colors flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sparkles size={20} />
              <span>Recommendations</span>
            </Link>
            <Link
              to="/taskbuddy"
              className="px-6 py-3 text-gray-300 hover:bg-[#383850] hover:text-white transition-colors flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Target size={20} />
              <span>TaskBuddies</span>
            </Link>
            <button
              onClick={() => {
                setShowMessenger(!showMessenger);
                setIsMobileMenuOpen(false);
              }}
              className="px-6 py-3 text-gray-300 hover:bg-[#383850] hover:text-white transition-colors flex items-center justify-between w-full"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} />
                <span>Messenger</span>
              </div>
              <ChevronRight
                size={20}
                className={`transition-transform ${
                  showMessenger ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout Button - Bottom */}
        <div className="px-6">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Messenger Panel */}
      {showMessenger && (
        <div className="fixed top-0 h-screen overflow-hidden bg-[#1a1b26] z-20 transition-transform duration-300 lg:left-64 lg:right-0 left-0 right-0">
          <MessengerPanel onClose={handleMessengerClose} />
        </div>
      )}
    </>
  );
};

export default Navbar;
