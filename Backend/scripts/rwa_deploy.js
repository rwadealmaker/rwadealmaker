require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("开始部署 CertificateToken ...");

  const { ethers } = hre;

  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address); // v6：从 provider 查余额
  console.log(`部署者: ${deployer.address}`);
  console.log(`余额: ${ethers.formatEther(bal)} ETH`);

  //const KYCRegistryAddr = process.env.KYCRegistry_Contract_Address;
  //if (!KYCRegistryAddr) throw new Error("缺少环境变量 KYCRegistry_Contract_Address");

  //部署KYCRegistry
  // ["KYC-Registry"] 是给合约的 EIP-712 域名，用于后续 KYC 离线签名的安全绑定与校验；名字本身可自定义，但必须与签名端一致且保持稳定。
  const kyc = await ethers.deployContract("KYCRegistry", ["KYC-Registry"]);
  console.log("=======参数传入成功=======");
  await kyc.waitForDeployment();
  const kycAddr = await kyc.getAddress();
  console.log("✔KYCRegistry:", kycAddr);

  //部署本金币
  const lpt = await ethers.deployContract("CertificateToken", ["Loan-Principal-Token", "LPT", kycAddr]);
  console.log("=======参数传入成功=======");
  await lpt.waitForDeployment();
  const lptAddr = await lpt.getAddress();
  console.log("✔本金币(LPT) 地址:" + lptAddr);

  //部署利息币
  const lit = await ethers.deployContract("CertificateToken", ["Loan-Principal-Token", "LPT", kycAddr]);
  console.log("=======参数传入成功=======");
  await lit.waitForDeployment();
  const litAddr = await lit.getAddress();
  console.log("✔利息币(LIT) 地址:" + litAddr);

  //部署LoanIssuer并完成接线
  const issuer = await ethers.deployContract("LoanIssuer", [kycAddr, lptAddr, litAddr]);
  console.log("=======参数传入成功=======");
  await issuer.waitForDeployment();
  const issuerAddr = await issuer.getAddress();
  console.log("✔LoanIssuer:", issuerAddr);

  //代币 owner（你）把所有权转给 LoanIssuer
  await (await lpt.transferOwnership(issuerAddr)).wait();
  await (await lit.transferOwnership(issuerAddr)).wait();
  console.log("✔所有权已转移");

  //接线（把控制器设为 LoanIssuer）
  await (await issuer.wireControllers()).wait();
  console.log("✔ 控制器接线完成");

  console.log("✅ 全部部署完成");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
