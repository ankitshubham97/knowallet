import { Request } from 'express';
import Org from './org.interface';

interface RequestWithOrg extends Request {
  org?: Partial<Org>;
}

export default RequestWithOrg;
