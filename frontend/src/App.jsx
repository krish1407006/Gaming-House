import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import MovieDetailPage from "./pages/movieDetails";
import TestPage from "./pages/TestPage";
// import apiService from "./services/api"; // Temporarily disabled

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import HomePage from "./pages/HomePage";
import TrendingPage from "./pages/TrendingPage";
import TopRatedPage from "./pages/TopRatedPage";
import CategoriesPage from "./pages/CategoriesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import apiService from "./services/api";

function GetToken() {
  const { getToken } = useAuth();
  const handleClick = async () => {
    const token = await getToken();
    console.log("Token:", token);
  };
  return <button onClick={handleClick}>Log Token</button>;
}

// fetchMovies from backend API
async function fetchMovies() {
  try {
    console.log("� Fetching games from backend API...");
    const response = await apiService.getMovies();
    console.log("🔍 Raw backend response:", response);
    
    // Backend returns { movies: [...], pagination: {...} }
    const movies = Array.isArray(response) ? response : (response?.movies || response?.data || []);
    console.log("✅ Backend games loaded:", movies.length, "games");
    return movies;
  } catch (error) {
    console.error("❌ Backend fetch failed:", error);
    throw new Error("Failed to fetch games from backend");
  }
}

function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { getToken } = useAuth();

  // Set up auth token for API service
  React.useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  // Search function
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Search movies by name/title
    const filtered = allMovies.filter(movie =>
      movie.title?.toLowerCase().includes(value.toLowerCase()) ||
      movie.name?.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowResults(true);
  };

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

  // Load movies function
  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await fetchMovies();
      setAllMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadMovies();
  }, []);

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary font-sans theme-transition">
      <Navbar />
      
      <main className="flex-1 flex flex-col theme-bg-primary pt-16 transition-all duration-300">
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 theme-bg-primary border-b theme-border">
          <div className="flex items-center gap-2 lg:gap-4 justify-between w-full">
            
            <div className="relative search-container flex-1 max-w-md lg:max-w-none">
              <input
                type="search"
                placeholder="Search gaming..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="settings-input px-4 py-2 rounded-lg w-full lg:w-[30rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-[var(--text-secondary)] text-sm lg:text-base"
                disabled={currentPath === "/settings"}
              />
              
              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((movie) => (
                    <div
                      key={movie._id || movie.id}
                      className="flex items-center gap-3 p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
                      onClick={() => {
                        window.location.href = `/movie/${movie._id || movie.id}`;
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <img
                        src={movie.poster || movie.image}
                        alt={movie.title || movie.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {movie.title || movie.name}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {movie.year || new Date(movie.releaseDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
                {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg p-4 z-50">
                  <p className="text-[var(--text-secondary)] text-center">
                    No gaming found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-8">
              <SignedOut>
                <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-all" />
                <SignUpButton className="border-2 border-[var(--accent-color)] text-[var(--accent-color)] px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-colors" />
              </SignedOut>
            </div>
          </div>
          <div>
            <SignedIn>
              <UserButton  />
            </SignedIn>
          </div>
        </header>

        {/* <GetToken /> */}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage allMovies={allMovies} loading={loading} error={error} />
            }
          />
          <Route path="/trending" element={<TrendingPage key={allMovies.length} allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/top" element={<TopRatedPage key={allMovies.length} allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/categories" element={<CategoriesPage allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboard onMovieChange={() => loadMovies()} />} />
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/movie/:id"
            element={<MovieDetailPage allMovies={allMovies} />}
          />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
