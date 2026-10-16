import { Schema, model } from "mongoose";
import type { CourseDoc } from "../types/index";

// The third Session 1 interface, written a second time as a schema --
// the same move User and Submission made last week. Courses are the
// one thing this API serves to somebody who is not logged in.
const courseSchema = new Schema<CourseDoc>({
  // unique here is the reason GET /api/courses/ITELECT4 can use
  // findOne and be sure there is nothing else it could have matched.
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },

  title: { type: String, required: [true, "title is required"], trim: true },

  // An interface can say "a number". Only a schema can say
  // "a number between 1 and 6", which is what units really is.
  units: { type: Number, required: true, min: 1, max: 6 },

  semester: { type: String, required: true, trim: true },
});

// User and Submission both rename _id to id here, because the frontend
// has been reading .id off them since Session 1. Course never had an
// id -- the code is its identity -- so there is nothing to rename, and
// the two fields Mongo added are the only two that have to come out.
courseSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Course = model<CourseDoc>("Course", courseSchema);
