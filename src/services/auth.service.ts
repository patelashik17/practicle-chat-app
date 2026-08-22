import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { comparePassword, hashPassword } from "../lib/password";
import { AuthResponse } from "../types/auth";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

function toAuthResponse(user: {
  id: string;
  name: string;
  email: string;
}): AuthResponse {
  return {
    token: signToken({ userId: user.id, email: user.email }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AuthError("Email already registered", 409);
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true },
  });

  return toAuthResponse(user);
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const valid = await comparePassword(input.password, user.password);

  if (!valid) {
    throw new AuthError("Invalid email or password", 401);
  }

  return toAuthResponse({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}
