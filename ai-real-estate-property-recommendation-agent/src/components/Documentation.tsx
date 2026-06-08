import React from "react";
import { BookOpen, Terminal, Sparkles, AlertTriangle, FastForward, Info } from "lucide-react";

export default function Documentation() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 p-5 space-y-6 overflow-y-auto max-h-[500px]">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          Technical & Matching Documentation
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Detailed guide covering prompt engineering, database matching logic, and limitation outlines.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
        {/* Section 1: How AI is Used */}
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            1. Role of AI or Gemini in this System
          </h4>
          <p className="mb-2">
            This agent builds a seamless bridge between ambiguous natural language queries and a rigid property database schema. The AI fulfills multiple critical functions:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Structured Criteria Extraction:</strong> Converts natural utterances (such as <em>"furnished family flat Riyadh budget 7k"</em>) into programmatic constraints (<em>city: Riyadh, furnishing: furnished, budget: 7000</em>).
            </li>
            <li>
              <strong>Bilingual Understanding:</strong> Seamlessly understands and responds in both Arabic and English (responding in whichever language the user utilized).
            </li>
            <li>
              <strong>Intelligent Ranking & Alternative Selection:</strong> When strict requirements can't be met, the AI intelligently selects "nearest matches" and argues logically how they fit (e.g., slightly above budget but provides excellent parking or better location).
            </li>
            <li>
              <strong>Conversational Dynamics:</strong> Identifies missing criteria fields and presents tailored follow-up queries to help narrow choices without requiring rigid forms.
            </li>
          </ul>
        </div>

        {/* Section 2: Matching Logic */}
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-emerald-500" />
            2. Matchmaking Logic & Rules
          </h4>
          <p className="mb-2">
            To prevent hallucination, the matches are selected directly using a <strong>strict-bound data-context flow</strong>:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              The complete set of 31 properties is loaded server-side and sent directly as part of the systemInstruction context in the Gemini prompt.
            </li>
            <li>
              The model utilizes its internal attention mechanisms to score each listing based on user parameters, assigning a compatibility rating.
            </li>
            <li>
              The model returns a JSON schema containing the `recommendedPropertyIds` array, which the server maps back to database objects. This guarantees <strong>0% hallucinated properties</strong>.
            </li>
            <li>
              For maximum resilience, if the API key is not yet set up, the application employs a regex-based heuristic router fallback that still successfully matches properties.
            </li>
          </ol>
        </div>

        {/* Section 3: Assumptions & Limitations */}
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            3. Assumptions & Limitations
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Context Limit:</strong> This setup puts the dataset directly into the LLM system prompt. While perfect for small boutique agencies (up to 1,000 properties), enterprise catalogs require an active vector DB with Retrieval-Augmented Generation (RAG).
            </li>
            <li>
              <strong>Synthesized Labeled Listings:</strong> Fully structured Riyadh, Jeddah, Dammam, and Al-Khobar mock properties are synthetic and clearly labeled to comply with ethical AI mandates.
            </li>
            <li>
              <strong>Location Precision:</strong> The search matches are district/city based and don't yet feature active geofencing boundaries.
            </li>
          </ul>
        </div>

        {/* Section 4: Setup Instructions */}
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-slate-700" />
            4. Setup & Running Instructions
          </h4>
          <div className="space-y-2 bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px]">
            <p># Clone & Install dependencies</p>
            <p className="text-emerald-400">npm install</p>
            <p># Start the Full-stack dev environment (Vite + Express)</p>
            <p className="text-emerald-400">npm run dev</p>
            <p># Production Build & Start</p>
            <p className="text-emerald-400">npm run build</p>
            <p className="text-emerald-400">npm run start</p>
          </div>
          <p className="mt-2 text-slate-500">
            Ensure the <code>GEMINI_API_KEY</code> variable is populated in the Secrets settings tab to enable the advanced AI-driven conversational agent.
          </p>
        </div>

        {/* Section 5: Future Enhancements */}
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <FastForward className="h-4 w-4 text-emerald-500" />
            5. Future Enhancements
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Embed Google Maps Platform to overlay properties visually on a real map with routing details.</li>
            <li>Setup user profiles using Firebase Auth so clients can save favorite properties and get real-time price change warnings.</li>
            <li>RAG/Vector DB incorporation to handle list scopes of over 100,000 real-time listings easily.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
