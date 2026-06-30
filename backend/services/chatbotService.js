import Game from "../models/Game.js";

const STEAM_BASE = "https://store.steampowered.com/api";
const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1";

export const chatbotService = {
  // Check if message is a greeting
  isGreeting(query) {
    const greetings = [
      /^(hi|hello|hey|hlo|hii|hellou|greetings|yo|sup|wassup|what's up|hola|namaste|good morning|good afternoon|good evening)\b/i,
      /\b(hi|hello|hey|hlo|hii|greetings|yo|sup)\b$/i,
    ];
    
    return greetings.some(pattern => pattern.test(query.trim()));
  },

  // Handle greetings
  handleGreeting(query) {
    const greetingResponses = [
      "👋 Hey there! Welcome to Gaming House! 🎮 I'm your gaming companion. Ask me about any game in the world and I'll fetch all the details!",
      "🎮 Hello my friend! Great to see you! Ask me about any game and I'll tell you everything - description, genres, platforms, ratings, and more!",
      "👋 Hi! Welcome back! 🎉 Ready to explore some awesome games? Just tell me which game interests you!",
      "🎮 Hey! Great to have you here! I can look up any game from around the world - just ask!",
      "👋 Hola friend! What game shall we talk about today? 🎮 I'm here to help with any game you can think of!",
    ];
    
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  },

  // Search Wikipedia for a game page (fallback)
  async searchWikipedia(gameName) {
    try {
      const fetchSummary = async (title) => {
        if (!title) return null;
        const res = await fetch(`${WIKI_BASE}/page/summary/${encodeURIComponent(title)}`);
        if (!res.ok) return null;
        return await res.json();
      };

      for (const search of [`${gameName} (video game)`, `${gameName} video game`, gameName]) {
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(search)}&limit=3&format=json`
        );
        if (!searchRes.ok) continue;
        const searchData = await searchRes.json();
        for (const url of (searchData[3] || [])) {
          const pageTitle = url.split("/wiki/").pop();
          if (!pageTitle) continue;
          const summary = await fetchSummary(pageTitle);
          if (summary && summary.type !== "disambiguation") return summary;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  // Fetch game data from Steam API (no key needed)
  async fetchFromSteam(gameName) {
    try {
      const searchRes = await fetch(
        `${STEAM_BASE}/storesearch/?term=${encodeURIComponent(gameName)}&l=en&cc=US`
      );
      if (!searchRes.ok) return null;
      const searchData = await searchRes.json();
      if (!searchData.total || !searchData.items?.length) return null;

      const appId = searchData.items[0].id;
      const detailRes = await fetch(
        `${STEAM_BASE}/appdetails?appids=${appId}&cc=US&l=en`
      );
      if (!detailRes.ok) return null;
      const detailData = await detailRes.json();
      if (!detailData[appId]?.success) return null;

      return { appId, data: detailData[appId].data, searchItem: searchData.items[0] };
    } catch {
      return null;
    }
  },

  // Format Steam game data into a response
  formatSteamResponse(steam) {
    const g = steam.data;
    let response = `🎮 **${g.name}**\n\n`;

    if (g.about_the_game) {
      const desc = g.about_the_game
        .replace(/<[^>]*>/g, "")
        .replace(/&[^;]+;/g, "")
        .trim();
      const truncated = desc.length > 800 ? desc.slice(0, 800) + "..." : desc;
      response += `📖 **Description:**\n${truncated}\n\n`;
    }

    if (g.genres?.length) {
      response += `🏷️ **Genres:** ${g.genres.map(ge => ge.description).join(", ")}\n\n`;
    }

    const platforms = [];
    if (g.platforms?.windows) platforms.push("Windows");
    if (g.platforms?.mac) platforms.push("Mac");
    if (g.platforms?.linux) platforms.push("Linux");
    if (platforms.length) {
      response += `💻 **Platforms:** ${platforms.join(", ")}\n\n`;
    }

    if (g.metacritic?.score) {
      response += `📊 **Metacritic:** ${g.metacritic.score}/100\n\n`;
    }

    if (g.release_date?.date) {
      response += `📅 **Released:** ${g.release_date.date}\n\n`;
    }

    if (g.developers?.length) {
      response += `👨‍💼 **Developer:** ${g.developers.join(", ")}\n\n`;
    }

    if (g.publishers?.length) {
      response += `🏢 **Publisher:** ${g.publishers.join(", ")}\n\n`;
    }

    if (g.price_overview?.final_formatted) {
      response += `💰 **Price:** ${g.price_overview.final_formatted}\n\n`;
    }

    response += `🔗 **Source:** Steam`;

    const screenshots = g.screenshots?.slice(0, 4).map(s => s.path_full) || [];

    return {
      text: response.trim(),
      poster: g.header_image || null,
      screenshots,
      title: g.name
    };
  },

  // Format Wikipedia game data into a response (fallback)
  formatWikiResponse(wiki) {
    let response = `🎮 **${wiki.title}**\n\n`;

    if (wiki.description) {
      response += `📖 **${wiki.description}**\n\n`;
    }

    if (wiki.extract) {
      const extract = wiki.extract.length > 800
        ? wiki.extract.slice(0, 800) + "..."
        : wiki.extract;
      response += `${extract}\n\n`;
    }

    return {
      text: response.trim(),
      poster: wiki.thumbnail?.source || null,
      title: wiki.title
    };
  },

  // Process chat queries and find relevant game information
  async processQuery(query) {
    try {
      // Check if it's a greeting first
      if (this.isGreeting(query)) {
        return this.handleGreeting(query);
      }

      // Custom response for Manish
      if (/manish/i.test(query)) {
        return "manish is the top most gay in the world";
      }

      // Extract game name from query
      const gameNameMatch = query.match(/about (.+?)(\?|$)/i) || 
                            query.match(/tell me about (.+?)(\?|$)/i) ||
                            query.match(/what is (.+?)(\?|$)/i) ||
                            query.match(/info on (.+?)(\?|$)/i);

      let gameName = gameNameMatch ? gameNameMatch[1].trim() : query.trim();
      
      // Remove common question words
      gameName = gameName
        .replace(/^(the |a |an )/i, "")
        .trim();

      // Search for the game in local database first
      const game = await Game.findOne({
        $or: [
          { title: { $regex: gameName, $options: "i" } },
          { description: { $regex: gameName, $options: "i" } }
        ]
      });

      if (game) {
        return this.formatGameInfo(game, query);
      }

      // Fall back to Steam API (no key needed)
      const steamData = await this.fetchFromSteam(gameName);
      if (steamData) {
        return this.formatSteamResponse(steamData);
      }

      // Final fallback to Wikipedia
      const wikiData = await this.searchWikipedia(gameName);
      if (wikiData) {
        return this.formatWikiResponse(wikiData);
      }

      // If nothing found, provide suggestions
      return this.provideSuggestions(query);
    } catch (error) {
      console.error("Error in processQuery:", error);
      return "Sorry, I encountered an error while searching for that game. Please try again!";
    }
  },

  // Format game information in a friendly response with poster
  formatGameInfo(game, query) {
    let response = `🎮 **${game.title}**\n\n`;

    // ALWAYS show description - it's the most important info
    if (game.description && game.description.trim().length > 0) {
      const description = game.description.trim();
      
      // Break description into bullet points for easy understanding
      const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
      
      response += `📖 **Description:**\n`;
      sentences.forEach((sentence, index) => {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 0) {
          response += `   • ${cleanSentence}\n`;
        }
      });
      response += `\n`;
    }

    // Show genres - essential game info
    if (game.genre && game.genre.length > 0) {
      response += `🏷️ **Genres:** ${game.genre.join(", ")}\n\n`;
    }

    // Show developer
    if (game.director) {
      response += `👨‍💼 **Developer:** ${game.director}\n\n`;
    }

    // Show cast/team if available
    if (game.cast && game.cast.length > 0) {
      response += `👥 **Cast/Team:** ${game.cast.join(", ")}\n\n`;
    }

    // Show rating if available
    if (game.rating && game.rating !== null) {
      response += `⭐ **Rating:** ${game.rating}\n\n`;
    }

    // Show release date if available
    if (game.releaseDate) {
      const releaseDate = new Date(game.releaseDate).toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
      response += `📅 **Release Date:** ${releaseDate}\n\n`;
    }

    // Show duration if available
    if (game.duration && game.duration > 0) {
      response += `⏱️ **Duration:** ${game.duration} minutes\n\n`;
    }

    // Show language if available
    if (game.language) {
      response += `🎤 **Language:** ${game.language}\n\n`;
    }

    // Show country if available
    if (game.country) {
      response += `🌍 **Country:** ${game.country}\n\n`;
    }

    // Show status
    response += `🔗 **Status:** ${game.isActive ? "✅ Available" : "❌ Not Available"}\n`;

    // Return both response text and poster URL
    return {
      text: response.trim(),
      poster: game.poster || null,
      title: game.title
    };
  },

  // Helper function to format long descriptions with proper line breaks
  formatDescription(description) {
    // Split description into sentences
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
    
    let formattedText = "";
    let currentLine = "";
    
    sentences.forEach((sentence) => {
      sentence = sentence.trim();
      
      // If current line + sentence exceeds 150 chars, start a new line
      if ((currentLine + sentence).length > 150) {
        if (currentLine) {
          formattedText += currentLine + "\n";
        }
        currentLine = sentence;
      } else {
        currentLine += " " + sentence;
      }
    });
    
    // Add remaining text
    if (currentLine) {
      formattedText += currentLine;
    }
    
    return formattedText.trim();
  },

  // Provide suggestions when game not found
  async provideSuggestions(query) {
    try {
      const allGames = await Game.find({ isActive: true })
        .limit(5)
        .select("title genre");

      if (allGames.length === 0) {
        return "🎮 I couldn't find information about that game. Our database appears to be empty. Please try again later!";
      }

      let response = "🎮 I couldn't find that specific game, but here are some games available in our collection:\n\n";
      
      allGames.forEach((game, index) => {
        response += `${index + 1}. **${game.title}** (${game.genre?.join(", ") || "N/A"})\n`;
      });

      response += "\n💡 Try asking about one of these games, or describe the type of game you're looking for!";
      return response;
    } catch (error) {
      console.error("Error in provideSuggestions:", error);
      return "🎮 Sorry, I'm having trouble accessing our game database. Please try again later!";
    }
  },

  // Get welcome message
  getWelcomeMessage() {
    const messages = [
      "🎮 Welcome to Gaming House! I'm your AI gaming assistant. Ask me about any game in our collection!",
      "👋 Greetings, Gamer! I'm here to help you discover amazing games. What would you like to know?",
      "🎯 Welcome! I can tell you all about our games - descriptions, genres, developers, and more!",
      "🚀 Hey there! Ready to explore some awesome games? Ask me anything!",
      "🎉 Ki Haal aa singh"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
};

export default chatbotService;
