import axios from 'axios';
import EthCrypto from 'eth-crypto';
// import EnvService from '../services/env';
import FormData from 'form-data';


const CHAINSAFE_BUCKET_URL = "https://api.chainsafe.io/api/v1/bucket/12110635-9fce-419a-83ef-4f843965abbc";
const CHAINSAFE_KEY_SECRET = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjI4ODA2NDAsImNuZiI6eyJqa3UiOiIvY2VydHMiLCJraWQiOiI5aHE4bnlVUWdMb29ER2l6VnI5SEJtOFIxVEwxS0JKSFlNRUtTRXh4eGtLcCJ9LCJ0eXBlIjoiYXBpX3NlY3JldCIsImlkIjo4NjA2LCJ1dWlkIjoiM2M1NmYzMjEtYTk5Yi00MzA0LWFlNzEtNzJjNjU0MWM0Y2VhIiwicGVybSI6eyJiaWxsaW5nIjoiKiIsInNlYXJjaCI6IioiLCJzdG9yYWdlIjoiKiIsInVzZXIiOiIqIn0sImFwaV9rZXkiOiJPWVdOT0dVU1pOV01QR1VTUVFVSSIsInNlcnZpY2UiOiJzdG9yYWdlIn0.IDNCAGlNIvtr5T5NnL0IK8VVLXh1WLqvMPupvBWL0HPW2rikuKmURK2zW-tjCz5DDrFaXJlx6dkVhV-4lCsYhg";

export const encryptViaPublicKey = async ({privateKey, data}:{privateKey:string, data:string}) => {
  const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
  const encrypted_obj = await EthCrypto.encryptWithPublicKey(publicKey, data);
  return EthCrypto.cipher.stringify(encrypted_obj);
}

export const decryptViaPrivateKey = async ({privateKey, data}:{privateKey:string, data:string}) => {
  const encrypted_obj = EthCrypto.cipher.parse(data);
  return (await EthCrypto.decryptWithPrivateKey(privateKey, encrypted_obj));
}

export const uploadToIpfs = async ({data, filename}: {data:string, filename: string}) => {
  try {
    let formdata = new FormData();
    formdata.append('path', ``);
    formdata.append('file', data, filename);
    const resp2 = await axios({
      method: 'post',
      url: `${CHAINSAFE_BUCKET_URL}/upload`,
      // responseType: 'stream' as ResponseType,
      headers: { 
        'Authorization': `Bearer ${CHAINSAFE_KEY_SECRET}`,
        ...formdata.getHeaders()
      },
      data : formdata
    });
    console.log(resp2);

    // resp2.data.pipe(res)
  } catch (err) {
    console.log(err);
  }
}

// (encryptViaPublicKey({privateKey:"dec5213b700bc944b06584aaf3d508f88a1ce0221b77067b7e7b95d7b88d2ae3", data: "abc"}))
//   .then(d => console.log(d));
//   decryptViaPrivateKey({privateKey:"dec5213b700bc944b06584aaf3d508f88a1ce0221b77067b7e7b95d7b88d2ae3", data: "769812ba38835fa005510e62d442b79b039e9d8923f37e87544a9a27090cf7974107c988d6b6b2a2af5fff583a914ae096153cd2fb15126aac9441369eeeed44df90beef6393fc6e7205ee20c7be75ea3a5595f66b0601d0f49d0e6743b7a2822d"}).then
//   (d => console.log(d));
//   decryptViaPrivateKey({privateKey:"dec5213b700bc944b06584aaf3d508f88a1ce0221b77067b7e7b95d7b88d2ae3", data: "9d7b5be2cab0f90b3ca76dc7b91abc54038eb9543561a6df18beaa5bab51a21fadfde9b00bae84c3d6a8255ba126997f90e1a476eb2560f2109624a1470907a527f5529b2ffa8e4dd0548a67dd44f4153a5cab1d4e41c322053d0312bcb48805c7"}).then
//   (d => console.log(d));
//   decryptViaPrivateKey({privateKey:"dec5213b700bc944b06584aaf3d508f88a1ce0221b77067b7e7b95d7b88d2ae3", data: "62782d9f389f83d743202083d5a560e302f1c6b0dee65335a5780a04563ab827bc4071e5849dc7faf5d8df819c58a0fdb714230b5adf1c820b8509f2a0ababecb0c10a7d91d40f1af9232b505481f50cf38adbacc7616ff695c18d0b458d1ccca0"}).then
//   (d => console.log(d));

  // (uploadToIpfs())