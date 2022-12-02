import express from 'express';
import Controller from '../../interfaces/controller.interface';
import CreateOrUpdateUserDto from './dto/createOrUpdateUser.dto';
import UserService from './user.service';

class UserController implements Controller {
  public router = express.Router();
  public userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/users`, () => undefined);
    this.router.get(`/users/:userId`, () => undefined);
    this.router.post(`/users`, this.createOrUpdateUser);
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
}

export default UserController;
