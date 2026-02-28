import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useChatbot } from "../hooks/useQueries";
import { SiWhatsapp } from "react-icons/si";
import React from "react";

const QUICK_REPLIES = [
  { label: "Document Requirements" },
  { label: "Track Application" },
  { label: "Contact Support" },
  { label: "Payment Info" },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useChatbot();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    setIsTyping(true);
    sendMessage(text.trim());
    setInput("");
    setTimeout(() => setIsTyping(false), 800);
  };

  const formatText = (text: string) => {
    return text.split("\n").map((line, i, arr) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-4 z-40 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: "#0a2463" }}
        title="I Help – Chat Support"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: "#dc2626" }}
          >
            ?
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 left-4 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            maxHeight: "70vh",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white"
            style={{ backgroundColor: "#0a2463" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#1a3a7a" }}
            >
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">I Help – Support</p>
              <p className="text-xs text-blue-200">Vijay Online Centre</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-200 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            style={{ minHeight: "200px", maxHeight: "320px" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.isUser
                      ? "text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                  style={msg.isUser ? { backgroundColor: "#0a2463" } : {}}
                >
                  <div>{formatText(msg.text)}</div>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isUser ? "text-blue-200 text-right" : "text-gray-400"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-gray-200">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp link */}
          <div className="px-3 py-2 bg-green-50 border-t border-green-100">
            <a
              href="https://wa.me/918173064549"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-700 text-xs font-medium hover:text-green-900 transition-colors"
            >
              <SiWhatsapp className="w-4 h-4" />
              Chat directly on WhatsApp: +91 8173064549
            </a>
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 bg-white">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => handleSend(qr.label)}
                disabled={isTyping}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:text-white disabled:opacity-50"
                style={{ borderColor: "#0a2463", color: "#0a2463" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#0a2463";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#0a2463";
                }}
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend(input)
              }
              placeholder="Ask a question..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:border-transparent transition-all"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: "#0a2463" }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
