import React from "react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedCategory === category
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transform scale-105"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105"
          }`}
        >
          {category}
          {selectedCategory === category && (
            <span className="ml-2 text-xs opacity-75">✓</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
