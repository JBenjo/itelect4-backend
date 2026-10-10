import { Router, type Request, type Response } from "express";
import { Submission } from "../models/Submission";
import { requireAuth } from "../middleware/auth";
import type { NewSubmissionBody } from "../types/index";

export const submissionRouter = Router();

// One line, and every route in this file is behind the token check.
// Anything above this line would be public; everything below needs a
// valid Authorization header.
submissionRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/submissions -- only the ones belonging to this token
submissionRouter.get("/", async (req: Request, res: Response) => {
  const submissions = await Submission.find({
    studentId: req.userId,
  }).sort({ submittedAt: -1 });
  res.json(submissions);
});

// GET /api/submissions/:id
submissionRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    // Both halves matter: the right row, AND the right owner. Without
    // studentId here, changing the id in the URL reads another row.
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.userId,
    });

    if (!submission) {
      res.status(404).json({ message: "No submission with that id" });
      return;
    }

    res.json(submission);
  },
);

// POST /api/submissions
submissionRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewSubmissionBody>,
    res: Response,
  ) => {
    const submission = await Submission.create({
      ...req.body,
      // Not req.body.studentId. The owner comes off the verified
      // token, so a request cannot claim to be someone else by id.
      studentId: req.userId,
    });

    res.status(201).json(submission);
  },
);

// PATCH /api/submissions/:id
submissionRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewSubmissionBody>>,
    res: Response,
  ) => {
    const submission = await Submission.findOneAndUpdate(
      { _id: req.params.id, studentId: req.userId },
      req.body,
      // returnDocument: "after" returns the row AFTER the change, not before.
      // runValidators: schema rules are skipped on updates otherwise.
      { returnDocument: "after", runValidators: true },
    );

    if (!submission) {
      res.status(404).json({ message: "No submission with that id" });
      return;
    }

    res.json(submission);
  },
);

// DELETE /api/submissions/:id
submissionRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const submission = await Submission.findOneAndDelete({
      _id: req.params.id,
      studentId: req.userId,
    });

    if (!submission) {
      res.status(404).json({ message: "No submission with that id" });
      return;
    }

    // 204 means "done, and there is deliberately no body to send".
    res.status(204).send();
  },
);
