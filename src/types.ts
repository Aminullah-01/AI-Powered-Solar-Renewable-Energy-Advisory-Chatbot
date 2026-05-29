/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from "lucide-react";

export interface Appliance {
  id: string;
  name: string;
  defaultWattage: number; // in Watts
  defaultHours: number; // hours per day
  category: "lighting" | "cooling" | "entertainment" | "appliances" | "heavy" | "other";
  iconName: string;
}

export const APPLIANCE_PRESETS: Appliance[] = [
  { id: "led_bulb", name: "LED Bulb", defaultWattage: 10, defaultHours: 8, category: "lighting", iconName: "Lightbulb" },
  { id: "ceiling_fan", name: "Ceiling Fan", defaultWattage: 75, defaultHours: 10, category: "cooling", iconName: "Wind" },
  { id: "standing_fan", name: "Standing Fan", defaultWattage: 100, defaultHours: 10, category: "cooling", iconName: "Wind" },
  { id: "refrigerator", name: "Refrigerator", defaultWattage: 150, defaultHours: 24, category: "appliances", iconName: "ThermometerSnowflake" },
  { id: "freezer", name: "Freezer", defaultWattage: 250, defaultHours: 24, category: "appliances", iconName: "Refrigerator" },
  { id: "television", name: "Television", defaultWattage: 120, defaultHours: 6, category: "entertainment", iconName: "Tv" },
  { id: "decoder", name: "Decoder / DSTV", defaultWattage: 20, defaultHours: 6, category: "entertainment", iconName: "Cpu" },
  { id: "laptop", name: "Laptop", defaultWattage: 65, defaultHours: 8, category: "entertainment", iconName: "Laptop" },
  { id: "desktop", name: "Desktop Computer", defaultWattage: 250, defaultHours: 6, category: "entertainment", iconName: "Monitor" },
  { id: "air_conditioner", name: "Air Conditioner", defaultWattage: 1500, defaultHours: 6, category: "heavy", iconName: "Snowflake" },
  { id: "washing_machine", name: "Washing Machine", defaultWattage: 500, defaultHours: 2, category: "heavy", iconName: "WashingMachine" },
  { id: "microwave", name: "Microwave", defaultWattage: 1200, defaultHours: 1, category: "heavy", iconName: "Zap" },
  { id: "water_pump", name: "Water Pump", defaultWattage: 1000, defaultHours: 1, category: "heavy", iconName: "Droplets" }
];

export interface SelectedAppliance {
  applianceId: string;
  quantity: number;
  hoursPerDay: number;
  wattage: number; // user editable
}

export interface RecommendationResult {
  totalWattage: number; // W
  dailyEnergyWh: number; // Wh
  dailyEnergykWh: number; // kWh
  
  // Inverter recommendations
  inverterKVA: string; // e.g., "1.5kVA"
  inverterType: string; // "Pure Sine Wave Inverter"
  inverterNotes: string;
  
  // Battery recommendations
  systemVoltage: number; // 12, 24, 48
  batteryCapAh: number; // calculated Ah
  batteryCount: number; // number of 12V 200Ah batteries
  batteryConfigText: string; // e.g. "2 in series, 2 in parallel"
  batteriesTubularText: string;
  batteriesLithiumText: string;
  backupHours: number;

  // Solar panel recommendations
  requiredSolarCapacityW: number;
  panelWattageConfig: number; // e.g. 400
  panelCount: number; // number of panels
  solarConfigText: string; // e.g. "4 × 400W Solar Panels"
  chargeControllerAmps: number; // estimated charge controller rating (A)
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  parsedData?: {
    appliances: { name: string; qty: number; watts: number; hours: number; presetId?: string }[];
    results?: RecommendationResult;
  };
}

/**
 * Calculates system configurations based on selected appliances
 */
export function calculateRecommendations(
  selected: SelectedAppliance[],
  backupHours: number = 8
): RecommendationResult {
  // 1. Calculate Total Wattage and Daily Energy
  let totalWattage = 0;
  let dailyEnergyWh = 0;

  selected.forEach((item) => {
    const preset = APPLIANCE_PRESETS.find((p) => p.id === item.applianceId);
    const watts = item.wattage;
    const qty = item.quantity;
    const hrs = item.hoursPerDay;

    totalWattage += watts * qty;
    dailyEnergyWh += watts * qty * hrs;
  });

  const dailyEnergykWh = dailyEnergyWh / 1000;

  // 2. Suitability Inverter Size Recommendation
  // 0–800W -> 1.5kVA
  // 800–1800W -> 3kVA
  // 1800–3500W -> 5kVA
  // 3500–5500W -> 7.5kVA
  // Above 5500W -> 10kVA
  let inverterKVA = "1.5kVA";
  if (totalWattage > 5500) {
    inverterKVA = "10kVA";
  } else if (totalWattage > 3500) {
    inverterKVA = "7.5kVA";
  } else if (totalWattage > 1800) {
    inverterKVA = "5kVA";
  } else if (totalWattage > 800) {
    inverterKVA = "3kVA";
  }

  const inverterType = "Pure Sine Wave";
  const inverterNotes = `A high-efficiency ${inverterKVA} Pure Sine Wave Inverter is recommended to handle the surge currents of your appliances, with a safe margin to protect inductive loads (like refrigerators or water pumps).`;

  // 3. Battery System Sizing
  // Voltage assumptions:
  // - Small systems (Load <= 800W) = 12V
  // - Medium systems (Load > 800W and <= 2200W) = 24V
  // - Large systems (Load > 2200W) = 48V
  let systemVoltage = 12;
  if (totalWattage > 2200) {
    systemVoltage = 48;
  } else if (totalWattage > 800) {
    systemVoltage = 24;
  }

  // Battery Ah Calculation = (Total load in W * backup hours) / Voltage
  // To avoid deep discharging Lead-Acid, we assume 50% depth of discharge (DoD) factor for size.
  // Nominal requirement:
  const baseAhNeeded = (totalWattage * backupHours) / systemVoltage;
  
  // Standard battery cell: 12V 200Ah deep cycle Deep-Cycle
  // Voltage matching series configuration:
  const seriesCount = systemVoltage / 12; // 1, 2, or 4
  
  // Depth of Discharge compensation for lead-acid: 50% DoD means we double capacity
  const designAhNeeded = baseAhNeeded / 0.50; 
  
  // How many parallel branches? Each branch delivers 200Ah
  // parallelCount = ceil(designAhNeeded / 200)
  let parallelCount = Math.ceil(designAhNeeded / 200);
  if (parallelCount === 0 && totalWattage > 0) {
    parallelCount = 1;
  }
  
  const batteryCount = seriesCount * parallelCount;
  
  let batteryConfigText = "No batteries needed";
  if (totalWattage > 0) {
    batteryConfigText = `${batteryCount} × 12V 200Ah batteries configured as ${parallelCount} parallel branch${parallelCount > 1 ? "es" : ""} of ${seriesCount} battery${seriesCount > 1 ? "ies" : ""} in series (${systemVoltage}V system)`;
  }
  
  const batteriesTubularText = `${batteryCount} Deep-Cycle Tubular Batteries (12V 200Ah) - robust, long lifespan under deep recycling, ideal for Nigerian hot climate.`;
  // Lithium equivalents: Typically 1 Lithium battery of e.g. 24V 100Ah or 48V 100Ah provides similar usable Wh because they can discharge 90%.
  // 1 unit of 12V 200Ah lead-acid is roughly equivalent to 1.2kWh of usable energy.
  const usableKWhNeeded = (totalWattage * backupHours) / 1000 / 0.8; // 80% discharge
  const lithiumKWhText = `${usableKWhNeeded.toFixed(1)} kWh usable LiFePO4 Lithium Battery system. Highly efficient, handles 3000+ depth cycles, faster charging.`;

  // 4. Solar Capacity recommendation
  // Capacity = Daily energy Wh / 5 hours (Peak Sun Hours) * 1.2 (for efficiency loss)
  const psh = 5;
  const rawSolarW = (dailyEnergyWh / psh) * 1.2;
  const requiredSolarCapacityW = Math.ceil(rawSolarW);

  // Pick panel rating based on size:
  let panelWattageConfig = 400;
  if (requiredSolarCapacityW < 500) {
    panelWattageConfig = 200;
  } else if (requiredSolarCapacityW < 1200) {
    panelWattageConfig = 300;
  } else if (requiredSolarCapacityW < 3000) {
    panelWattageConfig = 400;
  } else {
    panelWattageConfig = 550;
  }

  const panelCount = requiredSolarCapacityW > 0 
    ? Math.max(1, Math.ceil(requiredSolarCapacityW / panelWattageConfig)) 
    : 0;
  
  const solarConfigText = requiredSolarCapacityW > 0
    ? `${panelCount} × ${panelWattageConfig}W Monocrystalline Solar Panels (${(panelCount * panelWattageConfig / 1000).toFixed(2)} kWp total)`
    : "No panels required";

  // Charge controller sizing: Solar wattage / system voltage with a safety multiplier (1.25)
  const chargeControllerAmps = requiredSolarCapacityW > 0
    ? Math.ceil((requiredSolarCapacityW / systemVoltage) * 1.25)
    : 0;

  return {
    totalWattage,
    dailyEnergyWh,
    dailyEnergykWh,
    inverterKVA,
    inverterType,
    inverterNotes,
    systemVoltage,
    batteryCapAh: Math.round(baseAhNeeded),
    batteryCount,
    batteryConfigText,
    batteriesTubularText,
    batteriesLithiumText: lithiumKWhText,
    backupHours,
    requiredSolarCapacityW,
    panelWattageConfig,
    panelCount,
    solarConfigText,
    chargeControllerAmps
  };
}
