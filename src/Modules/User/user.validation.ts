import z from "zod";
import { ValidationType } from "../../util/middlewares/validation.middleware.js";
import { StorageType } from "../../util/enums/file.enums.js";


export const shareProfileSchema = {
    params: z.object({
        id: ValidationType.id
    })
};


export const logoutSchema = {
    body: z.object({
        fromAllDevices: ValidationType.fromAllDevices
    }).required()
};


export const uploadProfilePicSchema = {
    file: ValidationType.file(StorageType.Memory),
};


export const uploadCoverPicSchema = {
    files: z.array(ValidationType.file(StorageType.Disk)),
};

