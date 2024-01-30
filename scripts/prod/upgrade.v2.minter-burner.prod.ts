import {ethers, upgrades} from "hardhat";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_MINTER_BURNER
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();



  const MinterBurnerFactory = await ethers.getContractFactory("MinterBurnerV2", deployer);
  const MinterBurner = await upgrades.upgradeProxy(ETHEREUM_MINTER_BURNER!, MinterBurnerFactory);

  console.log(
    `\n
    MinterBurner upgraded: ${await MinterBurner.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
