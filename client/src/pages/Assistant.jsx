import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePersonalization } from '../context/PersonalizationContext';
import { aiAPI, interactionsAPI } from '../api';
import {
  Send, Bot, User, Sparkles, Brain, Loader2, RefreshCw,
  Copy, Check, Lightbulb, Compass, Target, Clock, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Assistant() {
  const { user } = useAuth();
  const { profile } = usePersonalization();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your Adaptive AI Learning Companion. I actively monitor your preferences, skill level (${profile?.skillLevel || 'beginner'}), and your current focus to give you tailored answers. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Suggested prompts based on user profile
  const suggestedPrompts = [
    `What should I learn next to advance my "${profile?.goal || 'learning'}" goal?`,
    `Break down a 3-step practical roadmap based on my ${profile?.skillLevel || 'beginner'} level`,
    `Recommend high-impact projects matching my interests in ${profile?.interests?.slice(0, 2).join(' & ') || 'tech'}`,
    `Explain how my recent learning patterns are influencing my recommendations`,
  ];

  const handleSend = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send chat history formatted for backend
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiAPI.chat(text, historyPayload);
      const aiResponseText = res.data.data.reply || res.data.data.message || 'I processed your request using your personalized profile context.';

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.data.data.source || 'gemini',
      };

      setMessages((prev) => [...prev, botMessage]);

      // Track interaction to close the personalization feedback loop
      await interactionsAPI.track({
        eventType: 'CHAT',
        metadata: {
          promptLength: text.length,
          topicKeywords: text.split(' ').slice(0, 5).join(' '),
        },
      });
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get AI response. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an issue connecting to the AI brain. However, your session context has been saved. Please try asking again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-5 pb-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Adaptive Learning Copilot</h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Context-Aware
                </span>
              </div>
              <p className="text-[11px] text-surface-400">
                Tailored for {profile?.skillLevel || 'intermediate'} level • {profile?.preferredStyle || 'hands-on'} style
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([messages[0]]);
              toast.success('Conversation cleared');
            }}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-400">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm shadow-lg shadow-brand-600/20'
                    : 'bg-surface-800/80 border border-white/10 text-surface-100 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`flex items-center justify-between gap-4 mt-2 pt-2 border-t text-[10px] ${
                    msg.role === 'user' ? 'border-brand-500/30 text-brand-200' : 'border-white/5 text-surface-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider text-surface-400">
                        {msg.source === 'gemini' ? '✨ Gemini AI' : '⚡ Adaptive Engine'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="hover:text-white transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-surface-800 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-surface-300">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 text-brand-400">
                <Bot size={16} />
              </div>
              <div className="bg-surface-800/80 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-surface-400 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-brand-400" />
                <span>Consulting your personalization profile...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (if only welcome message) */}
        {messages.length === 1 && (
          <div className="px-4 py-3 bg-surface-950/40 border-t border-white/5">
            <p className="text-[11px] text-surface-400 mb-2 flex items-center gap-1 font-medium">
              <Lightbulb size={12} className="text-amber-400" />
              Suggested questions based on your profile:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left p-2 rounded-lg bg-surface-900 hover:bg-surface-800/80 border border-white/5 hover:border-brand-500/30 text-surface-300 hover:text-white text-xs transition-all flex items-start gap-2"
                >
                  <span className="text-brand-400 mt-0.5">›</span>
                  <span className="line-clamp-1">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-surface-900/60 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything — tailored for your ${profile?.skillLevel || 'current'} level...`}
              disabled={loading}
              className="flex-1 bg-surface-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Context Inspector Side Panel */}
      <div className="w-full lg:w-72 flex-shrink-0 card p-4 space-y-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Brain size={16} className="text-brand-400" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Active AI Memory Context
          </h3>
        </div>

        <div className="space-y-3 text-xs flex-1 overflow-y-auto pr-1">
          <div>
            <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Target Goal</span>
            <p className="text-white font-medium capitalize mt-0.5">
              {profile?.goal?.replace('-', ' ') || 'General Growth'}
            </p>
          </div>

          <div>
            <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Skill Level</span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase mt-0.5">
              {profile?.skillLevel || 'Beginner'}
            </span>
          </div>

          <div>
            <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Learning Style</span>
            <p className="text-white capitalize mt-0.5">{profile?.preferredStyle || 'Short-form'}</p>
          </div>

          <div>
            <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Tracked Interests</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile?.interests?.map((interest, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] bg-surface-800 text-surface-200 border border-white/5 capitalize"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {profile?.currentFocus && (
            <div>
              <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Current Focus</span>
              <p className="text-brand-300 text-xs mt-0.5 leading-snug font-medium">
                {profile.currentFocus}
              </p>
            </div>
          )}

          {profile?.personalNote && (
            <div>
              <span className="text-surface-500 text-[10px] uppercase font-bold tracking-wider">Learner Note</span>
              <p className="text-surface-300 text-[11px] mt-0.5 italic bg-surface-950/60 p-2 rounded-lg border border-white/5">
                "{profile.personalNote}"
              </p>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-300 leading-relaxed">
          💡 Every response from this assistant is customized according to the live parameters above.
        </div>
      </div>
    </div>
  );
}
