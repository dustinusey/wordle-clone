"use client";

import Navigation from "@/components/layout/Navigation";
import BackToTop from "@/components/ui/BackToTop";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomeLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
        <div className="text-foreground dark:text-foreground-dark">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <Navigation />
      <main className="max-w-4xl mx-auto px-8 pb-8">{children}</main>
      <BackToTop />
    </div>
  );
}
