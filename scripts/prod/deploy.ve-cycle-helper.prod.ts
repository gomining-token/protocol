import * as dotenv from "dotenv";
import {ethers, upgrades} from "hardhat";

dotenv.config({
	path: '../.env'
});



const {
	ETHEREUM_GMT_TOKEN_ADDRESS,
	ETHEREUM_MINTER_BURNER,
	ETHEREUM_MARKETING_VOTING,
} = process.env;


async function main() {
	const [deployer] = await ethers.getSigners();


	const VECycleHelperFactory = await ethers.getContractFactory("VECycleHelper", deployer);
	// @ts-ignore
	const VECycleHelper: VECycleHelper = await upgrades.deployProxy(VECycleHelperFactory, [
		ETHEREUM_GMT_TOKEN_ADDRESS,
		ETHEREUM_MINTER_BURNER,
		ETHEREUM_MARKETING_VOTING
	], {
		initializer: 'initialize',
		kind: 'uups',
	});

	console.log(
		`\n
    VECycleHelper: ${await VECycleHelper.getAddress()}\n`
	);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
