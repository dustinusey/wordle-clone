"use client";

import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeUserData = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Initialize user data if it doesn't exist
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        points: 0,
        dailiesPlayed: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        devMode: false, // Default to false for production
        lastDailyPlayed: null, // Track when the last daily game was played
        createdAt: new Date().toISOString(),
      });
      console.log("New user document created");
    } else {
      // Update existing user data if needed
      const currentData = userDoc.data();
      const updates = {};

      // Only update fields that are missing or need updating
      if (!currentData.points) updates.points = 0;
      if (!currentData.dailiesPlayed) updates.dailiesPlayed = 0;
      if (!currentData.winRate) updates.winRate = 0;
      if (!currentData.currentStreak) updates.currentStreak = 0;
      if (!currentData.bestStreak) updates.bestStreak = 0;
      if (!currentData.devMode) updates.devMode = false;
      if (!currentData.lastDailyPlayed) updates.lastDailyPlayed = null;
      if (!currentData.createdAt) updates.createdAt = new Date().toISOString();

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        console.log("User document updated with missing fields");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          await initializeUserData(user);
        }
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await initializeUserData(result.user);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
