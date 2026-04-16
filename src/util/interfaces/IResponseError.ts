export interface IResponseError extends Error
{
    statusCode: number;
    info?: object;
}