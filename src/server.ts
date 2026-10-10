import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

// Connect FIRST, then listen. Doing it the other way round gives
// you a server that answers requests for a second or two before it
// can reach the database, and those fail for a reason nobody finds.
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API on http://localhost:${PORT}`),
    );
  })
  .catch((err: unknown) => {
    console.error("Could not start:", err);
    process.exit(1);
  });
