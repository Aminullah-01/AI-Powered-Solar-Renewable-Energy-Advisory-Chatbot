/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  User, 
  Cpu, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  Lightbulb,
  Zap,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage, SelectedAppliance, APPLIANCE_PRESETS } from "../types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onApplyDetectedAppliances: (detected: { presetId: string; qty: number }[]) => void;
}

export default function ChatInterface({
  messages,
  setMessages,
  onApplyDetectedAppliances,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested conversational starter questions
  const starters = [
    {
      title: "Size Household inventory",
      prompt: "I have 2 ceiling fans, 1 fridge, 1 TV, and 6 LED bulbs. Sump calculation please.",
    },
    {
      title: "Inverter Beeping diagnostic",
      prompt: "Why is my inverter making a rapid beep sound at night?",
    },
    {
      title: "Battery Fast Drain",
      prompt: "My deep cycle batteries drain too fast. What could be the issues?",
    },
    {
      title: "Solar Sump during rainy season",
      prompt: "How do I optimize battery charging during the cloudy harmattan seasons in Nigeria?",
    }
  ];

  // Auto scroll to latest bubble
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Gather relevant trailing query history to send (max 10)
      const contextHistory = messages.slice(-10).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      // Call Express API route proxying Gemini 3.5-flash
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: contextHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gateway response failed");
      }

      // Construct AI responder message
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedData: data.parsedData ? {
          appliances: data.parsedData.appliances.map((app: any) => ({
            name: app.name,
            qty: app.qty,
            watts: app.watts,
            hours: app.hours,
            presetId: app.presetId || app.id
          }))
        } : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: `### Unstable Communications Node
I had an issue communicating with the core intelligence server. This is usually due to missing developer secrets or connection rate limits. 

Let's do standard sizing anyway:
- **Total Watts** calculated from default appliances is best verified on the **Sizing Calculator** tab.
- Let me know your exact household tools and I'll walk you through standard formulas.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: "welcome-init",
      sender: "bot",
      text: `### Welcome to Nigeria's Intelligent Renewable Energy Advisory Assistant! ☀️🔋
I am your solar consultant, developed for homes and small businesses in Lagos, Abuja, Kano, Port Harcourt, and across the federation. 

I can assist you to size, troubleshoot, and optimize your backup solar system. Here is what you can ask me:

1. **Sizing Inquiry**: *"I have 2 ceiling fans, 3 LED bulbs, 1 TV, and a fridge. What solar setup is appropriate?"*
2. **Troubleshooting**: *"Why is my inverter making a continuous beeping sound?"* or *"My batteries drop fast at 2 AM, what do I do?"*
3. **Optimizing**: *"How do I keep my backup system running reliably through the rainy season?"*

*Tip: Please write your exact appliances, and I will automatically populate the Interactive Calculator for you!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in" id="chat-section">
      <div className="bg-white border border-slate-200 rounded-2xl md:p-1 shadow-md flex flex-col h-[750px] overflow-hidden">
        
        {/* Chat window Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Cpu className="h-5 w-5 text-emerald-605 animate-pulse" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white"></span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-sm sm:text-base flex items-center">
                Solaris AI Conversational Adviser
                <Sparkles className="h-4 w-4 text-amber-500 ml-1.5" />
              </h3>
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                Active Node: gemini-3.5-flash
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <button
            onClick={clearChat}
            className="p-2 border border-slate-200 hover:border-red-200 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg text-slate-500 transition"
            title="Reset Advisor Chat"
            id="clear-chat-thread"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable messages thread */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar bg-slate-50/15">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            
            // Check if there are parsed appliances in this message block
            const detectedApps = msg.parsedData?.appliances;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start animate-fade-in"}`}>
                <div className="flex items-center space-x-2 mb-1">
                  {!isUser ? (
                    <>
                      <span className="p-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-[9px] uppercase tracking-widest flex items-center">
                        <Cpu className="h-2.5 w-2.5 mr-1" /> AI Advisor
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                      <span className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[9px] uppercase tracking-widest flex items-center">
                        <User className="h-2.5 w-2.5 mr-1" /> You
                      </span>
                    </>
                  )}
                </div>

                {/* Response bubble */}
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed border transition-all ${
                  isUser 
                    ? "bg-emerald-600 border-emerald-605 text-white" 
                    : "bg-white border-slate-200 text-slate-800 shadow-sm"
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>

                {/* DETECTED APPLIANCES QUICK NOTIFY CARD */}
                {detectedApps && detectedApps.length > 0 && (
                  <div className="mt-3 ml-2 max-w-[80%] bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-start space-x-2.5">
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-mono font-bold text-emerald-950 uppercase tracking-wide">
                          Smart Load Extracted!
                        </h4>
                        <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                          My local parsing algorithms detected the following appliances in your statement.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-100">
                      {detectedApps.map((app, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-mono text-slate-700">
                            {app.qty} × {app.name || app.presetId}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const payload = detectedApps.map(a => ({
                          presetId: a.presetId || "led_bulb",
                          qty: a.qty
                        }));
                        onApplyDetectedAppliances(payload);
                      }}
                      className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center space-x-1.5 shadow-sm"
                      id="btn-apply-detected"
                    >
                      <span>Apply to Sizing Simulator</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start animate-pulse">
              <span className="text-[10px] font-mono text-slate-400 mb-1">AI Advisor is composing...</span>
              <div className="bg-white border border-slate-150 rounded-2xl px-5 py-3 flex items-center space-x-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts - only shown if thread is empty or has only welcome message */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Suggested starter questions:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {starters.map((item, idx) => (
                <button
                  key={idx}
                  id={`starter-${idx}`}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="flex items-center text-left p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs text-slate-700 hover:text-emerald-800 transition shadow-sm"
                >
                  <ChevronRight className="h-3 w-3 shrink-0 mr-1.5 text-emerald-500" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form container */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I have 2 ceiling fans, 5 lights, and 1 TV..."
              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none transition-all placeholder-slate-400 shadow-inner"
              disabled={isLoading}
              id="chat-input-field"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-emerald-600 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition hover:bg-emerald-700 shrink-0 shadow-sm"
              id="chat-submit-btn"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[9px] font-mono text-slate-500">
              *The intelligent advisor auto-syncs with the Calculator when you mention appliance quantities.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
