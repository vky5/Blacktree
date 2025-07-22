"use client";

import React, { useState } from "react";

import Steps from "@/components/Developers/Steps";
import IntegrationStep1 from "@/components/Developers/IntegrationStep1.1";
import SignInButton from "@/components/shared/SubmitButton";

function HostAPI() {
  const [currentStep, setCurrentStep] = useState(2);
  const [readyForNext, setReadyForNext] = useState(false);
  const totalSteps = 4;

  return (
    <div className="bg-[#030712] min-h-screen p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Marketplace</h1>
        <p className="text-gray-400">
          Discover and integrate powerful APIs for your applications
        </p>
      </div>

      <div className="flex items-center gap-4">
        {[...Array(totalSteps)].map((_, index) => (
          <React.Fragment key={index}>
            <Steps no={index + 1} active={currentStep >= index + 1} />
            {index < totalSteps - 1 && (
              <div className="h-0.5 w-24 bg-emerald-900/55 rounded" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div>
        <IntegrationStep1 onRepoDataChange={setReadyForNext} />
      </div>

      {/* Bottom navigation bar */}
      <div className="flex justify-between items-center mt-10 p-4 rounded-lg">
        <button className="flex items-center px-4 py-2 rounded-md border border-emerald-700 text-white hover:bg-emerald-900 transition">
          ← Back to Dashboard
        </button>

        <div className="w-1/8">
          <SignInButton label="Next Step" disabled={!readyForNext} />
        </div>
      </div>
    </div>
  );
}

export default HostAPI;
