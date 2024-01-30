import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config({
  path: '.env'
});



const {
  GOERLI_URL,
  GOERLI_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  ETHEREUM_URL,
  ETHEREUM_PRIVATE_KEY
} = process.env;


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: GOERLI_URL,
      accounts: [`0x${GOERLI_PRIVATE_KEY!}`]
    },
    // mainnet: {
    //   url: ETHEREUM_URL,
    //   accounts: [`0x${ETHEREUM_PRIVATE_KEY!}`],
    // }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
