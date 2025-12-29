import React from "react";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function FloatingKBButton({ onClick, articleCount }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-0 z-[60] bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-l-full shadow-lg hover:shadow-xl flex items-center gap-2 px-3 py-2.5 group"
      style={{ top: 'calc(40% + 58px)' }}
      initial={{ x: 0 }}
      whileHover={{ x: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title="Knowledge"
    >
      <div className="relative">
        <BookOpen className="w-5 h-5" />
        {articleCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] flex items-center justify-center"
          >
            {articleCount}
          </Badge>
        )}
      </div>
      <span className="max-w-0 overflow-hidden group-hover:max-w-[70px] transition-all duration-300 whitespace-nowrap text-sm font-medium">
        Knowledge
      </span>
    </motion.button>
  );
}