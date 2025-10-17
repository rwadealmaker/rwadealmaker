require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  //getSigners根据你在 hardhat.config.js → networks.sepolia.accounts 里配置的私钥数组来返回 signer
  const [deployer, user1] = await ethers.getSigners();

  console.log("当前操作账户:", deployer.address);

  // 从 .env 加载地址
  const lptAddr = process.env.Loan_Principal_Token_Address;
  const litAddr = process.env.Loan_Interest_Token_Address;
  const issuerAddr = process.env.LoanIssuer_Contract_Address;

  if (!lptAddr || !litAddr || !issuerAddr) {
    throw new Error("缺少必要的合约地址，请检查 .env 文件");
  }

  // KYC实例化
  //console.log("KYCRegistry 地址:", process.env.KYCRegistry_Contract_Address);
  //const Registry = await ethers.getContractAt("KYCRegistry", process.env.KYCRegistry_Contract_Address);
  // 设置 KYC 等级
  //await (await Registry.connect(deployer).setKycLevel(user1.address, 2)).wait();
  //console.log(`✔ 已为 ${user1.address} 设置 KYC 等级 2`);


  // 连接合约
  const LPT = await ethers.getContractAt("CertificateToken", lptAddr);
  const LIT = await ethers.getContractAt("CertificateToken", litAddr);
  const Issuer = await ethers.getContractAt("LoanIssuer", issuerAddr);

  console.log("✔ 已加载合约地址:");
  console.log("  LPT:", lptAddr);
  console.log("  LIT:", litAddr);
  console.log("  LoanIssuer:", issuerAddr);

  // 示例：查询余额
  console.log("\n=== 初始余额 ===");
  console.log("user1 LPT:", ethers.formatEther(await LPT.balanceOf(user1.address)));
  console.log("user1 LIT:", ethers.formatEther(await LIT.balanceOf(user1.address)));

  // 示例：通过 LoanIssuer 发起借贷（铸造）

  console.log("\n=== 创建贷款（铸造 LPRI） ===");

  const loanInput = {
    holder: user1.address,               // 借款人
    principalAmount: ethers.parseEther("1000"), // 本金
    annualRateBps: 500,                  // 年化利率（500bps = 5%）
    startDate: Math.floor(Date.now() / 1000),     // 开始时间（秒）
    dueDate: Math.floor(Date.now() / 1000) + 31536000, // 一年后
    borrower: "Alice",
    lender: "Bank",
    collateral: "House",
    note: "First Loan"
  };

  let tx = await Issuer.connect(deployer).createLoan(loanInput);
  let receipt = await tx.wait();
  console.log("✔ Loan created, loanId =", await Issuer.nextLoanId());

  // 给这笔贷款铸造利息币
  console.log("\n=== 铸造利息币（LINT） ===");
  tx = await Issuer.connect(deployer).mintInterest(1, user1.address, ethers.parseEther("50"));
  await tx.wait();
  console.log("✔ 已铸造 50 LINT 给", user1.address);

  // 用户赎回（燃烧代币）
  console.log("\n=== 用户赎回 ===");
  tx = await Issuer.connect(user1).redeem(1, ethers.parseEther("200"), ethers.parseEther("10"));
  await tx.wait();
  console.log("✔ 用户赎回 200 LPT + 10 LIT");

  // 管理员结清贷款
  console.log("\n=== 结清贷款 ===");
  tx = await Issuer.connect(deployer).closeLoan(1);
  await tx.wait();
  console.log("✔ Loan closed");

  // 再查余额
  console.log("\n=== 更新后余额 ===");
  console.log("user1 LPT:", ethers.formatEther(await LPT.balanceOf(user1.address)));
  console.log("user1 LIT:", ethers.formatEther(await LIT.balanceOf(user1.address)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
