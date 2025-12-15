"use client";

import { useMemo, useState } from "react";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPlayer({ cards }) {
  const [shuffled, setShuffled] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const list = useMemo(() => {
    if (!cards?.length) return [];
    return shuffled ? shuffleArray(cards) : cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, shuffled]);

  const current = list[index];

  if (!list.length) return <p className="text-slate-600">No cards yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>Card {index + 1} / {list.length}</div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shuffled}
            onChange={(e) => {
              setIndex(0);
              setFlipped(false);
              setShuffled(e.target.checked);
            }}
          />
          Shuffle
        </label>
      </div>

      <button
        onClick={() => setFlipped((v) => !v)}
        className="w-full border rounded-xl p-8 text-center hover:bg-slate-50"
      >
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          {flipped ? "Back" : "Front"}
        </div>
        <div className="text-xl font-semibold whitespace-pre-wrap">
          {flipped ? current.back : current.front}
        </div>
        <div className="mt-4 text-sm text-slate-600">Click to flip</div>
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); }}
          disabled={index === 0}
          className="px-4 py-2 rounded border disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => { setFlipped(false); setIndex((i) => Math.min(i + 1, list.length - 1)); }}
          disabled={index === list.length - 1}
          className="px-4 py-2 rounded border disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => { setIndex(0); setFlipped(false); }}
          className="ml-auto px-4 py-2 rounded border"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
