import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaArrowUp, FaGamepad, FaUser, FaHeadset } from "react-icons/fa";
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

  const handleCloseChatbot = () => {
    setIsOpen(false);
    setMessages(initialMessages);
    setInputValue("");
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

      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      const botMessage = {
        id: Date.now() + 1,
        text: data.response || "I couldn't find information about that game. Try asking about a specific game title!",
        sender: "bot",
        timestamp: new Date(),
        poster: data.poster || null,
        screenshots: data.screenshots || [],
        title: data.title || null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);

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
      <div className="chatbot-button-wrapper">
        <div className="chatbot-button-ring" />
        <button
          onClick={() => isOpen ? handleCloseChatbot() : setIsOpen(true)}
          className={`chatbot-button ${isOpen ? "chatbot-button--open" : ""}`}
          title="Open Gaming Assistant"
        >
          {isOpen ? <FaTimes /> : <FaHeadset />}
        </button>
      </div>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <FaRobot />
              </div>
              <div>
                <h3>Gaming Assistant</h3>
                <div className="chatbot-status">
                  <span className="status-dot" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button onClick={handleCloseChatbot} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="message-avatar bot-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className={`message-content ${msg.sender === "bot" ? "message-content-bot" : "message-content-user"}`}>
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
                  {msg.screenshots?.length > 0 && msg.sender === "bot" && (
                    <div className="screenshots-gallery">
                      {msg.screenshots.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`${msg.title || "Game"} screenshot ${i + 1}`}
                          className="screenshot-thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
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
                {msg.sender === "user" && (
                  <div className="message-avatar user-avatar">
                    <FaUser />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar bot-avatar">
                  <FaRobot />
                </div>
                <div className="message-content message-content-bot">
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
