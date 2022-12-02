import express from 'express';
import { createFailureResponse, createSuccessResponse } from '../../interfaces/response';
import Controller from '../../interfaces/controller.interface';
import CreateOrUpdateUserDto from './dto/createOrUpdateUser.dto';
import VerifyUserDto from './dto/verifyUser.dto';
import UserService from './user.service';
import VerifyUserResponse from './interfaces/verifyUserResponse.interface';

class UserController implements Controller {
  public router = express.Router();
  public userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/users`, () => undefined);
    this.router.get(`/users/:walletAddress`, this.getUserByWalletAddress);
    this.router.post(`/users`, this.createOrUpdateUser);
    this.router.post(`/users/verify`, this.verifyUser);
    this.router.put(`/users`, () => undefined);
    this.router.delete(`/users`, () => undefined);
  }

  private createOrUpdateUser = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body as CreateOrUpdateUserDto;
    response.send(await this.userService.createOrUpdateUser({ payload }));
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
      console.log("-------")

      console.log("-------")
      if (data.success) {
        return response.send(createSuccessResponse(data));
      }
      return response.send(createFailureResponse(404, `Failed verification for address ${payload.walletAddress}`));
    }
    this.userService.verifyUser({ payload }, callbackFunction);
    // response.send(await this.userService.verifyUser({ payload }));
  };
}

export default UserController;
