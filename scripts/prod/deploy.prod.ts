import {ethers, upgrades} from "hardhat";
import {GoMiningToken, MintReward, VEGoMiningToken, MinterBurner} from "../../typechain-types";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHERSCAN_GMT_TOKEN_ADDRESS
} = process.env;


async function main() {
  const [deployer] = await ethers.getSigners();


  const VEGoMiningTokenFactory = await ethers.getContractFactory("VEGoMiningToken", deployer);
  // @ts-ignore
  const VEGoMiningToken: VEGoMiningToken = await upgrades.deployProxy(VEGoMiningTokenFactory, [
    ETHERSCAN_GMT_TOKEN_ADDRESS,
    "Vote-escrow GoMining Token",
    "veGoMining",
    "1"
  ], {
    initializer: 'initialize',
    kind: 'uups',
  });

  const MintRewardFactory = await ethers.getContractFactory("MintReward", deployer);
  // @ts-ignore
  const MintReward: MintReward = await upgrades.deployProxy(MintRewardFactory, [
    ETHERSCAN_GMT_TOKEN_ADDRESS,
    await VEGoMiningToken.getAddress(),
  ], {
    initializer: 'initialize',
    kind: 'uups',
  });


  const MinterBurnerFactory = await ethers.getContractFactory("MinterBurner", deployer);
  // @ts-ignore
  const MinterBurner: MinterBurner = await upgrades.deployProxy(MinterBurnerFactory, [
    ETHERSCAN_GMT_TOKEN_ADDRESS,
    await MintReward.getAddress(),
  ], {
    initializer: 'initialize',
    kind: 'uups',
  });


  console.log(
    `\n
    VEGoMiningToken: ${await VEGoMiningToken.getAddress()}\n
    MintReward: ${await MintReward.getAddress()}\n
    MinterBurner: ${await MinterBurner.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
