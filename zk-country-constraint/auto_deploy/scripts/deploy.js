async function main() {
    const PlonkVerifier = await ethers.getContractFactory("PlonkVerifier");
 
    // Start deployment, returning a promise that resolves to a contract object
    const hello_world = await PlonkVerifier.deploy();
    console.log("Contract deployed to address:", hello_world.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });