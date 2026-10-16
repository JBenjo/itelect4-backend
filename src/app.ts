import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth";
import { submissionRouter } from "./routes/submissions";

// This file builds the app and stops. It never opens a port and never
// touches the database, so anything that wants an app -- server.ts, or
// a test -- can have one without starting a server.
export const app = express();

// Lets a browser on another port -- the Vite app on 5173 -- call this
// one. Without it the browser blocks the response before your code
// ever sees it. Postman is not a browser, so it never needs this.
app.use(cors());

// Reads a JSON request body and puts it on req.body. Without this
// line req.body is undefined, and `const { email } = req.body`
// throws.
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionRouter);

// Nothing above matched, so the URL does not exist. Without this, an
// unknown path returns Express's own HTML error page, which is a
// surprise for something that otherwise only ever speaks JSON.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Four parameters, not three. That is the only thing telling Express
// this function is the error handler -- and it is why `next` has to
// stay here even though nothing calls it.
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // Thrown when a string in the URL is not a valid ObjectId at all.
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

export default app;