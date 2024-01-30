import {ethers, upgrades} from "hardhat";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_VE_GOMINING
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();



  const VEGoMiningTokenFactory = await ethers.getContractFactory("VEGoMiningTokenV4", deployer);
  const VEGoMiningToken = await upgrades.upgradeProxy(ETHEREUM_VE_GOMINING!, VEGoMiningTokenFactory);

  console.log(
    `\n
    VEGoMiningToken upgraded: ${await VEGoMiningToken.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
