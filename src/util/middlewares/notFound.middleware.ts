import type { Request, Response, NextFunction } from "express";

export function notFoundRoute(req: Request, res: Response, next: NextFunction)
{
    res.status(404).json({ error: "Endpoint not found" });
}