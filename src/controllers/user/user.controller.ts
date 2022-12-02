import express from 'express';
import { createFailureResponse, createSuccessResponse } from '../../interfaces/response';
import Controller from '../../interfaces/controller.interface';
import CreateOrUpdateUserDto from './dto/createOrUpdateUser.dto';
import VerifyUserDto from './dto/verifyUser.dto';
import UserService from './user.service';
import VerifyUserResponse from './interfaces/verifyUserResponse.interface';
import logger, { prettyJSON } from '../../services/logger';

class UserController implements Controller {
  public router = express.Router();
  public userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/users`, () => undefined);
    this.router.get(`/users/:walletAddress`, this.getUserByWalletAddress);
    this.router.post(`/users`, this.createUser);
    this.router.post(`/users/verify`, this.verifyUser);
    // TODO(ankit): Put a worker auth middleware.
    this.router.put(`/users/worker`, this.updateUserViaWorker);
    this.router.get(`/users/consent/:userWalletAddress/:requestorWalletAddress/:consentId/:value`, this.handleConsent);
    this.router.delete(`/users`, () => undefined);
  }

  private createUser = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body as CreateOrUpdateUserDto;
    response.send(await this.userService.createUser({ payload }));
  };

  private updateUserViaWorker = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body;
    logger.info(prettyJSON(payload));
    response.send(await this.userService.updateUser({ payload }));
  };

  private getUserByWalletAddress = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { walletAddress } = request.params;
    response.send(await this.userService.getUserByWalletAddress({ walletAddress }));
  };

  private verifyUser = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body as VerifyUserDto;
    let callbackFunction = (data : VerifyUserResponse) => {
      if (data.success) {
        return response.send(createSuccessResponse(data));
      }
      return response.send(createFailureResponse(404, `Failed verification for address ${payload.userWalletAddress}: ${data.errMsg}`));
    }
    this.userService.verifyUser({ payload }, callbackFunction);
    // response.send(await this.userService.verifyUser({ payload }));
  };

  private handleConsent = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { userWalletAddress, requestorWalletAddress, consentId, value } = request.params;
    response.send(await this.userService.handleConsent({ userWalletAddress, requestorWalletAddress, consentId, value }));
  };

}

export default UserController;
