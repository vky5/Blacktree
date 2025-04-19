import React from "react";
import { ArrowRight } from "lucide-react";

interface SignInButtonProps {
  label?: string;
  onClick?: (() => void) | ((e: React.FormEvent) => Promise<void>);
}

function SignInButton({ label = "Submit", onClick }: SignInButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
        bg-[linear-gradient(to_right,#00986A,#09998C)] text-white font-semibold 
        shadow-md transition-all duration-200 ease-in-out 
        hover:-translate-y-0.5 hover:shadow-lg hover:bg-green-800 active:translate-y-0 active:shadow-sm
"
    >
      {label}
      <ArrowRight size={18} />
    </button>
  );
}

export default SignInButton;
