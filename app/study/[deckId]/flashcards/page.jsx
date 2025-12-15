"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import FlashcardPlayer from "@/components/FlashcardPlayer";

export default function FlashcardsPage() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!deckId) return;
    (async () => {
      const { data: d } = await supabase.from("decks").select("id,title").eq("id", deckId).single();
      setDeck(d || null);

      const { data: c } = await supabase.from("cards").select("id,front,back,created_at").eq("deck_id", deckId).order("created_at");
      setCards(c || []);
    })();
  }, [deckId]);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flashcards — {deck?.title || ""}</h1>
        <Link className="underline text-sm" href={`/decks/${deckId}`}>Back</Link>
      </div>

      <div className="card p-4">
        <FlashcardPlayer cards={cards} />
      </div>

      <Link className="underline text-sm" href={`/decks/${deckId}`}>Back</Link>
    </main>
  );
}
