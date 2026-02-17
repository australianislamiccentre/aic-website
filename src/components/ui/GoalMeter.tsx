"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp } from "lucide-react";

interface GoalMeterProps {
  label?: string;
  goal: number;
  raised: number;
  className?: string;
}

export function GoalMeter({
  label,
  goal,
  raised,
  className = "",
}: GoalMeterProps) {
  const percentage = Math.min((raised / goal) * 100, 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-5 border border-teal-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">
            {label || "Fundraising Goal"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-teal-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-500">Raised: </span>
          <span className="font-semibold text-teal-600">
            {formatCurrency(raised)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Goal: </span>
          <span className="font-semibold text-gray-700">
            {formatCurrency(goal)}
          </span>
        </div>
      </div>
    </div>
  );
}
