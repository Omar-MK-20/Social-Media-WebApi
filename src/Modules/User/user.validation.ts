import z from "zod";
import { ValidationType } from "../../util/middlewares/validation.middleware.js";


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