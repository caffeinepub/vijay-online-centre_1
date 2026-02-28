import React, { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useChatbot } from "../hooks/useQueries";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChatbot();

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: "#0a2463" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" style={{ color: "#0a2463" }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">I Help – Support</p>
                <p className="text-blue-200 text-xs">Vijay Online Centre</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.isUser
                      ? "text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                  style={msg.isUser ? { backgroundColor: "#0a2463" } : {}}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isUser ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Link */}
          <div className="px-3 py-2 bg-green-50 border-t border-green-100">
            <a
              href="https://wa.me/918173064549"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-700 text-xs font-medium hover:text-green-800"
            >
              <SiWhatsapp className="w-4 h-4" />
              Chat directly on WhatsApp
            </a>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ backgroundColor: "#0a2463" }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
        {/* WhatsApp Quick Link */}
        <a
          href="https://wa.me/918173064549"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-full shadow-lg transition-all"
        >
          <SiWhatsapp className="w-4 h-4" />
          WhatsApp Help
        </a>

        {/* Chat Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ backgroundColor: "#0a2463" }}
          title="I Help – Support Chat"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </>
  );
}
