import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assistantApi } from '../../api/assistantApi';
import { ChatMessage, ChatSession } from '../../types';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  Minimize2,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

const SUGGESTIONS = [
  'How do I report an open manhole or broken road?',
  'What is the SLA timeline for fixing broken streetlights?',
  'How can I get garbage cleared if collection was missed?',
  'What are the city water supply outage guidelines?',
];

export const CivicAssistantWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load latest session on open if authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadLatestSession();
    }
  }, [isOpen, isAuthenticated]);

  const loadLatestSession = async () => {
    try {
      const list = await assistantApi.getSessions();
      if (list && list.length > 0) {
        const latest = list[0];
        setSessionUuid(latest.sessionUuid);
        const msgs = await assistantApi.getMessages(latest.sessionUuid);
        setMessages(msgs || []);
      }
    } catch (err) {
      console.warn('Failed to load past sessions', err);
    }
  };

  const handleNewSession = () => {
    setSessionUuid(undefined);
    setMessages([]);
  };

  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await assistantApi.chat(text, sessionUuid);
      setSessionUuid(res.sessionUuid);

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ASSISTANT',
        content: res.response || res.message || '',
        citations: res.citations,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Assistant error', err);
      const errMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ASSISTANT',
        content:
          'I apologize, but I encountered an error while processing your request. Please try asking again or track your complaint using the tracking code.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
          aria-label="Open Civic AI Assistant"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-semibold text-sm pr-1 hidden sm:inline">Ask CivicFix AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10 md:inset-16 max-w-5xl mx-auto'
              : 'bottom-6 right-6 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  CivicFix AI Assistant
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.2 rounded font-medium border border-emerald-400/30">
                    RAG Grounded
                  </span>
                </h3>
                <p className="text-[11px] text-white/70">
                  Municipal regulations & live status lookup
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleNewSession}
                title="New Chat Session"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="py-8 px-2 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    How can I assist you today?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                    Ask questions about city regulations, SLAs, reporting procedures, or ask me to check tracking ID like <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">#CFX-1001</code>.
                  </p>
                </div>

                <div className="text-left space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Suggested Questions
                  </span>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s)}
                      className="w-full text-left p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === 'USER';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                        isUser
                          ? 'bg-slate-800 dark:bg-slate-700 text-white'
                          : 'bg-primary-600 text-white shadow-sm'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {/* Citations section if present */}
                      {!isUser && m.citations && m.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                            <BookOpen className="w-3 h-3 text-primary-500" />
                            Grounded Citations:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {m.citations.map((cite, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              >
                                {cite}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></div>
                  </div>
                  <span>Searching civic knowledge base & retrieving answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything or check status with #CFX-..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 transition-colors shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
