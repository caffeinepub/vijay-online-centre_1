import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from '../hooks/useQueries';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  { label: 'Document Requirements', labelHindi: 'दस्तावेज़ आवश्यकताएं' },
  { label: 'Track Application', labelHindi: 'आवेदन ट्रैक करें' },
  { label: 'Contact Support', labelHindi: 'संपर्क करें' },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: 'नमस्ते! 🙏 Hello!\n\nWelcome to **Vijay Online Centre**. I can help you with:\n• Document requirements for any service\n• Application status tracking\n• Contact information\n\nआप हिंदी या English में पूछ सकते हैं।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbot = useChatbot();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const response = await chatbot.mutateAsync(text.trim());
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^• /, '&bull; ');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-4 z-40 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 animate-pulse-ring"
        style={{ background: 'oklch(0.45 0.18 250)' }}
        title="Chat with us"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'oklch(0.65 0.2 30)' }}>
            !
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 left-4 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          style={{ background: 'oklch(1 0 0)', maxHeight: '70vh', border: '1px solid oklch(0.88 0.01 240)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: 'oklch(0.12 0.06 250)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.45 0.18 250)' }}>
              <Bot size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm">Vijay Online Centre Assistant</p>
              <p className="text-xs text-white/60">24/7 Support • हिंदी & English</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '350px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: 'oklch(0.45 0.18 250)' }
                      : { background: 'oklch(0.95 0.005 240)', color: 'oklch(0.15 0.02 240)' }
                  }
                >
                  <div>{formatText(msg.text)}</div>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {chatbot.isPending && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'oklch(0.95 0.005 240)' }}>
                  <div className="flex gap-1 items-center">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100">
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr.label}
                onClick={() => sendMessage(qr.label)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:text-white"
                style={{ borderColor: 'oklch(0.45 0.18 250)', color: 'oklch(0.45 0.18 250)' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'oklch(0.45 0.18 250)'; (e.target as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = 'oklch(0.45 0.18 250)'; }}
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Type a message... / संदेश लिखें..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'oklch(0.88 0.01 240)',
                background: 'oklch(0.97 0.005 240)',
              }}
              disabled={chatbot.isPending}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || chatbot.isPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'oklch(0.45 0.18 250)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
