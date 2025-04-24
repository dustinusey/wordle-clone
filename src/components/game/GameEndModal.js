"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGame } from "../../contexts/GameContext";

export default function GameEndModal() {
  const router = useRouter();
  const { gameWon, targetWord, guesses, isDailyGame } = useGame();
  const [buttonText, setButtonText] = useState("Copy Results");

  const getShareText = () => {
    const emojiGrid = guesses
      .map((guess) => {
        return guess
          .split("")
          .map((letter, i) => {
            if (letter === targetWord[i]) return "🟩";
            if (targetWord.includes(letter)) return "🟨";
            return "⬜";
          })
          .join("");
      })
      .join("\n");

    return `Wordle Clone ${gameWon ? "🎉" : "😢"}\n\n${emojiGrid}\n\nPlay at: ${
      window.location.origin
    }`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareText());
    setButtonText("Copied!");
    setTimeout(() => setButtonText("Copy Results"), 2000);
  };

  const renderPreview = () => {
    return guesses.map((guess, rowIndex) => {
      const isWinningRow = gameWon && rowIndex === guesses.length - 1;
      return (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {guess.split("").map((letter, colIndex) => {
            let bgColor = "bg-zinc-200";
            if (letter === targetWord[colIndex]) {
              bgColor = "bg-emerald-400";
            } else if (targetWord.includes(letter)) {
              bgColor = "bg-amber-400";
            }
            return (
              <div
                key={colIndex}
                className={`w-6 h-6 ${bgColor} rounded-md flex items-center justify-center text-white font-bold`}
              >
                {isWinningRow ? letter.toUpperCase() : ""}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // Calculate points earned/lost
  const getPointsChange = () => {
    if (gameWon) {
      switch (guesses.length) {
        case 1:
          return 10;
        case 2:
          return 5;
        case 3:
          return 4;
        case 4:
          return 3;
        case 5:
          return 2;
        case 6:
          return 1;
        default:
          return 1;
      }
    } else {
      return -3;
    }
  };

  const pointsChange = getPointsChange();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white max-w-md w-full mx-4 space-y-8 rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          {gameWon ? "Congratulations!" : "Better luck next time!"}
        </h2>

        {isDailyGame && (
          <div className="text-center">
            <p className="text-gray-600">
              {gameWon
                ? `${guesses.length}/6 tries`
                : "You'll get it next time!"}
            </p>
            <p
              className={`mt-2 font-semibold ${
                gameWon ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {gameWon ? "+" : ""}
              {pointsChange} points
            </p>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm text-center text-gray-600">
              Share your results:
            </p>
            <div className="space-y-2">{renderPreview()}</div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={copyToClipboard}
              size="lg"
              className="w-full bg-primary hover:bg-primary dark:bg-primary  hover:dark:bg-primary text-white dark:text-white "
            >
              {buttonText}
            </Button>
            <Button
              onClick={() => router.push("/home")}
              variant="secondary"
              size="lg"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
