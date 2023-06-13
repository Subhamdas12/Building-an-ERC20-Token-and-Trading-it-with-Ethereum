const { ethers } = require("hardhat");
const converter = (n) => {
  return ethers.utils.parseEther(n.toString());
};
async function main() {
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");
  const accounts = await ethers.getSigners();
  console.log(`Deploying the token smart contract...`);
  const token = await Token.connect(accounts[0]).deploy(
    "The Blockchain century",
    "TBC",
    1000000
  );
  await token.deployed();
  console.log(`Token deployed at address ${token.address}`);
  console.log(`Deploying the exchange smart contract...`);
  const exchange = await Exchange.connect(accounts[0]).deploy(1, token.address);
  await exchange.deployed();
  console.log(`Exchange deployed at address ${exchange.address}`);
  await token
    .connect(accounts[0])
    .transfer(accounts[0].address, exchange.address, converter(1000000));
  console.log(
    `${converter(1000000)} transfered from accounts 0 to exchange contract`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
