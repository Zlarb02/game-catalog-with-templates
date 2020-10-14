import { Db } from "mongodb";
import * as core from "express-serve-static-core";
import * as dotenv from "dotenv";
import * as express from "express";
import * as nunjucks from "nunjucks";
import initDb from "../utils/initDatabase";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";
import ParcsJardinsModel from "./models/parcsJardinsModel";
import * as gamesController from "./controllers/games.controller";
import * as platformsController from "./controllers/platforms.controller";
import * as parcsJardinsController from "./controllers/parcsJardins.controller";

dotenv.config();

const app = express();

app.use("/assets", express.static("public"));

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

function makeApp(db: Db): core.Express {
  const platformModel = new PlatformModel(db.collection<Platform>("platforms"));
  const gameModel = new GameModel(db.collection<Game>("games"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcsJardinsModel = new ParcsJardinsModel(db.collection<any>("parcs-jardins"));

  app.get("/", (_request, response) => response.render("pages/home"));

  // GET platforms
  app.get("/platforms", platformsController.index(platformModel));
  // GET platforms/:slug
  app.get("/platforms/:slug", platformsController.show(platformModel));

  // GET games
  app.get("/games", gamesController.index(gameModel));
  // GET platforms/:slug
  app.get("/games/:slug", gamesController.show(gameModel));

  // GET parcs-jardins
  app.get("/parcs-jardins", parcsJardinsController.index(parcsJardinsModel));

  app.get("/*", (request, response) => {
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}

initDb()
  .then(async (client) => {
    const app = makeApp(client.db());

    app.listen(process.env.PORT, () => {
      console.log(`listen on http://localhost:${process.env.PORT}`);
    });
  })
  .catch(console.error);
