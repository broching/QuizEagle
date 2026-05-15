"use client";

import GeneratorEmbed from "@/app/(landing)/generator-embed";

export default function NewDeckPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-1">New Deck</p>
        <h1 className="text-2xl font-extrabold text-[#15172B] tracking-tight">Generate a study deck</h1>
        <p className="text-sm text-[#6A6F87] mt-1">Your deck is saved automatically once it&apos;s generated.</p>
      </div>
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 24px rgba(66,85,255,0.08), 0 1px 4px rgba(0,0,0,0.05)",
          border: "1px solid #e0e3f5",
        }}
      >
        <GeneratorEmbed />
      </div>
    </div>
  );
}
