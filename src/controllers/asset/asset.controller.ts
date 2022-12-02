import express from 'express';
import rateLimitterMiddleware from '../../middleware/rateLimitter.middleware';
import Controller from '../../interfaces/controller.interface';
import apiauthMiddleware from '../../middleware/apiauth.middleware';
import { ASSET_API } from '../../path';

class AssetController implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // TODO(Ankit): Replace this once testing of apiauth middleware is done.
    this.router.post(
      `${ASSET_API}/`,
      rateLimitterMiddleware,
      apiauthMiddleware,
      (_, res) => {
        res.send();
      }
    );
  }
}

export default AssetController;
