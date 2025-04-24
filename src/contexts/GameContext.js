"use client";

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const GameContext = createContext();

export function GameProvider({ children }) {
  const { user, loading } = useAuth();
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showDailyGameModal, setShowDailyGameModal] = useState(false);

  // Debug user info
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Auth loading state:", loading);
    if (user) {
      console.log("User ID:", user.uid);
      console.log("User email:", user.email);
    }
  }, [user, loading]);

  // Core game state
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [devMode, setDevMode] = useState(true); // Set to true for development

  const resetGameState = () => {
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setGameWon(false);
    setTargetWord("");
  };

  const getRandomWord = async () => {
    try {
      const response = await fetch("/api/words");
      const data = await response.json();
      const words = data.words;
      return words[Math.floor(Math.random() * words.length)];
    } catch (error) {
      console.error("Error fetching random word:", error);
      return "ERROR"; // Fallback word
    }
  };

  // Load a random word when the game initializes
  useEffect(() => {
    const initializeGame = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode");
      console.log("Game mode from URL:", mode);
      setIsDailyGame(mode === "daily");
      console.log("isDailyGame set to:", mode === "daily");

      // Always set a new word when initializing
      const newWord = await getRandomWord();
      setTargetWord(newWord);
      setGuesses([]);
      setCurrentGuess("");
      setGameOver(false);
      setGameWon(false);
    };

    if (!loading) {
      initializeGame();
    }
  }, [loading]); // Remove window.location.search from dependencies

  const updatePoints = async (pointsToAdd) => {
    console.log("Attempting to update points...");
    console.log("User object:", user);
    console.log("Auth loading state:", loading);

    if (loading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("No user found, cannot update points");
      return;
    }

    try {
      console.log("Updating points for user ID:", user.uid);
      const userRef = doc(db, "users", user.uid);
      console.log("User reference path:", userRef.path);

      // Get current points
      const userDoc = await getDoc(userRef);
      const currentPoints = userDoc.data()?.points || 0;
      console.log("Current points:", currentPoints);

      // Calculate new points, ensuring we don't go below 0
      const newPoints = Math.max(0, currentPoints + pointsToAdd);
      console.log("New points:", newPoints);

      await updateDoc(userRef, {
        points: newPoints,
      });
      console.log("Points update successful");
    } catch (error) {
      console.error("Error updating points:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
      });
    }
  };

  const saveGameHistory = async (points, won) => {
    console.log("=== Starting to save game history ===");
    console.log("User:", user);
    console.log("Points:", points);
    console.log("Won:", won);
    console.log("Target word:", targetWord);
    console.log("Number of tries:", guesses.length + 1);
    console.log("Game type:", isDailyGame ? "daily" : "practice");
    console.log("Is daily game:", isDailyGame);

    if (!user) {
      console.log("No user found, cannot save game history");
      return;
    }

    try {
      console.log("Creating user reference...");
      const userRef = doc(db, "users", user.uid);
      console.log("User reference path:", userRef.path);

      // Get current user data
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.data();

      // Calculate total tries based on game outcome
      const totalTries = won ? guesses.length + 1 : 6;

      const gameData = {
        date: new Date().toISOString(),
        points: points,
        word: targetWord,
        tries: totalTries,
        won: won,
        type: isDailyGame ? "daily" : "practice",
      };
      console.log("Game data to save:", gameData);

      // Save game history first
      console.log("Creating games collection reference...");
      const gamesRef = collection(userRef, "games");
      console.log("Games collection path:", gamesRef.path);

      console.log("Adding new game document...");
      const docRef = await addDoc(gamesRef, gameData);
      console.log("Game document added with ID:", docRef.id);

      // Only update user stats for daily games
      if (isDailyGame) {
        console.log("=== Starting user stats update ===");
        console.log("Current user data:", currentData);

        const dailiesPlayed = (currentData.dailiesPlayed || 0) + 1;
        console.log("New dailiesPlayed:", dailiesPlayed);

        const totalWins = Math.round(
          ((currentData.winRate || 0) * (currentData.dailiesPlayed || 0)) / 100
        );
        console.log("Total wins:", totalWins);

        const newWinRate = Math.round(
          ((totalWins + (won ? 1 : 0)) / dailiesPlayed) * 100
        );
        console.log("New win rate:", newWinRate);

        // Get the last game's date to check streak
        let currentStreak = currentData.currentStreak || 0;
        let bestStreak = currentData.bestStreak || 0;

        try {
          console.log("Fetching last game data...");
          const lastGameQuery = query(
            gamesRef,
            where("type", "==", "daily"),
            orderBy("date", "desc"),
            limit(1)
          );
          const lastGameSnapshot = await getDocs(lastGameQuery);
          const lastGame = lastGameSnapshot.docs[0]?.data();
          console.log("Last game data:", lastGame);

          console.log(
            "Initial streaks - current:",
            currentStreak,
            "best:",
            bestStreak
          );

          if (won) {
            if (lastGame) {
              const lastGameDate = new Date(lastGame.date);
              const currentDate = new Date();
              const timeDiff = currentDate - lastGameDate;
              const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              console.log("Days since last game:", daysDiff);

              if (daysDiff === 0) {
                // Same day, don't increment streak
                console.log("Same day, streak remains the same");
              } else if (daysDiff === 1) {
                // Next day, increment streak
                currentStreak += 1;
                bestStreak = Math.max(bestStreak, currentStreak);
                console.log("Next day, streak incremented to:", currentStreak);
              } else {
                // More than one day gap, reset streak
                currentStreak = 1;
                bestStreak = Math.max(bestStreak, currentStreak);
                console.log("Gap in days, streak reset to:", currentStreak);
              }
            } else {
              // First game, start streak
              currentStreak = 1;
              bestStreak = Math.max(bestStreak, currentStreak);
              console.log("First game, streak started at:", currentStreak);
            }
          } else {
            // Game lost, reset streak
            currentStreak = 0;
            console.log("Game lost, streak reset to 0");
          }
        } catch (error) {
          console.error("Error calculating streaks:", error);
          // Reset streaks on error
          currentStreak = won ? 1 : 0;
          bestStreak = Math.max(currentData.bestStreak || 0, currentStreak);
        }

        // Update user stats
        const updateData = {
          dailiesPlayed,
          winRate: newWinRate,
          currentStreak,
          bestStreak,
          points: (currentData.points || 0) + points,
          lastDailyPlayed: new Date().toISOString(), // Update last daily played timestamp
        };

        console.log("Attempting to update user stats with:", updateData);
        try {
          await updateDoc(userRef, updateData);
          console.log("User stats update successful");

          // Verify the update
          const updatedDoc = await getDoc(userRef);
          const updatedData = updatedDoc.data();
          console.log("Updated user data:", updatedData);
        } catch (error) {
          console.error("Error updating user stats:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack,
          });
        }
      }

      // Check if we need to delete old games
      console.log("Checking for old games to delete...");
      const gamesQuery = query(gamesRef, orderBy("date", "desc"));
      const gamesSnapshot = await getDocs(gamesQuery);
      console.log("Total games found:", gamesSnapshot.docs.length);

      if (gamesSnapshot.docs.length > 20) {
        console.log("Deleting old games...");
        const oldGames = gamesSnapshot.docs.slice(20);
        for (const oldGame of oldGames) {
          await deleteDoc(oldGame.ref);
          console.log("Deleted game with ID:", oldGame.id);
        }
      }
      console.log("=== Game history saved successfully ===");
    } catch (error) {
      console.error("Error saving game history:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
    }
  };

  // Handle keyboard input
  const handleKeyPress = async (key) => {
    if (gameOver) return;

    // Handle letter input
    if (key.length === 1 && /^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key.toLowerCase());
    }
    // Handle backspace
    else if (key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
    // Handle enter
    else if (key === "Enter" && currentGuess.length === 5) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      // Check if the game is won
      if (currentGuess === targetWord) {
        setGameWon(true);
        setGameOver(true);

        // Calculate points based on number of guesses
        let pointsToAdd = 0;
        switch (newGuesses.length) {
          case 1:
            pointsToAdd = 10;
            break;
          case 2:
            pointsToAdd = 5;
            break;
          case 3:
            pointsToAdd = 4;
            break;
          case 4:
            pointsToAdd = 3;
            break;
          case 5:
            pointsToAdd = 2;
            break;
          case 6:
            pointsToAdd = 1;
            break;
          default:
            pointsToAdd = 1;
        }

        console.log("Game won! Mode:", isDailyGame ? "daily" : "practice");
        console.log("Points to add:", pointsToAdd);

        // Only award points for daily games
        if (isDailyGame) {
          await updatePoints(pointsToAdd);
        }

        // Save game history with correct points and type
        await saveGameHistory(isDailyGame ? pointsToAdd : 0, true);
      }
      // Check if the game is lost
      else if (newGuesses.length >= 6) {
        setGameOver(true);

        console.log("Game lost! Mode:", isDailyGame ? "daily" : "practice");

        // Only deduct points for daily games
        if (isDailyGame) {
          await updatePoints(-3);
        }

        // Save game history with correct points and type
        await saveGameHistory(isDailyGame ? -3 : 0, false);
      }

      setCurrentGuess("");
    }
  };

  const startNewGame = async (mode = "daily") => {
    console.log("Starting new game with mode:", mode);
    const searchParams = new URLSearchParams(window.location.search);
    const urlMode = searchParams.get("mode");
    const gameMode = urlMode || mode;
    setIsDailyGame(gameMode === "daily");
    console.log("isDailyGame set to:", gameMode === "daily");

    // If it's a daily game, check if we can play
    if (gameMode === "daily" && user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Check if we can play a daily game
        if (!userData.devMode) {
          const lastDailyPlayed = userData.lastDailyPlayed
            ? new Date(userData.lastDailyPlayed)
            : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (lastDailyPlayed) {
            lastDailyPlayed.setHours(0, 0, 0, 0);
            if (lastDailyPlayed.getTime() === today.getTime()) {
              console.log("Daily game already played today");
              setShowDailyGameModal(true);
              return false; // Return false to indicate game should not start
            }
          }
        }
      } catch (error) {
        console.error("Error checking daily game availability:", error);
      }
    }

    // Reset game state and set new word
    const newWord = await getRandomWord();
    setTargetWord(newWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setGameWon(false);
    return true; // Return true to indicate game can start
  };

  const value = {
    targetWord,
    guesses,
    currentGuess,
    gameOver,
    gameWon,
    devMode,
    isDailyGame,
    setIsDailyGame,
    handleKeyPress,
    startNewGame,
    showDailyGameModal,
    setShowDailyGameModal,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
