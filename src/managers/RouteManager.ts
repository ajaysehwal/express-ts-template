import BaseRoute, { HealthCheck } from "../routes";
import { Router } from "express";

class RouteManager {
  private routes: BaseRoute[] = [];
  public addRoute(route: BaseRoute) {
    route.init();
    this.routes.push(route);
  }
  public getRoutes(): Router {
    const mainRouter = Router();
    this.routes.forEach((route) => {
      mainRouter.use("/", route.router);
    });
    return mainRouter;
  }
}
const routeManager = new RouteManager();
routeManager.addRoute(new HealthCheck());
/// add  more routes classes
const routes = routeManager.getRoutes();
export { routes };
