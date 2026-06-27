"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";
import RoadmapApiAxiosInstance from "@/app/api/axiosInstance";
import { apiRoutes } from "@/app/api/apiRoutes";

interface Message {
  role: "user" | "model";
  text: string;
  isLoading?: boolean;
  isError?: boolean;
}

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  // History stored in {role, text} format exactly as the backend expects
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi! I'm DevMap AI. Ask me anything about programming concepts, your roadmap, or anything you're stuck on. 🚀" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    // Build history from confirmed (non-loading, non-error) messages
    const history: { role: "user" | "model"; text: string }[] = messages
      .filter((m) => !m.isLoading && !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));

    // Optimistically add user message + loading bubble
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "model", text: "...", isLoading: true },
    ]);

    try {
      // Exact payload the backend expects (from chatbot.controllers.js)
      const res = await RoadmapApiAxiosInstance.post(apiRoutes.Chatbot.chat.route, {
        message: text,
        history, // [{role: "user"|"model", text: "..."}]
      });

      if (res.data?.success && res.data?.message) {
        setMessages((prev) => {
          const updated = [...prev];
          const loadingIdx = updated.findLastIndex((m) => m.isLoading);
          if (loadingIdx !== -1) updated[loadingIdx] = { role: "model", text: res.data.message };
          return updated;
        });
      } else {
        throw new Error(res.data?.message || "Empty response from AI");
      }
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Something went wrong. Please try again.";
      setMessages((prev) => {
        const updated = [...prev];
        const loadingIdx = updated.findLastIndex((m) => m.isLoading);
        if (loadingIdx !== -1)
          updated[loadingIdx] = { role: "model", text: msg, isError: true };
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${
          open ? "bg-destructive hover:bg-destructive/90 scale-90" : "bg-primary hover:bg-secondary scale-100 hover:scale-105"
        }`}
        aria-label="Toggle AI chat"
      >
        {open ? <X size={20} className="text-white" /> : <Bot size={22} className="text-white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 border-b border-white/10 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">DevMap Ai</p>
                  <span className="text-xs">✨</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-[10px] text-green-400">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Bot size={12} className="text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : msg.isError
                      ? "bg-destructive/10 text-destructive rounded-tl-sm border border-destructive/20"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    {msg.isLoading ? (
                      <span className="flex items-center gap-1">
                        {[0,150,300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    ) : msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <p className="text-center text-[10px] text-muted-foreground py-1 bg-muted/30 border-t border-border shrink-0">
              Powered by DevMap AI • CS concepts &amp; code explanations
            </p>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask about CS concepts..."
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
