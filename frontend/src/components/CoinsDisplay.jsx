import React from "react";
import { Coins } from "lucide-react";

export default function CoinsDisplay({ coins }) {
  return (
    <div
      data-testid="coins-display"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-[#FFCB45] to-[#F5A623] border-2 border-[#A36A00] text-[#3a2200] font-black shadow-[0_3px_0_0_#A36A00]"
    >
      <Coins className="w-4 h-4" />
      <span className="tabular-nums" data-testid="coins-amount">{coins ?? 0}</span>
    </div>
  );
}
