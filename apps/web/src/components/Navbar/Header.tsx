import React from "react";

function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-x-10">

      {/* Logo */}
      <div className="text-2xl font-extrabold">
        <span className="text-black">Black</span>
        <span className="text-emerald-600">Tree</span>
      </div>

      {/* Nav */}
      <nav className="flex space-x-8 text-black font-medium">
        <a href="#" className="hover:text-emerald-600 transition">Home</a>
        <a href="#" className="hover:text-emerald-600 transition">Marketplace</a>
        <a href="#" className="hover:text-emerald-600 transition">Pricing</a>
        <a href="#" className="hover:text-emerald-600 transition">Developers</a>
      </nav>
      </div>

      {/* Login Button */}
      <div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
          Login
        </button>
      </div>
    </header>
  );
}

export default Header;
