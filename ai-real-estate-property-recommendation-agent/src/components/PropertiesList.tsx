import { useState, useMemo } from "react";
import { Property } from "../types";
import { Search, MapPin, Building, Key, ShieldCheck, DollarSign, BedDouble, Bath, Square } from "lucide-react";

interface PropertiesListProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
}

export default function PropertiesList({ properties, onSelectProperty }: PropertiesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("All");

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = selectedCity === "All" || p.city === selectedCity;
      const matchesType = selectedType === "All" || p.propertyType === selectedType;
      const matchesPurpose = selectedPurpose === "All" || p.purpose === selectedPurpose;

      return matchesSearch && matchesCity && matchesType && matchesPurpose;
    });
  }, [properties, searchTerm, selectedCity, selectedType, selectedPurpose]);

  const uniqueCities = ["All", ...Array.from(new Set(properties.map((p) => p.city)))];
  const uniqueTypes = ["All", ...Array.from(new Set(properties.map((p) => p.propertyType)))];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, district, description..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* City filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-1.5 bg-slate-50 text-xs text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-1.5 bg-slate-50 text-xs text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {uniqueTypes.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</label>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full p-1.5 bg-slate-50 text-xs text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[500px]">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Found {filteredProperties.length} listings</span>
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Labeled Synthetic Data
          </span>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200/50 rounded-xl">
            <p className="text-slate-400 text-sm">No properties found matching your constraints</p>
          </div>
        ) : (
          filteredProperties.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProperty?.(p)}
              className="group bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-all shadow-sm hover:shadow duration-200 cursor-pointer flex flex-col gap-2.5 relative"
            >
              {/* Top Row with ID & Synthetic badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {p.id}
                </span>
                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200/50 tracking-wider">
                  SYNTHETIC DATA
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition">
                  {p.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{p.district}, {p.city}</span>
                </div>
              </div>

              {/* Core Features */}
              <div className="grid grid-cols-4 gap-2 py-1.5 border-y border-slate-100 text-[11px] text-slate-500 text-center font-medium bg-slate-50/50 rounded-lg">
                <div className="flex flex-col items-center">
                  <BedDouble className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                  <span>{p.bedrooms} Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bath className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                  <span>{p.bathrooms} Baths</span>
                </div>
                <div className="flex flex-col items-center">
                  <Square className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                  <span>{p.area} sqm</span>
                </div>
                <div className="flex flex-col items-center">
                  <Building className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                  <span className="capitalize">{p.propertyType}</span>
                </div>
              </div>

              {/* Price & Details */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-medium">Furnish:</span>
                  <span className="text-slate-600 font-semibold capitalize">{p.furnishingStatus}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-600">{p.price.toLocaleString()} SAR</span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {p.purpose === "rent" ? `/${p.pricePeriod}` : "One-time purchase"}
                  </span>
                </div>
              </div>

              {/* Optional Description snippet */}
              <p className="text-[11px] text-slate-500 line-clamp-1 italic bg-slate-50/20 px-2 py-1 rounded border border-slate-50">
                {p.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
