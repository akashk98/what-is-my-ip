export const MAX_INVITATION_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isValidImageType(value: string) {
  return ALLOWED_IMAGE_TYPES.includes(value.toLowerCase());
}

export function isValidUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isPhoneNumber(value: string) {
  const normalized = value.trim();
  return /^[+0-9][0-9\-\s]{6,24}$/.test(normalized);
}

export function isValidImageFileType(fileName: string, fileType: string) {
  return isValidImageType(fileType) || /\.(jpe?g|png|webp)$/i.test(fileName);
}

export function normalizeText(value: string) {
  return value.trim();
}
