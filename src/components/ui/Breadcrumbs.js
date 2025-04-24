"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  const breadcrumbs = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}`;
    const label = path.charAt(0).toUpperCase() + path.slice(1);

    return {
      href,
      label: label === "Play" ? "Daily Challenge" : label,
      isLast: index === paths.length - 1,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-background/50 dark:bg-background-dark/50 backdrop-blur-sm"
    >
      <div className="max-w-4xl mx-auto px-8 py-2">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/home"
            className="text-secondary hover:text-primary dark:text-zinc-300 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <span className="text-secondary/50 dark:text-zinc-400">/</span>
              {crumb.isLast ? (
                <span className="text-primary font-medium dark:text-white">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-secondary hover:text-primary dark:text-zinc-300 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
