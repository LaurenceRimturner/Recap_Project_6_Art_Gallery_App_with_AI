import { type FormEvent, useEffect, useRef, useState } from "react";

import type { ArtPiece } from "../types";

export type ArtPieceValues = Pick<
  ArtPiece,
  "imageSource" | "name" | "artist" | "genre" | "year"
>;

type ArtPieceModalProps = {
  piece?: ArtPiece;
  onSave: (values: ArtPieceValues) => void;
  onClose: () => void;
};

const fields: { key: keyof ArtPieceValues; label: string }[] = [
  { key: "imageSource", label: "Image URL" },
  { key: "name", label: "Name" },
  { key: "artist", label: "Artist" },
  { key: "genre", label: "Genre" },
  { key: "year", label: "Year" },
];

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function validate(values: ArtPieceValues) {
  const errors: Partial<Record<keyof ArtPieceValues, string>> = {};
  for (const { key, label } of fields) {
    if (!values[key]) errors[key] = `${label} is required.`;
  }
  if (values.imageSource && !isHttpUrl(values.imageSource)) {
    errors.imageSource = "Image URL must be a valid http or https URL.";
  }
  return errors;
}

export default function ArtPieceModal({
  piece,
  onSave,
  onClose,
}: ArtPieceModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<ArtPieceValues>({
    imageSource: piece?.imageSource ?? "",
    name: piece?.name ?? "",
    artist: piece?.artist ?? "",
    genre: piece?.genre ?? "",
    year: piece?.year ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ArtPieceValues, string>>
  >({});

  // jsdom has no showModal; fall back to a plain open dialog there
  useEffect(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    if (typeof element.showModal === "function") element.showModal();
    else element.setAttribute("open", "");
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = Object.fromEntries(
      fields.map(({ key }) => [key, values[key].trim()])
    ) as ArtPieceValues;
    const found = validate(trimmed);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(trimmed);
  }

  return (
    <dialog
      ref={dialog}
      className="art-piece-modal"
      aria-labelledby="art-piece-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <h2 id="art-piece-modal-title">
          {piece ? "Edit art piece" : "Add art piece"}
        </h2>
        {fields.map(({ key, label }) => (
          <div key={key} className="modal-field">
            <label htmlFor={`art-piece-${key}`}>{label}</label>
            <input
              id={`art-piece-${key}`}
              type="text"
              value={values[key]}
              aria-describedby={
                errors[key] ? `art-piece-${key}-error` : undefined
              }
              aria-invalid={errors[key] ? true : undefined}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
            {errors[key] && (
              <span role="alert" id={`art-piece-${key}-error`}>
                {errors[key]}
              </span>
            )}
          </div>
        ))}
        <div className="modal-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </dialog>
  );
}
