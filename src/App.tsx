/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ChatInterface from "./components/ChatInterface";
import DocPage from "./components/DocPage";
import { 
  Sun, 
  Zap, 
  BatteryCharging, 
  Sparkles, 
  ChevronRight, 
  FileCheck, 
  BookOpen, 
  ShieldCheck, 
  Database,
  Calculator,
  MessageSquare
} from "lucide-react";
import { SelectedAppliance, ChatMessage, APPLIANCE_PRESETS } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  
  // App-level state for inventory, backup hours, and chat memory
  const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>([]);
  const [backupHours, setBackupHours] = useState<number>(8);
  
  // Alert prompt for success notification when appliances are sync'd
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Pre-seed chat thread with a welcoming, technical message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
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
    },
  ]);

  // Handle callback when chatbot detects appliances
  const handleApplyDetectedAppliances = (detected: { presetId: string; qty: number }[]) => {
    setSelectedAppliances((prev) => {
      // Start fresh or update
      const updated = [...prev];
      detected.forEach((d) => {
        const preset = APPLIANCE_PRESETS.find((p) => p.id === d.presetId);
        if (preset) {
          const index = updated.findIndex((item) => item.applianceId === d.presetId);
          if (index >= 0) {
            updated[index].quantity = d.qty;
          } else {
            updated.push({
              applianceId: d.presetId,
              quantity: d.qty,
              hoursPerDay: preset.defaultHours,
              wattage: preset.defaultWattage,
            });
          }
        }
      });
      return updated;
    });

    // Alert the user and swap views
    setAlertNotification(`Successfully synchronised ${detected.length} appliance types to the Sizing Calculator!`);
    setActiveTab("calculator");

    // Auto dismiss alarm in 4 seconds
    setTimeout(() => {
      setAlertNotification(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950" id="main-applet-container">
      
      {/* Absolute top grid lines backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-40"></div>

      {/* Persistent Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* SUCCESS POPUP ALARM BANNER */}
      {alertNotification && (
        <div className="fixed top-20 right-4 z-[100] max-w-sm bg-white border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-100 animate-slide-in" id="success-sync-banner">
          <div className="flex items-start space-x-3">
            <div className="p-1 px-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-sans font-bold text-slate-900">Simulator Sync Enabled</h4>
              <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">{alertNotification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Area View */}
      <main className="flex-1 relative z-10">
        
        {/* VIEW 1: HOME PAGE OVERVIEW PORTAL */}
        {activeTab === "home" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in" id="home-view">
            
            {/* HERO INTRODUCTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                
                {/* CSC309 academic header pill */}
                <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-1 text-xs font-mono text-emerald-700 font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span>CSC309 Mini Project Courseware Submission</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 tracking-tight leading-tight">
                  AI-Powered Solar & Renewable <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    Energy Advisory Portal
                  </span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
                  Transitioning to clean energy in Nigeria shouldn't be based on trial and error. Our system implements rigorous electrical calculations paired with natural language parsing to ensure your appliances match your solar power arrays perfectly.
                </p>

                {/* Main CTA paths */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold tracking-tight shadow-md shadow-emerald-600/10 transition-all duration-200 cursor-pointer"
                    id="btn-goto-advisor"
                  >
                    <MessageSquare className="h-4.5 w-4.5 mr-1" />
                    <span>Consult AI Solar Advisor</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("calculator")}
                    className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-semibold tracking-tight shadow-sm transition cursor-pointer"
                    id="btn-goto-calculator"
                  >
                    <Calculator className="h-4.5 w-4.5 mr-1 text-slate-550" />
                    <span>Interactive Sizing Simulator</span>
                  </button>
                </div>

              </div>

              {/* Graphic stats showroom side */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44">
                  <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl w-10 h-10 flex items-center justify-center">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-bold text-slate-800 block">5.1 hours</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Average Peak Sun Hours</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 mt-6">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl w-10 h-10 flex items-center justify-center">
                    <BatteryCharging className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-bold text-emerald-600 block">12V/24V/48V</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Storage Direct Current</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44">
                  <div className="p-1.5 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-xl w-10 h-10 flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-bold text-slate-800 block">Pure Wave</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Inverter Sizing Waveform</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 mt-6">
                  <div className="p-2.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl w-10 h-10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-bold text-purple-600 block">IEEE 1562</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Battery Sizing Standards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SPLIT DOUBLE COL COLUMNS FOR CORE FUNCTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-16">
              
              {/* Feature A info section */}
              <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                <h3 className="font-sans font-bold text-xl text-slate-900 flex items-center">
                  <span className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl mr-3 text-emerald-600">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  Natural Language Load Parsing
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-sans leading-relaxed">
                  Simply tell the advisor: *"I have 2 ceiling fans, 1 fridge, and 5 LED bulbs. Why are my battery banks draining?"*
                </p>
                <p className="text-slate-500 text-xs leading-relaxed font-sans">
                  The integrated Gemini LLM model analyses your sentence, segments the quantities, targets the appropriate preset wattages inside our Nigerian appliance catalogs, and compiles a comprehensive troubleshooting analysis, while enabling one-click transfer to push these devices straight into the interactive calculations panel!
                </p>
              </div>

              {/* Feature B info section */}
              <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                <h3 className="font-sans font-bold text-xl text-slate-900 flex items-center">
                  <span className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl mr-3 text-emerald-600">
                    <Calculator className="h-5 w-5" />
                  </span>
                  IEEE Sizing Calculation Matrices
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-sans leading-relaxed">
                  Real-time calculations for inverter surge limits, Deep-Cycle wet-cell and lithium backup configurations.
                </p>
                <p className="text-slate-500 text-xs leading-relaxed font-sans">
                  Adjust active hours, fine-tune individual device wattages, and observe how Required Solar values scale in response using our interactive range bars. Includes built-in regional advisories covering harmattan dust compensation, borehole pump inductive surges, and battery preservation.
                </p>
              </div>

            </div>

            {/* CSC309 ACADEMIC ATTRIBUTION SECTION (NIGERIAN CONTEXT) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden" id="academic-attribution">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                <Sun className="h-8 w-8 text-amber-500 mx-auto animate-pulse" />
                <h3 className="font-sans font-bold text-lg text-slate-900">
                  CSC309 Mini Project Course Submission Board
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto font-sans leading-relaxed">
                  Approved framework prototype representing modern web practices (TS Module System, Express, Google GenAI SDK). Made for regional energy advisement.
                </p>
                
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left text-xs font-mono text-slate-600">
                  <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    <span>Student ID: CSC/309/2026/0882</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    <span>Supervised by: Course Board</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: ADVISOR CHAT INTERFACE */}
        {activeTab === "chat" && (
          <ChatInterface 
            messages={messages} 
            setMessages={setMessages} 
            onApplyDetectedAppliances={handleApplyDetectedAppliances} 
          />
        )}

        {/* VIEW 3: DYNAMIC SIZING SIMULATOR */}
        {activeTab === "calculator" && (
          <Dashboard 
            selectedAppliances={selectedAppliances} 
            setSelectedAppliances={setSelectedAppliances} 
            backupHours={backupHours} 
            setBackupHours={setBackupHours} 
          />
        )}

        {/* VIEW 4: SYSTEM DOCUMENTATION REPORT */}
        {activeTab === "doc" && <DocPage />}

      </main>

      {/* Standard Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            SolarisAdvisor Node • Dept of Computer Science • Grade Prototype
          </p>
          <p className="text-[9px] font-mono text-slate-400">
            Powered by Google Gemini 3.5-flash & TS CJS Container System
          </p>
        </div>
      </footer>

    </div>
  );
}
