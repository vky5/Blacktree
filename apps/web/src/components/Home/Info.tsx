import React from "react";
import DisplayDiv from "../shared/DisplayDiv";

function Info() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Tagline */}
      <DisplayDiv text="The Future of API Marketplace" />

      {/* Heading */}
      <h1 className="text-5xl font-extrabold text-black leading-tight">
        Monetize and Deploy <br /> Your APIs with Ease
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-500">
        BlackTree is the premier marketplace for buying and selling ready-to-use
        backend APIs with automatic scalability and hosting.
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-x-4 pt-2">
        {/* Explore Marketplace Button */}
        <button className="bg-emerald-600 text-white px-5 py-2 text-base font-medium rounded-lg hover:bg-emerald-700 transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
          Explore Marketplace <span>→</span>
        </button>

        {/* Publish Your API Button */}
        <button className="border border-emerald-500 px-5 py-2 text-base font-medium rounded-lg hover:border-emerald-600 transition">
          Publish Your API
        </button>
      </div>
    </div>
  );
}

export default Info;
