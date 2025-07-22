"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function DeploymentMetaForm({
  onChange,
}: {
  onChange: (data: {
    name: string;
    port: number;
    autoDeploy: boolean;
    contextDir: string;
    tags: string[];
    description: string;
    visibility: "public" | "private";
  }) => void;
}) {
  const [name, setName] = useState("");
  const [port, setPort] = useState<number | "">("");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [contextDir, setContextDir] = useState("./");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  // Update parent when all required fields are filled
  useEffect(() => {
    const isValid = name.trim() !== "" && port !== "" && contextDir.trim() !== "";
    if (isValid) {
      onChange({
        name: name.trim(),
        port: Number(port),
        autoDeploy,
        contextDir: contextDir.trim(),
        tags,
        description: description.trim(),
        visibility,
      });
    }
  }, [name, port, autoDeploy, contextDir, tags, description, visibility]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 p-6 rounded-xl border border-zinc-800 shadow-md bg-[#030712]"
    >
      <div className="text-lg font-semibold text-emerald-500 mb-6">
        Deployment Configuration
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Unique name for your deployment"
            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Port */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Port *</label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            placeholder="e.g. 3000"
            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Auto-deploy */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="autodeploy"
            type="checkbox"
            checked={autoDeploy}
            onChange={(e) => setAutoDeploy(e.target.checked)}
            className="accent-emerald-500"
          />
          <label htmlFor="autodeploy" className="text-sm text-gray-300">
            Enable Auto-Deploy on new commits
          </label>
        </div>

        {/* Context Directory */}
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-300 mb-1 block">Context Directory *</label>
          <input
            value={contextDir}
            onChange={(e) => setContextDir(e.target.value)}
            placeholder="./ or path/to/dir"
            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="text-sm text-gray-300 mb-1 block">Tags (Optional)</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add tag and press enter"
            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 text-sm focus:outline-none"
          />
          <button
            onClick={handleAddTag}
            className="bg-emerald-600 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-700 transition-all"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-gray-300 flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-red-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="text-sm text-gray-300 mb-1 block">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this deployment"
          className="w-full px-3 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
        />
      </div>

      {/* Visibility */}
      <div className="mb-2">
        <label className="text-sm text-gray-300 mb-2 block">API Visibility *</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="accent-emerald-500"
            />
            Public
          </label>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
              className="accent-emerald-500"
            />
            Private
          </label>
        </div>
      </div>
    </motion.div>
  );
}

export default DeploymentMetaForm;
