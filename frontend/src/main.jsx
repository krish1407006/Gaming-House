import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/themes.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { ClerkProvider } from "@clerk/clerk-react";
import ThemeProvider from "./contexts/ThemeContext.jsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

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
