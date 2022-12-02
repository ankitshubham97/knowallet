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
.addPositionalParam("contractAddress")
  .setAction(async (taskArgs, hre) => {
      try {
         // console.log(taskArgs);
         // console.log(hre);
         const address = taskArgs["contractAddress"];
         // const address = "0xf62e08643635C0e0755CE5A894fDaEEEF72f8F00";
         const Box = await ethers.getContractFactory('PlonkVerifier');
         const box = await Box.attach(address);
         // console.log(process.argv);
         const value = await box.verifyProof(taskArgs["bytesCalldata"],JSON.parse(taskArgs["arrCalldata"]));
         console.log(value);
      } catch (e) {
         console.log(false)
      }
  });

module.exports = {
   solidity: "0.7.3",
   defaultNetwork: "matic",
   networks: {
      hardhat: {},
      matic: {
         url: "https://rpc-mumbai.maticvigil.com",
         accounts: [PRIVATE_KEY]
      },
      fvm: {
         url: "https://wallaby.node.glif.io/rpc/v0",
         accounts: [PRIVATE_KEY]
      },
      shardeum: {
         url: "https://liberty10.shardeum.org/",
         accounts: [PRIVATE_KEY],
         chainId: 8080,
      },
      gnosis: {
         url: "https://rpc.chiadochain.net",
         accounts: [PRIVATE_KEY],
      }
   },
}