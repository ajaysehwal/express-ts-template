import { log } from "@/services";
import BaseRoute, { HealthCheck } from "@/routes";
import { Router } from "express";

interface RouteInfo {
  path: string;
  method: string;
  middleware: string[];
}

class RouteLogger {
  private static routes: RouteInfo[] = [];

  static extractRoutePaths(router: Router, basePath: string = ""): RouteInfo[] {
    const routes: RouteInfo[] = [];

    const stack = (router as any).stack || [];

    for (const layer of stack) {
      if (layer.route) {
        const routePath = basePath + (layer.route.path || "");
        const methods = Object.keys(layer.route.methods).filter(
          (method) => layer.route.methods[method]
        );

        const middleware = layer.route.stack
          .map((handler: any) => handler.name || "anonymous")
          .filter((name: string) => name !== "handle");

        methods.forEach((method) => {
          routes.push({
            path: routePath,
            method: method.toUpperCase(),
            middleware,
          });
        });
      } else if (layer.name === "router") {
        const prefix = layer.regexp.source
          .replace("^\\", "")
          .replace("\\/?(?=\\/|$)", "")
          .replace(/\\\//g, "/");

        routes.push(...RouteLogger.extractRoutePaths(layer.handle, prefix));
      }
    }

    return routes;
  }

  static logRoutes(router: Router) {
    this.routes = this.extractRoutePaths(router);
    this.routes.sort((a, b) => a.path.localeCompare(b.path));

    log.info("🚀 Initialized Routes:");
    log.info("====================");

    this.routes.forEach((route) => {
      const middlewareStr = route.middleware.length
        ? ` [${route.middleware.join(", ")}]`
        : "";

      log.info(`${route.method.padEnd(8)} ${route.path}${middlewareStr}`);
    });

    log.info(`Total routes: ${this.routes.length}`);
    log.info("====================");
  }

  static getRoutes(): RouteInfo[] {
    return this.routes;
  }
}


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
    RouteLogger.logRoutes(mainRouter);
    return mainRouter;
  }
}
const routeManager = new RouteManager();
routeManager.addRoute(new HealthCheck());
/// add  more routes classes

// routeManager.addRoute(new Auth());


const routes = routeManager.getRoutes();
export { routes };
