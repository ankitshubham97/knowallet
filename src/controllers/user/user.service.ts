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
          this.generateProofAndPersist({walletAddress});
          this.generateCalldataAndPersist({walletAddress});
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
      
      return createSuccessResponse('OK');
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }
  
  public async getUserByWalletAddress({ walletAddress }: { walletAddress: string }) {
    // @ts-ignore
    const user = await this.userRepository.findOne({
      where: {
        walletAddress
      }
    });
    if (!user) {
      return createFailureResponse(400, `User with wallet address ${walletAddress} not found`);
    }
    return createSuccessResponse(user);
  }


  private generateProofAndPersist({walletAddress}: {walletAddress: string}) {
    const genProofScript = spawn('bash', ['/home/ubuntu/workspace/api/zk-age-constraint/scripts/generate_proof.sh']);
    genProofScript.stdout.on('data', (data) => {
      const proof = String(data.toString()).trim();
      console.log(proof, walletAddress);
      // @ts-ignore
      this.userRepository.findOne({
        where: {
          walletAddress
        }
      }).then( walletEntry => {
        if (!walletEntry) {
          // @ts-ignore
          this.userRepository.create ({
            walletAddress,
            proof
          });
        } else {
          // @ts-ignore
          this.userRepository.update({
            proof,
          },
          {
            where: {
              walletAddress
            },
          })
        }
      })
    });
    genProofScript.stderr.on('data', (data) => {
      console.log((data.toString()));
    });
    genProofScript.on('exit', (code) => {
      console.log("Process quit with code : " + code);
    });
  }

  private generateCalldataAndPersist({walletAddress}: {walletAddress: string}) {
    const genCalldataScript = spawn('bash', ['/home/ubuntu/workspace/api/zk-age-constraint/scripts/generate_calldata.sh']);
    genCalldataScript.stdout.on('data', (data) => {
      const calldata = String(data.toString()).trim();
      console.log(calldata, walletAddress);
      // @ts-ignore
      this.userRepository.findOne({
        where: {
          walletAddress
        }
      }).then( walletEntry => {
        if (!walletEntry) {
          // @ts-ignore
          this.userRepository.create ({
            walletAddress,
            calldata
          });
        } else {
          // @ts-ignore
          this.userRepository.update({
            calldata,
          },
          {
            where: {
              walletAddress
            },
          })
        }
      })
    });
    genCalldataScript.stderr.on('data', (data) => {
      console.log((data.toString()));
    });
    genCalldataScript.on('exit', (code) => {
      console.log("Process quit with code : " + code);
    });
  }
}

export default UserService;
