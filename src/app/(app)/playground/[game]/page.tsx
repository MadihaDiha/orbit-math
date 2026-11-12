import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { GamePlayer } from "@/components/games/GamePlayer";

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const g = getGame((await params).game);
  return { title: g?.title ?? "Permainan" };
}

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!getGame(game)) notFound();
  return <GamePlayer slug={game} />;
}
