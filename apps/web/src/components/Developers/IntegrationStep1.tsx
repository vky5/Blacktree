import { FaGithub } from "react-icons/fa";

function IntegrationStep1() {
  return (
    <div className="mx-10 my-7 px-6 py-5 bg-[#111] rounded-lg">
      {/* heading */}
      <div>
        <div className="text-2xl font-semibold border-zinc-800 text-emerald-800">
          Choose Deployment Method
        </div>
        <div className="text-gray-400">Deploying step for API</div>
      </div>

      {/* Info about the repository */}
      <div className="mt-5 text-white text-[0.9rem]">Repository URL</div>
      <div className="relative mt-2 group px-1.5 py-2 rounded-xl focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-800 border border-zinc-700 transition">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          <FaGithub size={20} />
        </span>
        <input
          type="text"
          placeholder="https://github.com/username/repo"
          className="w-full pl-10 py-2 rounded text-[0.9rem] bg-zinc-900 text-white outline-none"
        />
      </div>
      <div className="mt-5 text-white text-[0.9rem]">Dockerfile URL</div>
      <div className="relative mt-2 group px-1.5 py-2 rounded-xl focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-800 border border-zinc-700 transition">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          {/* Docker icon SVG */}
          <svg width={20} height={20} viewBox="0 0 32 32" fill="currentColor">
            <path d="M29.5 17.2c-.2-.2-.5-.3-.8-.3h-2.1c-.2-2.1-1.6-4-3.6-5.3l-.7-.4-.5.7c-.6.8-.8 1.7-.7 2.6.1.7.4 1.4.9 2 .2.2.2.5 0 .7-.2.2-.5.2-.7 0-.6-.7-1-1.5-1.1-2.4-.1-.9.1-1.9.7-2.7l.5-.7-.7-.4c-2.1-1.2-4.5-1.2-6.6 0l-.7.4.5.7c.6.8.8 1.7.7 2.7-.1.9-.5 1.7-1.1 2.4-.2.2-.5.2-.7 0-.2-.2-.2-.5 0-.7.5-.6.8-1.3.9-2 .1-.9-.1-1.8-.7-2.6l-.5-.7-.7.4c-2 1.2-3.4 3.2-3.6 5.3h-2.1c-.3 0-.6.1-.8.3-.2.2-.3.5-.3.8 0 4.1 3.3 7.4 7.3 7.4h7.1c4.1 0 7.3-3.3 7.3-7.4 0-.3-.1-.6-.3-.8zm-7.3 6.1h-7.1c-3.2 0-5.7-2.6-5.7-5.8 0-.1.1-.2.2-.2h19.2c.1 0 .2.1.2.2 0 3.2-2.6 5.8-5.8 5.8z" />
            <path d="M23.5 10.2c-.2-.1-.5-.1-.7.1-.2.2-.2.5 0 .7.5.6.8 1.3.9 2 .1.9-.1 1.8-.7 2.6l-.5.7.7.4c2.1 1.2 4.5 1.2 6.6 0l.7-.4-.5-.7c-.6-.8-.8-1.7-.7-2.6.1-.7.4-1.4.9-2 .2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0-.6.7-1 1.5-1.1 2.4-.1.9.1 1.9.7 2.7l.5.7-.7.4c-2.1 1.2-4.5 1.2-6.6 0l-.7-.4.5-.7c.6-.8.8-1.7.7-2.7-.1-.9-.5-1.7-1.1-2.4-.2-.2-.5-.2-.7 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="https://github.com/username/repo/blob/main/Dockerfile"
          className="w-full pl-10 py-2 rounded text-[0.8rem] bg-zinc-900 text-white outline-none"
        />
      </div>

      {/* Choose which branch */}
      <div className="mt-5 text-white text-[0.9rem]">Branch</div>
      <div className="relative mt-2 group px-1.5 py-2 rounded-xl focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-800 border border-zinc-700 transition">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          {/* Branch icon SVG */}
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7V17M7 7A2 2 0 1 1 7 3a2 2 0 0 1 0 4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-12v8a4 4 0 0 1-4 4H7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="17"
              cy="17"
              r="2"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        <select
          defaultValue="main"
          className="appearance-none w-full pl-10 pr-8 py-2 rounded-xl text-[0.9rem] bg-zinc-900 text-white outline-none border-none focus:ring-0 transition"
          style={{ WebkitAppearance: "none", MozAppearance: "none" }}
        >
          <option value="main">main</option>
          <option value="dev">dev</option>
          <option value="feature">feature</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {/* Chevron down icon */}
          <svg width={18} height={18} fill="none" viewBox="0 0 24 24">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="flex justify-between mt-8 gap-3 w-full ">
        <button
          type="button"
          className="hover:cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black border border-emerald-600 text-white font-semibold transition-colors duration-200 shadow-sm hover:bg-emerald-900"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <svg
            className="mr-1"
            width={20}
            height={20}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M11 19l-7-7 7-7M19 12H5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Dashboard
        </button>
        <button
          type="button"
          className="hover:cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold transition-colors duration-200 shadow-sm"
        >
          Next Step
          <svg
            className="ml-1"
            width={20}
            height={20}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M13 5l7 7-7 7M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default IntegrationStep1;
