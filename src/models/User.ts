import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index";

// The Session 1 User interface, written a second time as a schema.
// TypeScript checks the shape while you type; this checks it when the
// data arrives, which is the only moment that can stop bad data.
const userSchema = new Schema<UserDoc>(
  {
    name:  { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },

    // The one field itelect4-project's User interface does not have.
    // select: false keeps it out of every query result unless a query
    // asks for it by name -- see the .select("+password") in auth.ts.
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
);

// Runs on every .save(). Replaces the plain password with its hash, so
// the plain one is never what gets written.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// What this document looks like once it is turned into JSON. Mongo's own
// field is _id; the frontend has been reading .id since Session 1, so
// rename it here rather than change the frontend.
userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = model<UserDoc>("User", userSchema);
