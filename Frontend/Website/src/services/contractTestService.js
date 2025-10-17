// 合约测试服务
// 这个服务模拟后端API调用，实际项目中应该连接到真实的后端服务

class ContractTestService {
  constructor() {
    this.baseUrl = '/api/contract-test' // 假设的后端API地址
    
    // 真实ERC20代币地址配置
    this.realTokenAddresses = {
      // 测试网地址
      sepolia: {
        lpt: '0xA41b4F0417d588a08F914Ca17b07c99783D5c3FC', // LPrincipalFixed
        lit: '0x9d3175E3F8c055389e070e058f717D450bB89206', // LInterest
        kycRegistry: '0x0A96077ffe3f06274d869ba1eed6cB7324270C2f', // KYC Registry
        loanIssuer: '0x13159e6417D98528C220b12Ec4950D5A343E5eAA', // Loan Issuer
        complianceGuard: '0x448d5FB04025FDb01b97e9bB5e5FD12c687cd480', // ComplianceGuard
        holderRegistry: '0x1E77C41899D1d34A11E3BF55809962fE6a929074' // HolderRegistry
      },
      // 主网地址 (暂时使用相同地址)
      ethereum: {
        lpt: '0xA41b4F0417d588a08F914Ca17b07c99783D5c3FC', // LPrincipalFixed
        lit: '0x9d3175E3F8c055389e070e058f717D450bB89206', // LInterest
        kycRegistry: '0x0A96077ffe3f06274d869ba1eed6cB7324270C2f', // KYC Registry
        loanIssuer: '0x13159e6417D98528C220b12Ec4950D5A343E5eAA', // Loan Issuer
        complianceGuard: '0x448d5FB04025FDb01b97e9bB5e5FD12c687cd480', // ComplianceGuard
        holderRegistry: '0x1E77C41899D1d34A11E3BF55809962fE6a929074' // HolderRegistry
      },
    }
  }

  // 合约部署功能已移除

  // 认购部署功能已移除

  // 模拟合约交互测试
  async testContractInteraction(contractAddresses, walletAddress) {
    try {
      await this.delay(1500)
      
      // 模拟交互测试结果
      const mockResults = {
        initialBalances: {
          lpt: '0.0',
          lit: '0.0',
          eth: '1.5'
        },
        loanCreated: {
          loanId: 1,
          principalAmount: '1000.0',
          annualRate: '5.0%',
          borrower: 'Alice',
          lender: 'Bank'
        },
        interestMinted: {
          amount: '50.0',
          recipient: walletAddress
        },
        redemption: {
          lptAmount: '200.0',
          litAmount: '10.0'
        },
        finalBalances: {
          lpt: '800.0',
          lit: '40.0',
          eth: '1.5'
        },
        loanClosed: true
      }
      
      return {
        success: true,
        results: mockResults,
        transactions: [
          { type: 'createLoan', hash: this.generateMockTxHash() },
          { type: 'mintInterest', hash: this.generateMockTxHash() },
          { type: 'redeem', hash: this.generateMockTxHash() },
          { type: 'closeLoan', hash: this.generateMockTxHash() }
        ]
      }
    } catch (error) {
      throw new Error(`交互测试失败: ${error.message}`)
    }
  }

  // 模拟查询余额
  async getBalances(contractAddresses, walletAddress) {
    try {
      await this.delay(500)
      
      return {
        success: true,
        balances: {
          lpt: (Math.random() * 1000).toFixed(2),
          lit: (Math.random() * 100).toFixed(2),
          eth: (Math.random() * 5).toFixed(4)
        },
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`余额查询失败: ${error.message}`)
    }
  }

  // 模拟验证合约地址
  async validateContractAddresses(addresses) {
    try {
      await this.delay(300)
      
      const validation = {
        lpt: this.isValidAddress(addresses.lpt),
        lit: this.isValidAddress(addresses.lit),
        issuer: this.isValidAddress(addresses.issuer)
      }
      
      const allValid = Object.values(validation).every(valid => valid)
      
      return {
        success: allValid,
        validation,
        message: allValid ? '所有地址格式正确' : '部分地址格式不正确'
      }
    } catch (error) {
      throw new Error(`地址验证失败: ${error.message}`)
    }
  }

  // 模拟获取网络信息
  async getNetworkInfo() {
    try {
      await this.delay(200)
      
      return {
        success: true,
        network: {
          name: 'Sepolia Testnet',
          chainId: 11155111,
          rpcUrl: 'https://sepolia.infura.io/v3/your-api-key',
          blockExplorer: 'https://sepolia.etherscan.io'
        }
      }
    } catch (error) {
      throw new Error(`网络信息获取失败: ${error.message}`)
    }
  }

  // 模拟获取合约ABI
  async getContractABI(contractType) {
    try {
      await this.delay(300)
      
      const mockABIs = {
        kycRegistry: this.getMockKYCRegistryABI(),
        certificateToken: this.getMockCertificateTokenABI(),
        loanIssuer: this.getMockLoanIssuerABI()
      }
      
      return {
        success: true,
        abi: mockABIs[contractType] || []
      }
    } catch (error) {
      throw new Error(`ABI获取失败: ${error.message}`)
    }
  }

  // 获取合约条款
  async getContractTerms() {
    try {
      await this.delay(200)
      
      // 模拟从合约或配置文件获取条款
      return {
        success: true,
        terms: {
          annualRate: 5.5,  // 年化利率 5.5%
          loanTerm: 365,    // 贷款期限 365 天
          minSubscription: 100,    // 最小认购金额
          maxSubscription: 10000,  // 最大认购金额
        }
      }
    } catch (error) {
      throw new Error(`合约条款获取失败: ${error.message}`)
    }
  }

  // 获取可用项目列表
  async getAvailableProjects() {
    try {
      await this.delay(300)
      
      // 模拟从API获取项目列表
      return {
        success: true,
        projects: [
          { 
            code: 'RWA001', 
            name: '悉尼住宅项目',
            description: '位于悉尼市中心的优质住宅项目',
            status: 'active'
          },
          { 
            code: 'RWA002', 
            name: '墨尔本商业地产',
            description: '墨尔本CBD核心商业地产项目',
            status: 'active'
          },
          { 
            code: 'RWA003', 
            name: '布里斯班物流仓储',
            description: '布里斯班港口物流仓储设施',
            status: 'active'
          },
          { 
            code: 'RWA004', 
            name: '珀斯写字楼项目',
            description: '珀斯金融区甲级写字楼',
            status: 'active'
          },
          { 
            code: 'RWA005', 
            name: '阿德莱德工业地产',
            description: '阿德莱德工业园制造设施',
            status: 'active'
          }
        ]
      }
    } catch (error) {
      throw new Error(`项目列表获取失败: ${error.message}`)
    }
  }

  // 根据链ID获取网络信息
  getNetworkInfo(chainId) {
    const networks = {
      1: { name: 'Ethereum Mainnet', shortName: 'ETH', networkKey: 'ethereum' },
      11155111: { name: 'Sepolia Testnet', shortName: 'Sepolia', networkKey: 'sepolia' },
      // 31337: { name: 'Localhost', shortName: 'Local', networkKey: 'sepolia' },
      // 137: { name: 'Polygon Mainnet', shortName: 'MATIC', networkKey: 'polygon' },
      // 80001: { name: 'Mumbai Testnet', shortName: 'Mumbai', networkKey: 'sepolia' }
    }
    
    return networks[chainId] || { 
      name: `Unknown Network (${chainId})`, 
      shortName: `Chain ${chainId}`,
      networkKey: 'sepolia' // 默认使用测试网
    }
  }

  // 根据链ID获取真实合约地址
  getRealContractAddresses(chainId) {
    const networkInfo = this.getNetworkInfo(chainId)
    const networkKey = networkInfo.networkKey || 'sepolia'
    
    return this.realTokenAddresses[networkKey] || this.realTokenAddresses.sepolia
  }

  // 工具方法
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  generateMockAddress() {
    const chars = '0123456789abcdef'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  generateMockTxHash() {
    const chars = '0123456789abcdef'
    let hash = '0x'
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  isValidAddress(address) {
    return address && 
           address.startsWith('0x') && 
           address.length === 42 && 
           /^0x[0-9a-fA-F]{40}$/.test(address)
  }

  getMockKYCRegistryABI() {
    return [
      {
        "inputs": [{"name": "user", "type": "address"}, {"name": "level", "type": "uint8"}],
        "name": "setKycLevel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getKycLevel",
        "outputs": [{"name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }

  getMockCertificateTokenABI() {
    return [
      {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }

  getMockLoanIssuerABI() {
    return [
      {
        "inputs": [
          {"name": "holder", "type": "address"},
          {"name": "principalAmount", "type": "uint256"},
          {"name": "annualRateBps", "type": "uint256"},
          {"name": "startDate", "type": "uint256"},
          {"name": "dueDate", "type": "uint256"},
          {"name": "borrower", "type": "string"},
          {"name": "lender", "type": "string"},
          {"name": "collateral", "type": "string"},
          {"name": "note", "type": "string"}
        ],
        "name": "createLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"name": "loanId", "type": "uint256"},
          {"name": "to", "type": "address"},
          {"name": "amount", "type": "uint256"}
        ],
        "name": "mintInterest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"name": "loanId", "type": "uint256"},
          {"name": "lptAmount", "type": "uint256"},
          {"name": "litAmount", "type": "uint256"}
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"name": "loanId", "type": "uint256"}],
        "name": "closeLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
}

// 创建单例实例
const contractTestService = new ContractTestService()

export default contractTestService
