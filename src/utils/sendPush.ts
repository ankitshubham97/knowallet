import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
import EnvService from "../services/env";


const PK = EnvService.env().PRIVATE_KEY;
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

export const sendNotification = async({title, body, cta, img, receiverAddress}: {title: string, body: string, cta: string, img: string, receiverAddress: string}) => {
  try {
    await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title,
        body
      },
      payload: {
        title,
        body,
        cta,
        img,
      },
      recipients: `eip155:5:${receiverAddress}`, // recipient address
      channel: `eip155:5:${EnvService.env().PUBLIC_KEY}`, // your channel address
      env: 'staging'
    });
    
    // apiResponse?.status === 204, if sent successfully!
    // console.log('API repsonse: ', apiResponse);
  } catch (err) {
    console.error('Error: ', err);
  }
}

// export const optIn = async ({userAddress}: {userAddress:string}) => {
//   try {
//     await PushAPI.channels.subscribe({
//       signer,
//       channelAddress: `eip155:5:${EnvService.env().PUBLIC_KEY}`, // channel address in CAIP
//       userAddress: `eip155:5:${userAddress}`, // user address in CAIP
//       onSuccess: () => {
//        console.log('opt in success');
//       },
//       onError: () => {
//         console.error('opt in error');
//       },
//       env: 'staging'
//     })
    
//   } catch (err) {
//     console.error('Error: ', err);
//   }
// }