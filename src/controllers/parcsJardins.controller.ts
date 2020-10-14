import { Request, Response } from "express";
import ParcsJardinsModel from "../models/parcsJardinsModel";

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";

export function index(parcsJardinsModel: ParcsJardinsModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const parcsJardinss = await parcsJardinsModel.findAll();
    if (clientWantsJson(request)) {
      response.json(parcsJardinss);
    } else {
      response.render("parcsJardins/index", { parcsJardinss });
    }
  };
}
