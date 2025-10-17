// walletService.js - 钱包服务
// 整合钱包连接、交易、余额查询、历史记录等功能

import { ethers } from 'ethers'

// 钱包服务类
export class WalletService {
  constructor() {
    this.provider = null
    this.signer = null
    this.address = null
    this.connected = false
    this.chainId = null
    this.networkLabel = ''
    this.nativeBalance = 0n
    this.nativeSymbol = 'ETH'
    this.audPrice = null
    this.tokens = []
    this.walletActivity = []
    this.loading = false
    this.error = null
    this.blockListenerAttached = false
    this.blockHandler = null
  }

  // ======================== 钱包连接管理 ========================

  /**
   * 连接钱包
   * @returns {Promise<Object>} 连接结果
   */
  async connectWallet() {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 WalletService: 开始连接钱包...')
      
      if (!window.ethereum) {
        throw new Error('MetaMask未检测到，请安装MetaMask钱包')
      }

      // 创建provider和signer
      this.provider = new ethers.BrowserProvider(window.ethereum, 'any')
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      this.signer = await this.provider.getSigner()
      this.address = await this.signer.getAddress()
      this.connected = true

      // 刷新所有数据
      await this.refreshAll()
      
      // 设置事件监听器
      this.attachEventListeners()

      console.log('✅ WalletService: 钱包连接成功:', this.address)
      
      return {
        success: true,
        address: this.address,
        chainId: this.chainId,
        networkLabel: this.networkLabel
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ WalletService: 钱包连接失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 断开钱包连接
   * @returns {Promise<Object>} 断开结果
   */
  async disconnectWallet() {
    try {
      console.log('🔄 WalletService: 断开钱包连接...')
      
      // 停止事件监听器
      this.detachEventListeners()
      
      // 重置状态
      this.provider = null
      this.signer = null
      this.address = null
      this.connected = false
      this.chainId = null
      this.networkLabel = ''
      this.nativeBalance = 0n
      this.nativeSymbol = 'ETH'
      this.audPrice = null
      this.tokens = []
      this.walletActivity = []
      this.error = null

      console.log('✅ WalletService: 钱包断开连接成功')
      
      return {
        success: true,
        message: '钱包已断开连接'
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ WalletService: 断开钱包连接失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======================== 数据刷新 ========================

  /**
   * 刷新所有数据
   * @returns {Promise<void>}
   */
  async refreshAll() {
    if (!this.connected) return
    
    try {
      await this.refreshNetwork()
      await this.refreshNative()
      await this.refreshTokens()
      await this.loadWalletActivity()
    } catch (error) {
      console.error('❌ WalletService: 刷新数据失败:', error)
    }
  }

  /**
   * 刷新网络信息
   * @returns {Promise<void>}
   */
  async refreshNetwork() {
    try {
      const net = await this.provider.getNetwork()
      this.chainId = Number(net.chainId)
      this.networkLabel = net.name && net.name !== 'unknown' ? this.capitalize(net.name) : `Chain ${this.chainId}`
      
      // 设置原生代币符号
      this.nativeSymbol = this.chainId === 1 ? 'ETH' :
                         this.chainId === 137 ? 'MATIC' :
                         this.chainId === 11155111 ? 'ETH' : 'ETH'
      
      // 获取AUD价格
      await this.fetchAudPriceSafely()
      
      console.log('✅ WalletService: 网络信息刷新成功:', this.networkLabel)
    } catch (error) {
      console.error('❌ WalletService: 刷新网络信息失败:', error)
    }
  }

  /**
   * 刷新原生代币余额
   * @returns {Promise<void>}
   */
  async refreshNative() {
    try {
      this.nativeBalance = await this.provider.getBalance(this.address)
      console.log('✅ WalletService: 原生代币余额刷新成功:', ethers.formatEther(this.nativeBalance))
    } catch (error) {
      console.error('❌ WalletService: 刷新原生代币余额失败:', error)
    }
  }

  /**
   * 刷新代币余额
   * @returns {Promise<void>}
   */
  async refreshTokens() {
    try {
      // 这里可以添加自定义代币的余额查询逻辑
      console.log('✅ WalletService: 代币余额刷新完成')
    } catch (error) {
      console.error('❌ WalletService: 刷新代币余额失败:', error)
    }
  }

  // ======================== 交易管理 ========================

  /**
   * 发送交易
   * @param {Object} transaction - 交易参数
   * @returns {Promise<Object>} 交易结果
   */
  async sendTransaction(transaction) {
    try {
      this.loading = true
      this.error = null
      
      if (!this.connected || !this.signer) {
        throw new Error('钱包未连接')
      }

      console.log('🔄 WalletService: 发送交易...', transaction)

      const tx = await this.signer.sendTransaction(transaction)
      const receipt = await tx.wait()

      // 记录交易到活动历史
      await this.recordTransaction({
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        value: receipt.value,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        type: 'transaction'
      })

      console.log('✅ WalletService: 交易发送成功:', receipt.hash)
      
      return {
        success: true,
        hash: receipt.hash,
        receipt: receipt
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ WalletService: 发送交易失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 发送ETH交易
   * @param {string} to - 接收地址
   * @param {string} value - 发送金额（ETH）
   * @param {Object} options - 交易选项
   * @returns {Promise<Object>} 交易结果
   */
  async sendEthTransaction(to, value, options = {}) {
    try {
      const valueWei = ethers.parseEther(value.toString())
      
      const transaction = {
        to,
        value: valueWei,
        ...options
      }

      return await this.sendTransaction(transaction)
    } catch (error) {
      console.error('❌ WalletService: 发送ETH交易失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======================== 余额查询 ========================

  /**
   * 获取地址余额
   * @param {string} address - 地址
   * @returns {Promise<string>} 余额（ETH）
   */
  async getBalance(address = null) {
    try {
      const targetAddress = address || this.address
      if (!targetAddress) {
        throw new Error('地址未提供')
      }

      const balance = await this.provider.getBalance(targetAddress)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('❌ WalletService: 获取余额失败:', error)
      return '0'
    }
  }

  /**
   * 获取代币余额
   * @param {string} tokenAddress - 代币合约地址
   * @param {string} userAddress - 用户地址
   * @returns {Promise<string>} 代币余额
   */
  async getTokenBalance(tokenAddress, userAddress = null) {
    try {
      const targetAddress = userAddress || this.address
      if (!targetAddress) {
        throw new Error('用户地址未提供')
      }

      // ERC20代币余额查询
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ], this.provider)

      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(targetAddress),
        tokenContract.decimals()
      ])

      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error('❌ WalletService: 获取代币余额失败:', error)
      return '0'
    }
  }

  // ======================== 网络管理 ========================

  /**
   * 切换网络
   * @param {number} chainId - 目标链ID
   * @returns {Promise<Object>} 切换结果
   */
  async switchNetwork(chainId) {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask未检测到')
      }

      const chainIdHex = '0x' + chainId.toString(16)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })

      // 刷新网络信息
      await this.refreshNetwork()

      console.log('✅ WalletService: 网络切换成功:', chainId)
      
      return {
        success: true,
        chainId: chainId
      }

    } catch (error) {
      console.error('❌ WalletService: 切换网络失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取当前网络信息
   * @returns {Object} 网络信息
   */
  getCurrentNetwork() {
    return {
      chainId: this.chainId,
      networkLabel: this.networkLabel,
      nativeSymbol: this.nativeSymbol
    }
  }

  // ======================== 交易历史 ========================

  /**
   * 加载钱包活动记录
   * @returns {Promise<void>}
   */
  async loadWalletActivity() {
    try {
      this.loading = true
      console.log('🔄 WalletService: 加载钱包活动记录...')
      
      // 从localStorage获取交易记录
      const storedActivity = localStorage.getItem('walletActivity')
      if (storedActivity) {
        this.walletActivity = JSON.parse(storedActivity)
      }

      // 为每个活动记录获取Etherscan详情
      for (const activity of this.walletActivity) {
        if (activity.transactionHash && !activity.etherscan) {
          try {
            const etherscanData = await this.fetchTransactionDetails(activity.transactionHash)
            if (etherscanData.success) {
              activity.etherscan = {
                hash: etherscanData.transaction.hash,
                from: etherscanData.transaction.from,
                to: etherscanData.transaction.to,
                value: etherscanData.transaction.value,
                gasUsed: etherscanData.receipt.gasUsed,
                blockNumber: etherscanData.transaction.blockNumber,
                timestamp: parseInt(etherscanData.transaction.timeStamp) * 1000
              }
            }
          } catch (error) {
            console.warn('获取交易详情失败:', error)
          }
        }
      }

      console.log('✅ WalletService: 钱包活动记录加载完成:', this.walletActivity.length, '条记录')
    } catch (error) {
      console.error('❌ WalletService: 加载钱包活动记录失败:', error)
    } finally {
      this.loading = false
    }
  }

  /**
   * 记录交易到活动历史
   * @param {Object} transaction - 交易信息
   */
  async recordTransaction(transaction) {
    try {
      const activity = {
        id: Date.now().toString(),
        type: transaction.type || 'transaction',
        transactionHash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        gasUsed: transaction.gasUsed,
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timestamp || Date.now(),
        status: 'confirmed'
      }

      this.walletActivity.unshift(activity)
      
      // 限制记录数量（保留最近100条）
      if (this.walletActivity.length > 100) {
        this.walletActivity = this.walletActivity.slice(0, 100)
      }

      // 保存到localStorage
      localStorage.setItem('walletActivity', JSON.stringify(this.walletActivity))

      // 触发活动更新事件
      window.dispatchEvent(new CustomEvent('walletActivityUpdated', {
        detail: { activity, allActivity: this.walletActivity }
      }))

      console.log('✅ WalletService: 交易记录已保存:', activity.hash)
    } catch (error) {
      console.error('❌ WalletService: 记录交易失败:', error)
    }
  }

  /**
   * 从Etherscan获取交易详情
   * @param {string} txHash - 交易哈希
   * @returns {Promise<Object>} 交易详情
   */
  async fetchTransactionDetails(txHash) {
    try {
      console.log('🔍 WalletService: 从Etherscan获取交易详情:', txHash)
      
      // Etherscan Sepolia API
      const apiUrl = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`
      const receiptUrl = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`

      const [response, receiptResponse] = await Promise.all([
        fetch(apiUrl),
        fetch(receiptUrl)
      ])

      const [data, receiptData] = await Promise.all([
        response.json(),
        receiptResponse.json()
      ])

      if (data.result && receiptData.result) {
        console.log('✅ WalletService: 成功获取交易详情:', data.result)
        
        return {
          success: true,
          transaction: data.result,
          receipt: receiptData.result
        }
      } else {
        throw new Error('无法获取交易详情')
      }

    } catch (error) {
      console.error('❌ WalletService: 获取交易详情失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======================== 事件监听 ========================

  /**
   * 设置事件监听器
   */
  attachEventListeners() {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this))
    window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))

    // 监听新区块
    if (this.provider && !this.blockListenerAttached) {
      this.blockHandler = async () => {
        try {
          await this.refreshNative()
        } catch (error) {
          console.error('刷新原生代币余额失败:', error)
        }
      }
      this.provider.on('block', this.blockHandler)
      this.blockListenerAttached = true
    }
  }

  /**
   * 移除事件监听器
   */
  detachEventListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged')
      window.ethereum.removeAllListeners('chainChanged')
    }

    if (this.provider && this.blockListenerAttached) {
      this.provider.off('block', this.blockHandler)
      this.blockListenerAttached = false
    }
  }

  /**
   * 处理账户变化
   * @param {Array} accounts - 账户列表
   */
  async handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      await this.disconnectWallet()
    } else {
      this.address = accounts[0]
      await this.refreshAll()
    }
  }

  /**
   * 处理链变化
   */
  async handleChainChanged() {
    await this.refreshAll()
  }

  // ======================== 工具方法 ========================

  /**
   * 格式化单位
   * @param {BigInt} raw - 原始值
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的值
   */
  formatUnitsSafe(raw, decimals) {
    try {
      return Number(ethers.formatUnits(raw, decimals)).toLocaleString(undefined, { 
        maximumFractionDigits: 6 
      })
    } catch {
      return '0'
    }
  }

  /**
   * 获取AUD价格
   * @returns {Promise<void>}
   */
  async fetchAudPriceSafely() {
    try {
      const id = this.nativeSymbol === 'MATIC' ? 'matic-network' : 'ethereum'
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=aud`)
      const json = await res.json()
      this.audPrice = json?.[id]?.aud || null
    } catch {
      this.audPrice = null
    }
  }

  /**
   * 首字母大写
   * @param {string} str - 字符串
   * @returns {string} 首字母大写的字符串
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // ======================== 状态获取 ========================

  /**
   * 获取当前状态
   * @returns {Object} 当前状态
   */
  getCurrentState() {
    return {
      connected: this.connected,
      address: this.address,
      chainId: this.chainId,
      networkLabel: this.networkLabel,
      nativeBalance: this.nativeBalance,
      nativeSymbol: this.nativeSymbol,
      audPrice: this.audPrice,
      tokens: this.tokens,
      walletActivity: this.walletActivity,
      loading: this.loading,
      error: this.error
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
    this.detachEventListeners()
    this.provider = null
    this.signer = null
    this.address = null
    this.connected = false
    this.chainId = null
    this.networkLabel = ''
    this.nativeBalance = 0n
    this.nativeSymbol = 'ETH'
    this.audPrice = null
    this.tokens = []
    this.walletActivity = []
    this.loading = false
    this.error = null
  }
}

// 创建全局实例
export const walletService = new WalletService()

// 导出便捷方法
export const {
  connectWallet,
  disconnectWallet,
  refreshAll,
  sendTransaction,
  sendEthTransaction,
  getBalance,
  getTokenBalance,
  switchNetwork,
  getCurrentNetwork,
  loadWalletActivity,
  recordTransaction,
  getCurrentState,
  clearError,
  reset
} = walletService

export default walletService
