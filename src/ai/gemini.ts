// ===== SESSION 11: a NEW file =======================================
// ===== no Session 10 version -- nothing to compare it to ============
import { GoogleGenAI, ApiError, type Content } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, EXAMPLES, wrap } from "./prompt";
import {
  reviewSchema,
  reviewJsonSchema,
  type Review,
} from "../schemas/review";

// The same shape as connectDB in src/config/db.ts: nothing happens
// when this file is imported. The client is made on the first call,
// so a missing key is a sentence on the first AI request -- not a
// crash for every route in the app, and not a problem for the tests
// in Session 12, which never call Gemini at all.
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env, and to Vercel.",
    );
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// The two examples become two finished exchanges -- a user turn, then
// the model's reply -- and the real description is the last turn.
// To the model it looks like a conversation it has already had twice.
function buildContents(description: string): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.description) }] },
    {
      role: "model",
      parts: [{ text: JSON.stringify(example.review) }],
    },
  ]);
  return [
    ...shots,
    { role: "user", parts: [{ text: wrap(description) }] },
  ];
}

// Thrown when Gemini answered but the answer is unusable. The route
// turns it into a 502; anything else stays a 500.
export class AiReplyError extends Error {}

export async function reviewProject(
  description: string,
): Promise<Review> {
  const maxAttempts = 4;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await getClient().models.generateContent({
        model: MODEL,
        contents: buildContents(description),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: reviewJsonSchema,
        },
      });
      lastError = null;
      const text = response.text;
      if (!text) {
        throw new AiReplyError("Gemini sent back no text");
      }
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new AiReplyError("Gemini's reply was not JSON");
      }
      const result = reviewSchema.safeParse(data);
      if (!result.success) {
        throw new AiReplyError("Gemini's reply did not match the schema");
      }
      return result.data;
    } catch (err) {
      lastError = err;
      const status =
        err instanceof ApiError ? err.status ?? (err as any).code : undefined;
      const retryable =
        status === 503 || status === 429 || status === 500;
      if (!retryable || attempt === maxAttempts) {
        throw err;
      }
      const delay = 1000 * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
