import React from "react";
import { Star, ExternalLink, Play, BookOpen, Users, Clock } from "lucide-react";

export interface APIData {
  id: number;
  title: string;
  description: string;
  category: string;
  rating: number;
  price: string;
  provider: string;
  stars: number;
}

const APITemplate: React.FC<{ api: APIData }> = ({ api }) => {
  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      "AI & ML": "from-purple-500 to-pink-500",
      "Finance": "from-green-500 to-emerald-500",
      "Data": "from-blue-500 to-cyan-500",
      "Utilities": "from-orange-500 to-red-500",
      "Media": "from-indigo-500 to-purple-500",
      "Security": "from-red-500 to-pink-500",
      "Social": "from-pink-500 to-rose-500"
    };
    return gradients[category] || "from-slate-500 to-slate-600";
  };

  return (
    <div className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 "
         style={{ boxShadow: `0 8px 20px -4px rgba(52, 211, 153, 0.2)` }}>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors duration-200 line-clamp-1">
              {api.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              <span>{api.provider}</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <Clock className="w-3 h-3" />
              <span>Updated 2h ago</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-sm">{api.rating}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {api.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>{api.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <span>99.9% uptime</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            <span>1.2k uses</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <span className={`px-3 py-1 bg-gradient-to-r ${getCategoryGradient(api.category)} text-white text-xs font-medium rounded-full`}>
            {api.category}
          </span>
          <div className="text-right">
            <div className="text-emerald-400 font-semibold text-sm">{api.price}</div>
            <div className="text-slate-500 text-xs">per request</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md group/btn">
            {/* <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> */}
            Try it
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 group/btn">
            <BookOpen className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Docs
          </button>
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 group/btn">
            <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

        <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-md">
            REST API
          </span>
          <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-md">
            JSON
          </span>
          <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-md">
            Rate Limited
          </span>
        </div>
      </div>
    </div>
  );
};

export default APITemplate;
