import React, { useState, useRef, useCallback, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import GameDetailPage from "./pages/GameDetails";
import TestPage from "./pages/TestPage";

import Navbar from "./components/Navbar";
import Background from "./components/Background";
import Chatbot from "./components/Chatbot";
import HomePage from "./pages/HomePage";
import TrendingPage from "./pages/TrendingPage";
import TopRatedPage from "./pages/TopRatedPage";
import CategoriesPage from "./pages/CategoriesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import apiService from "./services/api";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  // Set up auth token for API service
  React.useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  // Search function with debounce
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await apiService.getGames({ search: value, limit: 10 });
        const games = response?.games || [];
        setSearchResults(games);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary font-sans theme-transition">
      <Background />
      <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 flex flex-col theme-bg-primary pt-16 transition-all duration-300">
        <header className="flex items-center justify-between px-2 sm:px-4 lg:px-8 py-2 sm:py-4 theme-bg-primary border-b theme-border gap-2">
          <div className="flex items-center gap-2 sm:gap-4 justify-between w-full">
            
            <div className="relative search-container flex-1 max-w-sm sm:max-w-md lg:max-w-none">
              <input
                type="search"
                placeholder="Search gaming..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="settings-input px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg w-full lg:w-[30rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-[var(--text-secondary)] text-xs sm:text-sm lg:text-base"
                disabled={currentPath === "/settings"}
              />
              
              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-72 sm:max-h-96 overflow-y-auto z-50">
                  {searchResults.map((game) => (
                    <div
                      key={game._id || game.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
                      onClick={() => {
                        navigate(`/game/${game._id || game.id}`);
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <img
                        src={game.poster || game.image}
                        alt={game.title || game.name}
                        className="w-8 h-10 sm:w-12 sm:h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-xs sm:text-base text-[var(--text-primary)]">
                          {game.title || game.name}
                        </h4>
                        <p className="text-[10px] sm:text-sm text-[var(--text-secondary)]">
                          {game.year || new Date(game.releaseDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
                {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 sm:p-4 z-50">
                  <p className="text-xs sm:text-base text-[var(--text-secondary)] text-center">
                    No gaming found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <SignedOut>
                <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:opacity-90 transition-all text-xs sm:text-sm touch-target" />
                <SignUpButton className="hidden sm:inline-flex border-2 border-[var(--accent-color)] text-[var(--accent-color)] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-colors text-xs sm:text-sm touch-target" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* <GetToken /> */}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/top" element={<TopRatedPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/game/:id" element={<GameDetailPage />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
