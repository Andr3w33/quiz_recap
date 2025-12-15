"use client";

/*
  DeckPage
  ----------
  This page allows the user to:
  - View a specific deck
  - Create new flashcards for that deck
  - View all flashcards in the deck
  - Edit an existing flashcard (via modal)
*/

import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import EditCardModal from "@/components/EditCardModal";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DeckPage() {
  const { deckId } = useParams();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);

  // Create form inputs
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Errors + saving state
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null); // { id, front, back } or null
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Card delete confirmation state
  const [deleteCardTarget, setDeleteCardTarget] = useState(null); // { id, front } or null

  async function loadDeckAndCards() {
    setError(null);

    const deckRes = await supabase
      .from("decks")
      .select("id,title,description")
      .eq("id", deckId)
      .single();

    if (deckRes.error) return setError(deckRes.error.message);
    setDeck(deckRes.data);

    const cardsRes = await supabase
      .from("cards")
      .select("id,front,back,created_at")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });

    if (cardsRes.error) return setError(cardsRes.error.message);
    setCards(cardsRes.data || []);
  }

  useEffect(() => {
    if (!deckId) return;
    loadDeckAndCards();
  }, [deckId]);

  async function createFlashcard(e) {
    e.preventDefault();
    setError(null);

    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return setError("Front and Back are required.");

    setSaving(true);
    const { error } = await supabase.from("cards").insert({
      deck_id: deckId,
      front: f,
      back: b,
    });
    setSaving(false);

    if (error) return setError(error.message);

    setFront("");
    setBack("");
    loadDeckAndCards();
  }

  async function updateCard(cardId, newFront, newBack) {
    setError(null);

    const f = newFront.trim();
    const b = newBack.trim();
    if (!f || !b) return setError("Front and Back are required.");

    setEditSaving(true);
    const { error } = await supabase
      .from("cards")
      .update({ front: f, back: b })
      .eq("id", cardId);

    setEditSaving(false);

    if (error) return setError(error.message);

    // Close modal + refresh
    closeEdit();
    loadDeckAndCards();
  }

  function openEdit(card) {
    setEditTarget(card);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  function closeEdit() {
    setEditTarget(null);
    setEditFront("");
    setEditBack("");
  }

  async function deleteCard(cardId) {
    setError(null);

    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) return setError(error.message);

    setDeleteCardTarget(null);
    loadDeckAndCards();
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Deck header */}
      <div className="card p-5">
        <h1 className="text-3xl font-bold">{deck?.title || "Deck"}</h1>

        {deck?.description && <p className="text-muted">{deck.description}</p>}

        <div className="flex items-center justify-between">
          <Link href="/" className="underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* CREATE FLASHCARD SECTION */}
      <section className="card p-5 space-y-3">
        <h2 className="text-xl font-semibold">Create a Flashcard</h2>

        <form onSubmit={createFlashcard} className="grid gap-3">
          <input
            className="w-full"
            placeholder="Front (term / question)"
            value={front}
            onChange={(e) => setFront(e.target.value)}
          />
          <input
            className="w-full"
            placeholder="Back (definition / answer)"
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />

          <button className="btn btn-primary w-fit" disabled={saving}>
            {saving ? "Saving..." : "Add Flashcard"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {/* LIST FLASHCARDS SECTION */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Flashcards</h2>

        {cards.length === 0 ? (
          <p className="text-muted">No flashcards yet. Add your first one above.</p>
        ) : (
          <div className="grid gap-3">
            {cards.map((c, i) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="pill mb-2">Card {i + 1}</div>
                    <div className="font-semibold">{c.front}</div>
                    <div className="text-muted mt-1">{c.back}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openEdit({ id: c.id, front: c.front, back: c.back })}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setDeleteCardTarget({ id: c.id, front: c.front })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer navigation */}
      <Link href="/" className="underline text-sm">
        Back to Dashboard
      </Link>

      {/* ✅ EDIT MODAL (using your component) */}
      <EditCardModal
        open={!!editTarget}
        front={editFront}
        back={editBack}
        saving={editSaving}
        onFrontChange={(e) => setEditFront(e.target.value)}
        onBackChange={(e) => setEditBack(e.target.value)}
        onCancel={closeEdit}
        onSave={() => {
          if (!editTarget) return;
          updateCard(editTarget.id, editFront, editBack);
        }}
      />

      {/* DELETE CONFIRM MODAL (reused) */}
      <ConfirmModal
        open={!!deleteCardTarget}
        title="Delete flashcard?"
        message={
          deleteCardTarget
            ? `Are you sure you want to delete this card?\n\n"${deleteCardTarget.front}"`
            : ""
        }
        cancelText="Cancel"
        confirmText="Delete"
        danger
        onCancel={() => setDeleteCardTarget(null)}
        onConfirm={() => {
          if (!deleteCardTarget) return;
          deleteCard(deleteCardTarget.id);
        }}
      />
    </main>
  );
}
