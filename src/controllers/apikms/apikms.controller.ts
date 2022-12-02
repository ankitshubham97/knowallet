import express from 'express';
import Controller from '../../interfaces/controller.interface';
import { APIKMS_API } from '../../path';
import ApikmsService from './apikms.service';
import GenerateApiKeyDto from './dto/generateApiKey.dto';
import RequestWithOrg from '../../interfaces/requestWithOrg.interface';
import authMiddleware from '../../middleware/auth.middleware';
import validationMiddleware from '../../middleware/validation.middleware';
import ManageApiKeyDto from './dto/manageApiKey.dto';
import UpdateAccessApiKeyDto from './dto/updateAccessApiKey.dto';

class ApikmsController implements Controller {
  public router = express.Router();
  public apikmsService = new ApikmsService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Generate api key and secret.
    this.router.post(
      `${APIKMS_API}/create`,
      validationMiddleware(GenerateApiKeyDto),
      this.generateApiKey
    );

    // Get API Keys
    // FIXME: Remove this route after testing.
    this.router.get(`${APIKMS_API}/:apiKey`, this.getApiKey);

    // Delete api key and secret.
    this.router.delete(
      `${APIKMS_API}/delete`,
      validationMiddleware(ManageApiKeyDto),
      authMiddleware,
      this.deleteApiKey
    );

    // Rotate api key and secret.
    this.router.post(
      `${APIKMS_API}/rotate`,
      validationMiddleware(ManageApiKeyDto),
      authMiddleware,
      this.rotateApiKey
    );

    // Update access to existing api key and secret.
    this.router.post(
      `${APIKMS_API}/updateAccess/:apiKey`,
      validationMiddleware(UpdateAccessApiKeyDto),
      authMiddleware,
      this.updateAccess
    );
  }

  private generateApiKey = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body as GenerateApiKeyDto;
    response.send(await this.apikmsService.generateApiKey({ payload }));
  };

  private getApiKey = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { apiKey } = request.params;
    response.send(await this.apikmsService.getApiKeyPair({ apiKey }));
  };

  private deleteApiKey = async (
    request: RequestWithOrg,
    response: express.Response
  ) => {
    const { apiKey } = request.body as ManageApiKeyDto;
    const orgId = String(request.org?._id);
    response.send(await this.apikmsService.deleteApiKey({ apiKey, orgId }));
  };

  private rotateApiKey = async (
    request: RequestWithOrg,
    response: express.Response
  ) => {
    const { apiKey } = request.body as ManageApiKeyDto;
    const orgId = String(request.org?._id);
    response.send(await this.apikmsService.rotateApiKey({ apiKey, orgId }));
  };

  private updateAccess = async (
    request: RequestWithOrg,
    response: express.Response
  ) => {
    const { apiKey, access } = request.body as UpdateAccessApiKeyDto;
    const orgId = String(request.org?._id);
    response.send(
      await this.apikmsService.updateAccess({ apiKey, access, orgId })
    );
  };
}

export default ApikmsController;
