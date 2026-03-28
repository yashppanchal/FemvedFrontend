import { useId, useRef, useState } from "react";

import { isCloudinaryUploadConfigured, uploadImageToCloudinary } from "../cloudinary/upload";
import { isValidUrl } from "../validation";

import "./CloudinaryImageUrlField.scss";

type CloudinaryImageUrlFieldProps = {
  label: React.ReactNode;
  hint: React.ReactNode;
  value: string;
  onUrlChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Cloudinary folder for this upload (same preset can target different folders per usage). */
  uploadFolder?: string;
};

export function CloudinaryImageUrlField({
  label,
  hint,
  value,
  onUrlChange,
  disabled = false,
  placeholder = "https://res.cloudinary.com/...",
  uploadFolder,
}: CloudinaryImageUrlFieldProps) {
  const baseId = useId();
  const urlInputId = `${baseId}-url`;
  const fileInputId = `${baseId}-file`;
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const inputLocked = disabled || uploading;

  const handleFile = async (file: File | undefined) => {
    if (!file || inputLocked) return;
    setUploadError(null);

    if (!isCloudinaryUploadConfigured()) {
      console.error(
        "[CloudinaryImageUrlField] Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET. Add them to .env and restart the dev server.",
      );
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, uploadFolder ? { folder: uploadFolder } : undefined);
      onUrlChange(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <span className="field__hint">{hint}</span>
      <input
        id={urlInputId}
        className="field__input"
        type="url"
        value={value}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={placeholder}
        disabled={inputLocked}
        aria-describedby={uploadError ? `${baseId}-upload-err` : undefined}
      />

      <div className="cloudinaryImageUrlField__uploadRow">
        <input
          ref={fileRef}
          id={fileInputId}
          className="cloudinaryImageUrlField__fileInput"
          type="file"
          accept="image/*"
          disabled={inputLocked}
          onChange={(e) => void handleFile(e.target.files?.[0])}
          aria-label="Upload image file"
          tabIndex={-1}
        />
        {uploading ? (
          <span
            className="adminActionButton adminActionButton--sm cloudinaryImageUrlField__uploadTrigger cloudinaryImageUrlField__uploadTrigger--busy"
            aria-live="polite"
          >
            Uploading…
          </span>
        ) : disabled ? (
          <span
            className="adminActionButton adminActionButton--sm cloudinaryImageUrlField__uploadTrigger cloudinaryImageUrlField__uploadTrigger--muted"
            aria-disabled
          >
            Upload image
          </span>
        ) : (
          <label
            htmlFor={fileInputId}
            className="adminActionButton adminActionButton--sm cloudinaryImageUrlField__uploadTrigger"
          >
            Upload image
          </label>
        )}
      </div>

      {uploadError && (
        <p id={`${baseId}-upload-err`} className="cloudinaryImageUrlField__uploadError" role="alert">
          {uploadError}
        </p>
      )}

      {value.trim() && isValidUrl(value.trim()) && (
        <div className="cloudinaryImageUrlField__preview">
          <img src={value.trim()} alt="" />
        </div>
      )}
    </div>
  );
}
