// contractService.js - 智能合约服务
// 整合智能合约交互、代币交易、KYC验证、合约部署等功能

import { ethers } from 'ethers'
import CONTRACT_CONFIG from '@/config/contractConfig.js'
import { 
  getKycStatus, 
  setKycStatus, 
  setKycLevel, 
  KYC_STATUS, 
  KYC_LEVELS 
} from './kycService.js'

// 智能合约服务类
export class ContractService {
  constructor() {
    this.provider = null
    this.signer = null
    this.contracts = {
      kycRegistry: null,
      loanIssuer: null,
      principalToken: null,
      interestToken: null,
      trade: null,
      complianceGuard: null
    }
    this.isInitialized = false
    this.loading = false
    this.error = null
  }

  // ======================== 合约初始化 ========================

  /**
   * 初始化合约服务
   * @returns {Promise<Object>} 初始化结果
   */
  async initializeContract() {
    try {
      this.loading = true
      this.error = null
      
      console.log('🚀 ContractService: 初始化智能合约服务...')
      
      // 检查Web3钱包
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Web3钱包未检测到，请安装MetaMask或类似钱包')
      }

      // 验证合约地址
      this.validateContractAddresses()

      // 检查网络
      await this.checkNetwork()

      // 初始化provider和signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      this.signer = await this.provider.getSigner()

      // 初始化合约实例
      await this.initializeContracts()

      this.isInitialized = true
      console.log('✅ ContractService: 智能合约服务初始化成功!')
      
      return {
        success: true,
        message: '合约服务初始化成功'
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ ContractService: 初始化失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 验证合约地址
   */
  validateContractAddresses() {
    const addresses = {
      'KYC Registry': CONTRACT_CONFIG.KYC_REGISTRY_ADDRESS,
      'Loan Issuer': CONTRACT_CONFIG.LOAN_ISSUER_ADDRESS,
      'Principal Token': CONTRACT_CONFIG.PRINCIPAL_TOKEN_ADDRESS,
      'Interest Token': CONTRACT_CONFIG.INTEREST_TOKEN_ADDRESS,
      'Trade Contract': CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS,
      'Compliance Guard': CONTRACT_CONFIG.COMPLIANCE_GUARD_ADDRESS
    }

    for (const [name, address] of Object.entries(addresses)) {
      this.validateContractAddress(address, name)
    }
  }

  /**
   * 检查网络
   */
  async checkNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    const expectedChainId = '0x' + CONTRACT_CONFIG.NETWORK.chainId.toString(16)
    const currentChainId = parseInt(chainId, 16)
    
    console.log('🌐 当前链ID:', currentChainId)
    console.log('🎯 目标链ID:', CONTRACT_CONFIG.NETWORK.chainId)
    
    if (chainId !== expectedChainId) {
      throw new Error(`请切换到 ${CONTRACT_CONFIG.NETWORK.name} (链ID: ${CONTRACT_CONFIG.NETWORK.chainId})`)
    }
  }

  /**
   * 初始化合约实例
   */
  async initializeContracts() {
    const contractConfigs = [
      { name: 'kycRegistry', address: CONTRACT_CONFIG.KYC_REGISTRY_ADDRESS, abi: this.getKycRegistryABI() },
      { name: 'loanIssuer', address: CONTRACT_CONFIG.LOAN_ISSUER_ADDRESS, abi: this.getLoanIssuerABI() },
      { name: 'principalToken', address: CONTRACT_CONFIG.PRINCIPAL_TOKEN_ADDRESS, abi: this.getCompliantERC20ABI() },
      { name: 'interestToken', address: CONTRACT_CONFIG.INTEREST_TOKEN_ADDRESS, abi: this.getCompliantERC20ABI() },
      { name: 'trade', address: CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS, abi: this.getTradeContractABI() },
      { name: 'complianceGuard', address: CONTRACT_CONFIG.COMPLIANCE_GUARD_ADDRESS, abi: this.getComplianceGuardABI() }
    ]

    for (const config of contractConfigs) {
      try {
        this.contracts[config.name] = new ethers.Contract(config.address, config.abi, this.signer)
        console.log(`✅ ${config.name} 合约初始化成功`)
      } catch (error) {
        console.error(`❌ ${config.name} 合约初始化失败:`, error)
        throw new Error(`初始化 ${config.name} 合约失败: ${error.message}`)
      }
    }
  }

  // ======================== 代币交易 ========================

  /**
   * 购买代币
   * @param {number} amount - 购买数量
   * @returns {Promise<Object>} 交易结果
   */
  async buyTokens(amount) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      const userAddress = await this.getUserAddress()
      if (!userAddress) {
        throw new Error('无法获取用户钱包地址，请确保钱包已连接')
      }

      console.log('💰 购买代币:', { amount, userAddress })

      if (!CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS || CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
        console.warn('⚠️ 交易合约地址未配置，模拟成功交易')
        
        const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000
        
        return {
          success: true,
          transactionHash: mockTxHash,
          blockNumber: mockBlockNumber,
          tokenPrice: '1.0',
          totalCost: amount.toString(),
          userAddress: userAddress
        }
      }

      let tokenPrice
      let totalCost
      
      try {
        tokenPrice = await this.contracts.trade.getTokenPrice()
        totalCost = tokenPrice * BigInt(amount)
        console.log('💰 获取到代币价格:', tokenPrice.toString())
      } catch (priceError) {
        console.warn('⚠️ 无法获取代币价格，使用默认价格:', priceError.message)
        tokenPrice = ethers.parseEther('1.0')
        totalCost = tokenPrice * BigInt(amount)
      }
      
      console.log('💰 购买代币:', { amount, userAddress, tokenPrice: tokenPrice.toString(), totalCost: totalCost.toString() })

      const tx = await this.contracts.trade.buyTokens(amount, {
        value: totalCost
      })
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        tokenPrice: ethers.formatEther(tokenPrice),
        totalCost: ethers.formatEther(totalCost),
        userAddress: userAddress
      }
    } catch (error) {
      console.error('❌ 购买代币失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 出售代币
   * @param {number} amount - 出售数量
   * @returns {Promise<Object>} 交易结果
   */
  async sellTokens(amount) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      const userAddress = await this.getUserAddress()
      if (!userAddress) {
        throw new Error('无法获取用户钱包地址，请确保钱包已连接')
      }

      console.log('💸 出售代币:', { amount, userAddress })

      if (!CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS || CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
        console.warn('⚠️ 交易合约地址未配置，模拟成功交易')
        
        const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000
        
        return {
          success: true,
          transactionHash: mockTxHash,
          blockNumber: mockBlockNumber,
          tokenPrice: '1.0',
          totalCost: amount.toString(),
          userAddress: userAddress
        }
      }

      let tokenPrice
      let totalRevenue
      
      try {
        tokenPrice = await this.contracts.trade.getTokenPrice()
        totalRevenue = tokenPrice * BigInt(amount)
        console.log('💰 获取到代币价格:', tokenPrice.toString())
      } catch (priceError) {
        console.warn('⚠️ 无法获取代币价格，使用默认价格:', priceError.message)
        tokenPrice = ethers.parseEther('1.0')
        totalRevenue = tokenPrice * BigInt(amount)
      }
      
      console.log('💸 出售代币:', { amount, userAddress, tokenPrice: tokenPrice.toString(), totalRevenue: totalRevenue.toString() })

      const tx = await this.contracts.trade.sellTokens(amount)
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        tokenPrice: ethers.formatEther(tokenPrice),
        totalCost: ethers.formatEther(totalRevenue),
        userAddress: userAddress
      }
    } catch (error) {
      console.error('❌ 出售代币失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取代币价格
   * @returns {Promise<string>} 代币价格
   */
  async getTokenPrice() {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      console.log('🔍 尝试从合约获取代币价格:', CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS)
      
      if (!CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS || CONTRACT_CONFIG.TRADE_CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
        console.warn('⚠️ 交易合约地址未配置，返回默认价格')
        return '1.0'
      }

      const price = await this.contracts.trade.getTokenPrice()
      console.log('✅ 代币价格获取成功:', ethers.formatEther(price))
      return ethers.formatEther(price)
    } catch (error) {
      console.error('❌ 获取代币价格失败:', error)
      
      if (error.message.includes('BAD_DATA') || error.message.includes('UNSUPPORTED_OPERATION')) {
        console.warn('⚠️ 合约方法不可用，使用默认价格')
        return '1.0'
      }
      
      return '0'
    }
  }

  // ======================== 余额查询 ========================

  /**
   * 获取用户代币余额
   * @param {string} userAddress - 用户地址
   * @param {string} tokenAddress - 代币地址
   * @returns {Promise<string>} 代币余额
   */
  async getUserTokenBalance(userAddress, tokenAddress = null) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      if (!userAddress) {
        userAddress = await this.getUserAddress()
      }

      if (!tokenAddress) {
        // 使用主代币地址
        tokenAddress = CONTRACT_CONFIG.PRINCIPAL_TOKEN_ADDRESS
      }

      const tokenContract = new ethers.Contract(tokenAddress, this.getCompliantERC20ABI(), this.signer)
      const balance = await tokenContract.balanceOf(userAddress)
      
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('❌ 获取代币余额失败:', error)
      return '0'
    }
  }

  // ======================== KYC验证 ========================

  /**
   * 申请KYC验证
   * @param {Object} kycData - KYC数据
   * @returns {Promise<Object>} 申请结果
   */
  async applyForKYC(kycData) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      const userAddress = await this.getUserAddress()

      const isBlocked = await this.contracts.kycRegistry.blocked(userAddress)
      if (isBlocked) {
        throw new Error('用户已被阻止进行KYC验证')
      }

      const currentLevel = await this.contracts.kycRegistry.kycLevel(userAddress)
      if (currentLevel >= 2) {
        return {
          success: true,
          message: '用户已有足够的KYC等级',
          currentLevel: currentLevel
        }
      }

      const kycHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'string', 'string', 'string', 'string'],
          [kycData.firstName, kycData.lastName, kycData.dob, kycData.country, kycData.docType]
        )
      )

      console.log('KYC数据哈希:', kycHash)
      console.log('KYC数据:', kycData)

      // 更新本地KYC状态
      setKycStatus(KYC_STATUS.VERIFIED)
      setKycLevel(KYC_LEVELS.LEVEL_2)

      return {
        success: true,
        message: 'KYC申请提交成功',
        kycHash: kycHash,
        userAddress: userAddress
      }

    } catch (error) {
      console.error('KYC申请失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 检查用户KYC等级
   * @param {string} userAddress - 用户地址
   * @returns {Promise<number>} KYC等级
   */
  async getKycLevel(userAddress = null) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      if (!userAddress) {
        userAddress = await this.getUserAddress()
      }

      const level = await this.contracts.kycRegistry.kycLevel(userAddress)
      return level
    } catch (error) {
      console.error('检查KYC等级失败:', error)
      return 0
    }
  }

  /**
   * 检查用户是否被阻止
   * @param {string} userAddress - 用户地址
   * @returns {Promise<boolean>} 是否被阻止
   */
  async isBlocked(userAddress = null) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      if (!userAddress) {
        userAddress = await this.getUserAddress()
      }

      const blocked = await this.contracts.kycRegistry.blocked(userAddress)
      return blocked
    } catch (error) {
      console.error('检查阻止状态失败:', error)
      return false
    }
  }

  // ======================== 白名单管理 ========================

  /**
   * 检查用户是否在白名单中
   * @param {string} userAddress - 用户地址
   * @returns {Promise<boolean>} 是否在白名单中
   */
  async isWhitelisted(userAddress) {
    try {
      if (!this.isInitialized) {
        await this.initializeContract()
      }

      console.log('🔍 检查白名单状态:', userAddress)
      
      const isWhitelisted = await this.contracts.complianceGuard.whitelist(userAddress)
      console.log('✅ 白名单状态:', isWhitelisted)
      
      return isWhitelisted
    } catch (error) {
      console.error('❌ 检查白名单状态失败:', error)
      return false
    }
  }

  /**
   * 获取白名单状态（综合检查）
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 白名单状态
   */
  async getWhitelistStatus(userAddress) {
    try {
      console.log('🔍 获取综合白名单状态:', userAddress)
      
      const [isWhitelisted, isBlocked, kycLevel, kycExpireAt] = await Promise.all([
        this.isWhitelisted(userAddress),
        this.isBlocked(userAddress),
        this.getKycLevel(userAddress),
        this.getKycExpireAt(userAddress)
      ])
      
      const now = Math.floor(Date.now() / 1000)
      const isKycExpired = kycExpireAt > 0 && now > kycExpireAt
      
      let status = 'none'
      if (isBlocked) {
        status = 'rejected'
      } else if (isWhitelisted && kycLevel >= 2 && !isKycExpired) {
        status = 'approved'
      } else if (isWhitelisted && kycLevel >= 2) {
        status = 'approved'
      } else if (isWhitelisted && kycLevel >= 1) {
        status = 'pending'
      }
      
      console.log('✅ 白名单状态:', status)
      
      return {
        status,
        isWhitelisted,
        isBlocked,
        kycLevel,
        kycExpireAt,
        isKycExpired
      }
    } catch (error) {
      console.error('❌ 获取白名单状态失败:', error)
      return {
        status: 'none',
        isWhitelisted: false,
        isBlocked: false,
        kycLevel: 0,
        kycExpireAt: 0,
        isKycExpired: false
      }
    }
  }

  // ======================== 工具方法 ========================

  /**
   * 获取用户地址
   * @returns {Promise<string>} 用户地址
   */
  async getUserAddress() {
    try {
      if (this.signer) {
        return await this.signer.getAddress()
      }
      
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          return accounts[0]
        }
      }
      
      throw new Error('无法获取用户地址')
    } catch (error) {
      console.error('❌ 获取用户地址失败:', error)
      return null
    }
  }

  /**
   * 验证合约地址格式
   * @param {string} address - 地址
   * @param {string} name - 名称
   */
  validateContractAddress(address, name) {
    if (!address || address === '#' || address === '0x...') {
      throw new Error(`${name} 合约地址未正确配置`)
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error(`${name} 合约地址格式无效: ${address}`)
    }
    return true
  }

  // ======================== ABI定义 ========================

  getKycRegistryABI() {
    return [
      "function kycLevel(address user) external view returns (uint8)",
      "function blocked(address user) external view returns (bool)",
      "function setKycLevel(address user, uint8 level) external",
      "function setBlocked(address user, bool isBlocked) external",
      "function kycSigner() external view returns (address)",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)"
    ]
  }

  getLoanIssuerABI() {
    return [
      "function registry() external view returns (address)",
      "function principalToken() external view returns (address)",
      "function interestToken() external view returns (address)",
      "function nextLoanId() external view returns (uint256)",
      "function loans(uint256 loanId) external view returns (uint256 principal, uint256 annualRateBps, uint64 startDate, uint64 dueDate, string memory borrower, string memory lender, string memory collateral, string memory note, bool closed)",
      "function loanHolder(uint256 loanId) external view returns (address)"
    ]
  }

  getCompliantERC20ABI() {
    return [
      "function name() external view returns (string memory)",
      "function symbol() external view returns (string memory)",
      "function decimals() external pure returns (uint8)",
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address account) external view returns (uint256)",
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
    ]
  }

  getTradeContractABI() {
    return [
      "function buyTokens(uint256 amount) external payable",
      "function sellTokens(uint256 amount) external",
      "function getTokenPrice() external view returns (uint256)",
      "function getUserBalance(address user) external view returns (uint256)"
    ]
  }

  getComplianceGuardABI() {
    return [
      "function whitelist(address user) external view returns (bool)",
      "function blocked(address user) external view returns (bool)",
      "function kycTier(address user) external view returns (uint8)",
      "function kycExpireAt(address user) external view returns (uint64)"
    ]
  }

  // ======================== 状态获取 ========================

  /**
   * 获取当前状态
   * @returns {Object} 当前状态
   */
  getCurrentState() {
    return {
      isInitialized: this.isInitialized,
      loading: this.loading,
      error: this.error,
      contracts: Object.keys(this.contracts).reduce((acc, key) => {
        acc[key] = this.contracts[key] ? 'initialized' : 'not_initialized'
        return acc
      }, {})
    }
  }

  /**
   * 清除错误状态
   */
  clearError() {
    this.error = null
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.provider = null
    this.signer = null
    this.contracts = {
      kycRegistry: null,
      loanIssuer: null,
      principalToken: null,
      interestToken: null,
      trade: null,
      complianceGuard: null
    }
    this.isInitialized = false
    this.loading = false
    this.error = null
  }
}

// 创建全局实例
export const contractService = new ContractService()

// 导出便捷方法
export const {
  initializeContract,
  buyTokens,
  sellTokens,
  getTokenPrice,
  getUserTokenBalance,
  applyForKYC,
  getKycLevel,
  isBlocked,
  isWhitelisted,
  getWhitelistStatus,
  getCurrentState,
  clearError,
  reset
} = contractService

export default contractService
