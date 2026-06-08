import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  MapPin, 
  Building, 
  DollarSign, 
  BedDouble, 
  Bath, 
  Square, 
  HelpCircle, 
  ShieldCheck, 
  Database, 
  Info, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, Property, SearchCriteria } from "./types";
import PropertiesList from "./components/PropertiesList";
import Documentation from "./components/Documentation";

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "docs">("listings");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Track parameters of the latest search query
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria>({
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
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick Test examples for review
  const testCases = [
    {
      id: "test-1",
      label: "Riyadh Furnished Flat (<7k)",
      lang: "EN",
      prompt: "I need a furnished 2-bedroom apartment in Riyadh with parking, budget under 7,000 SAR/month."
    },
    {
      id: "test-2",
      label: "Riyadh Furnished Flat (AR)",
      lang: "AR",
      prompt: "أبحث عن شقة مفروشة غرفتين في الرياض بموقف، ميزانية تحت 7000 ريال سعودي شهرياً"
    },
    {
      id: "test-3",
      label: "Riyadh Premium Villa Sale",
      lang: "EN",
      prompt: "I want to buy a luxurious 5-bedroom villa with parking in Riyadh, budget under 3.5 Million SAR."
    },
    {
      id: "test-4",
      label: "Dammam Budget Flat",
      lang: "EN",
      prompt: "I'm looking for a budget rent apartment with 2 bedrooms in Dammam under 2,500 SAR/month."
    },
    {
      id: "test-5",
      label: "Riyadh Boulevard Flat",
      lang: "EN",
      prompt: "Need a cozy 1-bedroom furnished flat near Boulevard in Riyadh, Al-Yasmin or Hittin, let's say max 8,000 SAR/month."
    }
  ];

  // Fetch full property database on mount
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error("Could not fetch properties list:", err));
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Query Submission
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setQuery("");
    setLoading(true);

    try {
      // Make full-stack endpoint call passing overall history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update extracted metrics for the visual dashboard widget
        if (data.extractedCriteria) {
          setCurrentCriteria(data.extractedCriteria);
        }

        // Map reasons list back to property IDs
        const reasonsMap: { [key: string]: string } = {};
        (data.explanations || []).forEach((exp: any) => {
          reasonsMap[exp.propertyId] = exp.reason;
        });

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          extractedCriteria: data.extractedCriteria,
          recommendations: data.recommendedProperties,
          reasons: reasonsMap,
          followUps: data.followUpQuestions,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "Failed search query match");
      }
    } catch (err: any) {
      console.error("Chat transmission error:", err);
      // Fallback message indicating error
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error connecting to AI Agent. ${err.message || ""}. Please make sure you have the Express server booted.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentCriteria({
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
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Dynamic Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
              AqariAI <span className="text-blue-600">Recommend</span>
              <span className="text-[9px] font-mono font-medium bg-blue-50 text-blue-600 border border-blue-100 px-1 py-0.2 rounded">
                v1.5
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Fusing Natural Language with Saudi Real Estate Catalogs
            </p>
          </div>
        </div>

        {/* Info Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            System Online: {properties.length} Active Listings
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start overflow-hidden">
        
        {/* Left Side: Agent Consultation Workspace (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-[calc(100vh-100px)] min-h-[550px]">
          
          {/* Workspace Title & Clear Actions */}
          <div className="flex items-center justify-between border-b border-slate-150 pb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              <h2 className="font-bold text-slate-700 text-xs tracking-wider uppercase">AI Consultation Room</h2>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-[10px] hover:text-rose-600 text-slate-500 flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-rose-50/45 rounded border border-slate-200 transition"
              >
                <Trash2 className="h-3 w-3" />
                Clear Conversation
              </button>
            )}
          </div>

          {/* Test Case Selection Panel */}
          <div className="flex-shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Quick-Test Suite (Runs query to evaluate parser):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-thin">
              {testCases.map((tc) => (
                <button
                  key={tc.id}
                  disabled={loading}
                  onClick={() => {
                    setQuery(tc.prompt);
                    handleSendMessage(tc.prompt);
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-705 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded text-[10px] text-left transition flex items-center gap-2 cursor-pointer disabled:opacity-55 shadow-xs"
                >
                  <span className={`text-[8px] font-extrabold px-1 rounded ${tc.lang === 'AR' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    {tc.lang}
                  </span>
                  <span className="truncate max-w-[150px] font-semibold">{tc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Extracted Criteria Dashboard Bar */}
          <div className="flex-shrink-0 bg-blue-50/20 border border-blue-100 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-blue-600" />
                Latest Extracted Criteria (Visual Dashboard)
              </h3>
              <span className="text-[10px] text-slate-400 italic">Updates dynamically in real-time</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2 rounded-md border border-slate-200 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">City</span>
                <span className={`text-xs font-bold ${currentCriteria.city ? 'text-blue-600' : 'text-slate-400'}`}>
                  {currentCriteria.city || "—"}
                </span>
              </div>
              <div className="bg-white p-2 rounded-md border border-slate-200 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Property Type</span>
                <span className={`text-xs font-bold capitalize ${currentCriteria.propertyType ? 'text-blue-600' : 'text-slate-400'}`}>
                  {currentCriteria.propertyType || "—"}
                </span>
              </div>
              <div className="bg-white p-2 rounded-md border border-slate-200 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Beds / Baths</span>
                <span className={`text-xs font-bold ${currentCriteria.bedrooms || currentCriteria.bathrooms ? 'text-blue-600' : 'text-slate-400'}`}>
                  {currentCriteria.bedrooms ? `${currentCriteria.bedrooms} BR` : "—"}
                  {currentCriteria.bathrooms ? ` / ${currentCriteria.bathrooms} BA` : ""}
                </span>
              </div>
              <div className="bg-white p-2 rounded-md border border-slate-200 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Budget Cap</span>
                <span className={`text-xs font-bold ${currentCriteria.budget ? 'text-blue-600' : 'text-slate-400'}`}>
                  {currentCriteria.budget ? `${currentCriteria.budget?.toLocaleString()} SAR` : "—"}
                </span>
              </div>
            </div>

            {/* Minor criteria horizontal strip */}
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 font-medium">
              <span>Purpose: <strong className="text-slate-800 capitalize">{currentCriteria.purpose || "Any"}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Furnishing: <strong className="text-slate-800 capitalize">{currentCriteria.furnishing || "Any"}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Parking: <strong className="text-slate-800">{currentCriteria.parking === true ? "Required" : currentCriteria.parking === false ? "No" : "Any"}</strong></span>
              {currentCriteria.preferences && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="truncate max-w-[200px]" title={currentCriteria.preferences}>
                    Prefs: <strong className="text-slate-800">{currentCriteria.preferences}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Dialog Stream List */}
          <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0 select-none">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                  <Sparkles className="h-8 w-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Start Your AI Search Session</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                    Type your request in English or Arabic, or click any of the preloaded Test Room prompts above to observe the AI Agent's criteria extraction and listing recommendations.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 border border-slate-200 bg-white p-2.5 rounded-lg max-w-md font-medium">
                  <strong>Example request layout:</strong> "Furnished 2-bed flat in Riyadh under 7000 SAR/month with garage parking"
                </div>
              </div>
            ) : (
              <div className="space-y-4 pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1">
                    {/* Speaker Header */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider px-2">
                      <span>{m.role === "user" ? "Client Requirement" : "AI Property Consultant"}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>

                    {/* Chat Bubble Card */}
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-slate-100 border-slate-200 text-slate-800 self-end ml-12 rounded-tr-none shadow-xs"
                        : "bg-white border-slate-200/80 text-slate-800 mr-12 rounded-tl-none shadow-sm"
                    }`}>
                      {/* Message Content */}
                      <p className="break-words font-semibold text-slate-800 whitespace-pre-wrap">{m.content}</p>

                      {/* Display Recommended Properties (only for Assistant messages) */}
                      {m.role === "assistant" && m.recommendations && m.recommendations.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                          <h4 className="text-[10px] font-bold text-blue-600 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            AI Recommended Best Matches ({m.recommendations.length} properties):
                          </h4>

                          <div className="grid grid-cols-1 gap-2.5">
                            {m.recommendations.map((rec) => (
                              <div
                                key={rec.id}
                                className="bg-slate-50 hover:bg-slate-100/40 border border-slate-200 hover:border-blue-400 rounded-xl p-3 flex flex-col gap-2 transition relative group"
                              >
                                {/* Header price & title */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                                  <div>
                                    <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                                      {rec.id}
                                    </span>
                                    <h5 className="font-bold text-slate-800 text-xs mt-1.5 group-hover:text-blue-600 transition pr-2">
                                      {rec.title}
                                    </h5>
                                  </div>
                                  <div className="text-left sm:text-right flex-shrink-0">
                                    <span className="text-xs font-extrabold text-blue-600 block">
                                      {rec.price.toLocaleString()} SAR
                                    </span>
                                    <span className="text-[9px] text-slate-400 block -mt-0.5 font-medium">
                                      {rec.purpose === "rent" ? `/${rec.pricePeriod}` : "One-time Purchase"}
                                    </span>
                                  </div>
                                </div>

                                {/* Spec bar */}
                                <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200/60">
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {rec.district}, {rec.city}
                                  </span>
                                  <span className="text-slate-300 font-bold">|</span>
                                  <span className="flex items-center gap-1">
                                    <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                                    {rec.bedrooms} Bed
                                  </span>
                                  <span className="text-slate-300 font-bold">|</span>
                                  <span className="flex items-center gap-1">
                                    <Bath className="h-3.5 w-3.5 text-slate-400" />
                                    {rec.bathrooms} Bath
                                  </span>
                                  <span className="text-slate-300 font-bold">|</span>
                                  <span className="flex items-center gap-1 bg-slate-100 border border-slate-200/50 px-1.5 rounded py-0.2 capitalize font-mono text-[9px] text-slate-600 font-bold">
                                    {rec.furnishingStatus}
                                  </span>
                                </div>

                                {/* AI Reasoning Bubble */}
                                {m.reasons && m.reasons[rec.id] && (
                                  <div className="text-[11px] text-slate-700 bg-blue-50/60 border border-blue-100/60 p-2.5 rounded-lg flex gap-2 items-start mt-1">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                                    <div>
                                      <strong className="text-blue-700 block text-[9px] uppercase font-bold tracking-wider mb-0.5">AI Reason for Recommendation:</strong>
                                      <p className="italic text-slate-600 font-semibold leading-relaxed">"{m.reasons[rec.id]}"</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Follow-up Prompt Pills */}
                      {m.role === "assistant" && m.followUps && m.followUps.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Suggested Follow-up Questions:
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {m.followUps.map((question, qIdx) => (
                              <button
                                key={qIdx}
                                disabled={loading}
                                onClick={() => {
                                  setQuery(question);
                                  handleSendMessage(question);
                                }}
                                className="bg-white hover:bg-blue-50/55 hover:text-blue-600 hover:border-blue-400/50 text-slate-700 text-xs px-3 py-2 text-left rounded-lg border border-slate-200 transition flex items-center justify-between cursor-pointer group disabled:opacity-50 font-medium"
                              >
                                <span className="font-semibold">{question}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                   {/* Animated typing dots */}
                {loading && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-2">AI Consultant is checking database...</div>
                    <div className="bg-white border border-slate-200/80 p-3 rounded-xl rounded-tl-none mr-12 text-slate-800 self-start shadow-xs">
                      <div className="flex items-center gap-1.5 px-1 py-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-75"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-150"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-225"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* User Consultation query box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(query);
            }}
            className="flex-shrink-0 flex gap-2 mt-2"
          >
            <input
              type="text"
              className="flex-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 text-left font-medium"
              placeholder="Query: e.g. I need a rent 2-bedroom in Jeddah under 5000 SAR/month..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition flex items-center justify-center cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 border border-blue-500/20 shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Right Side: Tabbed panel (Database list vs Project Docs) (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 h-[calc(100vh-100px)] min-h-[550px] bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          
          {/* Tab Navigation header */}
          <div className="flex border-b border-slate-100 pb-3 flex-shrink-0 gap-3">
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition border flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "listings"
                  ? "bg-blue-50/60 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-semibold"
              }`}
            >
              <Database className="h-4 w-4" />
              Browse 31 Listings
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`flex-1 py-1.5 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition border flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "docs"
                  ? "bg-blue-50/60 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-semibold"
              }`}
            >
              <Info className="h-4 w-4" />
              Technical Docs
            </button>
          </div>

          {/* Active Panel View */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "listings" ? (
              <div className="h-full overflow-y-auto">
                <PropertiesList properties={properties} onSelectProperty={(p) => setSelectedProperty(p)} />
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <Documentation />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Property Details Modal overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 bg-slate-950 p-1.5 rounded-lg border border-slate-800/85 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 space-y-4">
                {/* Badges tag */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-slate-950 text-emerald-400 font-bold border border-slate-800 px-2 py-0.5 rounded">
                    {selectedProperty.id}
                  </span>
                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    SYNTHETIC LABEL
                  </span>
                  <span className="text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded uppercase">
                    {selectedProperty.purpose}
                  </span>
                </div>

                {/* Listing Headline */}
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedProperty.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    District of {selectedProperty.district}, {selectedProperty.city}, KSA
                  </p>
                </div>

                {/* Primary specs row */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-semibold text-slate-300 text-[11px]">
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500 mb-0.5">Type</span>
                    <span className="capitalize text-emerald-400 font-bold">{selectedProperty.propertyType}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500 mb-0.5">Bedrooms</span>
                    <span className="text-emerald-400 font-bold">{selectedProperty.bedrooms} BR</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500 mb-0.5">Bathrooms</span>
                    <span className="text-emerald-400 font-bold">{selectedProperty.bathrooms} BA</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500 mb-0.5">Area Space</span>
                    <span className="text-emerald-400 font-bold">{selectedProperty.area} m²</span>
                  </div>
                </div>

                {/* Secondary Specifications */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Furnishing status:</span>
                    <span className="text-slate-300 font-bold capitalize">{selectedProperty.furnishingStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Shaded Parking:</span>
                    <span className="text-slate-300 font-bold">{selectedProperty.parking ? "Available" : "None"}</span>
                  </div>
                </div>

                {/* Long description text */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Property Pitch</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/20 p-3 rounded-lg border border-slate-800/40">
                    "{selectedProperty.description}"
                  </p>
                </div>

                {/* Footer and Price tag */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Listing Price</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {selectedProperty.price.toLocaleString()} SAR
                    </span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">
                      {selectedProperty.purpose === "rent" ? `Period: ${selectedProperty.pricePeriod}` : "Total purchase cost"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setQuery(`Tell me more about property ${selectedProperty.id}`);
                      handleSendMessage(`Tell me more about property ${selectedProperty.id}`);
                      setSelectedProperty(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-1 text-center cursor-pointer border border-emerald-500/20 shadow-md"
                  >
                    Consult Agent on This
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer credits bar */}
      <footer className="bg-slate-950 border-t border-slate-800/60 py-3.5 px-6 text-center text-[10px] text-slate-500 tracking-wide">
        &copy; 2026 Saudi AI Real Estate Property Recommendation Agent. Labeled Synthesized Agent Prototype. All rights reserved.
      </footer>
    </div>
  );
}
