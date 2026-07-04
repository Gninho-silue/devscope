"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitHubIcon } from "@/components/shared/BrandIcons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-[#0b1223]/80 border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="DevScope home"
        >
          <span className="w-8 h-8 rounded-lg bg-[#2453d3] flex items-center justify-center text-white text-sm font-bold font-heading shrink-0 group-hover:bg-[#1e45b8] transition-colors">
            D
          </span>
          <span className="text-xl font-bold font-heading tracking-tight text-[#2453d3] group-hover:text-[#60a5fa] transition-colors">
            DevScope
          </span>
        </Link>

        {/* Right side */}
        <Link
          href="https://github.com/Gninho-silue"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Author's GitHub profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#f9fafb]/70 hover:text-[#f9fafb] hover:bg-white/5 transition-all duration-200 text-sm font-medium"
        >
          <GitHubIcon className="w-5 h-5" />
          <span className="hidden sm:inline">GitHub</span>
        </Link>
      </nav>
    </header>
  );
}
