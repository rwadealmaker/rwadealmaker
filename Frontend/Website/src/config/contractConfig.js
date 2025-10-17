// 智能合约配置文件
// 优先从环境变量读取配置，如果没有则使用默认值

// 从环境变量获取配置，如果没有则使用默认值
const getEnvConfig = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue
}

// 开发环境配置 (Sepolia测试网)
export const DEV_CONFIG = {
  KYC_REGISTRY_ADDRESS: getEnvConfig('VITE_KYC_REGISTRY_ADDRESS', '0x0A96077ffe3f06274d869ba1eed6cB7324270C2f'),
  LOAN_ISSUER_ADDRESS: getEnvConfig('VITE_LOAN_ISSUER_ADDRESS', '0x13159e6417D98528C220b12Ec4950D5A343E5eAA'),
  PRINCIPAL_TOKEN_ADDRESS: getEnvConfig('VITE_PRINCIPAL_TOKEN_ADDRESS', '0xA41b4F0417d588a08F914Ca17b07c99783D5c3FC'),
  INTEREST_TOKEN_ADDRESS: getEnvConfig('VITE_INTEREST_TOKEN_ADDRESS', '0x9d3175E3F8c055389e070e058f717D450bB89206'),
  TRADE_CONTRACT_ADDRESS: getEnvConfig('VITE_TRADE_CONTRACT_ADDRESS', '0x13159e6417D98528C220b12Ec4950D5A343E5eAA'),
  COMPLIANCE_GUARD_ADDRESS: getEnvConfig('VITE_COMPLIANCE_GUARD_ADDRESS', '0x448d5FB04025FDb01b97e9bB5e5FD12c687cd480'),
  HOLDER_REGISTRY_ADDRESS: getEnvConfig('VITE_HOLDER_REGISTRY_ADDRESS', '0x1E77C41899D1d34A11E3BF55809962fE6a929074'),
  NETWORK: {
    chainId: parseInt(getEnvConfig('VITE_NETWORK_CHAIN_ID', '1')), // 默认使用以太坊主网
    name: getEnvConfig('VITE_NETWORK_NAME', 'Ethereum Mainnet'),
    rpcUrl: getEnvConfig('VITE_RPC_URL', 'https://mainnet.infura.io/v3/s9YBJHw1dEizTkvbyMkn0')
  },
  // KYC配置
  KYC: {
    DEFAULT_SUCCESS: getEnvConfig('VITE_KYC_DEFAULT_SUCCESS', 'false') === 'true',
    DEFAULT_LEVEL: parseInt(getEnvConfig('VITE_KYC_DEFAULT_LEVEL', '0'))
  }
}

// 生产环境配置 (Ethereum主网)
export const PROD_CONFIG = {
  // ✅ 已配置主网部署的合约地址
  KYC_REGISTRY_ADDRESS: getEnvConfig('VITE_KYC_REGISTRY_ADDRESS_PROD', '0x0A96077ffe3f06274d869ba1eed6cB7324270C2f'), // KYC注册合约
  LOAN_ISSUER_ADDRESS: getEnvConfig('VITE_LOAN_ISSUER_ADDRESS_PROD', '0x13159e6417D98528C220b12Ec4950D5A343E5eAA'), // 贷款发行合约
  PRINCIPAL_TOKEN_ADDRESS: getEnvConfig('VITE_PRINCIPAL_TOKEN_ADDRESS_PROD', '0xA41b4F0417d588a08F914Ca17b07c99783D5c3FC'), // 本金代币合约 (LPrincipalFixed)
  INTEREST_TOKEN_ADDRESS: getEnvConfig('VITE_INTEREST_TOKEN_ADDRESS_PROD', '0x9d3175E3F8c055389e070e058f717D450bB89206'), // 利息代币合约 (LInterest)
  TRADE_CONTRACT_ADDRESS: getEnvConfig('VITE_TRADE_CONTRACT_ADDRESS_PROD', '0x13159e6417D98528C220b12Ec4950D5A343E5eAA'), // 交易合约
  COMPLIANCE_GUARD_ADDRESS: getEnvConfig('VITE_COMPLIANCE_GUARD_ADDRESS_PROD', '0x448d5FB04025FDb01b97e9bB5e5FD12c687cd480'), // 合规守护合约
  HOLDER_REGISTRY_ADDRESS: getEnvConfig('VITE_HOLDER_REGISTRY_ADDRESS_PROD', '0x1E77C41899D1d34A11E3BF55809962fE6a929074'), // 持有者注册合约
  NETWORK: {
    chainId: parseInt(getEnvConfig('VITE_NETWORK_CHAIN_ID_PROD', '1')), // 以太坊主网Chain ID
    name: getEnvConfig('VITE_NETWORK_NAME_PROD', 'Ethereum Mainnet'),
    rpcUrl: getEnvConfig('VITE_RPC_URL_PROD', '') // 🔴 需要提供主网RPC URL
  },
  // KYC配置
  KYC: {
    DEFAULT_SUCCESS: getEnvConfig('VITE_KYC_DEFAULT_SUCCESS_PROD', 'false') === 'true',
    DEFAULT_LEVEL: parseInt(getEnvConfig('VITE_KYC_DEFAULT_LEVEL_PROD', '0'))
  }
}

// 根据环境变量选择配置
const isProduction = import.meta.env.PROD

// 当前使用的配置
export const CONTRACT_CONFIG = isProduction ? PROD_CONFIG : DEV_CONFIG

// 导出当前配置供其他文件使用
export default CONTRACT_CONFIG

// 导出KYC配置
export const KYC_CONFIG = CONTRACT_CONFIG.KYC

// 应用配置
export const APP_CONFIG = {
  NAME: getEnvConfig('VITE_APP_NAME', 'RWA Trading Platform'),
  VERSION: getEnvConfig('VITE_APP_VERSION', '1.0.0'),
  ENV: getEnvConfig('VITE_APP_ENV', 'development')
}

// 功能开关配置
export const FEATURE_CONFIG = {
  ENABLE_KYC: getEnvConfig('VITE_ENABLE_KYC', 'true') === 'true',
  ENABLE_TRADING: getEnvConfig('VITE_ENABLE_TRADING', 'true') === 'true',
  ENABLE_AUTO_REFRESH: getEnvConfig('VITE_ENABLE_AUTO_REFRESH', 'true') === 'true',
  AUTO_REFRESH_INTERVAL: parseInt(getEnvConfig('VITE_AUTO_REFRESH_INTERVAL', '30'))
}
