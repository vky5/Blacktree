"use client";

import GithubConnect from "./Page1/GithubConnect";
import RepositorySelect from "./RepositorySelect";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

interface FormData {
  repo: string;
  branch: string;
  dockerPath: string;
  contextDir: string;
  port: string;
  category: string;
  visibility: boolean;
  name: string;
  description: string;
  envVars: Record<string, string>;
}

function IntegrationStep1({}: {}) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    repo: "",
    branch: "",
    dockerPath: "./Dockerfile",
    contextDir: ".",
    port: "3000",
    category: "Utilities",
    visibility: true,
    name: "",
    description: "",
    envVars: {},
  });

  const handleRepoChange = (data: {
    repo: string;
    branch: string;
    dockerPath: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      repo: data.repo,
      branch: data.branch,
      dockerPath: data.dockerPath,
    }));
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="mx-2 my-7 px-6 py-5 bg-[#0B0F19] rounded-lg">
      <div className="text-2xl font-semibold border-zinc-800 text-emerald-500">
        Connect Your Repository
      </div>
      <div className="text-gray-200 mt-2">
        Connect your GitHub account and select the repository you want to deploy
      </div>

      <div className="mt-4">
        <GithubConnect />
      </div>

      {userData?.github_connect === true && (
        <div>
          <RepositorySelect onSubmit={handleFormSubmit} />
        </div>
      )}
    </div>
  );
}

export default IntegrationStep1;
