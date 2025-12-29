import React from "react";
import { NotebookPen } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingNotesButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-0 z-[60] bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-l-full shadow-lg hover:shadow-xl flex items-center gap-2 px-3 py-2.5 group"
      style={{ top: '40%' }}
      initial={{ x: 0 }}
      whileHover={{ x: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title="Notes"
    >
      <NotebookPen className="w-5 h-5" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-[70px] transition-all duration-300 whitespace-nowrap text-sm font-medium">
        Notes
      </span>
    </motion.button>
  );
}