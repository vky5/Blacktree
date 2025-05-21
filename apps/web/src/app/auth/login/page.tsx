"use client";

import React, { useState } from "react";
import ColouredDiv from "@/components/shared/ColouredDiv";
import SubmitButton from "@/components/shared/SubmitButton";
import HrWithText from "@/components/shared/HrWithText";
import InputField from "@/components/shared/InputField";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Logo from "@/components/Auth/Logo";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useOAuthSignIn } from "@/utils/clerk/oauth";
import axios from "axios";

function page() {
  // defining all hooks
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const { handleOAuthSignIn } = useOAuthSignIn();

  // defining state of form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }


  // function to handle Signin button click
  // Workflow:
  // 1. Check if the signIn object is loaded.
  // 2. Call the signIn.create method with the email and password.
  // 3. If the signInAttempt.status is "complete":
  //    a. Set the created session as active.
  //    b. Call the /api/auth/set-token route to set the token in the httpOnly cookie.
  //    c. Redirect to the home page.
  const handleSigninButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return; // Check if the sign-in object is loaded

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // call the /api/set-token route to set the token in the httpOnly cookie
        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/auth/set-token");

        if (response.status !== 200) {
          console.error("Error setting token in cookie");
        }

        // Redirect to the home page after successful sign-in
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    // Flex container to center the content vertically and horizontally
    <div className="flex items-center justify-center min-h-screen py-10">
      {/* The main content container */}
      <div className="w-full max-w-lg md:w-1/3">
        {/* ColouredDiv: Wrapper that adds background color */}
        <ColouredDiv>
          {/* Inner container with margin and padding */}
          <div className="w-5/6 mx-auto">
            {/* Heading section */}
            <div className="text-center space-y-3">
              {/* Logo */}
              <Logo />
              {/* Main heading */}
              <h1 className="text-xl md:text-2xl font-extrabold text-black leading-tight">
                Welcome back
              </h1>
              {/* Description text */}
              <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
                Sign in to your account to continue
              </p>
            </div>

            {/* Button section for authentication */}
            <div className="flex flex-col space-y-5 py-5">
              {/* Github login button */}
              <button
                className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center"
                onClick={() => handleOAuthSignIn("oauth_github", "/dashboard")}
              >
                <FaGithub className="text-2xl" />
                <span>Continue With Github</span>
              </button>
              {/* Google login button */}
              <button
                className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center"
                onClick={() => handleOAuthSignIn("oauth_google", "/dashboard")}
              >
                <FcGoogle className="text-2xl" />
                <span>Continue With Google</span>
              </button>
            </div>

            {/* Horizontal line with text in between */}
            <HrWithText text="Or Continue With" />

            {/* Input fields for email and password */}
            <div className="space-y-4">
              {/* Email input */}
              <InputField
                label="Email"
                placeholder="example@example.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {/* Password input */}
              <InputField
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-emerald-600 font-medium hover:underline text-sm"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            {/* Submit button */}
            <div className="py-5">
              <SubmitButton label="Sign in" onClick={handleSigninButton} />
            </div>

            {/* Sign-up link for new users */}
            <div>
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </ColouredDiv>
      </div>
    </div>
  );
}

export default page;

// TODO implement good error handling

// https://leading-gnu-88.clerk.accounts.dev/v1/oauth_callback
