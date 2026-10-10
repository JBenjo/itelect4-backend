import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import type { TokenPayload } from "../middleware/auth";

export const authRouter = Router();

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// Request takes three type arguments: the URL params, the response
// body, and the request body. Filling the third in is what makes
// req.body.email a checked string instead of an any.
authRouter.post(
  "/register",
  async (
    req: Request<unknown, unknown, RegisterBody>,
    res: Response,
  ) => {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      res.status(409).json({
        message: "That email is already registered",
      });
      return;
    }

    // The plain password goes in; the pre("save") hook in User.ts
    // hashes it before it reaches the database.
    const user = await User.create({ name, email, password });

    res.status(201).json(user.toJSON());
  },
);

authRouter.post(
  "/login",
  async (
    req: Request<unknown, unknown, LoginBody>,
    res: Response,
  ) => {
    const { email, password } = req.body;

    // password is select: false in the schema, so a plain findOne
    // returns a user with no password to compare against. +password
    // asks for it back, for this one query.
    const user = await User.findOne({ email }).select("+password");

    // One message for both failures. Saying "no such email" tells
    // whoever is guessing which half they got right.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({
        message: "Email or password is incorrect",
      });
      return;
    }

    const payload: TokenPayload = { userId: String(user._id) };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    res.json({ token, user: user.toJSON() });
  },
);
