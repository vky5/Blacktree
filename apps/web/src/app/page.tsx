import Header from "@/components/Navbar/Header";
import Info from "@/components/Home/Info";
import Codex from "@/components/Home/Codex";

export default function Home() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-36 gap-10">
        {/* Left: Text and Buttons */}
        <div className="max-w-xl">
          <Info />
        </div>

        {/* Right: Code Block */}
        <div className="w-full lg:w-[540px]">
          <Codex />
        </div>
      </div>

      {/* For the info section */}
      <div>

      </div>


    </div>
  );
}
