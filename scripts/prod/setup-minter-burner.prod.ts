import {ethers, upgrades} from "hardhat";
import {GoMiningToken, MintReward, VEGoMiningToken, MinterBurner} from "../../typechain-types";

import * as dotenv from "dotenv";

dotenv.config({
  path: '../.env'
});



const {
  ETHEREUM_MINTER_BURNER,
  ETHEREUM_MINT_REWARD,
} = process.env;

const burnRatioEpochsNumbers: [number, number][] = [
  [10000000, 0.8],
  [20000000, 0.81],
  [30000000, 0.82],
  [40000000, 0.83],
  [50000000, 0.84],
  [60000000, 0.85],
  [70000000, 0.86],
  [80000000, 0.87],
  [90000000, 0.88],
  [100000000, 0.89],
  [200000000, 0.9],
  [300000000, 0.91],
  [400000000, 0.92],
  [500000000, 0.93],
  [600000000, 0.94],
  [650000000, 0.95],
  [700000000, 0.96],
  [750000000, 0.97],
  [1345762000, 0.98]
];

const burnRatioEpochs: [bigint, number][] = burnRatioEpochsNumbers.map((val) => {
  return [BigInt(val[0]) * BigInt(10 ** 18), val[1]]
});

const lastMintBurnRatio = 0.99;

async function main() {
  const [deployer] = await ethers.getSigners();

  const MinterBurnerFactory = await ethers.getContractFactory("MinterBurner");
  const MinterBurner: MinterBurner = MinterBurnerFactory.attach(
    ETHEREUM_MINTER_BURNER!
  ) as MinterBurner;

  const MintRewardFactory = await ethers.getContractFactory("MintReward");
  const MintReward: MintReward = MintRewardFactory.attach(
    ETHEREUM_MINT_REWARD!
  ) as MintReward;

  for (let i = 0; i < burnRatioEpochs.length; i++) {
    await MinterBurner.addBurnRatioEpoch(burnRatioEpochs[i][0], burnRatioEpochs[i][1] * 1000);
  }

  await MinterBurner.setLastBurnRatio(lastMintBurnRatio * 1000);

  const deciPercentMintReward = 200;

  await MinterBurner.setMintRewardDeciPercent(deciPercentMintReward);

  await MintReward.grantRole(await MintReward.MINTER_ROLE(), await MinterBurner.getAddress());

  console.log(
    `finished`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
