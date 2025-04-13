import React from "react";
import ColouredDiv from "@/components/shared/ColouredDiv";
import SubmitButton from "@/components/shared/SubmitButton";
import HrWithText from "@/components/shared/HrWithText";
import InputField from "@/components/shared/InputField";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Logo from "@/components/Auth/Logo";

function page() {
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
              <button className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center">
                <FaGithub className="text-2xl" />
                <span>Continue With Github</span>
              </button>
              {/* Google login button */}
              <button className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center">
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
                key={1}
              />
              {/* Password input */}
              <InputField
                label="Password"
                placeholder=""
                type="password"
                key={2}
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
              <SubmitButton label="Sign in" />
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
