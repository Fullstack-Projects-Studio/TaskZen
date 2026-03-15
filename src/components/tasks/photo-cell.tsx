"use client";

import { Camera } from "lucide-react";
import { motion } from "framer-motion";

interface PhotoCellProps {
  hasPhoto: boolean;
  disabled: boolean;
  onClick: () => void;
  color: string;
}

export function PhotoCell({ hasPhoto, disabled, onClick, color }: PhotoCellProps) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center rounded-full bg-background shadow-sm border p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={hasPhoto ? "View photo" : "Add photo"}
      title={hasPhoto ? "View photo" : "Add photo"}
    >
      <Camera
        className="h-2.5 w-2.5"
        style={{ color: hasPhoto ? color : undefined }}
        strokeWidth={hasPhoto ? 2.5 : 1.5}
      />
    </motion.button>
  );
}
