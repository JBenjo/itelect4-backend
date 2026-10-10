import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request type has no userId field, because Express does
// not know this app exists. This block adds one, for this project
// only, so req.userId type-checks everywhere below.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What we put inside the token when we sign it, and therefore what we
// get back out when we verify it.
export interface TokenPayload {
  userId: string;
}

// FROM SESSION 6: ProtectedRoute in itelect4-project checks a token
// in the Zustand auth store before rendering. That check guards
// the SCREEN. This one protects the DATA -- and it is the one that
// matters, because anyone can call this API without the app.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Browsers and Postman both send this as:
  //   Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    // verify does two things: checks the signature was made with our
    // secret, and checks the token has not expired. Either failure
    // throws, which is why this is inside a try.
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}
