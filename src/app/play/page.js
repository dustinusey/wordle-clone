"use client";

import { useSearchParams } from "next/navigation";
import GameBoard from "../../components/game/GameBoard";
import Keyboard from "../../components/game/Keyboard";
import Navigation from "../../components/layout/Navigation";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

export default function PlayPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Breadcrumbs />
      <div className="flex-1 flex flex-col p-4 ">
        <div className="flex-1 min-h-0 flex flex-col gap-20 mt-16">
          <div className="min-h-0 max-w-xl mx-auto w-full">
            <GameBoard />
          </div>
          <div className="pb-4 max-w-4xl mx-auto w-full">
            <Keyboard />
          </div>
        </div>
      </div>
    </div>
  );
}
