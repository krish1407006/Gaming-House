import Movie from "../models/Movie.js";

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
      "👋 Hey there! Welcome to Gaming House! 🎮 I'm your gaming companion. What game would you like to know about?",
      "🎮 Hello my friend! Great to see you! Ask me about any game and I'll tell you everything - description, genres, developers, ratings, and more!",
      "👋 Hi! Welcome back! 🎉 Ready to explore some awesome games? Just tell me which game interests you!",
      "🎮 Hey! Great to have you here! Looking for game info? I've got all the details about our fantastic collection!",
      "👋 Hola friend! What game shall we talk about today? 🎮 I'm here to help!",
    ];
    
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  },

  // Process chat queries and find relevant game information
  async processQuery(query) {
    try {
      // Check if it's a greeting first
      if (this.isGreeting(query)) {
        return this.handleGreeting(query);
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

      // Search for the game in database
      const game = await Movie.findOne({
        $or: [
          { title: { $regex: gameName, $options: "i" } },
          { description: { $regex: gameName, $options: "i" } }
        ]
      });

      if (game) {
        return this.formatGameInfo(game, query);
      }

      // If no specific game found, provide suggestions
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
      const allGames = await Movie.find({ isActive: true })
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
