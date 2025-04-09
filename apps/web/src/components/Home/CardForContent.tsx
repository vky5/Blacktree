import { LucideIcon } from "lucide-react";

type CardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function CardForContent({ icon: Icon, title, description }: CardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="bg-green-50 p-3 rounded-md inline-block text-green-500 text-2xl">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  );
}

export default CardForContent;
