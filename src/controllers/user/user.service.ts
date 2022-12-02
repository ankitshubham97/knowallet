import logger from '../../services/logger';
import { sequelize } from '../../models/sql/sequelize';

import { INTERNAL_SERVER_ERROR } from '../../constants';
import {
  createFailureResponse,
  createSuccessResponse,
} from '../../interfaces/response';
import CreateOrUpdateUserDto from './dto/createOrUpdateUser.dto';
import User from '../../models/sql/user.model';
import { spawn } from 'node:child_process';

class UserService {
  public userRepository = sequelize.getRepository(User);

  public async createOrUpdateUser({ payload }: { payload: CreateOrUpdateUserDto }) {
    try {
      const { walletAddress } = payload;
      console.log(walletAddress);

      // // @ts-ignore
      // const walletEntry = await this.userRepository.findOne({
      //   where: {
      //     walletAddress
      //   }
      // });
      // if (!walletEntry) {
      //   // @ts-ignore
      //   await this.userRepository.create ({
      //     walletAddress,
      //   });
      // }

      // Call mrz to extract age.
      const mrzScript = spawn('python3', ['python/mrz.py']);
      mrzScript.stdout.on('data', (data) => {
        console.log((data.toString()));
        const deepfaceScript = spawn('python3', ['python/face.py']);
        deepfaceScript.stdout.on('data', (data1) => {
          const result = String(data1.toString());
          if (result.length > 5) {
            return
          }
          console.log('faces verified:', result);
        });
        deepfaceScript.stderr.on('data', (data) => {
          console.log((data.toString()));
        });
        deepfaceScript.on('exit', (code) => {
          console.log("Process quit with code : " + code);
        });

      });
      mrzScript.stderr.on('data', (data) => {
        console.log((data.toString()));
      });
      mrzScript.on('exit', (code) => {
        console.log("Process quit with code : " + code);
      });

      // Call deepface to verify faces.
      
      
      return createSuccessResponse('OK');
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }
}

export default UserService;
