import type { CourseDoc } from "../types/index";

// The three courses db.json has held since Session 7, word for word.
// They are reference data: nobody creates a course through the API, so
// they live here and go into the database once, from src/seed.ts.
//
// itelect4-project had a file in exactly this place -- src/data/
// mockData.ts -- and deleted it in Session 7 when json-server took
// over. This is that same list, on the side of the wire that now owns
// it.
export const COURSES: CourseDoc[] = [
  {
    code: "ITELECT4",
    title: "IT Elective 4",
    units: 3,
    semester: "1st Semester 2026-2027",
  },
  {
    code: "ITELECT3",
    title: "IT Elective 3",
    units: 3,
    semester: "2nd Semester 2025-2026",
  },
  {
    code: "CSSWENG",
    title: "Software Engineering",
    units: 3,
    semester: "1st Semester 2026-2027",
  },
];
