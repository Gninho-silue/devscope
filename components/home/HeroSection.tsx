"use client";

import { motion } from "framer-motion";
import SearchForm from "@/components/home/SearchForm";

/* ─── Stagger config ────────────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/* ─── Tech badges ─────────────────────────────────────────────────────────
   dotClass: a Tailwind bg-[color] arbitrary value — compiled to CSS at
   build time, not an inline style.
────────────────────────────────────────────────────────────────────────── */
const TECH_BADGES = [
  { label: "TypeScript", dotClass: "bg-[#3178c6]" },
  { label: "React",      dotClass: "bg-[#61dafb]" },
  { label: "Java",       dotClass: "bg-[#f89820]" },
  { label: "Python",     dotClass: "bg-[#3776ab]" },
  { label: "Node.js",    dotClass: "bg-[#68a063]" },
  { label: "Rust",       dotClass: "bg-[#ce4a0c]" },
  { label: "Go",         dotClass: "bg-[#00add8]" },
  { label: "Docker",     dotClass: "bg-[#2496ed]" },
] as const;

/* ─── Orb animation config ──────────────────────────────────────────────── */
const ORB_ANIMATIONS = [
  { orbClass: "hero-orb hero-orb-1", delay: 0,   duration: 9  },
  { orbClass: "hero-orb hero-orb-2", delay: 2,   duration: 11 },
  { orbClass: "hero-orb hero-orb-3", delay: 1.5, duration: 8  },
  { orbClass: "hero-orb hero-orb-4", delay: 3,   duration: 13 },
] as const;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-brand-background">

      {/* ── Gradient mesh background ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0b1223,#0f1e3a,#0b1223)] pointer-events-none" />

      {/* ── Floating orbs — positions + radial gradients defined in globals.css ── */}
      {ORB_ANIMATIONS.map(({ orbClass, delay, duration }) => (
        <motion.div
          key={orbClass}
          className={orbClass}
          animate={{ y: [0, -28, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Subtle grid overlay — background-image defined in globals.css ── */}
      <div className="hero-grid absolute inset-0 pointer-events-none opacity-[0.03]" />

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-4xl mx-auto w-full"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-accent text-sm font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            AI-Powered GitHub Analysis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-heading font-bold text-[#f9fafb] text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.1] tracking-tight mb-6"
        >
          Analyze any{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary via-brand-accent to-brand-primary">
              GitHub profile
            </span>
          </span>
          {" "}with AI
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-[#9ca3af] text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
        >
          Get an instant AI-powered report on any developer&apos;s tech stack,
          seniority level, strengths, and job role recommendations.
        </motion.p>

        {/* Search form */}
        <motion.div variants={fadeUp} className="w-full flex justify-center mb-12">
          <SearchForm />
        </motion.div>

        {/* Tech badges */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <p className="text-brand-muted text-xs uppercase tracking-widest font-medium">
            Detects languages &amp; frameworks like
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_BADGES.map(({ label, dotClass }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/4 text-[#d1d5db] text-xs font-medium backdrop-blur-sm hover:border-white/20 hover:bg-white/7 transition-all duration-200"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-brand-background to-transparent pointer-events-none" />
    </section>
  );
}
