import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import { JwtPayload } from "../types/auth";

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
