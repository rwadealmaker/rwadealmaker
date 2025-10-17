const { task } = require("hardhat/config");

task("unlock-user", "Add user to whitelist", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {};