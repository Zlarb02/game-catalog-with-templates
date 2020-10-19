import { Db } from "mongodb";
import * as core from "express-serve-static-core";
import express from "express";
import * as nunjucks from "nunjucks";
import GameModel, { Game } from "./models/gameModel";
import * as gamesController from "./controllers/games.controller";
import PlatformModel, { Platform } from "./models/platformModel";
import * as platformsController from "./controllers/platforms.controller";
import ParcsJardinsModel from "./models/parcsJardinsModel";
import * as parcsJardinsController from "./controllers/parcsJardins.controller";
import bodyParser from "body-parser";

const formParser = bodyParser.urlencoded({ extended: true });
// `extended: true` mean that the parser will try its best to give you
// meaningful representation of the data that was being sent.

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

const jsonParser = bodyParser.json();

export function makeApp(db: Db): core.Express {
  const app = express();

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  app.use("/assets", express.static("public"));
  app.set("view engine", "njk");

  const platformModel = new PlatformModel(db.collection<Platform>("platforms"));
  const gameModel = new GameModel(db.collection<Game>("games"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcsJardinsModel = new ParcsJardinsModel(db.collection<any>("parcs-jardins"));

  app.get("/", (_request, response) => response.render("pages/home"));

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/new", formParser, platformsController.showFormForPlatforms(platformModel));
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.post("/platforms/new", formParser, platformsController.create(platformModel));
  app.put("/platforms/:slug", jsonParser, platformsController.update(platformModel));
  app.delete("/platforms/:slug", jsonParser, platformsController.destroy(platformModel));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));
  app.get("/games", gamesController.index(gameModel));
  app.get("/games/new", formParser, gamesController.showFormForGames(gameModel));
  app.get("/games/:slug", gamesController.show(gameModel));
  app.post("/games/new", jsonParser, gamesController.create(gameModel, platformModel));
  app.put("/games/:slug", jsonParser, gamesController.update(gameModel));
  app.delete("/games/:slug", jsonParser, gamesController.destroy(gameModel));

  // GET parcs-jardins
  app.get("/parcs-jardins", parcsJardinsController.index(parcsJardinsModel));
  // GET personal-page
  app.get("/personal-page", (_request, response) => response.render("bonus/personal-page/index"));
  // GET casse-brique
  app.get("/casse-brique", (_request, response) => response.render("bonus/casse-brique/shiny"));

  app.get("/*", (request, response) => {
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
