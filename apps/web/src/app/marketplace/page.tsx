'use client'

import React, { useState } from "react";
import CategoryFilter from "@/components/Marketplace/CategoryFilter";
import APITemplate from "@/components/Marketplace/APITemplate";

const mockData = [
  {
    title: "Image Recognition API",
    description: "Detect objects, faces, and text in images with high accuracy",
    category: "AI & ML",
    rating: 4.9,
    price: "$0.001 / request",
    provider: "VisionTech",
  },
  {
    title: "Payment Gateway",
    description: "Process payments securely with support for multiple currencies",
    category: "Finance",
    rating: 4.8,
    price: "$0.05 / transaction",
    provider: "SecurePay",
  },
  {
    title: "Weather Data API",
    description: "Real-time and forecast weather data for any location worldwide",
    category: "Data",
    rating: 4.5,
    price: "$0.0003 / request",
    provider: "WeatherSystems",
  },

  {
    title: "Payment Gateway",
    description: "Process payments securely with support for multiple currencies",
    category: "Finance",
    rating: 4.8,
    price: "$0.05 / transaction",
    provider: "SecurePay",
  },
  {
    title: "Weather Data API",
    description: "Real-time and forecast weather data for any location worldwide",
    category: "Data",
    rating: 4.5,
    price: "$0.0003 / request",
    provider: "WeatherSystems",
  },
  // Add more APIs...
];

function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData =
    selectedCategory === "All"
      ? mockData
      : mockData.filter((api) => api.category === selectedCategory);

  return (
    <div className="bg-black min-h-screen p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Marketplace</h1>
        <p className="text-gray-400">Discover and integrate powerful APIs for your applications</p>
      </div>

      <div className="flex gap-8">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1 overflow-y-auto py-6">
          {filteredData.map((api, idx) => (
            <APITemplate key={idx} {...api} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
