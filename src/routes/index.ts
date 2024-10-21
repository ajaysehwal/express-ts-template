import { Router } from "express";
// Base Router instance
abstract class BaseRoute {
  public router: Router;
  protected path: string;
  constructor(path: string) {
    this.router = Router();
    this.path = path;
  }

  public init() {
    this.initRoutes();
  }

  protected abstract initRoutes(): void;
}

export default BaseRoute;
export * from "./health.routes";