import { type FormEvent, useEffect, useRef, useState } from "react";

import { isHttpUrl } from "../isHttpUrl";
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

  // open as a modal; on unmount give focus back to what opened it
  useEffect(() => {
    const opener = document.activeElement;
    dialog.current?.showModal();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = Object.fromEntries(
      fields.map(({ key }) => [key, values[key].trim()])
    ) as ArtPieceValues;
    const found = validate(trimmed);
    setErrors(found);
    const firstInvalid = fields.find(({ key }) => found[key]);
    if (firstInvalid) {
      document.getElementById(`art-piece-${firstInvalid.key}`)?.focus();
      return;
    }
    onSave(trimmed);
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
