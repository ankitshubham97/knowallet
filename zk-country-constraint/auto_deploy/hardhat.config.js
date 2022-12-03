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
         const address = taskArgs["contractAddress"];
         const Box = await ethers.getContractFactory('PlonkVerifier');
         const box = await Box.attach(address);
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
      },
      cronos: {
         url: "https://evm-t3.cronos.org",
         accounts: [PRIVATE_KEY],
      },
      moonbeam: {
         url: "https://rpc.api.moonbase.moonbeam.network",
         accounts: [PRIVATE_KEY],
      }
   },
}