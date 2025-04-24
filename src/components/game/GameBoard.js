"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "../../contexts/GameContext";
import GameEndModal from "./GameEndModal";

export default function GameBoard() {
  const {
    targetWord,
    guesses,
    currentGuess,
    gameOver,
    gameWon,
    devMode,
    handleKeyPress,
  } = useGame();

  useEffect(() => {
    if (gameWon) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount: 50,
        scalar: 1.5, // Make particles larger
        colors: [
          "#f3f4f6",
          "#e5e7eb",
          "#d1d5db",
          "#9ca3af",
          "#6b7280",
          "#4b5563",
          "#374151",
          "#1f2937",
          "#111827",
        ], // Grayscale colors from light to dark
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [gameWon]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, handleKeyPress]);

  // Helper function to determine letter state
  const getLetterState = (letter, position, guess) => {
    if (!letter) return "";
    if (letter === targetWord[position]) return "correct";
    if (targetWord.includes(letter)) return "present";
    return "absent";
  };

  // Render a single cell
  const renderCell = (rowIndex, colIndex) => {
    const guess = guesses[rowIndex];
    const letter = guess ? guess[colIndex] : "";
    const state = guess ? getLetterState(letter, colIndex, guess) : "";
    const isCurrentRow = rowIndex === guesses.length;
    const displayLetter = isCurrentRow ? currentGuess[colIndex] || "" : letter;

    return (
      <motion.div
        key={colIndex}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: (rowIndex * 5 + colIndex) * 0.05,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className={`
          relative aspect-square w-full
          flex items-center justify-center
          text-[min(8vw,4rem)] font-bold rounded-md
          ${state === "correct" ? "bg-emerald-400 text-white" : ""}
          ${state === "present" ? "bg-amber-400 text-white" : ""}
          ${state === "absent" ? "bg-gray-400 text-white" : ""}
          ${!state ? "bg-gray-200 dark:bg-zinc-800" : ""}
        `}
      >
        <span className="absolute">{displayLetter}</span>
      </motion.div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      <div className="grid grid-rows-6 gap-4 w-full h-full">
        {[...Array(6)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4 h-full">
            {[...Array(5)].map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>

      {gameOver && <GameEndModal />}

      {devMode && (
        <div className="fixed bottom-4 right-4 bg-secondary/20 px-4 py-2 rounded-md text-sm">
          Dev Mode: {targetWord}
        </div>
      )}
    </div>
  );
}
