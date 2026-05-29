/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  Plus, 
  Minus, 
  Info, 
  Sun, 
  BatteryCharging, 
  Zap, 
  ShieldAlert, 
  FileCheck, 
  HelpCircle,
  Lightbulb,
  Wind,
  Refrigerator,
  Tv,
  Laptop,
  Monitor,
  Snowflake,
  WashingMachine,
  Droplets,
  Cpu,
  Calculator
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";
import { 
  APPLIANCE_PRESETS, 
  SelectedAppliance, 
  calculateRecommendations 
} from "../types";

interface DashboardProps {
  selectedAppliances: SelectedAppliance[];
  setSelectedAppliances: React.Dispatch<React.SetStateAction<SelectedAppliance[]>>;
  backupHours: number;
  setBackupHours: (hrs: number) => void;
}

// Icon mapping dictionary
const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Wind,
  Refrigerator,
  Tv,
  Cpu,
  Laptop,
  Monitor,
  Snowflake,
  WashingMachine,
  Zap,
  Droplets
};

export default function Dashboard({
  selectedAppliances,
  setSelectedAppliances,
  backupHours,
  setBackupHours,
}: DashboardProps) {
  
  // Calculate sizing configuration reactively
  const recommendations = useMemo(() => {
    return calculateRecommendations(selectedAppliances, backupHours);
  }, [selectedAppliances, backupHours]);

  // Adjust appliance quantity
  const handleQuantityChange = (applianceId: string, delta: number) => {
    setSelectedAppliances((prev) => {
      const existing = prev.find((item) => item.applianceId === applianceId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) {
          // Keep it in the list but set quantity to 0
          return prev.map((item) =>
            item.applianceId === applianceId ? { ...item, quantity: 0 } : item
          );
        }
        return prev.map((item) =>
          item.applianceId === applianceId ? { ...item, quantity: newQty } : item
        );
      } else if (delta > 0) {
        // Add default new entry
        const preset = APPLIANCE_PRESETS.find((p) => p.id === applianceId);
        if (preset) {
          return [
            ...prev,
            {
              applianceId,
              quantity: 1,
              hoursPerDay: preset.defaultHours,
              wattage: preset.defaultWattage,
            },
          ];
        }
      }
      return prev;
    });
  };

  // Adjust runtime hours
  const handleHoursChange = (applianceId: string, hours: number) => {
    setSelectedAppliances((prev) =>
      prev.map((item) =>
        item.applianceId === applianceId
          ? { ...item, hoursPerDay: Math.min(24, Math.max(0, hours)) }
          : item
      )
    );
  };

  // Adjust wattage
  const handleWattageChange = (applianceId: string, wattage: number) => {
    setSelectedAppliances((prev) =>
      prev.map((item) =>
        item.applianceId === applianceId
          ? { ...item, wattage: Math.max(1, wattage) }
          : item
      )
    );
  };

  // Preset quick adder
  const getApplianceState = (presetId: string) => {
    return selectedAppliances.find((item) => item.applianceId === presetId) || {
      applianceId: presetId,
      quantity: 0,
      hoursPerDay: APPLIANCE_PRESETS.find((p) => p.id === presetId)?.defaultHours || 8,
      wattage: APPLIANCE_PRESETS.find((p) => p.id === presetId)?.defaultWattage || 10,
    };
  };

  // 1. Chart Data: Appliance wattage distribution
  const wattageChartData = useMemo(() => {
    return selectedAppliances
      .filter((item) => item.quantity > 0)
      .map((item) => {
        const preset = APPLIANCE_PRESETS.find((p) => p.id === item.applianceId);
        return {
          name: preset?.name || "Other",
          TotalWatts: item.wattage * item.quantity,
          Quantity: item.quantity,
        };
      });
  }, [selectedAppliances]);

  // 2. Chart Data: Daily kWh Consumption
  const kwhChartData = useMemo(() => {
    return selectedAppliances
      .filter((item) => item.quantity > 0)
      .map((item) => {
        const preset = APPLIANCE_PRESETS.find((p) => p.id === item.applianceId);
        return {
          name: preset?.name || "Other",
          kWh: parseFloat(((item.wattage * item.quantity * item.hoursPerDay) / 1000).toFixed(2)),
        };
      });
  }, [selectedAppliances]);

  // 3. Chart Data: Simulated Battery Depletion Profile
  const batteryDepletionData = useMemo(() => {
    const data = [];
    const step = backupHours / 8;
    for (let i = 0; i <= 8; i++) {
      const hoursPassed = (step * i).toFixed(1);
      // Depletes down to 50% for tubular safety
      const leadAcidRem = 100 - (50 * (i / 8));
      const lithiumRem = 100 - (80 * (i / 8));
      data.push({
        time: `${hoursPassed}h`,
        "Tubular wet-cell SOC (%)": Math.round(leadAcidRem),
        "Lithium LiFePO4 SOC (%)": Math.round(lithiumRem),
      });
    }
    return data;
  }, [backupHours]);

  // Specific Nigerian load warnings (Harmattan weather, NEPA unstable cycle tags)
  const loadWarnings = useMemo(() => {
    const warnings = [];
    const activeAC = selectedAppliances.find((item) => item.applianceId === "air_conditioner" && item.quantity > 0);
    const activePump = selectedAppliances.find((item) => item.applianceId === "water_pump" && item.quantity > 0);
    const activeMicrowave = selectedAppliances.find((item) => item.applianceId === "microwave" && item.quantity > 0);

    if (activeAC) {
      warnings.push("⚠️ An Air Conditioner is configured. Running ACs on standard inverter batteries requires high discharge ratings (typically 5kVA+ pure sine inverter and large LiFePO4 battery banks). We highly recommend running ACs strictly during high solar-gains period (11 AM - 3 PM) directly on bypass current, or interlocking them to utility-grid inputs.");
    }
    if (activePump) {
      warnings.push("⚡ Water Pumping machines run inductive motors. Their start-up surge is 3-4x the continuous wattage. Keep other high loads off when pumping water to prevent 'Inverter Overload Trip'.");
    }
    if (recommendations.requiredSolarCapacityW > 4500) {
      warnings.push("🍂 Dusty Season (Dec-Feb Harmattan) blocks solar irradiance. Your large array configuration will experience up to 30% reduction. Plan regular weekly cleanings on the roof array in these dry periods.");
    }
    return warnings;
  }, [selectedAppliances, recommendations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="calculator-section">
      {/* Title block */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-sans font-bold text-3xl text-slate-900 tracking-tight flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-emerald-600 mr-2" />
              <span>Solar Sizing Auditor & Recommendations</span>
            </h1>
            <p className="text-slate-500 mt-2 max-w-3xl">
              Model your residential utility inventory, specify quantities, configure expected overnight backup autonomy, and monitor mathematical results. Adapted for Nigerian utility variables.
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center space-x-3 text-slate-705">
            <span className="font-mono text-sm text-yellow-600 font-semibold">Autonomy Sizing Factor:</span>
            <div className="flex items-center space-x-1.5 focus:outline-none">
              <button 
                onClick={() => setBackupHours(Math.max(2, backupHours - 2))}
                className="p-1 px-2.5 bg-white hover:bg-emerald-50 font-bold border border-slate-200 hover:border-emerald-300 rounded text-xs text-emerald-600 transition"
              >
                -2h
              </button>
              <span className="font-sans font-semibold text-lg text-slate-800 w-12 text-center">{backupHours} hrs</span>
              <button 
                onClick={() => setBackupHours(Math.min(24, backupHours + 2))}
                className="p-1 px-2.5 bg-white hover:bg-emerald-50 font-bold border border-slate-200 hover:border-emerald-300 rounded text-xs text-emerald-600 transition"
              >
                +2h
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE FORM (8 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-sans font-bold text-xl text-slate-900 flex items-center">
                <span className="h-5 w-1 bg-emerald-500 rounded mr-2.5"></span>
                Household Appliance Registry
              </h2>
              <span className="text-xs font-mono text-slate-400">Preset Catalogue</span>
            </div>

            {/* List presets & sliders */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {APPLIANCE_PRESETS.map((preset) => {
                const spec = getApplianceState(preset.id);
                const IconComponent = IconMap[preset.iconName] || Zap;
                const isSelected = spec.quantity > 0;

                return (
                  <div 
                    key={preset.id}
                    id={`appliance-row-${preset.id}`}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? "bg-slate-50 border-emerald-500/30 shadow-sm" 
                        : "bg-white border-slate-150 opacity-80 hover:opacity-105"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Name and Icon */}
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2.5 rounded-xl ${
                          isSelected ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-400 border border-slate-150"
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-sans font-medium text-slate-900 text-sm sm:text-base">{preset.name}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs font-mono text-slate-400">Preset: {preset.defaultWattage}W</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {preset.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls and Quantity adjustment */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0">
                        {/* Custom Wattage Box */}
                        <div className="flex flex-col items-center">
                          <label className="text-[10px] font-mono text-slate-400 mb-1 uppercase">Wattage</label>
                          <input 
                            type="number"
                            value={spec.wattage}
                            onChange={(e) => handleWattageChange(preset.id, parseInt(e.target.value) || 0)}
                            className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-mono text-sm text-emerald-700 focus:border-emerald-550 focus:outline-none"
                            placeholder={`${preset.defaultWattage}`}
                          />
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-center">
                          <label className="text-[10px] font-mono text-slate-400 mb-1 uppercase">Qty</label>
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(preset.id, -1)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono text-sm text-slate-800">{spec.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(preset.id, 1)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Daily Run Hours */}
                        <div className="flex flex-col items-end w-24">
                          <label className="text-[10px] font-mono text-slate-400 mb-1 uppercase">Daily hours</label>
                          <div className="flex items-center space-x-1">
                            <input 
                              type="range"
                              min="1"
                              max="24"
                              value={spec.hoursPerDay}
                              disabled={!isSelected}
                              onChange={(e) => handleHoursChange(preset.id, parseInt(e.target.value))}
                              className="w-16 accent-emerald-500 disabled:opacity-30 cursor-pointer h-1"
                            />
                            <span className={`text-xs font-mono w-8 text-right font-medium ${isSelected ? "text-slate-700" : "text-slate-400"}`}>
                              {spec.hoursPerDay}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Clear All action button */}
            {selectedAppliances.some(s => s.quantity > 0) && (
              <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedAppliances([])}
                  className="px-3.5 py-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-655 rounded-lg text-xs font-mono font-medium transition shadow-sm"
                  id="btn-clear-inventory"
                >
                  Clear Appliance Register
                </button>
              </div>
            )}
          </div>

          {/* Sizing Alerts / System Rules Nigeria */}
          {loadWarnings.length > 0 && (
            <div className="bg-amber-50/65 border border-amber-100 rounded-2xl p-5 space-y-3.5 shadow-sm">
              <h3 className="font-sans font-bold text-sm text-amber-800 flex items-center">
                <ShieldAlert className="h-5 w-5 text-amber-600 mr-2 shrink-0" />
                Regional Grid Integration Advisories
              </h3>
              <div className="space-y-2">
                {loadWarnings.map((warn, index) => (
                  <p key={index} className="text-xs text-slate-600 leading-relaxed border-l-2 border-amber-300 pl-3">
                    {warn}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TECHNICAL OUTPUT RECOMMENDATIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SCOREBOARD CALCULATED AUDIT METRICS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <h2 className="font-sans font-bold text-lg text-slate-900 flex items-center mb-5">
              <span className="h-5 w-1 bg-emerald-500 rounded mr-2.5"></span>
              Electrical Load Summary
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Watts Load</span>
                <span className="text-2xl font-mono font-bold text-slate-900 mt-1">{recommendations.totalWattage} W</span>
                <span className="text-[10px] font-mono text-slate-400 mt-2">Active Surge Capacity</span>
              </div>
              <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex flex-col">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-wider">Daily Consumption</span>
                <span className="text-2xl font-mono font-bold text-emerald-700 mt-1">{recommendations.dailyEnergykWh.toFixed(2)} kWh</span>
                <span className="text-[10px] font-mono text-slate-400 mt-2">Daily Wh: {recommendations.dailyEnergyWh}</span>
              </div>
            </div>

            {/* Slider for backup hours */}
            <div className="mt-5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-600 flex items-center">
                  <BatteryCharging className="h-4 w-4 text-emerald-600 mr-1.5" />
                  Nocturnal Battery Autonomy:
                </span>
                <span className="text-sm font-mono font-bold text-emerald-700">{backupHours} Hours</span>
              </div>
              <input 
                type="range"
                min="2"
                max="24"
                step="2"
                value={backupHours}
                onChange={(e) => setBackupHours(parseInt(e.target.value))}
                className="w-full accent-emerald-555 h-2 bg-slate-200 rounded-lg cursor-pointer"
                id="slider-backup-hours"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                <span>2h (Shorter cycle)</span>
                <span>12h (Overnight standard)</span>
                <span>24h (Full Autonomy)</span>
              </div>
            </div>
          </div>

          {/* RECOMENDATION PANELS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
            <h2 className="font-sans font-bold text-lg text-slate-900 flex items-center mb-5">
              <span className="h-5 w-1 bg-emerald-500 rounded mr-2.5"></span>
              Sized System Configuration
            </h2>

            {selectedAppliances.filter(s => s.quantity > 0).length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                <Zap className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-sans">No appliances active in registry.</p>
                <p className="text-xs font-mono text-slate-400 mt-1">Select items in the auditor to size a system.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                
                {/* INVERTER RECOMMEDATION */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3.5 relative overflow-hidden">
                  <div className="p-2 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Recommended Inverter Rating</h4>
                    <span className="text-lg font-bold text-slate-900">{recommendations.inverterKVA} Pure Sine Wave Inverter</span>
                    <p className="text-xs text-slate-600 mt-2 font-sans tracking-normal leading-relaxed">
                      {recommendations.inverterNotes}
                    </p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700">
                      Standard Voltages: {recommendations.systemVoltage}V DC Input Base
                    </span>
                  </div>
                </div>

                {/* BATTERY CONFIGURATION */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3.5 relative overflow-hidden">
                  <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-605 rounded-xl shrink-0">
                    <BatteryCharging className="h-5 w-5" />
                  </div>
                  <div className="w-full">
                    <h4 className="text-[11px] font-mono uppercase text-slate-550 tracking-wider">Required Battery Bank</h4>
                    <span className="text-lg font-bold text-slate-900">{recommendations.batteryCapAh} Ah Nominal Reservoir</span>
                    
                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                      <div className="flex flex-col bg-white p-2 border border-slate-200/60 rounded">
                        <span className="text-[10px] font-mono font-medium text-emerald-700 uppercase">Option A: Robust Tubular (Deep-Cycle Wet-Cell)</span>
                        <span className="text-xs text-slate-600 mt-1 leading-relaxed">{recommendations.batteriesTubularText}</span>
                      </div>
                      <div className="flex flex-col bg-white p-2 border border-slate-200/60 rounded">
                        <span className="text-[10px] font-mono font-medium text-cyan-705 uppercase">Option B: High End Lithium LiFePO4</span>
                        <span className="text-xs text-slate-600 mt-1 leading-relaxed">{recommendations.batteriesLithiumText}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                      *Config: {recommendations.batteryConfigText}
                    </p>
                  </div>
                </div>

                {/* SOLAR PANEL ARRAY */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3.5 relative overflow-hidden">
                  <div className="p-2 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-xl shrink-0">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Solar Array Recommendations</h4>
                    <span className="text-lg font-bold text-slate-900">{recommendations.requiredSolarCapacityW}W Peak Photovoltaic Sizing</span>
                    <p className="text-xs text-indigo-700 mt-1 font-mono">{recommendations.solarConfigText}</p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-3.5">
                      <div className="bg-white border border-slate-200 p-2.5 rounded">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Charge Controller</span>
                        <p className="text-sm font-mono text-slate-700 font-bold mt-1">≥ {recommendations.chargeControllerAmps}A MPPT</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded">
                        <span className="text-[9px] font-mono text-slate-550 uppercase">Average Daily Yield</span>
                        <p className="text-sm font-mono text-slate-700 font-bold mt-1">{(recommendations.dailyEnergykWh * 1.15).toFixed(1)} kWh/d</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3.5 leading-relaxed font-sans">
                      Estimates apply a 20% system wiring factor loss and assume an average of 5 hours solar peak sunshine (PSH) typical for southern/middle-belt regions of Nigeria.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION */}
      {selectedAppliances.some((item) => item.quantity > 0) && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="charts-visualization">
          
          {/* Chart 1: Surge Wattage Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <Zap className="h-4 w-4 text-emerald-600 mr-1.5" />
              Surge demand distribution (Watts)
            </h3>
            <div className="h-64 h-full" id="wattage-bar-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={wattageChartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  />
                  <Bar dataKey="TotalWatts" fill="#10b981">
                    {wattageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.TotalWatts > 1000 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
              Devices exceeding 1,000 Watts (shown in Red) represent severe inductive loads.
            </p>
          </div>

          {/* Chart 2: Daily kWh Consumption Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <Sun className="h-4 w-4 text-emerald-600 mr-1.5" />
              Daily Energy consumption (kWh)
            </h3>
            <div className="h-64 h-full" id="energy-pie-chart">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={kwhChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="kWh"
                  >
                    {kwhChartData.map((entry, index) => {
                      const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
              Share of Wh based on quantity and runtime. Swap heaters for passive devices to reduce size.
            </p>
          </div>

          {/* Chart 3: Battery autonomy curves */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm md:col-span-2 lg:col-span-1">
            <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <BatteryCharging className="h-4 w-4 text-emerald-600 mr-1.5" />
              Autonomy discharge curve
            </h3>
            <div className="h-64 h-full" id="battery-depletion-chart">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={batteryDepletionData}>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[40, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Tubular wet-cell SOC (%)" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                  <Area type="monotone" dataKey="Lithium LiFePO4 SOC (%)" stroke="#06b6d4" fillOpacity={0.15} fill="#06b6d4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
              Simulated depletion rate over {backupHours} hours of deep cycle continuous draw.
            </p>
          </div>

        </div>
      )}

      {/* ACCORDION SYSTEM TIPS FOR ENERGY SAVINGS */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center mb-4">
          <FileCheck className="h-5 w-5 text-emerald-650 mr-2.5" />
          Household Energy-Saving Practices
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Reducing your initial load profile significantly shrinks your inverter, solar, and battery sizing profiles, dramatically decreasing direct financial setup thresholds in Nigeria.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
            <span className="text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">1. Swapping Passive Loads</span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Traditional incandescent lamps pull 60W-100W each. Swapping to high-efficiency LED lights (8W-12W) reduces lighting power requirements by 85% instantly.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
            <span className="text-xs font-mono font-semibold text-cyan-700 uppercase tracking-wider">2. DC Fan Transition</span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Standard AC ceiling fans consume 75W-100W each. Modern brushless DC (BLDC) ceiling fans operate at just 20W-25W while pushing comparable airflow, extending battery life.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-700 uppercase tracking-wider">3. Daytime Sump Interlocking</span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Water pumps draw high surge currents (1000W+). Run your borehole pump strictly mid-day (12 PM - 2 PM) when solar panels are fully engaged on bypass, leaving batteries untapped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
