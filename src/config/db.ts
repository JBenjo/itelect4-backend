import mongoose from "mongoose";
import { ensureSrvDnsWorks } from "./dns";

// ===== SESSION 9: connect, and log the database it landed in =========
// export async function connectDB() {
//   const uri = process.env.MONGODB_URI;
//   if (!uri) {
//     throw new Error(
//       "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
//     );
//   }
//   await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
//   console.log("MongoDB connected:", mongoose.connection.name);
// }
//
// NOTE: On your laptop that runs once, at startup. On Vercel this file
//       is loaded again on every new instance and connectDB is reached
//       from a request, so the connect below would run once per request
//       instead of once per process.
// ===== SESSION 10: the same connect, made to happen only once ========

// The promise, kept. Not the connection -- the promise of one. The
// first caller starts the connect; every caller after it gets this
// same promise back and waits on the connection already being made.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Fail here, with a sentence, rather than three screens later with a
  // connection timeout that does not mention .env at all.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    // Without this option, a wrong or unreachable connection string
    // does not fail -- it sits there for 31 seconds looking like a
    // hung terminal, and then errors. Five seconds is long enough for
    // a real Atlas connection and short enough to tell you something
    // is wrong.
    connection = ensureSrvDnsWorks()
      .then(() => mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }))
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // A failed attempt must not be the thing that gets kept. Leave
        // the rejected promise in place and every request from now on
        // fails with this same five-second-old error, including the
        // ones sent after the database comes back.
        connection = null;
        throw err;
      });
  }

  return connection;
}
