"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLock, FaGlobe, FaTrash } from "react-icons/fa";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

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

function RepositorySelect({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [dockerPath, setDockerPath] = useState("./Dockerfile");
  const [contextDir, setContextDir] = useState(".");
  const [port, setPort] = useState("3000");
  const [category, setCategory] = useState("Utilities");
  const [visibility, setVisibility] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const [repos, setRepos] = useState<string[]>([]);
  const [envFields, setEnvFields] = useState([{ key: "", value: "" }]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/repos`, {
          withCredentials: true,
        });
        setRepos(res.data.repos);
      } catch (error) {
        console.error("Failed to load repositories:", error);
      }
    };
    fetchRepos();
  }, []);

  const handleAddEnvField = () => {
    const lastField = envFields[envFields.length - 1];
    if (!lastField.key.trim()) return;
    setEnvFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveEnvField = (index: number) => {
    setEnvFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnvChange = (index: number, key: string, value: string) => {
    const updated = [...envFields];
    updated[index] = { key, value };
    setEnvFields(updated);
  };

  const handleSubmit = () => {
    const envObject = envFields.reduce((acc, field) => {
      if (field.key.trim()) acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>);

    onSubmit({
      repo: selectedRepo,
      branch,
      dockerPath,
      contextDir,
      port,
      category,
      visibility,
      name,
      description,
      envVars: envObject,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 p-6 rounded-xl bg-[#0B0F19] border border-zinc-800 shadow-md space-y-6"
    >
      {/* Name (Required) */}
      <div>
        <h3 className="text-lg font-semibold text-emerald-500 mb-2">Blueprint Name *</h3>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter blueprint name"
          className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
        />
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-emerald-500 mb-2">Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          rows={3}
          className="w-full bg-[#0B0F19]/80 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-0"
        />
      </div>

      {/* Repo, Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Repository</h3>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-[#0B0F19]/80 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-0"
          >
            <option value="" disabled>Select a repository</option>
            {repos.map((repo) => (
              <option key={repo} value={repo}>{repo}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Branch</h3>
          <Input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. main"
            className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>
      </div>

      {/* Context Dir & Dockerfile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Context Directory</h3>
          <Input
            value={contextDir}
            onChange={(e) => setContextDir(e.target.value)}
            placeholder="e.g. ./"
            className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Dockerfile Path</h3>
          <div className="flex items-center gap-2 bg-[#0B0F19]/80 border border-zinc-700 rounded-md px-3 py-2">
            <FaGithub className="text-zinc-400" />
            <input
              value={dockerPath}
              onChange={(e) => setDockerPath(e.target.value)}
              placeholder="./Dockerfile"
              className="bg-transparent text-white w-full text-sm focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Port & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Port</h3>
          <Input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g. 3000"
            className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-emerald-500 mb-2">Category</h3>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0B0F19]/80 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-0"
          >
            <option value="Utilities">Utilities</option>
            <option value="UI">UI</option>
            <option value="APIs">APIs</option>
            <option value="AI Tools">AI Tools</option>
          </select>
        </div>
      </div>

      {/* Env Vars */}
      <div>
        <h3 className="text-lg font-semibold text-emerald-500 mb-2">Environment Variables</h3>
        {envFields.map((field, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <Input
              placeholder="Key"
              value={field.key}
              onChange={(e) => handleEnvChange(index, e.target.value, field.value)}
              className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
            />
            <Input
              placeholder="Value"
              value={field.value}
              onChange={(e) => handleEnvChange(index, field.key, e.target.value)}
              className="focus:outline-none focus:ring-0 border border-zinc-700 bg-[#0B0F19]/80 text-white"
            />
            <Button
              variant="ghost"
              onClick={() => handleRemoveEnvField(index)}
              className="text-red-500 hover:text-red-600"
            >
              <FaTrash />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={handleAddEnvField}
          className={`text-emerald-500 flex items-center gap-1 ${!envFields[envFields.length - 1].key.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!envFields[envFields.length - 1].key.trim()}
        >
          <Plus size={16} /> Add Variable
        </Button>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between bg-[#0D1117] border border-zinc-800 rounded-md px-4 py-3">
        <div>
          <h3 className="text-md font-semibold text-white">Blueprint Visibility</h3>
          <p className="text-sm text-gray-400">Make this blueprint discoverable in the marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          <FaLock className={`text-sm ${!visibility ? 'text-emerald-500' : 'text-gray-400'}`} />
          <span className={!visibility ? 'text-emerald-500' : 'text-gray-400'}>Private</span>
          <Switch
            checked={visibility}
            onCheckedChange={setVisibility}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white"
          />
          <FaGlobe className={`text-sm ${visibility ? 'text-emerald-500' : 'text-gray-400'}`} />
          <span className={visibility ? 'text-emerald-500' : 'text-gray-400'}>Public</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-right">
        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="bg-[#33CF96] text-black hover:bg-[#2dbd85] disabled:bg-gray-600"
        >
          Submit Blueprint
        </Button>
      </div>
    </motion.div>
  );
}

export default RepositorySelect;
