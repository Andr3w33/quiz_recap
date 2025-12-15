"use client";

/*
  EditCardModal
  --------------
  Reusable modal for editing a flashcard
*/

export default function EditCardModal({
  open,
  title = "Edit Flashcard",
  front,
  back,
  saving = false,
  onFrontChange,
  onBackChange,
  onCancel,
  onSave,
}) {
  // Do not render anything if modal is closed
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg p-5 opacity-0 translate-y-2 animate-[popIn_.18s_ease-out_forwards]">
          <h3 className="text-lg font-semibold">{title}</h3>

          <p className="text-muted text-sm mt-1">
            Update the front and back, then click Save.
          </p>

          {/* Inputs */}
          <div className="mt-4 grid gap-3">
            <input
              value={front}
              onChange={onFrontChange}
              placeholder="Front"
            />
            <input
              value={back}
              onChange={onBackChange}
              placeholder="Back"
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>

            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes popIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
