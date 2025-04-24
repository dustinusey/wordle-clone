"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-zinc-300">
      <Link href="/home" className="hover:text-gray-900 dark:hover:text-white">
        Home
      </Link>
      {segments.map((segment, index) => (
        <div key={segment} className="flex items-center space-x-2">
          <span className="text-gray-400 dark:text-zinc-500">/</span>
          {index === segments.length - 1 ? (
            <span className="text-gray-900 dark:text-white">{segment}</span>
          ) : (
            <Link
              href={`/${segments.slice(0, index + 1).join("/")}`}
              className="hover:text-gray-900 dark:hover:text-white"
            >
              {segment}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
