import type { Response } from "express";
import { StatusCodeEnum, type TResponseObject, type TStatusCode } from "../types/ResponseTypes.js";

export function successResponse<T>(res: Response, result: TResponseObject<T>)
{
    const { status, ...restData } = result;

    return res.status(status).json(restData);
}


// ===========================================================================================


export function successObject<T>(status: TStatusCode, message: string, result: T): TResponseObject<T>
{
    return { status, message, result };
}


export function getSuccessObject<T>(data: T)
{
    return { status: StatusCodeEnum.Ok, message: "success", data };
}


export function createSuccessObject<T>(createdName: string, result: T): TResponseObject<T>
{
    return { status: StatusCodeEnum.Created, message: `${createdName} created successfully`, result: result };
}

export function updateSuccessObject<T>(updatedData: string, result: T): TResponseObject<T>
{
    return { status: StatusCodeEnum.Ok, message: `${updatedData} updated successfully`, result: result };
}

export function deleteSuccessObject(DeletedName: string)
{
    return { status: StatusCodeEnum.Ok, message: `${DeletedName} deleted successfully` };
}

