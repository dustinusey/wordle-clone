"use client";

import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
];

export default function Keyboard() {
  const { targetWord, guesses, handleKeyPress } = useGame();

  const getKeyState = (key) => {
    if (!guesses.length) return "";

    const keyLower = key.toLowerCase();
    let state = "";

    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] !== keyLower) continue;

        if (guess[i] === targetWord[i]) {
          return "correct";
        } else if (targetWord.includes(guess[i])) {
          state = "present";
        } else if (!state) {
          state = "absent";
        }
      }
    }

    return state;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1.75,
        duration: 0.5,
        ease: "easeOut",
      }}
      className="w-full flex flex-col gap-2 px-4"
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const state = getKeyState(key);
            const isWideKey = key === "Enter" || key === "Backspace";

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${isWideKey ? "w-[min(12vw,6rem)]" : "w-[min(8vw,4rem)]"} 
                  h-[min(12vw,6rem)]
                  flex items-center justify-center
                  rounded-md font-semibold 
                  text-[min(4vw,2rem)]
                  transition-colors duration-150
                  ${state === "correct" ? "bg-emerald-400 text-white" : ""}
                  ${state === "present" ? "bg-amber-400 text-white" : ""}
                  ${state === "absent" ? "bg-gray-400 text-white" : ""}
                  ${
                    !state
                      ? "bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700"
                      : ""
                  }
                `}
              >
                {key === "Backspace" ? "←" : key}
              </button>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}
