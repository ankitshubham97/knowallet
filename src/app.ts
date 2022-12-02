import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import morgan from 'morgan';
import morganBody from 'morgan-body';

import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

class App {
  public app: express.Application;

  constructor(controllers: readonly Controller[]) {
    this.app = express();

    this.initializeStandardMiddlewares();
    this.initializeControllers(controllers);
  }

  public listen(): void {
    const httpserver = this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
    httpserver.setTimeout(100000);
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeStandardMiddlewares() {
    this.app.set('trust proxy', true);

    // Parse body as json
    this.app.use(bodyParser.json({limit: "50mb"}));
    this.app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
    this.app.use(express.json({limit: '50mb'}));


    // Parse cookies
    this.app.use(cookieParser());

    // Protect against HTTP Parameter Pollution
    this.app.use(hpp());

    // Protect against multiple things
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );

    // Enable CORS
    this.app.use(
      cors({ origin: ['http://localhost:3001','http://localhost:3000', 'https://zk-ui.vercel.app', 'https://bafybeiaia3xkqedbi55rhe5tsbr2au4gvbbx4ebgrjc3syty4lq77xpbya.ipfs.gateway.valist.io', 'https://app.knowallet.xyz'], credentials: true })
    );

    // We have to ensure checks end-point is before logging
    // so that we don't overflow the logs with health checks
    this.app.use('/checks', (_req, res) => res.send('OK'));

    // Log out requests
    this.app.use(morgan('combined'));
    morganBody(this.app, {
      logResponseBody: false,
      skip: (req: express.Request, _res: express.Response) => {
        // This is a whitelist, to allow body logging for a few endpoints
        if (req.url.match(/user/)) {
          return false;
        }

        return true;
      },
    });
  }

  private initializeControllers(controllers: readonly Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });

    // Error Handling
    this.app.use(errorMiddleware);
  }
}

export default App;
