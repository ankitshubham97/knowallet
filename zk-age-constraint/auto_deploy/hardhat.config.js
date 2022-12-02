/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;

// import { task } from "hardhat/config";

task("verifyCalldata", "verifyCalldata")
  .addPositionalParam("bytesCalldata")
  .addPositionalParam("arrCalldata")
  .setAction(async (taskArgs) => {
      // console.log(taskArgs);
      const address = '0xf62e08643635C0e0755CE5A894fDaEEEF72f8F00';
      const Box = await ethers.getContractFactory('PlonkVerifier');
      const box = await Box.attach(address);
      // console.log(process.argv);
      const value = await box.verifyProof(taskArgs["bytesCalldata"],JSON.parse(taskArgs["arrCalldata"]));
      console.log(value);
  });

module.exports = {
   solidity: "0.7.3",
   defaultNetwork: "matic",
   networks: {
      hardhat: {},
      matic: {
         url: "https://rpc-mumbai.maticvigil.com",
         accounts: [PRIVATE_KEY]
      }
   },
}