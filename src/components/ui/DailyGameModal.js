"use client";

import Button from "@/components/ui/Button";

export default function DailyGameModal({ onClose }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 flex items-center justify-center z-50 w-full h-screen">
      <div className="bg-white max-w-md w-full mx-4 space-y-6 rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Daily Challenge Already Played
        </h2>
        <p className="text-gray-600 text-center">
          You've already played today's daily challenge! Come back tomorrow for
          a new one.
        </p>
        <Button size="lg" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
