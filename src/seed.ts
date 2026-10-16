import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Course } from "./models/Course";
import { COURSES } from "./data/courses";

// npm run seed. Run it once after the database is created, and again
// after anything that empties it. Nothing else in the project writes
// a course.
async function seed() {
  await connectDB();

  for (const course of COURSES) {
    // upsert: update the row with this code, or insert it if there is
    // none. Running this a second time leaves three courses, not six.
    await Course.updateOne({ code: course.code }, course, { upsert: true });
  }

  console.log(`${COURSES.length} courses in ${mongoose.connection.name}`);

  // Without this the script never ends: the connection is an open
  // socket, and Node keeps running while one is still open.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
