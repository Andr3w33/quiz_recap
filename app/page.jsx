"use client";

import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [decks, setDecks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadDecks() {
    setErr(null);
    setLoading(true);
    const { data, error } = await supabase
      .from("decks")
      .select("id,title,description,created_at")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    setDecks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDecks();
  }, []);

  async function createDeck(e) {
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const d = description.trim();
    if (!t) return setErr("Deck title is required.");

    // 1) Check if a deck with same title already exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from("decks")
      .select("id")
      .ilike("title", t); // ilike = case-insensitive match

    if (checkError) return setErr(checkError.message);

    if (existing && existing.length > 0) {
      return setErr("That deck title already exists. Please choose a different title.");
    }

    // 2) Insert if unique
    const { error } = await supabase.from("decks").insert({
      title: t,
      description: d || null,
    });

    // If you also added the DB unique index, handle that error too
    if (error) {
      // Postgres unique violation code = 23505
      if (error.code === "23505") {
        return setErr("That deck title already exists. Please choose a different title.");
      }
      return setErr(error.message);
    }

    setTitle("");
    setDescription("");
    loadDecks();
  }

  async function deleteDeck(deckId) {
    // Delete the deck
    const { error } = await supabase
      .from("decks")
      .delete()
      .eq("id", deckId);

    if (error) return setErr(error.message);

    // Reload deck list
    loadDecks();
  }  

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quiz Recap</h1>
      </header>

      <form onSubmit={createDeck} className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-lg">Create a Deck</h2>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Deck title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="rounded bg-black text-white px-4 py-2">
          Create
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Your Decks</h2>
        {loading ? (
          <p className="text-slate-600">Loading…</p>
        ) : decks.length ? (
          <div className="grid gap-3">
            {decks.map((d) => (
              <div key={d.id} className="bg-white border rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <Link href={`/decks/${d.id}`} className="font-semibold text-lg hover:underline">
                    {d.title}
                  </Link>
                  {d.description && <div className="text-slate-600 text-sm">{d.description}</div>}
                  <div className="mt-2 flex gap-3 text-sm">
                    <Link className="underline" href={`/study/${d.id}/flashcards`}>Flashcards</Link>
                    <Link className="underline" href={`/study/${d.id}/test`}>Test</Link>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget({ id: d.id, title: d.title })}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No decks yet.</p>
        )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete deck?"
        message={
          deleteTarget
            ? `You’re about to delete "${deleteTarget.title}". This will also remove all flashcards in it.`
            : ""
        }
        cancelText="Cancel"
        confirmText="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteDeck(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </main>
  );
}
