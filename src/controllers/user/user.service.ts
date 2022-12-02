import logger from '../../services/logger';
import { sequelize } from '../../models/sql/sequelize';

import { AI_URL, CHAIN_SC_MAP_AGE, CHAIN_SC_MAP_COUNTRY, INTERNAL_SERVER_ERROR, LEGAL_AGE, REVISE_COLLECTION_ID, SANCTIONED_COUNTRIES } from '../../constants';
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
import {Revise} from 'revise-sdk';


class UserService {
  public userRepository = sequelize.getRepository(User);
  public consentRepository = sequelize.getRepository(Consent);
  public queueService: Queue = new AWSQueue();
  public revise = new Revise({auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhNThkYzI3LTY0MjItNGViZS05N2I0LWQ2YTc5NTRlN2JmNCIsImtleSI6ImluZ2F6cnNkIiwiaWF0IjoxNjcwMDgyNDU0fQ.wORhUg6WeVRcXUjYZAF0bWGnjtsisteNS6zFxzvXP5s"});
  
  public async updateUser({ payload }: { payload: any }) {
    try {
      const { callType } = payload;
      if (callType === 'gen-proof-country') {
        // @ts-ignore
        await this.userRepository.update({
          proofCountry: payload.proof ?? '',
          calldataCountry: payload.calldata ?? '',
        },
        {
          where: {
            walletAddress: payload.walletAddress ?? '',
          },
        });
      } else if (callType === 'gen-proof-age') {
        // @ts-ignore
        await this.userRepository.update({
          proofAge: payload.proof ?? '',
          calldataAge: payload.calldata ?? '',
        },
        {
          where: {
            walletAddress: payload.walletAddress ?? '',
          },
        });
      } else {
        return createFailureResponse(500, INTERNAL_SERVER_ERROR);
      }
      const user = await this.userRepository.findOne ({
        where: {
          walletAddress: payload.walletAddress
        }
      });
      if (user && user.proofAge && user.proofCountry) {
        //https://app.revise.network/revisions/8d64c152-9e47-44b9-86a6-af21e02d0315
        const pet = await this.revise.fetchNFT(user?.nftUrl?.split('https://app.revise.network/revisions/')?.[1]);
        this.revise.nft(pet)
          .setProperty("status", "done")
          .setImage("https://i.ibb.co/rFcrTLx/happy.png")
          .save();
        await sendNotification({
          title: `✅ On-chain id token is verified!`,
          body: `Verification is complete! Click to see it now!`,
          cta: user.nftUrl,
          img: "https://i.ibb.co/rFcrTLx/happy.png",
          receiverAddress: payload.walletAddress
        });
      }
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
        const nft = await this.revise.addNFT({
          image: "https://i.ibb.co/9tQ2YTr/sad.png",
          name: `On-chain Knowallet Id for ${walletAddress}`,
          tokenId: `${Date.now()}`,
          description: `This NFT serves as on-chain id token for ${walletAddress} powered by Knowallet!`,
        },[
          {status: "pending"}
        ], REVISE_COLLECTION_ID);
        console.log(nft.id)
        console.log(`https://app.revise.network/revisions/${nft.id}`)
        // @ts-ignore
        await this.userRepository.create ({
          walletAddress,
          nftUrl: `https://app.revise.network/revisions/${nft.id}`
        });
        await sendNotification({
          title: `❓ On-chain id token is added but not verified!`,
          body: `Verification is pending! Complete it soon! In the meanwhile, click me to see the Knowallet id token!`,
          cta: `https://app.revise.network/revisions/${nft.id}`,
          img: "https://i.ibb.co/9tQ2YTr/sad.png",
          receiverAddress: walletAddress
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
      const country = (response.data.country);
      if (SANCTIONED_COUNTRIES.includes(country)) {
        return createFailureResponse(400, `You are in one of the sanctioned countries`);
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
          callType: 'gen-proof-age',
          inputData: JSON.stringify({
            age,
            ageLimit: 18,
          }),
          ts: Date.now(),
          walletAddress
        }
      );

      await this.queueService.enqueueTypedMessage<QueueMessage>(
        walletAddress,
        QUEUE_GROUPS.BASHER,
        'basher',
        {
          callType: 'gen-proof-country',
          inputData: JSON.stringify({
            "countries" : [123, 456, 789, 1112, 135],
            "country": 45
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
    return createSuccessResponse(user);
  }

  public async verifyUser({ payload }: {payload: VerifyUserDto}, fn: (data: any) => void ) {
    const { userWalletAddress, requestorWalletAddress, chain, questionId } = payload;
    let contractAddress = '';
    if (questionId === 1) {
      contractAddress = CHAIN_SC_MAP_AGE.get(chain) ?? '';
    } else if (questionId === 2) {
      contractAddress = CHAIN_SC_MAP_COUNTRY.get(chain) ?? '';
    } else {
      fn({success:false, errMsg: `Invalid question id ${questionId}.`});
      return;
    }
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
        title: `A requestor is asking for your consent <${consentEntry.id}>!`,
        body: `Binance (${requestorWalletAddress}) is asking for additional information. Approve now!`,
        cta: `https://api.app.knowallet.xyz/users/consent/${userWalletAddress}/${requestorWalletAddress}/${consentEntry.id}/true`,
        img: '',
        receiverAddress: userWalletAddress
      })
      fn({success:false, errMsg: 'User has not given the consent yet to verify their KYC details'});
      return;
    }
    if (consentEntry && !(consentEntry.consent)) {
      await sendNotification({
        title: `A requestor is asking for your consent <${consentEntry.id}>!`,
        body: `Binance (${requestorWalletAddress}) is asking for additional information. Approve now!`,
        cta: `https://api.app.knowallet.xyz/users/consent/${userWalletAddress}/${requestorWalletAddress}/${consentEntry.id}/true`,
        img: '',
        receiverAddress: userWalletAddress
      })
      fn({success:false, errMsg: 'We have resent the consent notification. User has not given the consent yet to verify their KYC details'});
      return;
    }
    logger.info('calling verifyCalldata...')
    this.verifyCalldata({userWalletAddress, chain, contractAddress, questionId}, fn);
  }

  public async handleConsent({ userWalletAddress, requestorWalletAddress, consentId, value }: { userWalletAddress: string, requestorWalletAddress: string, consentId: string, value: string }) {
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
    });
    await sendNotification({
      title: `Consent obtained!`,
      body: `${userWalletAddress} has given the consent to you to verify their KYC details!`,
      cta: ``,
      img: '',
      receiverAddress: requestorWalletAddress
    })
    return createSuccessResponse('OK');
  }

  private verifyCalldata({userWalletAddress, chain, contractAddress, questionId}: {userWalletAddress: string, chain: string, contractAddress: string, questionId: number}, fn: (data: VerifyUserResponse) => void) {
    console.log(userWalletAddress);
    // @ts-ignore
    this.userRepository.findOne({
      where: {
        walletAddress: userWalletAddress
      }
    }).then( walletEntry => {
      if (questionId === 1) {
        if (!walletEntry || !(walletEntry.calldataAge) || walletEntry.calldataAge.length === 0) {
          console.log('could not find the address');
          fn({success:false, errMsg: 'Could not find the address'});
        } else {
          const calldata = walletEntry.calldataAge;
          const indexComma = calldata.indexOf(",");
          const bytesCalldata = calldata.substring(0, indexComma);
          const arrCalldata = calldata.substring(indexComma + 1);
          const verifyCalldataScript = spawn('bash', ['/home/ubuntu/workspace/hawkeye/api/zk-age-constraint/scripts/verify_calldata.sh', chain, bytesCalldata, arrCalldata, contractAddress]);
          verifyCalldataScript.stdout.on('data', (data) => {
            logger.info("data");
            const success = (String(data.toString()).trim()) === 'true';
            logger.info(success);
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
      } else if (questionId === 2) {
        if (!walletEntry || !(walletEntry.calldataCountry) || walletEntry.calldataCountry.length === 0) {
          console.log('could not find the address');
          fn({success:false, errMsg: 'Could not find the address'});
        } else {
          const calldata = walletEntry.calldataCountry;
          const indexComma = calldata.indexOf(",");
          const bytesCalldata = calldata.substring(0, indexComma);
          const arrCalldata = calldata.substring(indexComma + 1);
          const verifyCalldataScript = spawn('bash', ['/home/ubuntu/workspace/hawkeye/api/zk-country-constraint/scripts/verify_calldata.sh', chain, bytesCalldata, arrCalldata, contractAddress]);
          verifyCalldataScript.stdout.on('data', (data) => {
            logger.info("data");
            const success = (String(data.toString()).trim()) === 'true';
            logger.info(success);
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
      } else {
        fn({success:false, errMsg: `Invalid question id ${questionId}`});
      }
    })
  }
}

export default UserService;
