"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold text-primary mb-4">
        Something went wrong!
      </h2>
      <button
        onClick={() => reset()}
        className="px-8 py-4 rounded-2xl bg-primary text-white hover:bg-primary-light active:bg-primary-dark transition-all duration-200"
      >
        Try again
      </button>
    </div>
  );
}
