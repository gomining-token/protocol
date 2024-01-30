import {ethers, upgrades} from "hardhat";
import {GoMiningToken, MintReward, VEGoMiningToken, MinterBurner} from "../../typechain-types";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_GMT_TOKEN_ADDRESS,
  ETHEREUM_VE_GOMINING
} = process.env;


async function main() {
  const [deployer] = await ethers.getSigners();


  console.log(ETHEREUM_GMT_TOKEN_ADDRESS);


  const MintRewardFactory = await ethers.getContractFactory("MintReward", deployer);
  // @ts-ignore
  const MintReward: MintReward = await upgrades.deployProxy(MintRewardFactory, [
    ETHEREUM_GMT_TOKEN_ADDRESS,
    ETHEREUM_VE_GOMINING,
  ], {
    initializer: 'initialize',
    kind: 'uups',
  });




  console.log(
    `\n
    MintReward: ${await MintReward.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
