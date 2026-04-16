// export type TStatusCode = 200 | 201 | 202 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;
export type TStatusCode = `${StatusCodeEnum}` extends `${infer T extends number}` ? T : never;

export enum StatusCodeEnum 
{
    Ok = 200,
    Created = 201,
    Accepted = 202,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnprocessableContent = 422,
    TooManyRequests = 429,
    ServerError = 500,
}

export type TResponseObject<T> = {
    status: TStatusCode;
    message: string;
    result: T;
};

