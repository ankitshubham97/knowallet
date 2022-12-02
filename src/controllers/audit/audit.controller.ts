import express from 'express';
import Controller from '../../interfaces/controller.interface';
import { AUDIT_API } from '../../path';
import AuditService from './audit.service';
import CreateAuditDto from './dto/createAudit.dto';
import validationMiddleware from '../../middleware/validation.middleware';

class AuditController implements Controller {
  public router = express.Router();
  public auditService = new AuditService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${AUDIT_API}/create`,
      validationMiddleware(CreateAuditDto),
      // TODO(ankit): Put an auth so that only Fuze could call this api.
      this.createAudit
    );
  }

  private createAudit = async (
    request: express.Request,
    response: express.Response
  ) => {
    const payload = request.body as CreateAuditDto;
    response.send(await this.auditService.createAudit({ payload }));
  };
}

export default AuditController;
