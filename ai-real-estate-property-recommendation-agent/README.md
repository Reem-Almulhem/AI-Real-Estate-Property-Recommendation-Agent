# AI Real Estate Property Recommendation Agent

An interactive full-stack AI agent that understands user requirements in natural language (Arabic or English) and recommends suitable Saudi Arabian real estate listings with customized explanations and interactive follow-ups.

## Features

- **Natural Language Parsing**: Analyzes conversational search parameters (such as `furnished 2-bedroom in Riyadh under 7000 SAR`) using Google Gemini.
- **Strict Matching Pipeline**: Contains a pre-built listing dataset of 31 realistic Saudi properties with synthetic data tags to guarantee that recommendations never hallucinate non-existent properties.
- **Bilingual Capabilities**: Fully recognizes, processes, and responds in both Arabic and English depending on the client's language selection.
- **Dynamic Extracted Criteria Widget**: Extends real-time visual indicator cards on the side so you can inspect exactly what constraints was parsed in the chat session.
- **Preload Validation Test Suite**: Provides immediate click-to-run buttons for 5 standard test cases.
- **Zero API Key Resilient Fallback**: Operates seamless heuristic regex filtering when the Gemini API Key is missing or not configured.

---

## Labeled Synthetic Dataset Structure
The system works with 31 listings across major cities: **Riyadh**, **Jeddah**, **Dammam**, and **Al-Khobar**.
Each listing is labeled inside `/src/data/properties.json` with the following parameters:
- `id`: unique reference (e.g. `PROP-001`)
- `title`: descriptive summary
- `city` & `district`: geographical location details
- `propertyType`: flat, villa, townhouse, studio
- `purpose`: rent or sale
- `price`: numerical value in SAR
- `pricePeriod`: monthly, yearly, or one-time
- `bedrooms` & `bathrooms`
- `area` (m²)
- `parking` (boolean)
- `furnishingStatus`: furnished, semi-furnished, unfurnished
- `description`
- `isSynthetic`: labeled `true` to ensure ethical compliance.

---

## Technical Architecture & Matchmaking Logic

1. **Information Extraction**: The query is intercepted server-side by an Express handler `/api/chat`.
2. **Context Binding**: The entire synthesized database is injected into the model's system metadata.
3. **Structured Outputs**: Gemini utilizes `gemini-3.5-flash` with a strict `responseSchema` JSON structure. The model parses the query, matches perfect candidate indices, writes distinct reason pitches in the user's language, and devises logical follow-up questions.
4. **Hydration**: The node server maps matched IDs back to rich JSON property objects before returning them to the React frontend.

---

## Troubleshooting, Assumptions & Future Scope

### Assumptions
- Listings fit within a typical Saudi market profile.
- Conversational chat holds multi-turn history.

### Limitations
- The system keeps the 31 properties in system instruction memory. For huge catalogs (e.g., >10,000 listings), a vector database with Retrieval-Augmented Generation (RAG) is needed.

### Future Improvements
1. **Google Maps platform integration** to pin matched locations on an active responsive map.
2. **User Profiles** via Firebase Authentication to bookmark units and schedule visits.

---

## Running the Project

To boot up the complete full-stack environment:

```bash
# 1. Install dependencies
npm install

# 2. Start Full-stack dev server
npm run dev

# 3. Build & launch local production server
npm run build
npm run start
```
