# How to read the comparison

The six variants change one primary architectural pressure at a time:

1. direct SQL makes the request-to-database path visible;
2. Prisma changes persistence mechanics;
3. use cases separate workflows from HTTP;
4. hexagonal ports invert infrastructure dependencies;
5. TypeScript makes selected boundaries statically visible;
6. DDD moves business invariants into a domain model.

The functional specification is the control variable. When a behavior changes,
the README and test must identify whether it is an intentional teaching
deviation or an accidental regression. The matrix runner proves every
directory's suite still passes; the comparison chapters explain what the suite
cannot prove, such as navigability, cognitive load, or the value of an
abstraction for future change.

## Review questions

- Which dependency points inward in each variant?
- Which test can run without a database?
- Where is authorization decided?
- What does the ORM hide, and what remains a SQL concern?
- Which domain rule is impossible to express with a port type alone?
- At what point would the added layer cost more than it saves?
