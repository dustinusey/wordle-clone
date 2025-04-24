"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setPoints(userDoc.data().points);
          } else {
            // If document doesn't exist, set points to 0
            setPoints(0);
          }
        } catch (error) {
          console.error("Error fetching user points:", error);
          setPoints(0);
        }
      }
    };

    fetchUserPoints();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 dark:bg-background-dark/80"
    >
      <div className="flex justify-between items-center p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden">
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground dark:text-foreground-dark">
              {(user?.displayName || "Player").split(" ")[0]}
            </h1>
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-full text-xs">
              <span className="text-secondary dark:text-secondary-dark">
                Points
              </span>
              <span className="font-semibold text-foreground dark:text-foreground-dark">
                {points}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
