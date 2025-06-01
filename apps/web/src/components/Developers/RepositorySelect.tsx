"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import axios from "axios";

function RepositorySelect({
  onChange,
}: {
  onChange: (data: {
    repo: string;
    branch: string;
    dockerPath: string;
  }) => void;
}) {
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [dockerPath, setDockerPath] = useState("./Dockerfile");

  const [repos, setRepos] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  // Fetch user repos on mount
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/repos`,
          { withCredentials: true }
        );
        setRepos(res.data.repos);
      } catch (error) {
        console.error("Failed to load repositories:", error);
      }
    };
    fetchRepos();
  }, []);

  // Fetch branches when repo changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/branches?repo=${selectedRepo}`,
          { withCredentials: true }
        );
        setBranches(res.data.branches);
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };

    fetchBranches();
    setBranch(""); // reset selected branch
  }, [selectedRepo]);

  // Notify parent when any field changes
  useEffect(() => {
    onChange({ repo: selectedRepo, branch, dockerPath });
  }, [selectedRepo, branch, dockerPath]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 p-6 rounded-xl bg-zinc-900 border border-zinc-800 shadow-md"
    >
      <div className="text-lg font-semibold text-emerald-500 mb-4">
        Repository Selection
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        {/* Repo Dropdown */}
        <div className="w-full sm:w-1/2">
          <label className="block text-sm text-gray-300 mb-1">Repository</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="" disabled>
              Select a repository
            </option>
            {repos.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Dropdown */}
        <div className="w-full sm:w-1/2">
          <label className="block text-sm text-gray-300 mb-1">Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className={`w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              !selectedRepo ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!selectedRepo}
          >
            <option value="" disabled>
              {selectedRepo ? "Select a branch" : "Select a repository first"}
            </option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dockerfile Path */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Dockerfile Path</label>
        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2">
          <FaGithub className="text-zinc-400" />
          <input
            value={dockerPath}
            onChange={(e) => setDockerPath(e.target.value)}
            placeholder="./Dockerfile or path/to/Dockerfile"
            className="bg-transparent text-white w-full text-sm focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Specify the path to your Dockerfile relative to the repository root
        </p>
      </div>
    </motion.div>
  );
}

export default RepositorySelect;
