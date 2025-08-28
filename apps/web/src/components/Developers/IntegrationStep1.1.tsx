"use client";

import axios from "axios";
import GithubConnect from "./Page1/GithubConnect";
import RepositorySelect from "./RepositorySelect";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

interface IntegrationStep1Props {
  onSuccessRedirectToTab2: () => void;
}

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

function IntegrationStep1({ onSuccessRedirectToTab2 }: IntegrationStep1Props) {
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment`,
        {
          name: data.name,
          repository: data.repo,
          dockerFilePath: data.dockerPath,
          branch: data.branch,
          portNumber: data.port,
          contextDir: data.contextDir,
          envVars: data.envVars,
          category: data.category,
          private: !data.visibility,
          description: data.description,
        },
        { withCredentials: true }
      );

      console.log("Deployment submitted:", res.data);
      onSuccessRedirectToTab2();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <RepositorySelect
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}

export default IntegrationStep1;
