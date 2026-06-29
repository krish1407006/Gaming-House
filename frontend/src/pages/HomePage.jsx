import React, { useState, useEffect } from "react";
import GameCard from "../components/GameCard";
import Pagination from "../components/Pagination";
import apiService from "../services/api";
import { discoveryBackgrounds } from "../constants/backgroundImages";

const PAGE_SIZE = 20;

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Background image rotation
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentBgIndex((prev) =>
        prev === discoveryBackgrounds.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Fetch games with pagination
  const fetchGames = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getGames({ page, limit: PAGE_SIZE });
      setGames(response?.games || []);
      const pag = response?.pagination;
      if (pag) {
        setTotalPages(pag.totalPages || 1);
        setCurrentPage(pag.currentPage || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchGames(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--accent-color)] relative h-48 sm:h-64 lg:h-72 flex items-center justify-center mb-6 lg:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000cc] to-[#00000099] z-10"></div>

        {discoveryBackgrounds.map((bg, index) => (
          <img
            key={bg.url}
            src={bg.url}
            alt={bg.credit}
            className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? "opacity-80" : "opacity-0"
            }`}
            style={{ objectPosition: bg.position }}
          />
        ))}

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-3 lg:mb-4 tracking-wide animate-fade-in font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-color)] to-[#ff2d95]">
              Discover Amazing Games
            </span>
          </h2>
          <p className="text-white text-sm sm:text-base lg:text-xl drop-shadow-lg font-medium animate-fade-in-up">
            Experience the best ratings and reviews from the Gaming House community.
          </p>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent-color)] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-300 opacity-10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide font-heading">Home</h3>
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading games...</span>
            <span className="text-xs lg:text-sm text-gray-400 mt-2 text-center px-4">Discovering amazing content for you</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="text-gray-400 text-base lg:text-lg px-4">
            No games found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {games.map((game, idx) => (
                <GameCard key={game._id || game.gameId || `game-${idx}`} game={game} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
}
