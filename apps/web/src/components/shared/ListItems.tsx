import React from "react";

type ListItemProps = {
  step: number;
  title: string;
  description: string;
};

function ListItem({ step, title, description }: ListItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-green-100 text-green1-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center text-xl">
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-black  text-2xl">{title}</h3>
        <p className="text-gray-500 ">{description}</p>
      </div>
    </div>
  );
}

export default ListItem;
