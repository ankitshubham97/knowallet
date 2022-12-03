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
         // const address = "0xA0e4586e635353374afB049d25d47Ea165E3Dac0";
         const Box = await ethers.getContractFactory('PlonkVerifier');
         const box = await Box.attach(address);
         // console.log(process.argv);
         const value = await box.verifyProof(taskArgs["bytesCalldata"],JSON.parse(taskArgs["arrCalldata"]));
         // const value = await box.verifyProof("0x10a23073f57d232dcbc999f72500bb36f965b92a6b46b6fbaf50aea50f48c1002bd8dd1796291383c6ccab5a20e5c8210e61f594f49f77308f66240a3273a0fd1376545a75b425d2bc663806d8337b438cc19a45aec4f9e63bdd3dd30de55e59191328f93dc8fff070efdf2866507a152f19901a9acf6491dadd88244f5a885a28d0352625995dc0cd3d0c3ba4b69eba2bed8a99fa6043af2fbbcf81a5b175e91ef9e1a4e593454215f06a44c9454c5d50c969b894c4fb5b598ccef21c39d59b1b0a13193b4da3a6d2c219ee54c4de103a988c1b09a5b4cae368773fa79f4f1a1fe721cc856c5ebfefc7b6e2d0480ae2406c09f78d9595937136b2aa122612280b66c56610980d4229a1e7953515cb2c38f3f956fcb899ce56a5d06eeae6d2b511c5a4be95e4def621f8013588cc7d2e941b38d3882bd4ba73ded37d1b971cfa116345e45641deb96314629ef7a9ce801446dcf7617575dc6f12cdfb0c9e7ee10f4ae3a148d292e20242ce00fd95850540ab6839e4f7cc9583c42b8a9c3988652b27e1858b32b54bc4a713474fb4c3111b5d36880ee1feb93d9d7338e03de9c70354970762e4e57c75a9c7e10698485011812206468d4c6bb493b621ff517f1629f34c315f69e4b9b3d39702df7152ae879142a6be84c566c7248373bb0715a928ef202d0e86993a5c27d0fdde704f28f84b7930ed42ac9e7af84f31ea9183872fad07ebbba6bee78edf9ba40788ee826c1962de9741cc63947a79a9c1542b9423bb8a513bf5f53db15b3ce9fda308500d032f7290b83c499e996ab44289d7870f3a05786501c3f0d836c9daef5151c1571710a3bc51e6284ca70d58f1e1549723acba252616d2caf2d176f2cbdd2c0c199b2ecf67e034f59ade52684866f704099336451631aaa4f14625f07e3ca8e709794bd3652400e8a5d487b341e72552293f6692510b1553aef41cc85c649304234a3ace56d8dfb0d326c962eb4bc98c2ea6bd37b81343f11b80c5c2e72bee421945c4127bda8fb8f2afe1ca4826c48225e3f5d750fea5ab3c895cc221f5945641e647d2ffc6f8aa2e125615246d85be12f1552ac39eb7b29dea02afb17ca2732ff248a971315e17cb58e29f704310f7",["0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000012"]);
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