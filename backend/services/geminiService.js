const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyzes an emergency description using Gemini AI
 * Returns: { level, advice, skillsNeeded }
 */
exports.analyzeEmergency = async (description) => {
  if (!process.env.GEMINI_API || process.env.GEMINI_API === 'your_google_gemini_api_key_here') {
    console.warn("--- GEMINI AI: API Key missing, returning fallback analysis");
    return { 
      level: null, 
      advice: "Stay calm and wait for staff to arrive.", 
      skillsNeeded: ["other"] 
    };
  }

  try {
    const prompt = `
      You are an emergency response AI for a campus security system.
      Analyze this emergency description and return ONLY a valid JSON object.
      
      Description: "${description}"

      Return JSON format:
      {
        "level": "1" (Minor), "2" (Moderate), or "3" (Critical),
        "advice": "Short, 1-sentence safety instruction for the person reporting",
        "skillsNeeded": ["medical", "fire", "security", "maintenance", or "other"]
      }

      Logic for levels:
      - Level 3: Life-threatening, heavy fire, active crime, unconsciousness.
      - Level 2: Moderate injury, small fire, water leak, broken equipment.
      - Level 1: Minor request, lost item, general question.

      ONLY RETURN THE JSON, NO EXTRA TEXT.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON string in case AI adds markdown code blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("--- GEMINI AI ERROR:", error.message);
    return { 
      level: null, 
      advice: "Staff have been notified. Please stay safe.", 
      skillsNeeded: ["other"] 
    };
  }
};

/**
 * Generates live system-wide suggestions based on current status
 * Returns: Array of { title, description, priority, type }
 */
exports.getSystemSuggestions = async (systemType, alerts, staff) => {
  if (!process.env.GEMINI_API || process.env.GEMINI_API === 'your_google_gemini_api_key_here') {
    return [
      { title: "AI Offline", description: "Connect Gemini API for live insights.", priority: "medium", type: "protocol" }
    ];
  }

  try {
    const activeAlerts = alerts.filter(a => a.status !== 'resolved');
    const availableStaff = staff.filter(s => s.availability === 'available');

    const prompt = `
      You are an AI Campus Safety Consultant for a "${systemType}" system.
      Current Status:
      - Active Emergencies: ${activeAlerts.length}
      - Total Alerts: ${alerts.length}
      - Available Staff: ${availableStaff.length} / Total Staff: ${staff.length}

      Based on this REAL DATA, suggest 3 immediate actions for the Admin.
      Return ONLY a valid JSON array of objects.
      
      Format:
      [
        {
          "title": "Short title",
          "description": "Specific advice based on the numbers above",
          "priority": "high", "medium", or "low",
          "type": "staff", "setting", "protocol", or "training"
        }
      ]

      Example logic:
      - If alerts > available staff, suggest adding more staff or changing protocols.
      - If all clear, suggest training or drill.

      ONLY RETURN THE JSON ARRAY.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("--- GEMINI SUGGESTIONS ERROR:", error.message);
    return [];
  }
};

