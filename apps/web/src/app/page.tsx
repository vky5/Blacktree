import Header from "@/components/Navbar/Header";
import Info from "@/components/Home/Info";
import Codex from "@/components/Home/Codex";
import Section2 from "@/components/Home/Section2";
import Section3 from "@/components/Home/Section3";

export default function Home() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-24 gap-10 min-h-screen">
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
      <section className="bg-[#CBCBCB] py-16 px-6 md:px-12 lg:px-20">
        <Section2 />          
      </section>

      {/* for documentation section */}
      <section className="py-16 px-6 md:px-12 lg:px-20">
        <Section3 />
      </section>


    </div>
  );
}
