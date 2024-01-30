import {ethers, upgrades} from "hardhat";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_MARKETING_VOTING
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();



  const MarketingVotingFactory = await ethers.getContractFactory("MarketingVoting", deployer);
  const MarketingVotingFactoryV2 = await ethers.getContractFactory("MarketingVotingV2", deployer);
  const MarketingVoting = await upgrades.forceImport(ETHEREUM_MARKETING_VOTING!, MarketingVotingFactory)
  const MarketingVotingV2 = await upgrades.upgradeProxy(ETHEREUM_MARKETING_VOTING!, MarketingVotingFactoryV2);

  console.log(
    `\n
    MarketingVoting upgraded: ${await MarketingVotingV2.getAddress()}\n`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
