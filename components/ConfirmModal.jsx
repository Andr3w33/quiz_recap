"use client";

import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  // Close modal when user presses Escape
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, onConfirm]);

  // Don’t render anything when closed
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 animate-[fadeIn_.18s_ease-out_forwards]"
        onClick={onCancel}
      />

      {/* Modal wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="card w-full max-w-md p-5 opacity-0 translate-y-2 scale-[0.98] animate-[popIn_.18s_ease-out_forwards]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="space-y-2">
            <h3 id="confirm-title" className="text-lg font-semibold">
              {title}
            </h3>
            <p className="text-muted">{message}</p>
          </div>

          <div className="mt-5 flex gap-2 justify-end">
            <button className="btn btn-outline" onClick={onCancel}>
              {cancelText}
            </button>

            <button
              className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Animations (local to this component) */}
      <style jsx global>{`
        @keyframes fadeIn {
          to {
            opacity: 1
          }
        }
        @keyframes popIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
