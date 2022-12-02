import './utils/loadEnv';

import EnvService from './services/env';
import AWSService from './services/aws';

const services = [EnvService, AWSService];
for (const service of services) {
  service.init();
  console.log('initing service');
}

import App from './app';
import { sequelize } from './models/sql/sequelize';
import ApikmsController from './controllers/apikms/apikms.controller';
import UserController from './controllers/user/user.controller';
import AssetController from './controllers/asset/asset.controller';
import AuditController from './controllers/audit/audit.controller';

// Setup db connection and then start app
sequelize.sync().then(() => {
  const app = new App([
    new UserController(),
    new ApikmsController(),
    new AssetController(),
    new AuditController(),
  ]);
  app.listen();
});
