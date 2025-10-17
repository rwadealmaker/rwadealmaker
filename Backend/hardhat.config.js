require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//测试网地址及私钥
const SEPOLIA_URL = process.env.SEPOLIA_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [
        process.env.SEPOLIA_PRIVATE_KEY,
        process.env.SEPOLIA_PRIVATE_KEY2,
        process.env.SEPOLIA_PRIVATE_KEY3,
      ],
      chainId: 11155111,
    },
  },
  etherscan: {
    // 如需校验合约可补充 key
    // apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts", // 如你的合约不在 contracts 目录可调整
    scripts: "./scripts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};