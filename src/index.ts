import express, { Application } from "express";
import { Security } from "./security";
import morgan from "morgan";
import { Monitoring, log } from "./services";
import { AppMiddleware } from "./middlewares/app.middleware";
import http from "http";
import os from "os";
import { env } from "./configs/env.config";
import cluster from "cluster";
import { routes } from "./managers/RouteManager";
export class Server {
  private app: Application;
  private secuity: Security;
  private monitoring: Monitoring;
  private middle: AppMiddleware;
  constructor() {
    this.app = express();
    this.secuity = new Security(this.app);
    this.monitoring = new Monitoring();
    this.middle = new AppMiddleware();
    this.Initialize();
  }
  private Initialize() {
    this.app.use(this.middle.responseTime);
    this.app.use(this.middle.requestId);
    this.app.use(this.middle.errorHandler);
    this.app.use(this.monitoring.middleware());
    this.secuity.enable();
    this.app.use(express.json({ limit: "1mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    this.app.use(
      morgan("combined", {
        stream: { write: (message) => log.info(message.trim()) },
      })
    );
    this.monitoring.initEndpoints(this.app);
    this.app.use("/", routes);
  }
  private setUpCluster() {
    const numCPUs = os.cpus().length;
    if (cluster.isPrimary) {
      log.info(`Primary ${process.pid} is running`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on("exit", (worker) => {
        log.info(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });

      ["SIGTERM", "SIGINT"].forEach((signal) => {
        process.on(signal, () => {
          log.info(`Primary received ${signal}, shutting down workers...`);
          for (const id in cluster.workers) {
            cluster.workers[id]?.process.kill(1);
          }
        });
      });
    } else {
      this.startWorker();
    }
  }
  private startWorker() {
    const server = this.app.listen(env.server.port, () => {
      log.info(`Worker ${process.pid} running on port ${env.server.port}`);
    });
    process.on("SIGTERM", () => this.shutdown(server));
    process.on("SIGINT", () => this.shutdown(server));
    process.on("uncaughtException", (error) => {
      log.error("Uncaught Exception:", error);
      this.shutdown(server);
    });
    process.on("unhandledRejection", (reason, promise) => {
      log.error("Unhandled Rejection at:", { reason, promise });
      this.shutdown(server);
    });
  }
  private shutdown(server: http.Server) {
    log.info("Server Shutting down...");
    server.close((err) => {
      if (err) log.error((err as Error).message);
      log.info("Server stopped");
      process.exit(0);
    });
    setTimeout(() => {
      log.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  }
  public run() {
    if (env.server.cluster) {
      this.setUpCluster();
    } else {
      this.startWorker();
    }
  }
}

(async () => {
  try {
    new Server().run();
  } catch (error) {
    log.error((error as Error).message);
    process.exit(1);
  }
})();
