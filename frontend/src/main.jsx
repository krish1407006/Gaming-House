import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/themes.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { ClerkProvider } from "@clerk/clerk-react";
import ThemeProvider from "./contexts/ThemeContext.jsx";
import apiService from "./services/api.js";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Load static snapshots into cache before rendering so games show instantly
// Static files served from the same Vercel CDN, typically loading in <50ms
const staticDataPromise = apiService.loadStaticDataIntoCache();

// Warm the API endpoint in background (non-blocking)
apiService.getHomepage(1, 8).catch(() => {});

// Safety timeout: render even if static data takes too long (3s max)
const renderTimeout = new Promise(resolve => setTimeout(resolve, 3000));
const readyPromise = Promise.race([staticDataPromise, renderTimeout]);

// Clerk appearance configuration
const clerkAppearance = {
  baseTheme: undefined, // Let our CSS handle theming
  elements: {
    // Remove Clerk's default styling to let our CSS take over
    rootBox: {
      colorScheme: 'none',
    },
    userButtonPopoverCard: {
      pointerEvents: 'auto',
    },
    userButtonPopoverActionButton: {
      '&:hover': {
        transform: 'none', // Prevent conflicting transforms
      }
    }
  },
  variables: {
    // Disable Clerk's automatic theme detection
    colorScheme: 'none',
  }
};

// Ensure static data is cached before first render for instant game display
readyPromise.finally(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY}
          appearance={clerkAppearance}
        >
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ClerkProvider>
      </BrowserRouter>
    </StrictMode>
  );
});
