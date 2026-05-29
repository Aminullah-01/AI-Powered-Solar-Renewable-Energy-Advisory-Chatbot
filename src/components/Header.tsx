/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sun, Zap, Sparkles, BookOpen, Calculator, MessageSquare, Menu, X } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: "home", label: "Overview Portal", icon: Sun },
    { id: "chat", label: "AI Advisor Chat", icon: MessageSquare },
    { id: "calculator", label: "Sizing Calculator", icon: Calculator },
    { id: "doc", label: "Project Documentation", icon: BookOpen },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="relative p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Sun className="h-6 w-6 animate-spin-slow text-amber-500 absolute" />
              <Zap className="h-6 w-6 text-emerald-600 relative z-10 scale-90" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-bold text-lg tracking-tight text-slate-900">
                  Solaris<span className="text-emerald-600">Advisor</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  CSC309 Mini Project
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                Dept of Computer Science
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-15">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 hover:bg-emerald-700"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-[#F8FAF9] border border-transparent"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-[#F8FAF9] focus:outline-none border border-slate-200"
              aria-expanded="false"
              id="mobile-menu-toggle"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 backdrop-blur-lg animate-fade-in" id="mobile-navigation-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-mob-tab-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "text-slate-600 hover:bg-[#F8FAF9]"
                  }`}
                >
                  <Icon className="h-5 w-5 text-slate-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="pt-2 px-4 border-t border-slate-100 mt-2">
              <div className="flex items-center space-x-2 py-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-550">
                  CSC309 Renewable Sizing Node
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
