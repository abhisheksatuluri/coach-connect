import React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, bgColor, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColor} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${bgColor} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}