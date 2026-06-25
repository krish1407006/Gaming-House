import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaArrowUp, FaGamepad } from "react-icons/fa";
import "../styles/chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const initialMessages = [
    {
      id: 1,
      text: "🎮 Greetings, Gamer! Welcome to Gaming House. I'm your gaming companion! Ask me about any game in our collection - I can tell you about genres, descriptions, cast, and more. What game would you like to know about?",
      sender: "bot",
      timestamp: new Date(),
      poster: null,
      title: null,
    },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle closing chatbot - clears chat history
  const handleCloseChatbot = () => {
    setIsOpen(false);
    setMessages(initialMessages); // Reset to welcome message only
    setInputValue(""); // Clear input field
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      poster: null,
      title: null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate thinking time (1.5 - 2.5 seconds) for realistic response
      const thinkingTime = 1500 + Math.random() * 1000;
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || "";

      const response = await fetch(
        `${API_BASE_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: inputValue,
          }),
        }
      );

      const data = await response.json();
      
      // Wait for thinking time to complete before showing response
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || "I couldn't find information about that game. Try asking about a specific game title!",
        sender: "bot",
        timestamp: new Date(),
        poster: data.poster || null,
        title: data.title || null,
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      
      // Wait for thinking time even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again later!",
        sender: "bot",
        timestamp: new Date(),
        poster: null,
        title: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => isOpen ? handleCloseChatbot() : setIsOpen(true)}
        className="chatbot-button"
        title="Open Gaming Assistant"
      >
        {isOpen ? <FaTimes /> : <FaGamepad />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="flex items-center gap-2">
              <FaRobot className="text-xl" />
              <div>
                <h3>Gaming Assistant</h3>
                <p className="text-xs opacity-75">Online</p>
              </div>
            </div>
            <button onClick={handleCloseChatbot} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {/* Show poster if available */}
                  {msg.poster && msg.sender === "bot" && (
                    <img 
                      src={msg.poster} 
                      alt={msg.title || "Game Poster"} 
                      className="game-poster"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="message-text">
                    {msg.text.split('\n').map((line, index) => (
                      <div key={index} className="message-line">
                        {line || <br />}
                      </div>
                    ))}
                  </div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about a game..."
              disabled={isLoading}
              className="chatbot-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              <FaArrowUp />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
