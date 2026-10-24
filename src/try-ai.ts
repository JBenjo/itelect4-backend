// ===== SESSION 11: a NEW file =======================================
// ===== no Session 10 version -- nothing to compare it to ============
import "dotenv/config";
import { reviewProject } from "./ai/gemini";

// npm run try-ai. One real request to Gemini from your terminal --
// the same function POST /api/ai calls, with no Express, no token
// and no database. Run it once the key is in .env: if this prints a
// review, the key, the model name and the schema all work.
async function tryAi() {
  const review = await reviewProject(
    "A course submission tracker in React and TypeScript. Students " +
      "log in, pick a course, and save the GitHub link of their " +
      "project. The API is Express and MongoDB, deployed on Vercel.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
