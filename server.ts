import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import properties from "./src/data/properties.json" assert { type: "json" };
import { SearchCriteria, Property, AgentApiResponse } from "./src/types";

// Create Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client with safety checks
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): { client: GoogleGenAI; modelName: string } | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return { client: genAIClient, modelName: "gemini-3.5-flash" };
}

// Simple rule-based Arabic/English fallback extractor for resilience
function fallbackSearch(userQuery: string): AgentApiResponse {
  const query = userQuery.toLowerCase();
  
  // Initialize criteria
  const criteria: SearchCriteria = {
    city: null,
    district: null,
    budget: null,
    propertyType: null,
    purpose: null,
    bedrooms: null,
    bathrooms: null,
    parking: null,
    furnishing: null,
    preferences: null,
  };

  // Determine language (Arabic check)
  const isArabic = /[\u0600-\u06FF]/.test(userQuery);

  // Heuristic extraction
  // City
  if (query.includes("riyadh") || query.includes("الرياض")) {
    criteria.city = "Riyadh";
  } else if (query.includes("jeddah") || query.includes("جدة") || query.includes("جده")) {
    criteria.city = "Jeddah";
  } else if (query.includes("dammam") || query.includes("الدمام")) {
    criteria.city = "Dammam";
  } else if (query.includes("khobar") || query.includes("الخبر")) {
    criteria.city = "Al-Khobar";
  }

  // Property Type
  if (query.includes("villa") || query.includes("فيلا") || query.includes("فلة") || query.includes("فلل")) {
    criteria.propertyType = "villa";
  } else if (query.includes("townhouse") || query.includes("تاون هاوس") || query.includes("تاونهاوس")) {
    criteria.propertyType = "townhouse";
  } else if (query.includes("studio") || query.includes("استوديو") || query.includes("ستوديو")) {
    criteria.propertyType = "studio";
  } else if (query.includes("apartment") || query.includes("flat") || query.includes("شقة") || query.includes("شقه") || query.includes("شقق")) {
    criteria.propertyType = "apartment";
  }

  // Purpose
  if (query.includes("sale") || query.includes("buy") || query.includes("purchase") || query.includes("شراء") || query.includes("للبيع") || query.includes("بيع")) {
    criteria.purpose = "sale";
  } else {
    // Default to rent since most dynamic queries are rents, unless sale is found
    criteria.purpose = "rent";
  }

  // Furnishing
  if (query.includes("furnished") || query.includes("مفروش") || query.includes("مؤثث") || query.includes("مأثث")) {
    criteria.furnishing = "furnished";
  } else if (query.includes("semi") || query.includes("شبه مؤثث") || query.includes("شبه مفروش")) {
    criteria.furnishing = "semi-furnished";
  } else if (query.includes("unfurnished") || query.includes("غير مؤثث") || query.includes("غير مفروش")) {
    criteria.furnishing = "unfurnished";
  }

  // Parking
  if (query.includes("parking") || query.includes("garage") || query.includes("موقف") || query.includes("كراج") || query.includes("باركنج")) {
    criteria.parking = true;
  }

  // Budget
  const budgetMatches = query.match(/(?:under|below|less than|budget|sar|ر.س|تحت|أقل من|اقل من|حدود)\s*(\d+[\d,]*)/);
  if (budgetMatches && budgetMatches[1]) {
    criteria.budget = parseInt(budgetMatches[1].replace(/,/g, ""), 10);
  }

  // Bedrooms / Bathrooms numbers
  const bedMatches = query.match(/(\d+)\s*(?:bedroom|bed|br|غرفه|غرفة|غرف)/);
  if (bedMatches && bedMatches[1]) {
    criteria.bedrooms = parseInt(bedMatches[1], 10);
  } else if (query.includes("one bedroom") || query.includes("غرفة واحدة") || query.includes("غرفه واحده")) {
    criteria.bedrooms = 1;
  } else if (query.includes("two bedroom") || query.includes("غرفتين") || query.includes("غرفتان")) {
    criteria.bedrooms = 2;
  } else if (query.includes("three bedroom") || query.includes("ثلاث غرف") || query.includes("ثلاثة غرف")) {
    criteria.bedrooms = 3;
  }

  const bathMatches = query.match(/(\d+)\s*(?:bathroom|bath|ba|حمام|حمامات)/);
  if (bathMatches && bathMatches[1]) {
    criteria.bathrooms = parseInt(bathMatches[1], 10);
  }

  // Filter properties mechanically
  let filtered = (properties as Property[]).filter((p) => {
    if (criteria.city && p.city.toLowerCase() !== criteria.city.toLowerCase()) return false;
    if (criteria.propertyType && p.propertyType.toLowerCase() !== criteria.propertyType.toLowerCase()) return false;
    if (criteria.purpose && p.purpose !== criteria.purpose) return false;
    if (criteria.bedrooms && p.bedrooms < criteria.bedrooms) return false;
    if (criteria.furnishing && p.furnishingStatus !== criteria.furnishing) return false;
    if (criteria.parking && p.parking !== criteria.parking) return false;
    if (criteria.budget && p.price > criteria.budget) return false;
    return true;
  });

  // If no strict matches, relax criteria starting from budget/district
  if (filtered.length === 0) {
    filtered = (properties as Property[]).filter((p) => {
      if (criteria.city && p.city.toLowerCase() !== criteria.city.toLowerCase()) return false;
      if (criteria.propertyType && p.propertyType.toLowerCase() !== criteria.propertyType.toLowerCase()) return false;
      if (criteria.purpose && p.purpose !== criteria.purpose) return false;
      return true;
    });
  }

  const matches = filtered.slice(0, 4);

  const welcomeMessage = isArabic
    ? `أهلاً بك! لقد قمت بتحليل طلبك باستخدام محرك التصفية المحلّي (ملاحظة: للحصول على كامل قوة الذكاء الاصطناعي مضافاً إليها التحليل الدقيق، يُرجى تفعيل مفتاح GEMINI_API_KEY في الإعدادات). إليك تفاصيل البحث الموصى بها:`
    : `Welcome! I've analyzed your request using our local matching engine (Note: For full AI reasoning and conversational clarity, please integrate the GEMINI_API_KEY in Settings). Here is what we found matching your request:`;

  const explanations = matches.map((p) => {
    const reason = isArabic
      ? `هذا العقار يقع في حي ${p.district} بمدينة ${p.city}، يحتوي على ${p.bedrooms} غرف نوم وبسعر مناسب قدره ${p.price} ريال سعودي، يطابق نوع طلبك بشكل جيد.`
      : `This property is located in ${p.district}, ${p.city} with ${p.bedrooms} bedrooms at a reasonable rate of ${p.price} SAR ${p.pricePeriod === 'monthly' ? '/month' : ''}, which aligns nicely with your request parameters.`;
    return {
      propertyId: p.id,
      reason,
    };
  });

  const followUpQuestions = isArabic
    ? [
        criteria.city ? "" : "في أي مدينة تبحث عن العقار؟ (الرياض، جدة، الدمام، الخبر)",
        criteria.budget ? "" : "ما هي الميزانية التقريبية التي حددتها (بالريال السعودي)؟",
        criteria.propertyType ? "" : "ما هو نوع العقار المفضل؟ (شقة، فيلا، تاون هاوس، استوديو)",
      ].filter(Boolean)
    : [
        criteria.city ? "" : "Which city are you looking to settle in? (Riyadh, Jeddah, Dammam, Al-Khobar)",
        criteria.budget ? "" : "What is your approximate budget ceiling in SAR?",
        criteria.propertyType ? "" : "What type of property do you prefer? (Apartment, Villa, Townhouse, Studio)",
      ].filter(Boolean);

  return {
    success: true,
    message: welcomeMessage,
    extractedCriteria: criteria,
    recommendedProperties: matches,
    explanations,
    followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : (isArabic ? ["هل ترغب في تحديد حي معيّن للتصفية بشكل أدق؟"] : ["Would you like to specify a preferred district to narrow down the search?"]),
  };
}

// HTTP API endpoint for AI property consults
app.post("/api/chat", async (req, res) => {
  const { query, history } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  const aiSetup = getGeminiClient();

  // If Gemini API is missing or not provided, run the resilient fallback
  if (!aiSetup) {
    console.log("No Gemini API key detected inside environment variables. Returning robust fallback matching.");
    const fallback = fallbackSearch(query);
    return res.json(fallback);
  }

  const { client, modelName } = aiSetup;

  try {
    // We compose a strong, structured system systemInstruction passing the database to the context
    const datasetBriefString = JSON.stringify(properties, null, 2);

    const systemInstruction = `
      You are an expert, highly sophisticated AI Real Estate Property Recommendation Agent.
      You assist clients looking for properties in Saudi Arabia (mainly Riyadh, Jeddah, Dammam, Al-Khobar).
      You speak fluently in both Arabic and English. You MUST respond, write messages, explain reasons, and suggest questions in the same language the user is chatting with you (Arabic if they speak Arabic, English if English).

      Database of available properties (STRICT SINGLE SOURCE OF TRUTH):
      ${datasetBriefString}

      CRITICAL RULES:
      1. ONLY recommend and select property IDs that exist explicitly in the database above. Do not invent, hallucinate, or assume any property holds other attributes.
      2. Recommend the best 3 to 5 matching properties from the dataset that match the user request.
      3. If no properties fit the criteria exactly, recommend 2 to 3 properties that are closest or next-best alternatives (e.g., slightly above budget, or in a neighboring district, or a different but similar housing type) and explain clearly why you are offering them as alternative matches.
      4. Carefully fill out all of the "extractedCriteria" fields. If the user didn't mention details (e.g. city, budget, bedrooms etc.), leave them as null in the criteria object.
      5. Formulate solid "followUpQuestions" in the matching language if any crucial criteria (e.g., city, budget, rent vs sale preference) are missing or ambiguous.
      6. Provide a highly professional, polite "message" explaining the recommendations broadly and welcoming their feedback, written in the matching language.
      7. Provide exact personalized "reasons" for each recommended property detailing precisely why it fits or how it serves as a smart alternative.
    `;

    // Package previous context for Gemini so we have true chat multi-turn comprehension
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add current prompt to history
    formattedHistory.push({
      role: "user",
      parts: [{ text: query }]
    });

    const response = await client.models.generateContent({
      model: modelName,
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["message", "extractedCriteria", "recommendedPropertyIds", "explanations", "followUpQuestions"],
          properties: {
            message: {
              type: Type.STRING,
              description: "The primary friendly message explaining the recommendations or requesting missing info, in the language matching the user's input."
            },
            extractedCriteria: {
              type: Type.OBJECT,
              description: "Criteria current values parsed from chat history.",
              properties: {
                city: { type: Type.STRING, description: "Normalized city name (e.g., Riyadh, Jeddah, Dammam, Al-Khobar) or null" },
                district: { type: Type.STRING, description: "District name or null" },
                budget: { type: Type.NUMBER, description: "Extracted numeric budget cap or null" },
                propertyType: { type: Type.STRING, description: "apartment, villa, townhouse, studio, or null" },
                purpose: { type: Type.STRING, description: "rent, sale, or null" },
                bedrooms: { type: Type.INTEGER, description: "Number of bedrooms or null" },
                bathrooms: { type: Type.INTEGER, description: "Number of bathrooms or null" },
                parking: { type: Type.BOOLEAN, description: "True/false or null if parking was mentioned" },
                furnishing: { type: Type.STRING, description: "furnished, semi-furnished, unfurnished, or null" },
                preferences: { type: Type.STRING, description: "Other user requests summarized, e.g. views, location walkability, new build" },
              }
            },
            recommendedPropertyIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of matching existing property IDs from the database (e.g. PROP-001)"
            },
            explanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["propertyId", "reason"],
                properties: {
                  propertyId: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "Localized, persuasive fit reasoning in the matching language of user." }
                }
              }
            },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fabulous, tailored follow-up questions to clarify missing parameters."
            }
          }
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");

    // Match recommendedPropertyIds back to real property data objects
    const recommendedListings = (properties as Property[]).filter((p) =>
      (parsedResponse.recommendedPropertyIds || []).includes(p.id)
    );

    res.json({
      success: true,
      message: parsedResponse.message,
      extractedCriteria: parsedResponse.extractedCriteria,
      recommendedProperties: recommendedListings,
      explanations: parsedResponse.explanations,
      followUpQuestions: parsedResponse.followUpQuestions,
    });
  } catch (error: any) {
    console.error("Gemini API Error occurred:", error);
    // Return graceful fallback state with details of error
    const fallback = fallbackSearch(query);
    res.json({
      ...fallback,
      error: error.message || "An error occurred with GenAI. Switched to responsive local search engine fallback."
    });
  }
});

// Serve properties directly for the direct browse screen
app.get("/api/properties", (req, res) => {
  res.json(properties);
});

// Configure Vite integration
async function main() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Real Estate Agent Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Starting server collapsed due to error:", err);
});
