import {ethers, upgrades} from "hardhat";
import {GoMiningToken, MintReward, VEGoMiningToken, MinterBurner} from "../../typechain-types";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_GMT_TOKEN_ADDRESS,
  ETHEREUM_MINT_REWARD
} = process.env;


async function main() {
  const [deployer] = await ethers.getSigners();


  console.log(ETHEREUM_GMT_TOKEN_ADDRESS);

  const MinterBurnerFactory = await ethers.getContractFactory("MinterBurner", deployer);
  // @ts-ignore
  const MinterBurner: MinterBurner = await upgrades.deployProxy(MinterBurnerFactory, [
    ETHEREUM_GMT_TOKEN_ADDRESS,
    ETHEREUM_MINT_REWARD,
  ], {
    initializer: 'initialize',
    kind: 'uups',
  });


  console.log(
    `\n
    MinterBurner: ${await MinterBurner.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
