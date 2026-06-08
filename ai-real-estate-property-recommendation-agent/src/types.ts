export interface Property {
  id: string;
  title: string;
  city: string;
  district: string;
  propertyType: 'apartment' | 'villa' | 'townhouse' | 'studio' | string;
  purpose: 'rent' | 'sale';
  price: number;
  pricePeriod: 'monthly' | 'one-time' | string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: boolean;
  furnishingStatus: 'furnished' | 'semi-furnished' | 'unfurnished';
  description: string;
  isSynthetic: boolean;
}

export interface SearchCriteria {
  city: string | null;
  district: string | null;
  budget: number | null;
  propertyType: string | null;
  purpose: 'rent' | 'sale' | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: boolean | null;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished' | null;
  preferences: string | null;
}

export interface RecommendationExplanation {
  propertyId: string;
  reason: string;
}

export interface AgentApiResponse {
  success: boolean;
  message: string; // Dynamic natural message
  extractedCriteria: SearchCriteria;
  recommendedProperties: Property[];
  explanations: RecommendationExplanation[];
  followUpQuestions: string[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  extractedCriteria?: SearchCriteria;
  recommendations?: Property[];
  reasons?: { [propertyId: string]: string };
  followUps?: string[];
  isLoading?: boolean;
}
