import React, { useState, useEffect } from "react";
import { useUser, useClerk, SignInButton } from "@clerk/clerk-react";
import ApiService from "../services/api";
import { useTheme } from "../hooks/useTheme";
import { Icon } from "../components/Icons";

export default function SettingsPage() {
  const { user, isSignedIn } = useUser();
  const { openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoplay: false,
    showSpoilers: false,
    defaultRatingSystem: "numbers",
    language: "en",
    showAdultContent: false,
    gameListView: "grid",
    itemsPerPage: 20,
    enableKeyboardShortcuts: true,
    showRatingCounts: true,
    autoSaveReviews: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("gaminghouse_settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.movieListView && !parsedSettings.gameListView) {
          parsedSettings.gameListView = parsedSettings.movieListView;
          delete parsedSettings.movieListView;
        }
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, [isSignedIn, user]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const saveSettings = () => {
    localStorage.setItem("gaminghouse_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isSignedIn) {
    return (
      <section className="px-4 lg:px-8 py-6 min-h-screen theme-bg-primary">
        <div className="text-center py-12 lg:py-20">
          <div className="text-6xl lg:text-8xl mb-4 lg:mb-6">🔐</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-400 text-base lg:text-lg mb-3">
            You need to sign in to access your settings
          </p>
          <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)]  px-6 lg:px-8 py-2 rounded-lg font-semibold hover:bg-[var(--accent-color)] transition-colors touch-target cursor-pointer" />
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary theme-text-primary min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold theme-accent mb-2">Settings</h1>
          <p className="theme-text-secondary text-sm lg:text-base">Manage your account preferences and privacy settings</p>
        </div>

        <div className="settings-card rounded-lg p-4 lg:p-6 mb-4 lg:mb-8">
          <h3 className="text-lg lg:text-2xl font-bold theme-accent mb-3 lg:mb-4 flex items-center gap-2">
            <Icon name="profile" size={16} className="lg:w-5 lg:h-5" /> Profile Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block theme-text-secondary mb-2 text-sm lg:text-base">Name</label>
              <div className="settings-input rounded-lg p-3 lg:p-4">
                <span className="theme-text-primary text-sm lg:text-base">
                  {user?.fullName || user?.firstName || "Anonymous User"}
                </span>
              </div>
            </div>
            <div>
              <label className="block theme-text-secondary mb-2 text-sm lg:text-base">Email</label>
              <div className="settings-input rounded-lg p-3 lg:p-4">
                <span className="theme-text-primary text-sm lg:text-base break-all">
                  {user?.emailAddresses?.[0]?.emailAddress || "Not provided"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t theme-border">
            <button
              onClick={() => openUserProfile()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm lg:text-base touch-target"
            >
              🔧 Manage Profile in Clerk
            </button>
          </div>
        </div>

        <div className="settings-card rounded-lg p-4 lg:p-6 mb-4 lg:mb-8">
          <h3 className="text-lg lg:text-2xl font-bold theme-accent mb-3 lg:mb-4 flex items-center gap-2">
            <Icon name="palette" size={16} className="lg:w-5 lg:h-5" /> Display Preferences
          </h3>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="theme-text-primary font-semibold text-sm lg:text-base">Theme</label>
                <p className="theme-text-secondary text-xs lg:text-sm">
                  Choose your preferred theme
                </p>
              </div>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="settings-input px-3 py-2 rounded-lg text-sm lg:text-base touch-target"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="theme-text-primary font-semibold text-sm lg:text-base">
                  Default Rating System
                </label>
                  <p className="theme-text-secondary text-xs lg:text-sm">
                  How you prefer to rate gaming
                </p>
              </div>
              <select
                value={settings.defaultRatingSystem}
                onChange={(e) =>
                  handleSettingChange("defaultRatingSystem", e.target.value)
                }
                className="settings-input px-3 py-2 rounded-lg text-sm lg:text-base touch-target"
              >
                <option value="numbers">Numbers (1-10)</option>
                <option value="stars">Stars (1-5)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card rounded-lg p-4 lg:p-6 mb-4 lg:mb-8">
          <h3 className="text-lg lg:text-2xl font-bold theme-accent mb-3 lg:mb-4 flex items-center gap-2">
            <Icon name="lock" size={16} className="lg:w-5 lg:h-5" /> Privacy & Content
          </h3>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="theme-text-primary font-semibold text-sm lg:text-base">
                  Show Spoilers
                </label>
                <p className="theme-text-secondary text-xs lg:text-sm">
                  Display spoiler content in reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer touch-target">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.showSpoilers}
                  onChange={(e) =>
                    handleSettingChange("showSpoilers", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.showSpoilers ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.showSpoilers ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="theme-text-primary font-semibold text-sm lg:text-base">
                  Show Adult Content
                </label>
                  <p className="theme-text-secondary text-xs lg:text-sm">
                  Display mature-rated gaming
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer touch-target">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.showAdultContent}
                  onChange={(e) =>
                    handleSettingChange("showAdultContent", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.showAdultContent ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.showAdultContent ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card rounded-lg p-4 lg:p-6 mb-4 lg:mb-8">
          <h3 className="text-lg lg:text-2xl font-bold theme-accent mb-3 lg:mb-4 flex items-center gap-2">
            🔔 Notifications
          </h3>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="theme-text-primary font-semibold text-sm lg:text-base">
                  Email Notifications
                </label>
                <p className="theme-text-secondary text-xs lg:text-sm">
                  Receive updates about new gaming and reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer touch-target">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleSettingChange("emailNotifications", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.emailNotifications ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
          <button
            onClick={saveSettings}
            className={`px-6 lg:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm lg:text-base touch-target ${
              saved
                ? "settings-success text-white"
                : "settings-button hover:opacity-90"
            }`}
          >
            {saved ? (
              <><Icon name="checkCircle" size={16} className="lg:w-4 lg:h-4 mr-2" /> Saved!</>
            ) : (
              <><Icon name="save" size={16} className="lg:w-4 lg:h-4 mr-2" /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}