import express from "express";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./repository.js";
import { createUseCases } from "./usecases.js";
function problem(status, title, detail, errors) {
  return {
    type: "about:blank",
    title,
    status,
    detail,
    ...(errors ? { errors } : {}),
  };
}
export function createApp({
  repository,
  useCases = createUseCases(repository),
}) {
  const app = express();
  app.use(express.static(new URL('./public', import.meta.url).pathname));
  app.set('view engine', 'ejs');
  app.set('views', new URL('./views', import.meta.url).pathname);
  app.get('/', (_request, response) => response.render('home', { title: 'Hexagonal URL Shortener' }));
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.post("/api/v1/links", async (request, response, next) => {
    try {
      return response
        .status(201)
        .json({
          data: await useCases.createLink({
            ...request.body,
            owner_id: request.get("x-user-id") || "dev-user",
          }),
        });
    } catch (error) {
      return next(error);
    }
  });
  app.get("/api/v1/links", async (request, response, next) => {
    try {
      return response.json(
        await useCases.listLinks(request.get("x-user-id") || "dev-user"),
      );
    } catch (error) {
      return next(error);
    }
  });
  app.patch("/api/v1/links/:alias", async (request, response, next) => {
    try {
      return response.json({
        data: await useCases.updateLink(
          request.params.alias,
          request.get("x-user-id") || "dev-user",
          request.body,
        ),
      });
    } catch (error) {
      return next(error);
    }
  });
  app.delete("/api/v1/links/:alias", async (request, response, next) => {
    try {
      await useCases.deleteLink(
        request.params.alias,
        request.get("x-user-id") || "dev-user",
      );
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  });
  app.get("/:alias", async (request, response, next) => {
    try {
      let host = null;
      try {
        host = request.get("referer")
          ? new URL(request.get("referer")).hostname
          : null;
      } catch {}
      return response.redirect(
        302,
        await useCases.resolveLink(request.params.alias, host),
      );
    } catch (error) {
      return next(error);
    }
  });
  app.use((_request, response) =>
    response
      .status(404)
      .json(problem(404, "Not Found", "The requested resource was not found")),
  );
  app.use((error, _request, response, _next) => {
    if (error instanceof ValidationError)
      return response
        .status(400)
        .json(problem(400, "Invalid request", error.message, error.errors));
    if (error instanceof NotFoundError)
      return response
        .status(404)
        .json(problem(404, "Not Found", error.message));
    if (error instanceof ForbiddenError)
      return response
        .status(403)
        .json(problem(403, "Forbidden", error.message));
    console.error(error);
    return response
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
