"use client";

import { motion } from "framer-motion";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: string;
  disabled?: boolean;
  size?: number;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  color = "#6366f1",
  disabled = false,
  size = 24,
}: AnimatedCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label="Toggle task completion"
      onClick={onChange}
      disabled={disabled}
      className="relative flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="cursor-pointer"
      >
        {/* Background circle */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke={checked ? color : "currentColor"}
          strokeWidth="2"
          fill={checked ? color : "transparent"}
          className={checked ? "" : "text-muted-foreground"}
          initial={false}
          animate={{
            fill: checked ? color : "transparent",
            stroke: checked ? color : "currentColor",
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Checkmark */}
        <motion.path
          d="M8 12.5L10.5 15L16 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            pathLength: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 0.1 },
          }}
        />
      </svg>

      {/* Bounce ring animation on check */}
      {checked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}` }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </button>
  );
}
