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

export default function Navbar() {
  const { user } = useUser();
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="text-2xl font-extrabold tracking-wide"
            style={{ color: 'var(--accent-color)' }}
          >
            Gaming House
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  nav-link flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                  transition-all duration-300 ease-in-out transform
                  relative overflow-hidden
                  ${isActive 
                    ? 'active text-[var(--accent-color)] bg-[var(--bg-primary)] scale-105 shadow-lg' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:scale-105 hover:shadow-md'
                  }
                  active:scale-95 active:shadow-inner
                `}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (hidden by default) */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium
                transition-all duration-300 ease-in-out transform
                relative overflow-hidden
                ${isActive 
                  ? 'text-[var(--accent-color)] bg-[var(--bg-primary)] scale-102 shadow-lg' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:scale-102 hover:shadow-md'
                }
                active:scale-95 active:shadow-inner
              `}
              style={{
                boxShadow: isActive => isActive ? '0 0 20px rgba(124, 58, 237, 0.2)' : 'none'
              }}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}