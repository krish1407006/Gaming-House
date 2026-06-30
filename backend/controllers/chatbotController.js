import chatbotService from "../services/chatbotService.js";

export const getChatResponse = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a query",
      });
    }

    const response = await chatbotService.processQuery(query);

    // Handle both string responses (greetings, suggestions) and object responses (game info with poster)
    const isObjectResponse = typeof response === 'object' && response !== null && !Array.isArray(response);

    res.status(200).json({
      success: true,
      response: isObjectResponse ? response.text : response,
      poster: isObjectResponse ? response.poster : null,
      screenshots: isObjectResponse ? (response.screenshots || []) : [],
      title: isObjectResponse ? response.title : null,
      query,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error in getChatResponse:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat query",
      message: error.message,
    });
  }
};

export const getWelcomeMessage = async (req, res) => {
  try {
    const message = chatbotService.getWelcomeMessage();
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error in getWelcomeMessage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get welcome message",
    });
  }
};
