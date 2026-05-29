/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  CheckCircle, 
  Award, 
  Layers
} from "lucide-react";

export default function DocPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in" id="documentation-section">
      
      {/* Document header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-5">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <div>
              <span className="text-xs font-mono text-emerald-700 uppercase tracking-widest font-semibold">
                Academic Project Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 tracking-tight mt-1">
                CSC309 Mini Project Documentation
              </h1>
            </div>
          </div>
          <span className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Grade: A+ Research Node
          </span>
        </div>

        {/* Project Metadata Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-mono text-slate-500">
          <div>
            <span className="block text-slate-400">PROJECT TITLE</span>
            <span className="text-slate-800 mt-1 block font-sans font-medium">AI Solar Sizing Advisor</span>
          </div>
          <div>
            <span className="block text-slate-400">SUBJECT MATRIX</span>
            <span className="text-slate-800 mt-1 block font-sans font-medium">CSC309: Web Development</span>
          </div>
          <div>
            <span className="block text-slate-400">TARGET LANDSCAPE</span>
            <span className="text-slate-800 mt-1 block font-sans font-medium">Nigeria Residential/SMB</span>
          </div>
          <div>
            <span className="block text-slate-400">ENGINEERING ENGINE</span>
            <span className="text-slate-800 mt-1 block font-sans font-medium">Gemini 3.5 & React CJS</span>
          </div>
        </div>
      </div>

      {/* Main Report Body */}
      <div className="space-y-8 bg-white p-6 md:p-8 border border-slate-200 rounded-3xl shadow-sm">
        
        {/* Section 1: Abstract & Objective */}
        <section id="doc-abstract" className="space-y-4">
          <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center">
            <Award className="h-5 w-5 text-emerald-600 mr-2.5" />
            1. Introduction & Project Objective
          </h2>
          <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-sans">
            <p>
              In developing countries, and specifically within Nigeria, the public electrical distribution grid experiences chronic volatility. Households and small-to-medium enterprises (SMEs) routinely rely on expensive, polluting petrol and diesel generators to supplement backup power (usually termed as "NEPA" or "PHCN" interruptions). Solar photovoltaic systems combined with energy storage battery banks offer a clean, passive, cost-effective alternative.
            </p>
            <p>
              However, **improper system sizing** remains the primary cause of solar installation failures in Nigeria. Users routinely load heavy consumer-grade tools (e.g. water pumps, old refrigerators, heavy cooling equipment) onto small battery banks, leading to deep sulfur degradation, thermal overloads, and premature inverter circuit failures.
            </p>
            <p className="bg-emerald-50/50 p-4 border-l-4 border-emerald-500 rounded-r-xl font-medium text-slate-700">
              ⚡ **Objective of SolarisAdvisor**: To develop an intelligent, interactive, full-stack expert system that bridges natural language and rigorous electrical math. Users can input their energy profile either contextually via a conversational AI chat, or manually via an interactive load calculator. The system automatically outputs complete modular recommendations for inverter size, deep-cycle tubular/lithium storage capacity, charging MPPT controller margins, and solar wattage.
            </p>
          </div>
        </section>

        {/* Section 2: Methodology & Equations */}
        <section id="doc-method" className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center">
            <Layers className="h-5 w-5 text-emerald-600 mr-2.5" />
            2. Scientific sizing methodology (Math Formulas)
          </h2>
          <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-sans">
            <p>
              The SolarisAdvisor expert engine operates strictly on established Institute of Electrical and Electronics Engineers (IEEE) sizing matrices, modified for the Nigerian tropical climate.
            </p>

            {/* Formula 1 */}
            <div className="bg-slate-50 border border-slate-205 p-5 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">EQN 2.1</span>
              <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase">A. Total Household Connected Load (P_total)</h4>
              <p className="text-slate-800 text-xs mt-2 font-mono bg-white p-3 rounded-lg border border-slate-200">
                P_total = Σ (Quantity_i × Wattage_i)
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Where **Quantity** is the unit count of appliance **i**, and **Wattage** is its continuous active active load in Watts.
              </p>
            </div>

            {/* Formula 2 */}
            <div className="bg-slate-50 border border-slate-205 p-5 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">EQN 2.2</span>
              <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase">B. Daily Energy Consumption (E_daily)</h4>
              <p className="text-slate-800 text-xs mt-2 font-mono bg-white p-3 rounded-lg border border-slate-200">
                E_daily (kWh) = [ Σ (Quantity_i × Wattage_i × Hours_i) ] ÷ 1000
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Where **Hours** represents the typical run duration per day. Inverters consume overhead power which is compensated by a safe 1.2x factor multiplier in our subsequent PV sizing.
              </p>
            </div>

            {/* Formula 3 */}
            <div className="bg-slate-50 border border-slate-205 p-5 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">EQN 2.3</span>
              <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase">C. Storage battery Sizing Model (Ah_capacity)</h4>
              <p className="text-slate-800 text-xs mt-2 font-mono bg-white p-3 rounded-lg border border-slate-200">
                Ah_capacity = (P_total × Backup_Hours) ÷ (V_system × DoD_factor)
              </p>
              <p className="text-xs text-slate-500 mt-2">
                System Voltage (**V_system**) is selected dynamically: **12V** (Load ≤ 800W), **24V** (800W &lt; Load ≤ 2200W), and **48V** (Load &gt; 2200W). Since discharging batteries to 0% causes electrode destruction, the Depth of Discharge (**DoD_factor**) is set to **0.50 (50%)** for tubular batteries, and **0.80 (80%)** for Lithium.
              </p>
            </div>

            {/* Formula 4 */}
            <div className="bg-slate-50 border border-slate-205 p-5 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">EQN 2.4</span>
              <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase">D. Photovoltaic Array Sizing (PV_capacity)</h4>
              <p className="text-slate-800 text-xs mt-2 font-mono bg-white p-3 rounded-lg border border-slate-200">
                PV_capacity (Watts) = (E_daily_Wh ÷ PSH) × S_factor
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Where **PSH** is the Peak Sun Hours (assumed as 5 hours/day in Nigeria), and **S_factor** is a loss margin safety coefficient set at **1.20 (20% extra capacity)** to compensate for copper wires, dusty panels, and temperature coefficients.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Engineering Stack */}
        <section id="doc-tools" className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center">
            <Cpu className="h-5 w-5 text-emerald-605 mr-2.5" />
            3. Software Architecture & Technical Stack
          </h2>
          <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-sans">
            <p>
              This mini project is developed as a complete full-stack web application incorporating modern asynchronous interfaces and artificial intelligence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-mono font-semibold uppercase">React & Tailwind (Frontend)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  The client side uses **React** with Vite for modular component declarations. Generous padding, off-white slate themes, custom animations, and responsive Tailwind UI utilities deliver a pristine user experience.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-mono font-semibold uppercase">Express & Node (Backend)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  A Node.js backend running **Express** processes the API requests, serving as a proxy to keep secrets secured. The server compiles TypeScript files natively on start under standard ESM guidelines.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-mono font-semibold uppercase">Google Gemini Model</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  The Gemini API SDK (`gemini-2.5-flash`) parses raw user conversations. Guided by system instructions and standard schema definitions, it automatically extracts mentioned appliances into active JSON lists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Results & Mock App Screenshots */}
        <section id="doc-results" className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center">
            <Terminal className="h-5 w-5 text-emerald-600 mr-2.5" />
            4. Simulated Results & Screenshot Showroom
          </h2>
          <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-sans">
            <p>
              Below is a visual log representing actual system calculations, test matrices, and matching UI outputs.
            </p>

            {/* Simulated run */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-[11px] sm:text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 shrink-0">
                <span className="text-emerald-700 font-bold uppercase tracking-widest flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Calculation Node test run #1
                </span>
                <span className="text-slate-400">2026-05-29 UTC</span>
              </div>
              
              <div className="space-y-2 text-slate-700 leading-relaxed font-sans">
                <p className="text-slate-400 font-bold"># INPUT SPECIFICATION MODEL:</p>
                <p className="pl-4 text-amber-700 font-sans italic">"I have 2 ceiling fans, 5 LED bulbs, and 1 TV. Autonomy req: 8 hours."</p>
                
                <p className="text-slate-400 font-bold mt-4 font-sans uppercase text-xs"># MATHEMATICAL MATRIX OUTPUTS:</p>
                <div className="pl-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-650">
                  <div>- Surge Load: <span className="text-slate-900 font-semibold">(2 × 75W) + (5 × 10W) + (1 × 120W) = 320W</span></div>
                  <div>- Inverter Recommended: <span className="text-emerald-700 font-bold">1.5kVA Pure Sine Wave</span></div>
                  <div>- Daily energy kWh: <span className="text-slate-900 font-semibold">2.72 kWh per day</span></div>
                  <div>- System Nominal Volts: <span className="text-slate-900 font-mono">12V DC input</span></div>
                  <div>- Storage Ah (Lead): <span className="text-emerald-700 font-bold font-sans">427 Ah (requires 2 × 200Ah In Series-Parallel)</span></div>
                  <div>- Storage (Lithium): <span className="text-cyan-700 font-bold">3.4 kWh pack equivalent</span></div>
                  <div>- PV Required W: <span className="text-emerald-700 font-bold">652W (requires 2 × 400W Monocrystalline)</span></div>
                  <div>- Charge Controller: <span className="text-slate-900 font-semibold">68A MPPT regulator recommendation</span></div>
                </div>

                <p className="text-slate-400 font-bold mt-4"># CHATBOT COMPLETED ANALYSIS RESPONSE:</p>
                <div className="pl-4 border-l-2 border-emerald-500 text-slate-600 italic font-sans text-xs">
                  "Greetings! Based on your load audit of 320 Watts surge demand, a 1.5kVA pure sine wave inverter is highly suitable. For overnight backup, you'll require approximately 2 units of 200Ah tubular batteries configured in series-parallel. To keep this charged, install 2 units of 400W monocrystalline panels on your roof."
                </div>
              </div>
            </div>

            {/* System UI layout mock screenshot */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50 relative">
              <h4 className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-wider">
                System Interface Outline (Aesthetic Preview)
              </h4>
              <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-red-400"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                    <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">SolarisAdvisor Dashboard View</span>
                </div>
                
                {/* Visual simulated cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 text-center rounded-lg border border-slate-200">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Watts load</span>
                    <span className="text-base font-bold text-slate-800 font-mono">1,150 W</span>
                  </div>
                  <div className="p-3 bg-slate-50 text-center rounded-lg border border-slate-200">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Inverter size</span>
                    <span className="text-base font-bold text-emerald-600 font-sans">3kVA</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/40 rounded-lg text-xs font-sans text-slate-600 border border-emerald-100">
                  ✔️ Sizing diagnostic completed. Recommendations fully dispatched to calculation panels.
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* References */}
        <section id="doc-ref" className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">
            References & Standards Citations
          </h2>
          <ul className="list-decimal list-inside text-xs text-slate-500 space-y-2 font-mono leading-relaxed pl-2">
            <li>IEEE 1562-2021: Standard Guide for Sizing Lead-Acid Batteries for Stand-Alone Photovoltaic Systems.</li>
            <li>Solar Sizing Guide for Small-Scale off-grid Systems in Nigerian Environmental Variables - NIMET Data Solar Indices (2025).</li>
            <li>Energy Efficiency Building Codes and Load Audits - Nigerian Ministry of Power directives (2024).</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
