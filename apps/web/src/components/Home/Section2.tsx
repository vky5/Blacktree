import React from "react";
import features from "@/assets/features";
import CardForContent from "./CardForContent";

function Section2() {
  return (
    <div>
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
          Why Choose BlackTree?
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Our platform offers everything you need to monetize your APIs and find the perfect solutions for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ id, icon, heading, explanation }) => (
          <CardForContent
            key={id}
            icon={icon}
            title={heading}
            description={explanation}
          />
        ))}
      </div>
    </div>
  );
}

export default Section2;
