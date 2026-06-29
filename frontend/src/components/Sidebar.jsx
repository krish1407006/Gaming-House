import { useUser } from "@clerk/clerk-react";
import {
  FaCog,
  FaFire,
  FaHome,
  FaListUl,
  FaStar,
  FaThLarge,
  FaUserShield
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { isUserAdmin } from "../adminDetails";

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user } = useUser();
  
  // Check if user is admin using centralized admin details
  const isAdmin = isUserAdmin(user);

  const navLinks = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Trending", icon: <FaFire />, path: "/trending" },
    { name: "Top Rated", icon: <FaStar />, path: "/top" },
    { name: "Categories", icon: <FaThLarge />, path: "/categories" },
    { name: "Watchlist", icon: <FaListUl />, path: "/watchlist" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
    ...(isAdmin ? [{ name: "Admin Panel", icon: <FaUserShield />, path: "/admin" }] : []),
  ];

  return (
    <aside className={`w-60 theme-bg-secondary flex flex-col py-6 lg:py-8 px-4 min-h-screen border-r theme-border shadow-xl fixed left-0 top-0 h-full z-50 theme-transition transform ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-6 lg:mb-10">
        <NavLink 
          to="/" 
          className="text-2xl lg:text-3xl font-extrabold tracking-wide theme-accent drop-shadow font-heading"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Gaming House
        </NavLink>
        <button
          className="lg:hidden p-2 rounded-lg hover:theme-bg-hover transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex flex-col gap-2 lg:gap-4 theme-text-secondary">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 text-base lg:text-lg font-semibold px-3 py-2 lg:py-3 rounded-lg transition-all duration-150 focus:outline-none ${
                isActive
                  ? "theme-accent theme-bg-primary"
                  : "hover:theme-accent hover:theme-bg-primary"
              } ${link.name === "Admin Panel" ? "border-t theme-border mt-4 pt-4" : ""}`
            }
          >
            <span className="text-lg lg:text-xl">{link.icon}</span>
            <span className="truncate">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
