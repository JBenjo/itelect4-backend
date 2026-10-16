import type { Types } from "mongoose";

// FROM SESSION 1: the three interfaces, copied from itelect4-project's
// src/types/index.ts. They are the reason this backend has the shape it
// has: the schemas in src/models/ are these interfaces again, written a
// second time in a form the database can enforce.

export interface User {
  id:       number | string;
  name:     string;
  email:    string;
  role:     "student" | "admin" | "instructor";
  isActive: boolean;
}

export interface Course {
  code:     string;
  title:    string;
  units:    number;
  semester: string;
}

export interface Submission {
  id:          number | string;
  studentId:   number | string;
  courseCode:  string;
  repoUrl:     string;
  submittedAt: Date;
  score?:      number;
}

// ---------------------------------------------------------------------
// What the database actually stores.
//
// Session 1 wrote `id: number` because there was no database yet -- the
// mock array in mockData.ts numbered its own rows. MongoDB numbers rows
// itself, with a 24-character hex string, so every id here is a string.
//
// Rather than rewrite the interfaces, the three types below are DERIVED
// from them with Omit and Pick -- the utility types from Session 2.
// Submission stays the single source of truth: add a field there and
// these inherit it.
// ---------------------------------------------------------------------

export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// studentId is an ObjectId, not a string. An ObjectId is an object that
// PRINTS as 24 hex characters -- it only becomes a real string when the
// document is turned into JSON. Typing it as string here compiles until
// the schema declares it, and then fails on every field at once.
export type SubmissionDoc = Omit<Submission, "id" | "studentId"> & {
  studentId: Types.ObjectId;
};

// Course is the one Session 1 interface with no id field of its own --
// the code is its identity -- so unlike the two types above there is
// nothing here to rename and nothing to leave out. Naming all four
// fields looks like saying nothing, and it is doing one real job:
// Omit and Pick both produce a MAPPED type, and an interface is not
// one. The toJSON transform in Course.ts takes Record<string, unknown>;
// TypeScript hands it a mapped type happily and refuses an interface.
export type CourseDoc = Pick<
  Course,
  "code" | "title" | "units" | "semester"
>;

// The body a client sends to create one. No id, and no studentId -- the
// server reads that off the token instead of trusting the request.
export type NewSubmissionBody = Pick<Submission, "courseCode" | "repoUrl">;
