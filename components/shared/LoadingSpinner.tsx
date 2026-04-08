"use client";

import { AnimatePresence, motion } from "framer-motion";

interface LoadingSpinnerProps {
  currentStep: string;
}

export default function LoadingSpinner({ currentStep }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-background px-6">
      {/* Spinner ring */}
      <div className="relative h-16 w-16">
        {/* Outer glow track */}
        <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20" />
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="h-2 w-2 rounded-full bg-brand-accent"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.75, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step text — cross-fades between steps via AnimatePresence */}
      <div className="h-6 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-sm text-brand-muted font-body tracking-wide"
          >
            {currentStep}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
