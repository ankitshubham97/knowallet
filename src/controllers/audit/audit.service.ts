import logger from '../../services/logger';
import { sequelize } from '../../models/sql/sequelize';

import { INTERNAL_SERVER_ERROR } from '../../constants';
import {
  createFailureResponse,
  createSuccessResponse,
} from '../../interfaces/response';
import CreateAuditDto from './dto/createAudit.dto';
import Audit from '../../models/sql/audit.model';
import AuditEventType from '../../enums/auditEventType.enum';

class AuditService {
  public auditRepository = sequelize.getRepository(Audit);

  public async createAudit({ payload }: { payload: CreateAuditDto }) {
    try {
      const { userId, orgId, eventType, level, createdBy } = payload;
      // @ts-ignore
      await this.auditRepository.create({
        userId,
        orgId,
        eventType: eventType as AuditEventType,
        level,
        createdBy,
      });
      return createSuccessResponse('OK');
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }
}

export default AuditService;
