import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import apiService from "../services/api";

export default function TestPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState("");
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setTestResult("Testing API...");

    try {
      // Test 1: Fetch movies
      const moviesData = await apiService.getMovies();
      setMovies(moviesData.movies || []);
      setTestResult(
        (prev) =>
          prev +
          `\n✅ Games fetch: ${moviesData.movies?.length || 0} game found`
      );

      if (moviesData.movies && moviesData.movies.length > 0) {
        const firstMovie = moviesData.movies[0];

        // Test 2: Fetch specific movie
        const movieDetails = await apiService.getMovieById(firstMovie._id);
        setTestResult(
          (prev) => prev + `\n✅ Game details: ${movieDetails.title}`
        );

        // Test 3: Fetch movie ratings
        const ratingsData = await apiService.getMovieRatings(firstMovie._id);
        setTestResult(
          (prev) =>
            prev +
            `\n✅ Game ratings: ${
              ratingsData.ratings?.length || 0
            } ratings found`
        );

        // Test 4: Test authentication (if signed in)
        if (isSignedIn) {
          try {
            const userProfile = await apiService.getCurrentUser();
            setTestResult(
              (prev) =>
                prev +
                `\n✅ User auth: ${userProfile.firstName || userProfile.id}`
            );
          } catch (authError) {
            setTestResult(
              (prev) => prev + `\n⚠️ User auth: ${authError.message}`
            );
          }
        } else {
          setTestResult((prev) => prev + `\n⚠️ User auth: Not signed in`);
        }
      }

      setTestResult(
        (prev) => prev + `\n\n🎉 All tests completed successfully!`
      );
    } catch (err) {
      setError(err.message);
      setTestResult((prev) => prev + `\n❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#f5c518] mb-4">
        API Integration Test
      </h1>

      <div className="mb-6">
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-[#f5c518] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#e5b91f] disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test API Integration"}
        </button>
      </div>

      {testResult && (
        <div className="bg-[#232323] rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Test Results:
          </h3>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {movies.length > 0 && (
        <div className="bg-[#232323] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Gaming from Backend:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.slice(0, 3).map((movie) => (
              <div key={movie._id} className="bg-[#1a1a1a] rounded-lg p-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h4 className="text-[#f5c518] font-semibold">{movie.title}</h4>
                <p className="text-gray-400 text-sm">
                  {movie.description?.slice(0, 100)}...
                </p>
                <p className="text-gray-500 text-xs mt-1">ID: {movie._id}</p>
                <p className="text-gray-500 text-xs">
                  Rating: {movie.averageRating || 0}/10
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
