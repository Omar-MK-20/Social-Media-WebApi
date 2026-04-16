import type { IResponseError } from "../interfaces/IResponseError.js";
import { StatusCodeEnum, type TStatusCode } from "../types/ResponseTypes.js";


export class ResponseError extends Error implements IResponseError
{
    public statusCode: TStatusCode;
    public info?: object;

    constructor(message: string, statusCode: TStatusCode = StatusCodeEnum.ServerError, info?: object)
    {
        super(message);
        this.name = 'Response Error';
        this.statusCode = statusCode;
        if (info) this.info = info;
        Error.captureStackTrace(this, this.constructor);
    }
}



export class NotFoundError extends ResponseError
{

    constructor({ message, info }: { message: string, info?: object; })
    {
        super(message, StatusCodeEnum.NotFound, info);
        this.name = 'Not Found Error';
    }
}


export class UnauthorizedError extends ResponseError
{
    constructor({ message, info }: { message: string, info?: object; })
    {
        super(message, StatusCodeEnum.Unauthorized, info);
        this.name = 'Unauthorized Error';
    }
}


export class ForbiddenError extends ResponseError
{
    constructor({ message, info }: { message: string, info?: object; })
    {
        super(message, StatusCodeEnum.Forbidden, info);
        this.name = 'Forbidden Error';
    }
}


export class ConflictError extends ResponseError
{

    constructor({ message, info }: { message: string, info?: object; })
    {
        super(message, StatusCodeEnum.Conflict, info);
        this.name = 'Conflict Error';
    }
}


export class ContentError extends ResponseError
{

    constructor({ message, info }: { message: string, info?: object; })
    {
        super(message, StatusCodeEnum.UnprocessableContent, info);
        this.name = 'Unprocessable Content Error';
    }
}