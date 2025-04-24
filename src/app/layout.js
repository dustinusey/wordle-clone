import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Inter } from "next/font/google";
import { GameProvider } from "../contexts/GameContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wordle Clone",
  description: "A modern Wordle clone with daily challenges and practice mode",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark`}
      >
        <AuthProvider>
          <ThemeProvider>
            <GameProvider>{children}</GameProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
