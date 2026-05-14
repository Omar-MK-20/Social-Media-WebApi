import type { Request, } from "express";
import multer, { type FileFilterCallback } from "multer";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { FileFormats, StorageType, type MimeType } from "../enums/file.enums.js";
import { ContentError } from "../res/ResponseError.js";



export function uploadFile(uploadOptions: { allowedFormats?: MimeType[]; storageType?: StorageType; fileSize?: number; filesCount?: number; } = {})
{
    const { allowedFormats = FileFormats.image, storageType = StorageType.Memory, fileSize = 5, filesCount = 1 } = uploadOptions;



    const storage = storageType == StorageType.Memory
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination(req, file, callback)
            {
                callback(null, tmpdir());
            },
            filename(req, file, callback)
            {
                callback(null, `${randomUUID()}_${file.originalname.split(" ").join("-")}`);
            },
        });



    function fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback)
    {
        if (!allowedFormats.includes(file.mimetype as MimeType))
        {
            return callback(new ContentError({ message: "Invalid File format", info: { "allowed file formats": allowedFormats } }));
        }
        return callback(null, true);
    }


    const multerOptions: multer.Options = { storage, fileFilter };
    multerOptions.limits = {
        fileSize: (fileSize * 1024 * 1024),
        files: filesCount
    };

    return multer(multerOptions);
};