import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  MAX_IMAGE_SIZE,
  MIN_IMAGE_SIZE,
  isAllowedImageSize,
  loadImageSize,
} from "../imageSize";
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

/** Loads the image and returns an error message, or null when it is fine. */
async function checkImage(url: string) {
  try {
    const size = await loadImageSize(url);
    return isAllowedImageSize(size)
      ? null
      : `Image must be between ${MIN_IMAGE_SIZE} and ${MAX_IMAGE_SIZE} pixels wide and tall.`;
  } catch {
    return "Image could not be loaded from this URL.";
  }
}

export default function ArtPieceModal({
  piece,
  onSave,
  onClose,
}: ArtPieceModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const isOpen = useRef(true);
  const [isChecking, setIsChecking] = useState(false);
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
    isOpen.current = true;
    dialog.current?.showModal();
    return () => {
      isOpen.current = false;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  function focusField(key: keyof ArtPieceValues) {
    document.getElementById(`art-piece-${key}`)?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isChecking) return;
    const trimmed = Object.fromEntries(
      fields.map(({ key }) => [key, values[key].trim()])
    ) as ArtPieceValues;
    const found = validate(trimmed);
    setErrors(found);
    const firstInvalid = fields.find(({ key }) => found[key]);
    if (firstInvalid) {
      focusField(firstInvalid.key);
      return;
    }

    // an unchanged image of an existing piece is not checked again
    if (!piece || trimmed.imageSource !== piece.imageSource) {
      setIsChecking(true);
      const imageError = await checkImage(trimmed.imageSource);
      if (!isOpen.current) return;
      setIsChecking(false);
      if (imageError) {
        setErrors({ imageSource: imageError });
        focusField("imageSource");
        return;
      }
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
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
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
          <button type="submit" disabled={isChecking}>
            Save
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </dialog>
  );
}
