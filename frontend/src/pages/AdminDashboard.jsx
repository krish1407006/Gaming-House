import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Icon } from "../components/Icons";
import ApiService from "../services/api";

import { isUserAdmin } from "../adminDetails";

export default function AdminDashboard({ ongameChange }) {
  const { user } = useUser();
  const [games, setgames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editinggame, setEditinggame] = useState(null);

  // Debug user info and admin promotion helper
  React.useEffect(() => {
    if (user) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress;
      console.log('🔍 Current user info:', {
        email: userEmail,
        role: user.publicMetadata?.role,
        userId: user.id,
        isAdmin: isUserAdmin(user)
      });

      // If not admin, provide instructions
      if (!isUserAdmin(user)) {
        console.log('❌ Admin access needed. Options:');
        console.log('1. Add your email to ADMIN_EMAILS in adminDetails.js');
        console.log('2. Or run this in console to make yourself admin:');
        console.log(`fetch('https://criticscore.onrender.com/api/dev/make-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: '${userEmail}' })
        }).then(r => r.json()).then(console.log)`);
      }
    }
  }, [user]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    poster: "",
    trailer: "",
    backdrop: "",
    screenshots: "",
    year: "",
    runtime: "",
    genre: "",
    director: "",
    language: "English",
    country: "USA",
    budget: "",
    boxOffice: "",
    awards: "",
    featured: false,
    trending: false,
    isActive: true,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTrendingModal, setShowTrendingModal] = useState(false);
  const [trendingData, setTrendingData] = useState({ trending: [], notTrending: [] });
  const [trendingOrder, setTrendingOrder] = useState([]);

  // Check if user is admin using centralized admin details
  const isAdmin = isUserAdmin(user);

  // Load games
  useEffect(() => {
    loadgames();
  }, []);

  const loadgames = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getGames();
      const gameData = Array.isArray(response) ? response : response.games || [];
      setgames(gameData);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  // Form validation - matches backend requirements
  const validateForm = () => {
    const errors = {};
    
    // Required fields per backend model
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.director.trim()) errors.director = "Director is required";
    if (!formData.year) errors.year = "Release year is required";
    if (!formData.runtime || formData.runtime <= 0) errors.runtime = "Valid runtime is required";
    if (!formData.language.trim()) errors.language = "Language is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    
    // URL validation (optional fields)
    const urlPattern = /^https?:\/\/.+/;
    if (formData.poster && formData.poster.trim() && !urlPattern.test(formData.poster)) {
      errors.poster = "Valid poster URL is required";
    }
    if (formData.trailer && formData.trailer.trim() && !urlPattern.test(formData.trailer)) {
      errors.trailer = "Valid trailer URL is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data for backend API
      const gameData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        director: formData.director.trim(),
        poster: formData.poster.trim() || undefined,
        trailer: formData.trailer.trim() || undefined,
        backdrop: formData.backdrop.trim() || undefined,
        screenshots: formData.screenshots ? formData.screenshots.split(',').map(s => s.trim()).filter(s => s) : undefined,
        // Convert year to proper releaseDate for backend
        releaseDate: formData.year ? new Date(`${formData.year}-01-01`) : new Date(),
        // Convert runtime to duration (number) for backend
        duration: parseInt(formData.runtime) || 120,
        // Convert genre string to array for backend
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(g => g) : [],
        language: formData.language || 'English',
        country: formData.country || 'USA',
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        boxOffice: formData.boxOffice ? parseInt(formData.boxOffice) : undefined,
        featured: formData.featured,
        trending: formData.trending,
        isActive: formData.isActive,
        // Cast can be added later, for now empty array
        cast: []
      };

      console.log('📤 Sending game data to backend:', gameData);

      if (editinggame) {
        await ApiService.updateGame(editinggame._id, gameData);
  console.log('✅ Gaming updated successfully');
  alert("Gaming updated successfully!");
      } else {
        const result = await ApiService.createGame(gameData);
  console.log('✅ Game created successfully:', result);
  alert("Game created successfully!");
      }
      
      resetForm();
      loadgames();
      
      // Update global games state in other pages
      if (ongameChange) {
        ongameChange();
      }
    } catch (error) {
  console.error("❌ Error saving game:", error);
  alert(`Error ${editinggame ? 'updating' : 'creating'} gaming: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (game) => {
    setEditinggame(game);
    setFormData({
      title: game.title || "",
      description: game.description || "",
      poster: game.poster || "",
      trailer: game.trailer || "",
      backdrop: game.backdrop || "",
      screenshots: Array.isArray(game.screenshots) ? game.screenshots.join(", ") : game.screenshots || "",
      year: game.year || new Date(game.releaseDate).getFullYear() || "",
      runtime: game.runtime || game.duration || "",
      genre: Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || "",
      director: game.director || "",
      language: game.language || "English",
      country: game.country || "USA",
      budget: game.budget || "",
      boxOffice: game.boxOffice || "",
      awards: game.awards || "",
      featured: game.featured || false,
      trending: game.trending || false,
      isActive: game.isActive !== false,
    });
    setFormErrors({});
    setShowCreateForm(true);
  };

  const openTrendingModal = async () => {
    setShowTrendingModal(true);
    try {
      const data = await ApiService.getAdminTrending();
      setTrendingData(data);
      setTrendingOrder(data.trending.map(g => g._id));
    } catch (error) {
      console.error("Error loading trending data:", error);
      alert("Failed to load trending data");
    }
  };

  const moveTrendingUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...trendingOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setTrendingOrder(newOrder);
  };

  const moveTrendingDown = (index) => {
    if (index >= trendingOrder.length - 1) return;
    const newOrder = [...trendingOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setTrendingOrder(newOrder);
  };

  const removeFromTrending = (id) => {
    setTrendingOrder(prev => prev.filter(gid => gid !== id));
    setTrendingData(prev => {
      const removed = prev.trending.find(g => g._id === id);
      return {
        trending: prev.trending.filter(g => g._id !== id),
        notTrending: removed ? [...prev.notTrending, removed] : prev.notTrending,
      };
    });
  };

  const addToTrending = (id) => {
    setTrendingOrder(prev => [...prev, id]);
    setTrendingData(prev => {
      const added = prev.notTrending.find(g => g._id === id);
      return {
        trending: added ? [...prev.trending, added] : prev.trending,
        notTrending: prev.notTrending.filter(g => g._id !== id),
      };
    });
  };

  const saveTrendingOrder = async () => {
    try {
      setIsSubmitting(true);
      const result = await ApiService.reorderTrending(trendingOrder);
      alert(result.message || "Trending order saved!");
      setShowTrendingModal(false);
      loadgames();
    } catch (error) {
      console.error("Error saving trending order:", error);
      alert("Failed to save: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoSelectTrending = async () => {
    try {
      setIsSubmitting(true);
      const result = await ApiService.autoSetTrending();
      alert(result.message || "Trending auto-selected!");
      const data = await ApiService.getAdminTrending();
      setTrendingData(data);
      setTrendingOrder(data.trending.map(g => g._id));
    } catch (error) {
      console.error("Error auto-selecting trending:", error);
      alert("Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (gameId) => {
  if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await ApiService.deleteGame(gameId);
        loadgames();
        
        // Update global games state in other pages
        if (ongameChange) {
          ongameChange();
        }
      } catch (error) {
        console.error("Error deleting game:", error);
        alert("Error deleting gaming. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      poster: "",
      trailer: "",
      backdrop: "",
      screenshots: "",
      year: "",
      runtime: "",
      genre: "",
      director: "",
      language: "English",
      country: "USA",
      budget: "",
      boxOffice: "",
      awards: "",
    featured: false,
    trending: false,
    isActive: true,
    });
    setFormErrors({});
    setEditinggame(null);
    setShowCreateForm(false);
  };

  // Function to make current user admin (development only)
  const makeUserAdmin = async () => {
    if (!user) return;
    
    try {
      const userEmail = user.emailAddresses?.[0]?.emailAddress;
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}api/dev/make-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      const result = await response.json();
      console.log('Admin promotion result:', result);
      
      if (response.ok) {
        alert('✅ Admin access granted! Please refresh the page.');
        window.location.reload();
      } else {
        alert('❌ Failed to grant admin access: ' + result.error);
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('❌ Error granting admin access');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-bg-primary">
        <div className="text-center max-w-md mx-auto p-6">
          <Icon name="lock" size={64} className="mx-auto mb-4" style={{ color: 'var(--accent-color)' }} />
          <h1 className="text-2xl font-bold theme-text-primary mb-2">Admin Access Required</h1>
          <p className="theme-text-secondary mb-6">You need admin permissions to access this panel.</p>
          
          {user && (
            <div className="space-y-4">
              <div className="text-sm theme-text-secondary bg-gray-800 p-3 rounded-lg">
                <p><strong>Your Email:</strong> {user.emailAddresses?.[0]?.emailAddress}</p>
                <p><strong>User ID:</strong> {user.id}</p>
              </div>
              
              <button
                onClick={makeUserAdmin}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🔑 Grant Admin Access (Development)
              </button>
              
              <p className="text-xs theme-text-secondary">
                This button uses the development endpoint to grant admin access.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary p-4 lg:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-tertiary);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 4px;
            border: 1px solid var(--bg-secondary);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
          }
          
          .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .modal-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-primary);
            border-radius: 3px;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
            opacity: 0.7;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 1;
            background: var(--text-primary);
          }
          
          .table-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .table-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
          }
          .table-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
            opacity: 0.6;
          }
          .table-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 0.8;
          }
        `}</style>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3">
              <Icon name="settings" size={28} className="theme-accent lg:w-8 lg:h-8" />
              <span className="truncate">Admin Dashboard</span>
            </h1>
            <p className="theme-text-secondary mt-1 lg:mt-2 text-sm lg:text-base">Manage games and content</p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={openTrendingModal}
              className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-all text-sm lg:text-base w-1/2 lg:w-auto"
              style={{ backgroundColor: '#065f46', color: 'white' }}
            >
              <Icon name="trending" size={18} />
              <span className="truncate">Manage Trending</span>
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 theme-button-primary px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-sm lg:text-base w-1/2 lg:w-auto"
            >
              <Icon name="plus" size={18} />
              <span className="lg:inline">Add New Games</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="theme-card p-4 lg:p-6 rounded-xl">
            <div className="flex items-center gap-3 lg:gap-4">
              <Icon name="film" size={32} className="theme-accent lg:w-10 lg:h-10" />
              <div>
                <h3 className="text-xl lg:text-2xl font-bold">{games.length}</h3>
                <p className="theme-text-secondary text-sm lg:text-base">Total Games</p>
              </div>
            </div>
          </div>
          
          <div className="theme-card p-4 lg:p-6 rounded-xl">
            <div className="flex items-center gap-3 lg:gap-4">
              <Icon name="star" size={32} className="lg:w-10 lg:h-10" style={{ color: 'var(--accent-color)' }} />
              <div>
                <h3 className="text-xl lg:text-2xl font-bold">
                  {games.filter(m => m.featured).length}
                </h3>
                <p className="theme-text-secondary text-sm lg:text-base">Featured Games</p>
              </div>
            </div>
          </div>
          
          <div className="theme-card p-4 lg:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 lg:gap-4">
              <Icon name="trending" size={32} className="text-green-400 lg:w-10 lg:h-10" />
              <div>
                <h3 className="text-xl lg:text-2xl font-bold">
                  {games.filter(m => m.trending).length}
                </h3>
                <p className="theme-text-secondary text-sm lg:text-base">Trending Games</p>
              </div>
            </div>
          </div>
        </div>

  {/* Gaming Table */}
        <div className="theme-card rounded-xl overflow-hidden">
          <div className="p-4 lg:p-6 border-b theme-border">
              <h2 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                <Icon name="list" size={20} className="lg:w-6 lg:h-6" />
              All Games
              </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="settings-loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p>Loading games...</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead className="theme-bg-secondary">
                  <tr>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base">Games</th>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base hidden sm:table-cell">Director</th>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base">Year</th>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base hidden md:table-cell">Rating</th>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base hidden lg:table-cell">Status</th>
                    <th className="text-left p-2 lg:p-4 font-semibold text-sm lg:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game._id} className="border-b theme-border hover:theme-bg-hover">
                      <td className="p-2 lg:p-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <img
                            src={game.poster}
                            alt={game.title}
                            className="w-8 h-10 lg:w-12 lg:h-16 object-cover rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm lg:text-base truncate">{game.title}</h4>
                            <p className="text-xs lg:text-sm theme-text-secondary truncate sm:hidden">
                              {game.director}
                            </p>
                            <p className="text-xs theme-text-secondary truncate hidden lg:block">
                              {Array.isArray(game.genre) ? game.genre.join(", ") : game.genre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 lg:p-4 hidden sm:table-cell">
                        <div className="text-sm lg:text-base truncate">{game.director}</div>
                      </td>
                      <td className="p-2 lg:p-4 text-sm lg:text-base">
                        {game.year || new Date(game.releaseDate).getFullYear()}
                      </td>
                      <td className="p-2 lg:p-4 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Icon name="star" size={14} className="lg:w-4 lg:h-4" style={{ color: 'var(--accent-color)' }} />
                          <span className="text-sm lg:text-base">{game.averageRating?.toFixed(1) || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-2 lg:p-4 hidden lg:table-cell">
                        <div className="flex gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            game.featured ? "bg-red-600 text-white" : "theme-bg-secondary"
                          }`}>
                            {game.featured ? "Featured" : "Regular"}
                          </span>
                          {game.trending && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-600 text-white">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 lg:p-4">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <button
                            onClick={() => handleEdit(game)}
                            className="p-1.5 lg:p-2 theme-bg-secondary hover:theme-bg-hover rounded transition-colors"
                            title="Edit"
                          >
                            <Icon name="edit" size={14} className="lg:w-4 lg:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(game._id)}
                            className="p-1.5 lg:p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                            title="Delete"
                          >
                            <Icon name="trash" size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit game Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4">
            <div className="theme-bg-secondary rounded-xl max-w-4xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto modal-scrollbar shadow-2xl">
              <div className="p-4 lg:p-6 border-b theme-border">
                <h3 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                  <Icon name={editinggame ? "edit" : "plus"} size={20} className="lg:w-6 lg:h-6" />
                  <span className="truncate">{editinggame ? "Edit Gaming" : "Add New Games"}</span>
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <div className="border-b theme-border pb-4">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="film" size={20} />
                        Basic Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Title <span style={{ color: 'var(--accent-color)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.title 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter Game title"
                            disabled={isSubmitting}
                          />
                          {formErrors.title && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.title}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Director <span style={{ color: 'var(--accent-color)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="director"
                            value={formData.director}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.director 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter director name"
                            disabled={isSubmitting}
                          />
                          {formErrors.director && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.director}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Description <span style={{ color: 'var(--accent-color)' }}>*</span>
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md resize-none ${
                              formErrors.description 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter gaming description or summary..."
                            disabled={isSubmitting}
                          />
                          {formErrors.description && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gaming Details */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="settings" size={20} />
                        Gaming Details
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Release Year <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.year 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="2024"
                            min="1900"
                            max="2030"
                            disabled={isSubmitting}
                          />
                          {formErrors.year && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.year}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Runtime (minutes) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="runtime"
                            value={formData.runtime}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.runtime 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="120 minutes"
                            min="1"
                            disabled={isSubmitting}
                          />
                          {formErrors.runtime && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.runtime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Genre <span style={{ color: 'var(--accent-color)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.genre 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="e.g., Action, Drama, Comedy"
                            disabled={isSubmitting}
                          />
                          {formErrors.genre && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.genre}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Language</label>
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            disabled={isSubmitting}
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Korean">Korean</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Media & Additional Info */}
                  <div className="space-y-6">
                    <div className="border-b theme-border pb-4">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="image" size={20} />
                        Media & Links
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Poster URL</label>
                          <input
                            type="url"
                            name="poster"
                            value={formData.poster}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.poster 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="https://example.com/poster.jpg"
                            disabled={isSubmitting}
                          />
                          {formErrors.poster && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.poster}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Trailer URL</label>
                          <input
                            type="url"
                            name="trailer"
                            value={formData.trailer}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.trailer 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="https://youtube.com/watch?v=..."
                            disabled={isSubmitting}
                          />
                          {formErrors.trailer && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.trailer}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Backdrop URL</label>
                          <input
                            type="url"
                            name="backdrop"
                            value={formData.backdrop}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="https://example.com/backdrop.jpg"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Screenshots (comma-separated URLs)</label>
                          <input
                            type="text"
                            name="screenshots"
                            value={formData.screenshots}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="https://example.com/screen1.jpg, https://example.com/screen2.jpg"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="star" size={20} />
                        Additional Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Budget</label>
                          <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="50000000"
                            min="0"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Box Office</label>
                          <input
                            type="number"
                            name="boxOffice"
                            value={formData.boxOffice}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="100000000"
                            min="0"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Awards</label>
                          <input
                            type="text"
                            name="awards"
                            value={formData.awards}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="Oscar Winner, Golden Globe Nominee"
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Status Options */}
                        <div className="pt-4 border-t theme-border">
                          <h5 className="text-md font-semibold mb-3">Status Options</h5>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:theme-bg-hover transition-colors">
                              <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-2 theme-border focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-semibold">Featured Gaming</span>
                                <p className="text-xs theme-text-secondary">Show on homepage as featured content</p>
                              </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:theme-bg-hover transition-colors">
                              <input
                                type="checkbox"
                                name="trending"
                                checked={formData.trending}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-2 theme-border focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-semibold">Trending Gaming</span>
                                <p className="text-xs theme-text-secondary">Show on trending page</p>
                              </div>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:theme-bg-hover transition-colors">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-2 theme-border focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-semibold">Active Status</span>
                                <p className="text-xs theme-text-secondary">Make gaming visible to users</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 mt-8 border-t theme-border">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-6 py-3 theme-button-secondary rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 theme-button-primary rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                  >
                        {isSubmitting ? (
                      <>
                        <div className="settings-loading-spinner w-4 h-4"></div>
                        {editinggame ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Icon name={editinggame ? "edit" : "plus"} size={18} />
                        {editinggame ? "Update Gaming" : "Create Gaming"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}