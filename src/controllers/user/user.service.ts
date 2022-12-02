import logger from '../../services/logger';
import { sequelize } from '../../models/sql/sequelize';

import { AI_URL, CHAIN_SC_MAP, INTERNAL_SERVER_ERROR, LEGAL_AGE } from '../../constants';
import {
  createFailureResponse,
  createSuccessResponse,
} from '../../interfaces/response';
import CreateOrUpdateUserDto from './dto/createOrUpdateUser.dto';
import User from '../../models/sql/user.model';
import { spawn } from 'node:child_process';
import axios from 'axios';
import VerifyUserDto from './dto/verifyUser.dto';
import VerifyUserResponse from './interfaces/verifyUserResponse.interface';
// import util from 'node:util';
// import shell from 'shelljs';
import Queue, { AWSQueue, QUEUE_GROUPS } from '../../services/queue';
import QueueMessage from '../../interfaces/queueMessage.interface';
import Consent from '../../models/sql/consent.model';
import { sendNotification } from '../../utils/sendPush';
// import { uploadToIpfs } from '../../utils/secureIpfs';

class UserService {
  public userRepository = sequelize.getRepository(User);
  public consentRepository = sequelize.getRepository(Consent);
  public queueService: Queue = new AWSQueue();
  
  public async updateUser({ payload }: { payload: any }) {
    try {
      // @ts-ignore
      await this.userRepository.update({
        proof: payload.proof ?? '',
        calldata: payload.calldata ?? '',
      },
      {
        where: {
          walletAddress: payload.walletAddress ?? '',
        },
      });
      return createSuccessResponse(payload);
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }
  public async createUser({ payload }: { payload: CreateOrUpdateUserDto }) {
    try {
      const { walletAddress, passportBase64String, selfieBase64String } = payload;
      console.log(walletAddress, LEGAL_AGE, AI_URL);
      // @ts-ignore
      const user = await this.userRepository.findOne ({
        where: {
          walletAddress
        }
      });
      if (!user) {
        // @ts-ignore
        await this.userRepository.create ({
          walletAddress,
        });
      }
      
      // Call mrz to extract age.
      let response = await axios({
        method: 'post',
        url: `${AI_URL}/mrz`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : JSON.stringify({"img": passportBase64String})
      });

      if (!(response && response.status === 200 && response.data.birthyear)) {
        return createFailureResponse(500, INTERNAL_SERVER_ERROR);
      }
      const birthyear = Number(response.data.birthyear);
      const age = new Date().getFullYear() - birthyear;
      if (age < LEGAL_AGE) {
        return createFailureResponse(400, `You are below ${LEGAL_AGE}`);
      }
      response = await axios({
        method: 'post',
        url: `${AI_URL}/face`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : JSON.stringify({"img1": passportBase64String, "img2": selfieBase64String})
      });
      console.log(response.status)
      console.log(response.data);
      if (!(response && response.status === 200)) {
        return createFailureResponse(400, INTERNAL_SERVER_ERROR);
      }
      const success = Boolean(response.data.success) ?? false;
      if (!success) {
        return createFailureResponse(400, `Images from selfie and passport do not match`);
      }

      await this.queueService.enqueueTypedMessage<QueueMessage>(
        walletAddress,
        QUEUE_GROUPS.BASHER,
        'basher',
        {
          callType: 'gen-proof',
          inputData: JSON.stringify({
            age,
            ageLimit: 18,
          }),
          ts: Date.now(),
          walletAddress
        }
      );
      return createSuccessResponse('OK');
    } catch (e) {
      logger.error(e);
      return createFailureResponse(500, INTERNAL_SERVER_ERROR);
    }
  }

  public async getUserByWalletAddress({ walletAddress }: { walletAddress: string }) {
    // await uploadToIpfs({data: 'sample data2', filename: walletAddress});
    // @ts-ignore
    const user = await this.userRepository.findOne({
      where: {
        walletAddress
      }
    });
    if (!user) {
      return createFailureResponse(400, `User with wallet address ${walletAddress} not found`);
    }
    await this.queueService.enqueueTypedMessage<QueueMessage>(
      walletAddress,
      QUEUE_GROUPS.BASHER,
      'basher',
      {
        callType: 'gen-proof',
        inputData: JSON.stringify({
          age: 19,
          ageLimit: 18,
        }),
        ts: Date.now(),
        walletAddress
      }
    );
    return createSuccessResponse(user);
  }

  public async verifyUser({ payload }: {payload: VerifyUserDto}, fn: (data: any) => void ) {
    const { userWalletAddress, requestorWalletAddress, chain } = payload;
    const contractAddress = CHAIN_SC_MAP.get(chain) ?? '';
    const user = await this.userRepository.findOne({
      where: {
        walletAddress: userWalletAddress,
      }
    });

    if (!user) {
      fn({success:false, errMsg: `User ${userWalletAddress} does not has KYC done.`});
      return;
    }

    const consentEntry = await this.consentRepository.findOne({
      where: {
        userWalletAddress,
        requestorWalletAddress,
        consent: true
      }
    });
    if (!consentEntry) {
      // @ts-ignore
      const consentEntry = await this.consentRepository.create({
        userWalletAddress,
        requestorWalletAddress,
        consent: false
      });
      await sendNotification({
        title: `A requestor is asking for your consent!`,
        body: `Requestor ${requestorWalletAddress} is seeking your consent to verify KYC details given by you.`,
        cta: `https://api.app.knowallet.xyz/users/consent/${userWalletAddress}/${consentEntry.id}/true`,
        img: ''
      })
      fn({success:false, errMsg: 'User has not given the consent yet to verify their KYC details'});
      return;
    }
    this.verifyCalldata({userWalletAddress, chain, contractAddress}, fn);
  }

  public async handleConsent({ userWalletAddress, consentId, value }: { userWalletAddress: string, consentId: string, value: string }) {
    // value: 'true' or 'false'
    // @ts-ignore
    const boolValue = value === 'true' ? true : false;
    const user = await this.userRepository.findOne({
      where: {
        walletAddress: userWalletAddress
      }
    });
    if (!user) {
      return createFailureResponse(400, `User with wallet address ${userWalletAddress} not found`);
    }
    const consentEntry = await this.consentRepository.findByPk(Number(consentId));
    if (!consentEntry || consentEntry.userWalletAddress !== userWalletAddress) {
      return createFailureResponse(400, `Error with consent entry of wallet address ${userWalletAddress}`);
    }
    await this.consentRepository.update({
      consent: boolValue
    }, {
      where: {
        id: consentEntry.id
      }
    })
    return createSuccessResponse('OK');
  }

  private verifyCalldata({userWalletAddress, chain, contractAddress}: {userWalletAddress: string, chain: string, contractAddress: string}, fn: (data: VerifyUserResponse) => void) {
    console.log(userWalletAddress);
    // @ts-ignore
    this.userRepository.findOne({
      where: {
        walletAddress: userWalletAddress
      }
    }).then( walletEntry => {
      if (!walletEntry || !(walletEntry.calldata) || walletEntry.calldata.length === 0) {
        console.log('could not find the address');
        fn({success:false, errMsg: 'Could not find the address'});
      } else {
        const calldata = walletEntry.calldata;
        const indexComma = calldata.indexOf(",");
        const bytesCalldata = calldata.substring(0, indexComma);
        const arrCalldata = calldata.substring(indexComma + 1);
        const verifyCalldataScript = spawn('bash', ['/home/ubuntu/workspace/hawkeye/api/zk-age-constraint/scripts/verify_calldata.sh', chain, bytesCalldata, arrCalldata, contractAddress]);
        verifyCalldataScript.stdout.on('data', (data) => {
          const success = (String(data.toString()).trim()) === 'true';
          if (success) {
            fn({
              success,
              calldata,
              network: chain,
              contractAddress
            })
          } else {
            fn({success})
          }
        });
        verifyCalldataScript.stderr.on('data', (data) => {
          console.log((data.toString()));
        });
        verifyCalldataScript.on('exit', (code) => {
          console.log("Process quit with code : " + code);
        });
      }
    })
  }
}

export default UserService;
