import express from "express";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./repository.js";
import { createUseCases } from "./usecases.js";
function problem(status, title, detail) {
  return { type: "about:blank", title, status, detail };
}
export function createApp({
  repository,
  useCases = createUseCases(repository),
}) {
  const app = express();
  app.use(express.static(new URL('./public', import.meta.url).pathname));
  app.set('view engine', 'ejs');
  app.set('views', new URL('./views', import.meta.url).pathname);
  app.get('/', (_request, response) => response.render('home', { title: 'Use Cases Pastebin' }));
  app.use(express.json({ limit: "128kb" }));
  app.post("/api/v1/snippets", async (q, s, n) => {
    try {
      return s
        .status(201)
        .json({
          data: await useCases.createSnippet({
            ...q.body,
            owner_id: q.get("x-user-id") || null,
          }),
        });
    } catch (e) {
      return n(e);
    }
  });
  app.get("/api/v1/snippets", async (q, s, n) => {
    try {
      return s.json(
        await useCases.listSnippets({
          query: q.query.q || "",
          tag: q.query.tag,
        }),
      );
    } catch (e) {
      return n(e);
    }
  });
  app.get("/api/v1/snippets/:id", async (q, s, n) => {
    try {
      return s.json({
        data: await useCases.readSnippet(
          q.params.id,
          q.get("x-user-id") || null,
        ),
      });
    } catch (e) {
      return n(e);
    }
  });
  app.get("/api/v1/snippets/:id/raw", async (q, s, n) => {
    try {
      return s
        .type("text/plain")
        .send(
          (await useCases.readSnippet(q.params.id, q.get("x-user-id") || null))
            .content,
        );
    } catch (e) {
      return n(e);
    }
  });
  app.patch("/api/v1/snippets/:id", async (q, s, n) => {
    try {
      return s.json({
        data: await useCases.updateSnippet(
          q.params.id,
          q.get("x-user-id") || null,
          q.body,
        ),
      });
    } catch (e) {
      return n(e);
    }
  });
  app.delete("/api/v1/snippets/:id", async (q, s, n) => {
    try {
      await useCases.deleteSnippet(q.params.id, q.get("x-user-id") || null);
      return s.status(204).end();
    } catch (e) {
      return n(e);
    }
  });
  app.use((_q, s) =>
    s
      .status(404)
      .json(problem(404, "Not Found", "The requested resource was not found")),
  );
  app.use((e, _q, s, _n) => {
    if (e instanceof ValidationError)
      return s.status(400).json(problem(400, "Invalid request", e.message));
    if (e instanceof NotFoundError)
      return s.status(404).json(problem(404, "Not Found", e.message));
    if (e instanceof ForbiddenError)
      return s.status(403).json(problem(403, "Forbidden", e.message));
    console.error(e);
    return s
      .status(500)
      .json(
        problem(
          500,
          "Internal Server Error",
          "The server could not complete the request",
        ),
      );
  });
  return app;
}
