"use client";

import Button from "@/components/ui/Button";
import DailyGameModal from "@/components/ui/DailyGameModal";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
} from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { startNewGame, showDailyGameModal, setShowDailyGameModal } = useGame();
  const [currentPage, setCurrentPage] = useState(1);
  const [topUsers, setTopUsers] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top users
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, orderBy("points", "desc"), limit(3));
        const usersSnapshot = await getDocs(usersQuery);

        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTopUsers(users);

        // Fetch user data and recent games if user is logged in
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();

          const gamesRef = collection(userRef, "games");
          const gamesQuery = query(gamesRef, orderBy("date", "desc"));
          const gamesSnapshot = await getDocs(gamesQuery);

          const games = gamesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setRecentGames(games);
          setUserData(userData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePlay = async (mode) => {
    const canStartGame = await startNewGame(mode);
    if (canStartGame) {
      router.push(`/play?mode=${mode}`);
    }
  };

  const totalPages = Math.ceil(recentGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGames = recentGames.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      {showDailyGameModal && (
        <DailyGameModal onClose={() => setShowDailyGameModal(false)} />
      )}
      {/* Game Modes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="card space-y-4">
          <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            Daily Challenge
          </h2>
          <p className="text-secondary dark:text-secondary-dark">
            One attempt per day. Compete with players worldwide and climb the
            leaderboard.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => handlePlay("daily")}
          >
            Play
          </Button>
        </div>

        <div className="card space-y-4">
          <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            Practice Mode
          </h2>
          <p className="text-secondary dark:text-secondary-dark">
            Play unlimited games to improve your skills. No pressure, just fun!
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => handlePlay("practice")}
          >
            Play
          </Button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card space-y-6"
      >
        <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
          Your Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="text-center space-y-3">
            <div className="text-4xl font-medium text-foreground dark:text-foreground-dark">
              {userData?.dailiesPlayed || 0}
            </div>
            <div className="text-secondary dark:text-secondary-dark">
              Daily Games Played
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-medium text-foreground dark:text-foreground-dark">
              {userData?.winRate || 0}%
            </div>
            <div className="text-secondary dark:text-secondary-dark">
              Win Rate
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-medium text-foreground dark:text-foreground-dark">
              {userData?.currentStreak || 0}
            </div>
            <div className="text-secondary dark:text-secondary-dark">
              Current Streak
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-medium text-foreground dark:text-foreground-dark">
              {userData?.bestStreak || 0}
            </div>
            <div className="text-secondary dark:text-secondary-dark">
              Best Streak
            </div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            Leaderboard
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/leaderboard")}
          >
            View All
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-secondary dark:text-secondary-dark">
              Loading leaderboard...
            </div>
          </div>
        ) : topUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex p-4 rounded-2xl bg-primary/5 dark:bg-primary/10"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden mr-4">
                  <Image
                    src={user.photoURL || "https://i.pravatar.cc/150?img=1"}
                    alt={user.displayName || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-secondary dark:text-secondary-dark">
                      {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
                    </span>
                    <span className="font-medium text-foreground dark:text-foreground-dark">
                      {(user.displayName || "Anonymous").split(" ")[0]}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-foreground dark:text-foreground-dark font-medium self-start">
                    {user.points || 0} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary dark:text-secondary-dark">
            No players yet. Be the first to join the leaderboard!
          </div>
        )}
      </motion.div>

      {/* Recent Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card space-y-4"
      >
        <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
          Your Recent Games
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-secondary dark:text-secondary-dark">
              Loading game history...
            </div>
          </div>
        ) : recentGames.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20 dark:border-primary/40">
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80"></th>
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80">
                      Date
                    </th>
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80">
                      Points
                    </th>
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80">
                      Word
                    </th>
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80">
                      Tries
                    </th>
                    <th className="text-left py-6 px-6 text-secondary dark:text-secondary-dark/80">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentGames.map((game) => (
                    <tr
                      key={game.id}
                      className="border-b border-primary/10 dark:border-primary/30 last:border-0"
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                            <Image
                              src={
                                user?.photoURL ||
                                "https://i.pravatar.cc/150?img=1"
                              }
                              alt={user?.displayName || "User"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-foreground dark:text-foreground-dark/90">
                            {(user?.displayName || "User").split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-foreground dark:text-foreground-dark/90">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/5 dark:bg-primary/10 text-secondary dark:text-secondary-dark/80">
                            <FaRegCalendarAlt className="mr-1.5" />
                            {new Date(game.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${
                            game.points > 0
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : game.points < 0
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {game.points > 0 ? "+" : ""}
                          {game.points}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <span className="text-sm text-secondary dark:text-secondary-dark/80 font-mono">
                          {game.word.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-foreground dark:text-foreground-dark/90">
                        {game.tries}/6
                      </td>
                      <td className="py-6 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${
                            game.type === "daily"
                              ? "bg-primary text-white dark:bg-white dark:text-primary"
                              : "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-dark/80"
                          }`}
                        >
                          {game.type === "daily" ? "Daily" : "Practice"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-foreground dark:text-foreground-dark min-w-[100px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-secondary dark:text-secondary-dark">
            No games played yet. Start playing to see your history!
          </div>
        )}
      </motion.div>
    </div>
  );
}
