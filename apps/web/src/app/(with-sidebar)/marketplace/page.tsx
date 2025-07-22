"use client";
import React, { useState, useMemo } from "react";
import CategoryFilter from "@/components/Marketplace/CategoryFilter";
import APITemplate, { APIData } from "@/components/Marketplace/APITemplate";
import { Search } from "lucide-react";

const mockData: APIData[] = [
  {
    id: 1,
    title: "Image Recognition API",
    description: "Detect objects, faces, and text in images with high accuracy",
    category: "AI & ML",
    rating: 4.9,
    price: "$0.001 / request",
    provider: "VisionTech",
    stars: 156
  },
  {
    id: 2,
    title: "Payment Gateway",
    description: "Process payments securely with support for multiple currencies",
    category: "Finance",
    rating: 4.8,
    price: "$0.05 / transaction",
    provider: "SecurePay",
    stars: 89
  },
  {
    id: 3,
    title: "Weather Data API",
    description: "Real-time and forecast weather data for any location worldwide",
    category: "Data",
    rating: 4.5,
    price: "$0.0003 / request",
    provider: "WeatherSystems",
    stars: 124
  },
  {
    id: 4,
    title: "Email Validation API",
    description: "Validate email addresses and check deliverability",
    category: "Utilities",
    rating: 4.6,
    price: "$0.002 / validation",
    provider: "ValidateX",
    stars: 67
  },
  {
    id: 5,
    title: "Crypto Price Tracker",
    description: "Track cryptocurrency prices and market data in real-time",
    category: "Finance",
    rating: 4.7,
    price: "$0.001 / request",
    provider: "CryptoData",
    stars: 92
  },
  {
    id: 6,
    title: "Web Scraping API",
    description: "Powerful web scraping API for extracting structured data",
    category: "Data",
    rating: 4.4,
    price: "$0.01 / request",
    provider: "DataMiner",
    stars: 78
  }
];

function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(mockData.map(api => api.category))];
    return ["All", ...uniqueCategories];
  }, []);

  const filteredData = useMemo(() => {
    let filtered = mockData;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((api) => api.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((api) =>
        api.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="bg-[#030712] min-h-screen p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          API Marketplace
        </h1>
        <p className="text-slate-400 mt-2">
          Discover and integrate powerful APIs for your applications.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search APIs, providers, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="text-slate-400">
          {filteredData.length} API{filteredData.length !== 1 ? 's' : ''} found
          {selectedCategory !== "All" && (
            <span className="ml-2">
              in <span className="text-emerald-400 font-medium">{selectedCategory}</span>
            </span>
          )}
        </div>
        <select className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Most Starred</option>
          <option>Highest Rated</option>
          <option>Lowest Price</option>
          <option>Recently Added</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((api) => (
            <APITemplate key={api.id} api={api} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-2">No APIs found</div>
            <p className="text-slate-500 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
