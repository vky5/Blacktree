"use client";

import React from "react";

const BigLoader = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-emerald-500 border-opacity-50"></div>
    </div>
  );
};

export default BigLoader;
