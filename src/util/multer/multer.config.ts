import type { Request, } from "express";
import multer, { type FileFilterCallback } from "multer";


export function uploadFile(uploadOptions: { fileSize?: number; filesCount?: number; } = {})
{
    const { fileSize = 5, filesCount = 1 } = uploadOptions;

    const storage = multer.memoryStorage();

    // function fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback)
    // {

    // }

    const multerOptions: multer.Options = { storage };

    multerOptions.limits = {
        fileSize: (fileSize * 1024 * 1024),
        files: filesCount
    };

    return multer(multerOptions);
};