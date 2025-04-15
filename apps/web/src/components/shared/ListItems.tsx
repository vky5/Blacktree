import React from "react";
import { tmerge } from "@/utils/tmerge";

type ListItemProps = {
  step: number;
  title: string;
  description: string;
  titleClassName?: string; 
  descClassName?: string;
};

function ListItem({ step, title, description, titleClassName, descClassName }: ListItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-green-100 text-green1-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center text-xl">
        {step === -1 ? <div className="w-3 h-3 bg-green-600 rounded-full"></div> : step}
      </div>
      <div>
        <h3 className={tmerge("font-semibold text-black text-2xl", titleClassName)}>{title}</h3>
        <p className={tmerge("text-gray-500", descClassName)}>{description}</p>
      </div>
    </div>
  );
}

export default ListItem;
