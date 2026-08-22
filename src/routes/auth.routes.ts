import { Router, Request, Response } from "express";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import {
  AuthError,
  loginUser,
  registerUser,
} from "../services/auth.service";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
);

router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await loginUser(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
);

export default router;
