import React from "react";
import ListItems from "../shared/ListItems";

function Section3() {
  return (
    <div className="">
      <div className="text-3xl md:text-4xl font-extrabold text-black leading-tight text-center">
        How It Works?
      </div>
      <div className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
        Getting started with BlackTree is simple, whether you're deploying your
        own backend or selling APIs.
      </div>
      <div className="py-16 space-y-7">
        <ListItems
          step={1}
          title="Create an Account"
          description="Sign up for free and set up your developer profile."
        />
        <ListItems
          step={2}
          title="Connect Your Repository"
          description="Link your GitHub repository or upload your Dockerfile."
        />
        <ListItems
          step={3}
          title="Configure Your API"
          description="Set pricing, documentation, and access controls."
        />
        <ListItems
          step={4}
          title="Deploy and Monetize"
          description="We handle the deployment, scaling, and billing for you."
        />
      </div>
    </div>
  );
}

export default Section3;
