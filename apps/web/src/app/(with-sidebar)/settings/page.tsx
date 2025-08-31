"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

const SettingsPage = () => {
  const { userData } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setEmail(userData.email || "");
      setUsername("");
      setBio("");
      setIsDirty(false);
    }
  }, [userData]);

  const handleChange =
    (setter: (v: string) => void) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setter(e.target.value);
      setIsDirty(true);
    };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    // TODO: Implement update logic here
    // Use profileImageFile for uploading the image
  };

  // Remove loading check and always render the form
  return (
    <div className="border border-white/5 bg-[#0B0E1A] mx-2 my-7 p-6 rounded-xl shadow-lg text-white">
      {/* Profile Information */}
      <h2 className="text-2xl font-bold mb-6 text-emerald-500">
        Profile Information
      </h2>

      {/* Upload Photo */}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center text-sm text-zinc-400 overflow-hidden">
          {imagePreview ? (
            <Image
              src={imagePreview || "/fallback-profile.png"} // fallback if needed
              alt="Profile Preview"
              className="object-cover w-full h-full"
              width={80} // match your container size
              height={80}
            />
          ) : (
            <span>Photo</span>
          )}
        </div>
        <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white text-sm cursor-pointer">
          Upload New Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        {profileImageFile && (
          <button
            className="text-xs text-red-400 ml-2"
            onClick={() => {
              setProfileImageFile(null);
              setImagePreview(null);
              setIsDirty(true);
            }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">First Name</label>
          <Input
            value={firstName}
            onChange={handleChange(setFirstName)}
            placeholder="First Name"
            className="border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Last Name</label>
          <Input
            value={lastName}
            onChange={handleChange(setLastName)}
            placeholder="Last Name"
            className="border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Username</label>
          <Input
            value={username}
            onChange={handleChange(setUsername)}
            placeholder="Username"
            className="border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">
            Email Address
          </label>
          <Input
            value={email}
            onChange={handleChange(setEmail)}
            placeholder="Email Address"
            className="border border-zinc-700 bg-[#0B0F19]/80 text-white"
          />
        </div>
      </div>

      {/* Bio Section */}
      <div className="mt-8">
        <label className="block mb-1 text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={handleChange(setBio)}
          placeholder="Bio"
          className="w-full p-3 border border-zinc-700 bg-[#0B0F19]/80 text-white rounded"
        />
        <p className="text-xs text-zinc-400 mt-1">
          Brief description for your profile. Max 160 characters.
        </p>
        <button
          className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>

      {/* Connected Accounts */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-emerald-500 mb-4">
          Connected Accounts
        </h3>
        <div className="bg-zinc-800 p-4 rounded flex items-center justify-between">
          <div>
            <p className="font-medium">GitHub</p>
            <p className="text-sm text-zinc-400">
              {userData?.github_connect ? "Connected" : "Not Connected"}
            </p>
          </div>
          {userData?.github_connect ? (
            <button
              className="bg-zinc-700 px-3 py-1 rounded hover:bg-zinc-600 transition-colors"
              onClick={() => {
                /* TODO: disconnect github handler */
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              className="bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-500 transition-colors"
              onClick={() => {
                /* TODO: connect github handler */
              }}
            >
              Connect
            </button>
          )}
        </div>
        {/* Extra Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            className="flex-1 gradient-emerald hover:opacity-90 transition-all px-4 py-2 rounded-xl text-white font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 flex items-center justify-center gap-2"
            onClick={handleSignOut}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
              />
            </svg>
            Sign Out
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all px-4 py-2 rounded-xl text-white font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 flex items-center justify-center gap-2"
            onClick={() => {
              /* TODO: delete account handler */
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

// --- Main Page (Landing) StatCard Layout Suggestion ---
// To make your main page look like statCard and leave gaps from left, right, top, and bottom:
//
// 1. Wrap your main content in a container with max-width and padding:
// <div className="max-w-4xl mx-auto p-6 min-h-[60vh] flex flex-col gap-8">
//   {/* StatCard grid here */}
// </div>
//
// 2. Use a grid for StatCards:
// <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//   <StatCard label="APIs Deployed" value="50K+" color="green" />
//   <StatCard label="Developers" value="12K+" color="amber" />
//   <StatCard label="Uptime" value="99.9%" color="blue" />
//   <StatCard label="Countries" value="180+" color="green" />
// </div>
//
// 3. Add top/bottom margin to the section for breathing room.
//
// This will give your main page a clean, card-based look with proper spacing, similar to your statCard component.
