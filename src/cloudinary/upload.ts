/**
 * Unsigned upload to Cloudinary (browser) using a named upload preset.
 * Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in `.env`.
 */

export function isCloudinaryUploadConfigured(): boolean {
  const name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  return Boolean(name && preset);
}

export type CloudinaryUploadOptions = {
  /** Destination folder in your Cloudinary media library (e.g. `femved/programs`). Leading/trailing slashes are stripped. */
  folder?: string;
};

function normalizeFolderPath(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

export async function uploadImageToCloudinary(
  file: File,
  options?: CloudinaryUploadOptions,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const folder = options?.folder?.trim();
  if (folder) {
    formData.append("folder", normalizeFolderPath(folder));
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  const data = (await res.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "Upload failed.");
  }
  if (!data.secure_url) {
    throw new Error("Upload did not return an image URL.");
  }
  return data.secure_url;
}
