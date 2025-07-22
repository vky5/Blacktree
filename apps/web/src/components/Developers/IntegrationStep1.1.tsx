import GithubConnect from "./Page1/GithubConnect";
import RepositorySelect from "./RepositorySelect";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

function IntegrationStep1({
  onNext,
  defaultValues,
}: {
  onNext: (data: { repo: string; branch: string; dockerPath: string }) => void;
  defaultValues?: { repo: string; branch: string; dockerPath: string };
}) {
  const { userData } = useAuth();
  const [repoData, setRepoData] = useState(
    defaultValues || { repo: "", branch: "", dockerPath: "./Dockerfile" }
  );

  const isValid = repoData.repo && repoData.branch && repoData.dockerPath;

  const handleRepoChange = (data: { repo: string; branch: string; dockerPath: string }) => {
    setRepoData(data);
  };

  return (
    <div className="mx-10 my-7 px-6 py-5 bg-[#0B0F19] rounded-lg">
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
          <RepositorySelect onChange={handleRepoChange} />

          <div className="flex justify-end mt-6">
            <button
              onClick={() => onNext(repoData)}
              disabled={!isValid}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-md text-white font-medium disabled:opacity-40"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationStep1;
