"use Client";

import React, { useEffect, useState } from "react";
import { LuGithub } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";

function GithubConnect() {
  const [repoVerified, setRepoVerified] = useState(false);
  const { userData, fetchUser } = useAuth();
  useEffect(() => {
    fetchUser();
  }, []);

  // Update repoVerified when userData is fetched/updated
  useEffect(() => {
    if (userData?.github_connect) {
      setRepoVerified(true);
    }
  }, [fetchUser]);

  // importing environment variables
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!;

  // Function to handle GitHub authentication
  const connectToGithub = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo%20admin:repo_hook%20read:user%20user:email`;
    // public_repo scope allows access to public repositories, read:user allows reading user profile data, and user:email allows access to the user's email address
    // it also inclues admin:repo_hook which we are gonna use to create the webhooks for CI integration
    
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="flex items-center justify-between rounded-xl p-5 bg-[#0B0F19]/80 border border-[#8C35EB]/20 shadow-[0_0_0_1px_rgba(140,53,235,0.05),0_0_30px_rgba(140,53,235,0.1)] backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-full shadow-sm">
          <LuGithub className="text-[#8C35EB] text-2xl" />
        </div>
        <div>
          <div className="font-semibold text-base text-white">
            GitHub Account
          </div>
          <div className="text-sm text-gray-400">
            Connect your GitHub account to deploy your repository
          </div>
        </div>
      </div>

      {/* Right Button */}
      {!repoVerified ? (
        <button
          className="bg-[#8C35EB] hover:bg-[#742bd4] transition-colors text-white hover:cursor-pointer font-medium rounded-md px-4 py-2 flex items-center gap-2 shadow-inner shadow-[#8C35EB]/20"
          onClick={connectToGithub}
        >
          <LuGithub className="text-lg" />
          <span>Connect to GitHub</span>
        </button>
      ) : (
        <span className="flex items-center gap-2 text-[#8C35EB] px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-[#8C35EB] inline-block"></span>
          Connected
        </span>
      )}
    </div>
  );
}

export default GithubConnect;
