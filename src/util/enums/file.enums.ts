export const MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "video/mp4", "video/mpeg", "video/webm", "audio/mpeg", "audio/ogg", "audio/webm", "application/pdf"] as const;

export type MimeType = typeof MIME_TYPES[number];

export enum StorageType { Disk, Memory }

export const FileFormats: Record<("image" | "gif" | "video" | "audio" | "pdf"), MimeType[]> = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    gif: ["image/gif"],
    video: ["video/mp4", "video/mpeg", "video/webm"],
    audio: ["audio/mpeg", "audio/ogg", "audio/webm"],
    pdf: ["application/pdf"]
};


export enum FolderName
{
    profilePics = "profilePics",
    coverPics = "coverPics"
};


