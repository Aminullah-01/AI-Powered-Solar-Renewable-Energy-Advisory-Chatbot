/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("⚠️ GEMINI_API_KEY workspace secret is not configured or left as default. Using robust Rule-Based Advisor fallback engine.");
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Appliance database for rule-based parsing
const APPLIANCES = [
  { id: "led_bulb", names: ["bulb", "bulbs", "led", "lamp", "lamps", "light", "lights"], watts: 10 },
  { id: "ceiling_fan", names: ["ceiling fan", "ceiling fans", "fan_ceiling"], watts: 75 },
  { id: "standing_fan", names: ["standing fan", "standing fans", "fan", "fans", "aerator"], watts: 100 },
  { id: "refrigerator", names: ["fridge", "fridges", "refrigerator", "refrigerators", "cooling cabinet"], watts: 150 },
  { id: "freezer", names: ["freezer", "freezers", "deep freezer"], watts: 250 },
  { id: "television", names: ["tv", "television", "televisions", "screen", "screens", "led tv"], watts: 120 },
  { id: "decoder", names: ["decoder", "decoders", "dstv", "gotv", "startimes", "cable tv"], watts: 20 },
  { id: "laptop", names: ["laptop", "laptops", "notebook"], watts: 65 },
  { id: "desktop", names: ["desktop", "desktop computer", "pc", "personal computer"], watts: 250 },
  { id: "air_conditioner", names: ["air conditioner", "ac", "aircon", "acs", "split unit"], watts: 1500 },
  { id: "washing_machine", names: ["washing machine", "washer", "wash machine"], watts: 500 },
  { id: "microwave", names: ["microwave", "microwaves", "microwave oven"], watts: 1200 },
  { id: "water_pump", names: ["pump", "pumps", "water pump", "pumping machine"], watts: 1000 }
];

/**
 * Local Rule-Based parsing and conversation engine
 * Handled if Gemini API is disabled, offline, or key is unconfigured.
 */
function handleRuleBasedChat(message: string): { reply: string; appliances: { presetId: string; quantity: number }[] } {
  const norm = message.toLowerCase();
  const detected: { presetId: string; quantity: number }[] = [];

  // Parse appliances. E.g. "3 fans, 1 fridge, and 5 bulbs"
  APPLIANCES.forEach((app) => {
    app.names.forEach((name) => {
      // Look for patterns like "3 fans", "3 standing fans", "one bulb", "a fridge"
      // Match a number followed by optional spaces, then the appliance name
      const regexPatterns = [
        new RegExp(`(\\d+)\\s*${name}\\b`, 'g'),
        new RegExp(`(?:a|an|one)\\s+${name}\\b`, 'g')
      ];

      regexPatterns.forEach((regex, idx) => {
        let match;
        while ((match = regex.exec(norm)) !== null) {
          const qty = idx === 1 ? 1 : parseInt(match[1]);
          if (qty > 0) {
            const existing = detected.find(d => d.presetId === app.id);
            if (existing) {
              existing.quantity += qty;
            } else {
              detected.push({ presetId: app.id, quantity: qty });
            }
          }
        }
      });
    });
  });

  let reply = "";

  // Structure reply based on keyword triggers
  if (norm.includes("beep") || norm.includes("beeping") || norm.includes("sound")) {
    reply = `### Inverter Beeping Troubleshooting Diagnostic
An inverter beep is a critical telemetry signal alerting you to system factors. Here is the diagnostic breakdown:

1. **Continuous Steady Beeping**: 
   - **Possible Cause**: Severe Overload. You have exceeded the rated rating (Inverter size).
   - **Diagnostic**: Look at the active appliance draw. Are you running heavy loads (like refrigerator startup or water pumps) at the same time?
   - **Recommended Solution**: Instantly turn off heavy appliances. Restart the inverter.
   
2. **Intermittent Rapid Beeping / Red Light**:
   - **Possible Cause**: Low Battery Warning.
   - **Diagnostic**: Check battery voltage status. If it reads below 10.5V (for 12V) or 21V (for 24V), the cutoff threshold is near.
   - **Recommended Solution**: Switch off all loads and wait for solar panel charging or utility power to restore battery state. Reduce nighttime loads.

3. **Beep with Temp / Fault Indicator**:
   - **Possible Cause**: Thermal shutdown or internal electronics fault.
   - **Safety Precaution**: Keep the inverter in a well-ventilated space. Do not place objects on top. Ensure its internal cooling fan is spinning.`;
  } else if (norm.includes("drain") || norm.includes("fast") || norm.includes("quickly") || norm.includes("not lasting")) {
    reply = `### Solar Battery Draining Rapidly: Action Plan
In Lagos and across Nigeria, deep cycle batteries are modeled to last years, but frequent deep discharges degrade capacity. Here is why your battery bank might be draining fast:

1. **High Base Load at Night**:
   - **Explanation**: Unconscious high standby draws. Running multiple ceiling fans (75W each), standard old TVs, or leaving water pumps on during the night draws persistent current.
   - **Solution**: Switch off heavy appliances, swap standing fans for energy-efficient DC fans, and turn off refrigerators at night index if they are already cold.

2. **Battery Sulfation / Age**:
   - **Explanation**: Lead-acid batteries must hit 100% full state repeatedly to stave off sulfation. If solar panels didn't charge them fully for days (due to rain/clouds), they degrade.
   - **Solution**: Run a controlled "Equalization Charge" from your inverter utility inputs, or check acid levels (for tubular batteries) and top up with distilled water.

3. **Wrong System Sizing**:
   - **Explanation**: Your backup load exceeds battery reservoir (Ah rating).
   - **Action**: Use the interactive **Load Calculator** tab above to check whether your battery bank capacity (Ah) matches your active household profile.`;
  } else if (norm.includes("charge") || norm.includes("charging") || norm.includes("no solar") || norm.includes("panel")) {
    reply = `### Why Solar Panels Are Not Charging: Diagnostics
If your charge controller is showing 0A charging current during daytime, run this technical inspection Checklist:

1. **Dust and Soot Accumulation**:
   - **Cause**: Dust, dry-season dust (harmattan), or soot from nearby power generators block sunlight.
   - **Solution**: Power off solar circuit breaker. Use water and a soft rag to wash panel surfaces. Run this early in the morning before panels get hot to prevent thermal glass shock!

2. **Loose or Burnt Connections**:
   - **Cause**: Harsh Nigerian sun degrades low-grade PVC wiring or MC4 connectors.
   - **Diagnostic**: Unscrew the Solar input terminals on your charge controller and probe the DC voltage using a multimeter.
   
3. **Breaker Tripped / Fuse Blown**:
   - **Solution**: Trace the wires from the roof. Doublecheck direct current circuit breakers or inline blade fuses in the battery/solar route.`;
  } else if (detected.length > 0) {
    const itemsText = detected.map(d => {
      const p = APPLIANCES.find(a => a.id === d.presetId);
      return `- **${d.quantity} × ${p ? p.names[0].toUpperCase() : d.presetId}** (${p ? p.watts : 10}W)`;
    }).join("\n");
    
    reply = `### Electrical load Audit & Calculation
I have completed a scan of your household load profile:

**Detected Appliance Breakdown:**
${itemsText}

Using standard advisory matrices, we have populated your **Load Calculator & Recommendation Dashboard**! 

Click on the **Results Dashboard** tab above to interactively examine your total wattage, daily Wh requirement, required Pure Sine Wave Inverter size, necessary deep cycle battery bank (tubular or lithium), and matching solar panel config.`;
  } else {
    reply = `### Welcome to Nigeria's Intelligent Renewable Energy Advisory Assistant! ☀️🔋
I am your solar consultant, developed for homes and small businesses in Lagos, Abuja, Kano, Port Harcourt, and across the federation. 

I can assist you to size, troubleshoot, and optimize your backup solar system. Here is what you can ask me:

1. **Sizing Inquiry**: *"I have 2 ceiling fans, 3 LED bulbs, 1 TV, and a fridge. What solar setup is appropriate?"*
2. **Troubleshooting**: *"Why is my inverter making a continuous beeping sound?"* or *"My batteries drop fast at 2 AM, what do I do?"*
3. **Optimizing**: *"How do I keep my backup system running reliably through the rainy season?"*

*Tip: Please write your exact appliances, and I will automatically populate the Interactive Calculator for you!*`;
  }

  return { reply, appliances: detected };
}

// REST endpoints
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message parameter is required." });
  }

  const client = getGeminiClient();

  if (!client) {
    // API key missing or unconfigured. Run rule-based local advisory directly.
    const offlineResult = handleRuleBasedChat(message);
    return res.json({
      text: offlineResult.reply,
      parsedData: {
        appliances: offlineResult.appliances.map(app => {
          const presetObj = APPLIANCES.find(a => a.id === app.presetId);
          return {
            name: presetObj ? presetObj.names[0] : app.presetId,
            qty: app.quantity,
            watts: presetObj ? presetObj.watts : 10,
            hours: 8
          };
        }),
      }
    });
  }

  try {
    // API is available. Use the recommended @google/genai SDK schema definition for perfect structured parsing!
    const systemPrompt = `
You are an expert Solar & Renewable Energy Advisor chatbot designed to help homes and small businesses in Nigeria transition to solar energy.
You must speak in a highly professional, encouraging, technical yet accessible tone. Address regional realities like the unstable public grid (NEPA/PHCN), reliance on petrol generators, harmattan dust on panels, and thermal impact on batteries in Nigeria.

Your goal is to reply conversationally AND parse any electrical appliances and quantities mentioned in the user's message.
You must return a structured JSON response matching the schema defined.
    
Make sure the "reply" field uses clean Markdown syntax. Use headings, bullet points, and numbered lists to structure your diagnostic steps, backup calculations, and solutions clearly.
    
Supported preset appliance IDs for parsing are exactly:
- led_bulb (10W, default: 8 hrs)
- ceiling_fan (75W, default: 10 hrs)
- standing_fan (100W, default: 10 hrs)
- refrigerator (150W, default: 24 hrs)
- freezer (250W, default: 24 hrs)
- television (120W, default: 6 hrs)
- decoder (20W, default: 6 hrs)
- laptop (65W, default: 8 hrs)
- desktop (250W, default: 6 hrs)
- air_conditioner (1500W, default: 6 hrs)
- washing_machine (500W, default: 2 hrs)
- microwave (1200W, default: 1 hr)
- water_pump (1000W, default: 1 hr)

If the user lists appliances (e.g. "I have 3 standing fans and a small fridge"), search and extract these into the "appliances" array using the matching preset IDs and appropriate quantities.
    
If the user asks troubleshooting questions (such as beeping inverters or fast-draining batteries), explain the causes (e.g., overload, sulfation, dust), diagnostic steps, safety protocols, and tips clearly in the "reply" string, leaving "appliances" array empty unless they also state their appliance inventory. Keep it friendly.
`;

    // Construct format history
    const geminiHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add current user prompt
    const contents = [
      ...geminiHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const modelResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Markdown formatted conversational response to the user's inquiry."
            },
            appliances: {
              type: Type.ARRAY,
              description: "List of appliances extracted from user input. Keep empty if user did not state appliances.",
              items: {
                type: Type.OBJECT,
                properties: {
                  presetId: {
                    type: Type.STRING,
                    description: "Matching preset ID. Choose strictly from the supported list (e.g. led_bulb, ceiling_fan...)"
                  },
                  quantity: {
                    type: Type.INTEGER,
                    description: "Number of units mentioned."
                  }
                },
                required: ["presetId", "quantity"]
              }
            }
          },
          required: ["reply"]
        }
      }
    });

    const resultText = modelResponse.text ? modelResponse.text.trim() : "{}";
    const resultJson = JSON.parse(resultText);

    // Filter parsed appliances to match presets or map them
    const parsedAppliances = (resultJson.appliances || []).map((app: any) => {
      const spec = APPLIANCE_PRESETS_W_SPECS[app.presetId] || { name: app.presetId, watts: 10, hours: 8 };
      return {
        name: spec.name,
        presetId: app.presetId,
        qty: app.quantity,
        watts: spec.watts,
        hours: spec.hours
      };
    });

    res.json({
      text: resultJson.reply || "I encountered an error formatting my response. Let me help you with your solar sizing calculations.",
      parsedData: {
        appliances: parsedAppliances
      }
    });

  } catch (err: any) {
    console.error("❌ Gemini API processing error:", err);
    // Fallback in case of Gemini query exceptions
    const offlineResult = handleRuleBasedChat(message);
    res.json({
      text: `*(API Offline Fallback)*\n\n${offlineResult.reply}`,
      parsedData: {
        appliances: offlineResult.appliances.map(app => {
          const presetObj = APPLIANCES.find(a => a.id === app.presetId);
          return {
            name: presetObj ? presetObj.names[0] : app.presetId,
            qty: app.quantity,
            watts: presetObj ? presetObj.watts : 10,
            hours: 8
          };
        })
      }
    });
  }
});

// Preset mapping helper for specs
const APPLIANCE_PRESETS_W_SPECS: Record<string, { name: string; watts: number; hours: number }> = {
  led_bulb: { name: "LED Bulb", watts: 10, hours: 8 },
  ceiling_fan: { name: "Ceiling Fan", watts: 75, hours: 10 },
  standing_fan: { name: "Standing Fan", watts: 100, hours: 10 },
  refrigerator: { name: "Refrigerator", watts: 150, hours: 24 },
  freezer: { name: "Freezer", watts: 250, hours: 24 },
  television: { name: "Television", watts: 120, hours: 6 },
  decoder: { name: "Decoder / DSTV", watts: 20, hours: 6 },
  laptop: { name: "Laptop", watts: 65, hours: 8 },
  desktop: { name: "Desktop Computer", watts: 250, hours: 6 },
  air_conditioner: { name: "Air Conditioner", watts: 1500, hours: 6 },
  washing_machine: { name: "Washing Machine", watts: 500, hours: 2 },
  microwave: { name: "Microwave", watts: 1200, hours: 1 },
  water_pump: { name: "Water Pump", watts: 1000, hours: 1 }
};

// Serving client pages in different environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite dev server as middleware to enable asset compiling on the fly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In prod, serve compiled static HTML assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Solar Adviser Server online on port http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("❌ Critical server startup crash:", e);
});
