'use client';

import React, { useState } from "react";
import ColouredDiv from "@/components/shared/ColouredDiv";
import LeftSection from "@/components/Auth/Signup/LeftSection";
import HrWithText from "@/components/shared/HrWithText";
import Logo from "@/components/Auth/Logo";
import SubmitButton from "@/components/shared/SubmitButton";
import InputField from "@/components/shared/InputField";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  
  const [verifiying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  if (!isLoaded) {
    return <>add loading screen please</>;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // this runs when verfication code is hit... this is what is being used to set session

  //TODO if user closes tab and do the signup process again... see what will happen then without verifying token
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard"); // Redirect to dashboard after successful verification
      } else {
        console.error("Verification failed");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

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
              <Logo />
              <h1 className="text-xl md:text-2xl font-extrabold text-black leading-tight">
                Create an account
              </h1>
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                Sign up to start using BlackTree
              </p>
            </div>

            {/* Button section for authentication */}
            <div className="flex flex-col space-y-5 py-5">
              <button className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center">
                <FaGithub className="text-2xl" />
                <span>Continue With Github</span>
              </button>
              <button className="border border-emerald rounded-lg hover:bg-emerald/50 transition duration-150 py-2 space-x-4 flex items-center justify-center">
                <FcGoogle className="text-2xl" />
                <span>Continue With Google</span>
              </button>
            </div>

            <HrWithText text="Or Continue With" />

            {/* Form fields */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <InputField
                  label="First name"
                  placeholder=""
                  type="text"
                  key={3}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <InputField
                  label="Last name"
                  placeholder=""
                  type="text"
                  key={4}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <InputField
                label="Email"
                placeholder="example@example.com"
                type="email"
                key={1}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <InputField
                label="Password"
                placeholder=""
                type="password"
                key={2}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="py-5">
              <SubmitButton label="Sign up" onClick={handleCreateUser} />
            </div>

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

      {/* Pop-up form for verification */}
      {verifiying && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <ColouredDiv>
            <div className="w-[90%] mx-auto space-y-4">
              <h2 className="text-xl font-bold text-center text-black">
                Verify Your Email
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Enter the verification code sent to your email.
              </p>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {/* Verification code input boxes */}
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length === 1 && index < 5) {
                          document.getElementById(`code-${index + 1}`)?.focus();
                        }
                        const newCode = verificationCode.split("");
                        newCode[index] = value;
                        setVerificationCode(newCode.join(""));
                      }}
                      id={`code-${index}`}
                    />
                  ))}
                </div>
                <SubmitButton label="Verify" />
              </form>
            </div>
          </ColouredDiv>
        </div>
      )}
    </div>
  );
}

export default page;
