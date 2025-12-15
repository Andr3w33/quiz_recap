"use client";

import { useMemo, useState } from "react";

function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

export default function TestPlayer({ cards }) {
  const list = useMemo(() => cards || [], [cards]);
  const [index, setIndex] = useState(0);

  // Current input + feedback (will be synced from per-question state)
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Score
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  // ✅ Per-question record so state persists when moving prev/next
  // checked[i] = { answer: "...", feedback: "...", correct: true/false }
  const [checked, setChecked] = useState({});

  const current = list[index];
  if (!list.length) return <p className="text-slate-600">No cards yet.</p>;

  const record = checked[index];         // record for current question (if any)
  const isChecked = !!record;            // whether current question already checked
  const isFirst = index === 0;
  const isLast = index === list.length - 1;

  function check() {
    // ✅ Prevent re-scoring / re-checking
    if (isChecked) return;

    const ok = normalize(answer) === normalize(current.back);
    const msg = ok ? "Correct ✅" : `Incorrect ❌ (Answer: ${current.back})`;

    // ✅ Save per-question data so it shows again when user navigates back
    setChecked((prev) => ({
      ...prev,
      [index]: { answer, feedback: msg, correct: ok },
    }));

    // ✅ Lock the UI for this question
    setFeedback(msg);

    // ✅ Score only once per question
    setScore((s) => ({
      correct: s.correct + (ok ? 1 : 0),
      incorrect: s.incorrect + (ok ? 0 : 1),
    }));
  }

  // ✅ Centralized navigation: loads saved state when revisiting checked questions
  function goTo(newIndex) {
    setIndex(newIndex);

    const rec = checked[newIndex];
    if (rec) {
      // If already checked, restore what user typed and the feedback (includes right answer)
      setAnswer(rec.answer);
      setFeedback(rec.feedback);
    } else {
      // If not checked, clear input/feedback
      setAnswer("");
      setFeedback(null);
    }
  }

  function next() {
    goTo(Math.min(index + 1, list.length - 1));
  }

  function prev() {
    goTo(Math.max(index - 1, 0));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-slate-600">
        <div>
          Question {index + 1} / {list.length}
        </div>
        <div>
          ✅ {score.correct} | ❌ {score.incorrect}
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Prompt
        </div>

        <div className="text-xl font-semibold whitespace-pre-wrap">
          {current.front}
        </div>

        <div className="mt-4 space-y-2">
          <input
            className="w-full border rounded px-3 py-2 disabled:opacity-60"
            placeholder="Type your answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            disabled={isChecked} // ✅ Disable after checking
          />

          <div className="flex gap-2 items-center">
            <button
              onClick={prev}
              disabled={isFirst}
              className="btn btn-primary disabled:opacity-30"
            >
              Prev
            </button>

            <button
              onClick={check}
              disabled={isChecked} // ✅ Prevent re-checking
              className="btn btn-primary disabled:opacity-30"
            >
              {isChecked ? "Checked" : "Check"}
            </button>

            <button
              onClick={next}
              disabled={isLast}
              className="btn btn-primary disabled:opacity-30"
            >
              Next
            </button>
          </div>

          {/* ✅ Feedback persists when going back to a checked question */}
          {feedback && <p className="text-sm mt-2">{feedback}</p>}
        </div>
      </div>

      {isLast && (
        <div className="border rounded p-4 bg-white">
          <div className="font-semibold">Done!</div>
          <div className="text-slate-600 text-sm">
            Score: {score.correct} correct, {score.incorrect} incorrect
          </div>
        </div>
      )}
    </div>
  );
}
