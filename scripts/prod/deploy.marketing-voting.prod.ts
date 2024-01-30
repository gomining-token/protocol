import * as dotenv from "dotenv";
import {ethers, upgrades} from "hardhat";

dotenv.config({
	path: '../.env'
});



const {
	ETHEREUM_VE_GOMINING
} = process.env;


async function main() {
	const [deployer] = await ethers.getSigners();


	const MarketingVotingFactory = await ethers.getContractFactory("MarketingVoting", deployer);
	// @ts-ignore
	const MarketingVoting: MarketingVoting = await upgrades.deployProxy(MarketingVotingFactory, [
		ETHEREUM_VE_GOMINING
	], {
		initializer: 'initialize',
		kind: 'uups',
	});
	console.log(
		`\n
    MarketingVoting: ${await MarketingVoting.getAddress()}\n`
	);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
