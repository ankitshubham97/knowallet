cd /home/ubuntu/workspace/hawkeye/api/zk-country-constraint/auto_deploy
npx hardhat --network $1 verifyCalldata $2 $3 $4
# npx hardhat verifyCalldata