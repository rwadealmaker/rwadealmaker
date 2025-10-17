declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_KYC_DEFAULT_SUCCESS: string
  readonly VITE_KYC_DEFAULT_LEVEL: string
  readonly VITE_KYC_REGISTRY_ADDRESS: string
  readonly VITE_LOAN_ISSUER_ADDRESS: string
  readonly VITE_PRINCIPAL_TOKEN_ADDRESS: string
  readonly VITE_INTEREST_TOKEN_ADDRESS: string
  readonly VITE_TRADE_CONTRACT_ADDRESS: string
  readonly VITE_NETWORK_CHAIN_ID: string
  readonly VITE_NETWORK_NAME: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  // 生产环境变量
  readonly VITE_KYC_REGISTRY_ADDRESS_PROD: string
  readonly VITE_LOAN_ISSUER_ADDRESS_PROD: string
  readonly VITE_PRINCIPAL_TOKEN_ADDRESS_PROD: string
  readonly VITE_INTEREST_TOKEN_ADDRESS_PROD: string
  readonly VITE_TRADE_CONTRACT_ADDRESS_PROD: string
  readonly VITE_NETWORK_CHAIN_ID_PROD: string
  readonly VITE_NETWORK_NAME_PROD: string
  readonly VITE_KYC_DEFAULT_SUCCESS_PROD: string
  readonly VITE_KYC_DEFAULT_LEVEL_PROD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
