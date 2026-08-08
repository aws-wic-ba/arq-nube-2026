const UPLOAD_URL_ENDPOINT = `${import.meta.env.VITE_API_URL_GET}/dev2/upload-url`;

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

interface UploadUrlResponse {
  newSignedUrl?: string;
  publicUrl?: string;
  message?: string;
}

// El backend le agrega un timestamp adelante, así que acá sólo normalizamos el
// nombre original para que la key sea válida en S3.
function buildFileKey(file: File): string {
  const extension = file.type === "image/png" ? "png" : "jpg";
  const safeName = file.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return /\.[a-z0-9]+$/.test(safeName)
    ? safeName
    : `${safeName || "logo"}.${extension}`;
}

async function requestPresignedUploadUrl(file: File): Promise<PresignedUpload> {
  const key = encodeURIComponent(buildFileKey(file));
  const response = await fetch(`${UPLOAD_URL_ENDPOINT}?key=${key}`, {
    method: "GET",
  });

  const data: UploadUrlResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        `No pudimos preparar la subida del logo (error ${response.status}).`,
    );
  }

  if (!data.newSignedUrl || !data.publicUrl) {
    throw new Error(
      "No pudimos preparar la subida del logo. Intentá de nuevo.",
    );
  }

  return { uploadUrl: data.newSignedUrl, publicUrl: data.publicUrl };
}

export async function uploadLogo(file: File): Promise<string> {
  const { uploadUrl, publicUrl } = await requestPresignedUploadUrl(file);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("No pudimos subir el logo. Intentá de nuevo.");
  }

  return publicUrl;
}
