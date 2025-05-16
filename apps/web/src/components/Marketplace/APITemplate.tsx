// components/Marketplace/APITemplate.tsx
import { Avatar } from "../ui/avatar";
import Tag from "../shared/Tag";
import { RatingStar } from "./RatingStar";

interface APITemplateProps {
  title: string;
  category: string;
  description: string;
  // company: string;
  rating: number;
  price: string;
}

function APITemplate({ title, category, description, rating, price }: APITemplateProps) {
  return (
    <div className="bg-[#111] rounded-xl p-4 flex flex-col justify-between border border-zinc-800 transition-all duration-300 ease-in-out mx-2 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.5)] hover:-translate-y-2 hover:border-emerald-400/40 ">
      <div className="flex justify-between items-start">
      <div className="text-white font-semibold text-lg">{title}</div>
      <Tag>{category}</Tag>
      </div>
      <p className="text-zinc-400 text-sm mt-2">{description}</p>
      <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6 bg-white" />
        <span className="text-white text-sm">hkj</span>
      </div>
      <RatingStar rating={rating} />
      </div>
      <div className="flex items-center justify-between mt-4">
      <span className="text-white text-sm">{price}</span>
      <button className="border border-zinc-700 rounded-md px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-zinc-800 hover:border-emerald-400/40">
        View Details
      </button>
      </div>
    </div>
  );
}

export default APITemplate;


