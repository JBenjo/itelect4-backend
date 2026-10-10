import { Schema, model } from "mongoose";
import type { SubmissionDoc } from "../types/index";

const submissionSchema = new Schema<SubmissionDoc>({
  // Not a number any more. This holds the _id of a User document, and
  // ref tells Mongoose which collection that id points into.
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  courseCode: {
    type: String,
    required: [true, "courseCode is required"],
    uppercase: true,
    trim: true,
  },

  // The same rule Session 8's .refine() enforced in the browser, now
  // enforced here as well. The browser check is a courtesy to whoever
  // is typing; this one is the rule.
  repoUrl: {
    type: String,
    required: [true, "repoUrl is required"],
    match: [/^https:\/\/github\.com\/.+/, "repoUrl must start with https://github.com/"],
  },

  submittedAt: { type: Date, default: Date.now },

  // Optional in the interface, so no `required` here. The range is new
  // -- an interface can say "a number", but only a schema can say
  // "a number between 0 and 100".
  score: { type: Number, min: 0, max: 100 },
});

// FROM SESSION 7: ApiSubmission, in itelect4-project's src/types/index.ts,
// exists because json-server returned string ids and ISO date strings
// instead of the number and Date that Session 1 declared. MongoDB does
// the same thing. This transform is where that gap gets closed, so the
// frontend keeps reading .id exactly as it has since Session 1.
submissionSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Submission = model<SubmissionDoc>("Submission", submissionSchema);
