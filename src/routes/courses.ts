import { Router, type Request, type Response } from "express";
import { Course } from "../models/Course";

export const courseRouter = Router();

// There is no requireAuth line in this file, and that is the point.
// submissions.ts puts one at the top so every route below it is
// private; the course list is what the app shows before anybody has
// logged in, so these two are public on purpose.

// GET /api/courses
courseRouter.get("/", async (_req: Request, res: Response) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

interface CodeParam {
  code: string;
}

// GET /api/courses/ITELECT4
courseRouter.get(
  "/:code",
  async (req: Request<CodeParam>, res: Response) => {
    // Session 7 asked json-server for /courses?code=ITELECT4 and read
    // matches[0], because json-server has no route for a single row.
    // A real API can have one, so the frontend stops unwrapping an
    // array that only ever had one thing in it.
    const course = await Course.findOne({
      // The schema uppercases code on the way in, so /courses/itelect4
      // has to be raised here too or it matches nothing.
      code: req.params.code.toUpperCase(),
    });

    if (!course) {
      res.status(404).json({
        message: `No course with code "${req.params.code}"`,
      });
      return;
    }

    res.json(course);
  },
);
