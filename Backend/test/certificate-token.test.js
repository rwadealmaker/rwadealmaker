const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateToken", function () {
  let CertificateToken;
  let lpriToken;
  let lintToken;
  let owner;
  let controller;
  let user1;
  let user2;
  let registry;

  beforeEach(async function () {
    // 获取签名者
    [owner, controller, user1, user2] = await ethers.getSigners();

    // 部署一个简单的Registry合约作为示例（实际项目中应使用真实的Registry）
    const Registry = await ethers.getContractFactory("MockRegistry");
    registry = await Registry.deploy();
    await registry.deployed();

    // 部署代币合约
    CertificateToken = await ethers.getContractFactory("CertificateToken");
    lpriToken = await CertificateToken.deploy(
      "Loan Principal Token", 
      "LPRI", 
      registry.address
    );
    await lpriToken.deployed();

    lintToken = await CertificateToken.deploy(
      "Loan Interest Token", 
      "LINT", 
      registry.address
    );
    await lintToken.deployed();

    // 设置控制器
    await lpriToken.setController(controller.address);
    await lintToken.setController(controller.address);
  });

  describe("部署和初始化", function () {
    it("应该正确设置名称、符号和所有者", async function () {
      expect(await lpriToken.name()).to.equal("Loan Principal Token");
      expect(await lpriToken.symbol()).to.equal("LPRI");
      expect(await lpriToken.owner()).to.equal(owner.address);
      
      expect(await lintToken.name()).to.equal("Loan Interest Token");
      expect(await lintToken.symbol()).to.equal("LINT");
      expect(await lintToken.owner()).to.equal(owner.address);
    });

    it("应该正确设置控制器", async function () {
      expect(await lpriToken.controller()).to.equal(controller.address);
      expect(await lintToken.controller()).to.equal(controller.address);
    });
  });

  describe("控制器功能", function () {
    it("只有所有者可以设置控制器", async function () {
      await expect(
        lpriToken.connect(user1).setController(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // 所有者设置控制器应该成功
      await lpriToken.setController(user1.address);
      expect(await lpriToken.controller()).to.equal(user1.address);
    });

    it("只有控制器可以铸造代币", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // 非控制器铸造应该失败
      await expect(
        lpriToken.connect(user1).mint(user2.address, amount)
      ).to.be.revertedWith("CTRL");
      
      // 控制器铸造应该成功
      await lpriToken.connect(controller).mint(user2.address, amount);
      expect(await lpriToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("只有控制器可以销毁代币", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // 先铸造一些代币
      await lpriToken.connect(controller).mint(user2.address, amount);
      expect(await lpriToken.balanceOf(user2.address)).to.equal(amount);
      
      // 非控制器销毁应该失败
      await expect(
        lpriToken.connect(user1).burn(user2.address, amount)
      ).to.be.revertedWith("CTRL");
      
      // 控制器销毁应该成功
      await lpriToken.connect(controller).burn(user2.address, amount);
      expect(await lpriToken.balanceOf(user2.address)).to.equal(0);
    });
  });
});

// 简单的模拟Registry合约
const { ethers } = require("hardhat");

async function main() {
  const MockRegistry = await ethers.getContractFactory("MockRegistry");
  const registry = await MockRegistry.deploy();
  await registry.deployed();
  console.log("MockRegistry deployed to:", registry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 模拟Registry合约的Solidity代码（应该放在contracts目录下）
/*
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockRegistry {
    mapping(address => bool) public isKYCCompliant;
    
    function setKYCCompliant(address user, bool compliant) external {
        isKYCCompliant[user] = compliant;
    }
}
*/
