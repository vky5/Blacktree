import React from "react";
import ColouredDiv from "@/components/shared/ColouredDiv";
import LeftSection from "@/components/Auth/Signup/LeftSection";
import HrWithText from "@/components/shared/HrWithText";
import Logo from "@/components/Auth/Logo";
import SubmitButton from "@/components/shared/SubmitButton";
import InputField from "@/components/shared/InputField";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function page() {
  return (
    <div className="flex items-center justify-center space-x-16 min-h-screen">
      <div>
        <LeftSection />
      </div>

      <div className="">
        <ColouredDiv>
          <div className="mx-auto w-[95%]">
            {/* Heading section */}
            <div className="text-center space-y-3">
              {/* Logo */}
              <Logo />
              {/* Main heading */}
              <h1 className="text-xl md:text-2xl font-extrabold text-black leading-tight">
                Create an account
              </h1>
              {/* Description text */}
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                Sign up to start using BlackTree
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

            {/* Form fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="flex space-x-4">
                <InputField
                  label="First name"
                  placeholder=""
                  type="text"
                  key={3}
                />
                <InputField
                  label="Last name"
                  placeholder=""
                  type="text"
                  key={4}
                />
              </div>

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
            </div>

            {/* Submit button */}
            <div className="py-5">
              <SubmitButton label="Sign up" />
            </div>

            {/* Sign-up link for new users */}
            <div>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Sign in
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
