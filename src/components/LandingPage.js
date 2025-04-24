"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const { signInWithGoogle, error } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push("/home");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestPlay = () => {
    router.push("/play");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-md"
      >
        <h1 className="text-4xl font-bold text-foreground dark:text-foreground-dark">
          Wordle Clone
        </h1>

        <p className="text-secondary dark:text-secondary-dark">
          A minimal take on the classic word game. Test your vocabulary,
          practice as much as you want, and fight your way to the top with
          others.
        </p>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGuestPlay}
          >
            Play as Guest
          </Button>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error.message || "An error occurred during sign in"}
          </div>
        )}

        <div className="text-sm text-secondary dark:text-secondary-dark">
          Sign in to save your scores and track your game history
        </div>
      </motion.div>
    </div>
  );
}
