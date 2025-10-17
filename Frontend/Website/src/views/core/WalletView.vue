<template>
  <!-- 解绑账号弹窗 -->
  <div v-if="showDisconnectModal" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h2 style="margin-bottom:8px;color:#ffffff;">{{ t('wallet.disconnect') }}</h2>
        <p style="color:#ffffff;">{{ t('wallet.disconnect.select') }}</p>
        <div style="margin:16px 0;">
          <span style="display:block;font-size:15px;padding:8px 0;color:#ffffff;background:#2a2a4a;border-radius:8px;">{{ selectedAccount }}</span>
        </div>
        <div style="text-align:right;">
          <button class="mm-btn mm-outline" @click="showDisconnectModal=false">{{ t('common.cancel') }}</button>
          <button class="mm-btn mm-outline" style="margin-left:8px;" @click="disconnectAccount">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 解绑成功弹窗 -->
  <div v-if="showDisconnectSuccess" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h2 style="margin-bottom:8px;color:#ffffff;">{{ t('wallet.disconnected') }}</h2>
        <p style="color:#ffffff;">{{ disconnectSuccessMsg }}</p>
        <div style="text-align:right;">
          <button class="mm-btn mm-outline" @click="showDisconnectSuccess=false">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>

  <!--Primary Section-->
  <div class="mm-page">
    <!-- Account Section -->
    <section class="mm-account-section">
      <header class="mm-topbar">
        <div class="mm-account">
          <div class="mm-avatar">
            <img 
              :src="getWalletIcon()" 
              :alt="t('wallet.account')"
              class="mm-avatar-img"
              @error="handleImageError"
            />
          </div>
          <div class="mm-account-meta">
            <div class="mm-account-title" style="display:flex;align-items:center;gap:12px;">
              <span>{{ t('wallet.account') }}</span>
              <div v-if="connected" class="mm-status">
                <span class="mm-dot"></span>
                <span class="mm-status-text">{{ t('wallet.connected') }}</span>
              </div>
            </div>
            <div class="mm-account-line">
              <template v-if="selectedAccount">
                <span class="mm-addr" :title="selectedAccount">{{ selectedAccount }}</span>
                <button v-if="connected" class="mm-btn mm-outline mm-copy" @click="onCopy">{{ t('wallet.copy') }}</button>

              </template>
              <template v-else>
                <span class="mm-addr" style="color:#b45309;">{{ t('wallet.connectWalletManagement') }}</span>
              </template>
            </div>
            <!-- <button v-if="!connected || !selectedAccount" class="mm-btn mm-outline" style="margin-top:6px;" @click="connect">Connect MetaMask</button> -->
          </div>
        </div>
        
        <!-- Current Network Section -->
        <div class="mm-network-section">
          <!-- <div class="mm-network-card">
          </div> -->
          <div class="mm-network-title" style="margin-bottom:2px;">{{ t('wallet.currentNetwork') }}: {{ networkLabel }}</div>
          <!-- <div class="mm-network-subtitle" >{{ t('wallet.networkSwitchNote') }}</div> -->
        </div>
        
        
      </header>
    </section>

    <!-- Main Dashboard Section -->
    <section v-if="connected && selectedAccount" class="mm-dashboard-section">
      <div class="mm-hero">
        <!-- 资产标题区 -->
        <div class="mm-balance">{{ nativeBalanceDisplay }} {{ nativeSymbol }}</div>
        <div class="mm-subline">
          <span>AUD{{ nativeToAudDisplay || 0 }}</span> 
          <a href="#" @click.prevent="$router.push('/portfolio')" class="mm-link">{{ t('wallet.portfolio') }} ↗</a>
        </div>
      </div>


      <!-- Tabs -->
      <nav class="mm-tabs">
        <button
          class="mm-tab"
          :class="{ 'is-active': activeTab==='tokens' }"
          @click="activeTab='tokens'"
        >{{ t('wallet.tokens') }}</button>
      </nav>
    
      <!-- 自定义代币输入 -->
      <!-- <div class="mm-custom">
        <span class="mm-net-left">{{ t('wallet.insertContractAddress') }}</span>
        <form class="mm-custom-form" @submit.prevent="addToken">
          <input v-model="customAddress" class="mm-input" :placeholder="t('wallet.pasteERC20Address')" />
          <input v-model="customLabel" class="mm-input" :placeholder="t('wallet.labelOptional')" />
          <button class="mm-btn mm-outline" type="submit" :disabled="!customAddress">{{ t('wallet.addToken') }}</button>
          <button class="mm-btn mm-outline" type="button" @click="refreshTokens">{{ t('wallet.refresh') }}</button>
        </form> -->
        <!-- 警告信息显示 -->
        <!-- <div v-if="warning" class="mm-warning">
          <span class="mm-warning-icon">⚠️</span>
          <span class="mm-warning-text">{{ warning }}</span>
        </div>
      </div> -->
      <!-- Tokens 列表 -->
      <div v-if="activeTab==='tokens'" class="mm-tokenlist">
        
        <!-- 代币列表标题和刷新按钮 -->
        <div class="mm-token-header">
          <!-- <h3 class="mm-token-title">{{ t('wallet.tokens') }}</h3> -->
          <button 
            class="mm-refresh-btn" 
            @click="refreshTokens"
            :disabled="loadingTokens"
            :title="t('wallet.refreshTokens')"
          >
            <span v-if="loadingTokens" class="mm-loading-spinner">⟳</span>
            <span v-else>⟳</span>
          </button>
        </div>
        
        <div class="mm-token">
          <div class="mm-token-left">
            <div class="mm-token-icon mm-network-icon">
              <img 
                :src="getNetworkIcon()" 
                :alt="networkLabel"
                class="mm-network-img"
                @error="handleNetworkImageError"
              />
            </div>
            <div>
              <div class="mm-token-title">
                {{ networkLabel }}
              </div>
              <div :class="priceChangeClass">{{ priceChangeDisplay }}</div>
            </div>
          </div>
          <div class="mm-token-right">
            <div class="mm-token-sub">{{ nativeBalanceDisplay }} {{ nativeSymbol }}</div>
            <div class="mm-token-amount">AUD{{ nativeToAudDisplay || 0 }}</div>
          </div>
        </div>

        <div v-for="token in sortedTokens" :key="token.address" class="mm-token" @click="$router.push({ name: 'tokenDetail', params: { address: token.address } })">
          <div class="mm-token-left">
            <div class="mm-token-icon">{{ (token.symbol || 'T').slice(0,1) }}</div>
            <div>
              <!-- <div class="mm-token-title">{{ token.symbol || 'Token' }}</div> -->
              <div class="mm-token-sub">{{ token.name }}</div>
              <div style="font-size:10px;color:#FFFFFF;">{{ t('wallet.clickForDetails') }}</div>

            </div>
          </div>
          <div class="mm-token-right">
            <div class="mm-token-sub">{{ token.displayBalance }}</div>
          </div>
        </div>
      </div>
      

    </section>
  </div>

  <!-- 提示/错误 -->
  <p v-if="warning" class="mm-warn">{{ warning }}</p>
  <p v-if="error" class="mm-error">{{ error }}</p>
  <transition name="fade">
    <div v-if="copied" class="mm-toast">{{ t('wallet.copied') }}</div>
  </transition>
</template>

<script setup>
// 弹窗状态
const showPrimaryModal = ref(false)
const showDisconnectModal = ref(false)
const showDisconnectSuccess = ref(false)
const primaryCandidate = ref('')
const disconnectCandidate = ref('')
const disconnectSuccessMsg = ref('')

import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue'
import { ethers } from 'ethers'
import { useWallet } from '/src/composables/useWallet'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const {
connected, address, fullAddress,
chainId, networkLabel, nativeSymbol,
nativeBalanceDisplay, nativeToAudDisplay, bigAudDisplay,
tokens, warning, error, loadingTokens,
activeTab, connect, disconnect, refreshTokens, copyAddress,
addCustomToken, audPrice, priceChange24h
} = useWallet()

// 返回MetaMask钱包图标
const getWalletIcon = () => {
  if (!connected.value) {
    return '/icons/login-wallet-icon.png' // 未连接时的默认图标
  }
  
  // 始终返回MetaMask图标
  return '/icons/metamask.png'
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/icons/default-wallet.png'
}

// 根据网络获取对应的图标
const getNetworkIcon = () => {
  if (!networkLabel.value) {
    return '/icons/default-network.png'
  }
  
  const network = networkLabel.value.toLowerCase()
  
  if (network.includes('sepolia')) {
    return '/icons/Sepolia.png'
  } else if (network.includes('ethereum') || network.includes('mainnet')) {
    return '/icons/EthereunMainnet.png'
  }
  
  // 默认图标
  return '/icons/default-network.png'
}

// 处理网络图标加载错误
const handleNetworkImageError = (event) => {
  // 如果图片加载失败，使用默认网络图标
  event.target.src = '/icons/Sepolia.png'
}

// Wallet Management 相关
import { watch } from 'vue'
// 动态账户列表，初始为当前 fullAddress
const accounts = ref([fullAddress.value])
const selectedAccount = ref(fullAddress.value)
const walletAction = ref('')




// 网络选择相关
const selectedNetwork = ref('SepoliaETH')
const availableNetworks = ref([
  { value: 'SepoliaETH', label: 'SepoliaETH', chainId: 11155111 },
  { value: 'Ethereum', label: 'Ethereum', chainId: 1 }
])


// 状态检查分页后的活动
const paginatedStatusActivities = computed(() => {
  const startIndex = (statusCheckPage.value - 1) * statusCheckPageSize
  const endIndex = startIndex + statusCheckPageSize
  return rightColumnActivities.value.slice(startIndex, endIndex)
})

// 状态检查总页数
const statusCheckTotalPages = computed(() => {
  return Math.ceil(rightColumnActivities.value.length / statusCheckPageSize)
})

// 状态检查智能分页显示
const statusCheckPaginationPages = computed(() => {
  const totalPages = statusCheckTotalPages.value
  const currentPage = statusCheckPage.value
  
  if (totalPages <= 5) {
    // 如果总页数小于等于5，显示所有页数
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const pages = []
  
  // 总是显示第一页
  pages.push(1)
  
  if (currentPage <= 3) {
    // 当前页在前3页，显示前3页
    for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
      pages.push(i)
    }
  } else if (currentPage >= totalPages - 2) {
    // 当前页在后2页，显示后2页
    for (let i = Math.max(2, totalPages - 2); i <= totalPages - 1; i++) {
      pages.push(i)
    }
  } else {
    // 当前页在中间，显示当前页前后各1页
    pages.push(currentPage - 1)
    pages.push(currentPage)
    pages.push(currentPage + 1)
  }
  
  // 总是显示最后一页
  if (totalPages > 1) {
    pages.push(totalPages)
  }
  
  // 去重并排序
  return [...new Set(pages)].sort((a, b) => a - b)
})

// 交易活动总页数
const transactionTotalPages = computed(() => {
  return Math.ceil(leftColumnActivities.value.length / transactionPageSize)
})

// 交易活动分页后的活动
const paginatedTransactionActivities = computed(() => {
  const startIndex = (transactionPage.value - 1) * transactionPageSize
  const endIndex = startIndex + transactionPageSize
  return leftColumnActivities.value.slice(startIndex, endIndex)
})



// 监听 fullAddress 变化，自动添加到 accounts 列表（避免重复）
watch(fullAddress, (newAddr) => {
if (newAddr && !accounts.value.includes(newAddr)) {
  accounts.value.push(newAddr)
  selectedAccount.value = newAddr
}
})

function onWalletConfirm() {
if (walletAction.value === 'set-primary') {
  primaryCandidate.value = selectedAccount.value
  showPrimaryModal.value = true
  return
}
if (walletAction.value === 'disconnect') {
  disconnectCandidate.value = selectedAccount.value
  showDisconnectModal.value = true
  return
}
if (walletAction.value === 'link') {
  // 绑定新钱包逻辑
  if (!window.ethereum) {
    warning.value = 'MetaMask not detected.'
    return
  }
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accs) => {
      if (accs && accs.length > 0) {
        const newAddr = accs[0]
        if (!accounts.value.includes(newAddr)) {
          accounts.value.push(newAddr)
          selectedAccount.value = newAddr
          address.value = newAddr
          warning.value = `New wallet ${newAddr} linked and selected.`
        } else {
          selectedAccount.value = newAddr
          address.value = newAddr
          warning.value = `Wallet ${newAddr} already linked. Switched to it.`
        }
      }
    })
    .catch((err) => {
      warning.value = normalizeErr(err)
    })
  return
}
// 切换账户演示
if (selectedAccount.value) {
  address.value = selectedAccount.value
  warning.value = `Dashboard now shows info for ${selectedAccount.value}`
}
}

function setPrimaryWallet() {
if (primaryCandidate.value) {
  // 设置主账号（这里只是演示，实际可存储到后端或本地）
  selectedAccount.value = primaryCandidate.value
  address.value = primaryCandidate.value
  showPrimaryModal.value = false
  warning.value = `Primary wallet set to ${primaryCandidate.value}`
}
}

function disconnectAccount() {
if (disconnectCandidate.value) {
  // 解绑账号（演示：从 accounts 列表移除）
  const idx = accounts.value.indexOf(disconnectCandidate.value)
  if (idx !== -1) {
    accounts.value.splice(idx, 1)
    // 如果解绑的是当前选中账号，则清空并提示
    if (selectedAccount.value === disconnectCandidate.value) {
      selectedAccount.value = ''
      address.value = ''
      warning.value = ''
    }
    showDisconnectModal.value = false
    disconnectSuccessMsg.value = `Wallet ${disconnectCandidate.value} disconnected.`
    showDisconnectSuccess.value = true
  }
}
}
const TOKENS_BY_CHAIN = {
1: [
  { address: '0xYOUR_PWLP_MAINNET', label: 'PWL-P' }, // ← 填主网 PWL-P 地址
  { address: '0xYOUR_PWLI_MAINNET', label: 'PWL-I' }, // ← 填主网 PWL-I 地址
],
11155111: [
  { address: '0xYOUR_PWLP_SEPOLIA', label: 'PWL-P' },
  { address: '0xYOUR_PWLI_SEPOLIA', label: 'PWL-I' },
],
}

const ERC20_ABI = [
'function balanceOf(address) view returns (uint256)',
'function decimals() view returns (uint8)',
'function symbol() view returns (string)',
'function name() view returns (string)',
]

let provider = null
let signer = null
let blockListenerAttached = false
let blockHandler = null

// toast: 复制成功提示
const copied = ref(false)
function onCopy(){
try { copyAddress() } finally {
  copied.value = true
  setTimeout(() => { copied.value = false }, 3000)
}
}

async function refreshAll() {
if (!connected.value) return
await refreshNetwork()
await refreshNative()
await refreshTokens()
}
async function refreshNetwork() {
const net = await provider.getNetwork()
chainId.value = Number(net.chainId)
networkLabel.value = net.name && net.name !== 'unknown' ? cap(net.name) : `Chain ${chainId.value}`
nativeSymbol.value =
  chainId.value === 1 ? 'ETH' :
  chainId.value === 137 ? 'MATIC' :
  chainId.value === 42161 ? 'ETH' :
  chainId.value === 10 ? 'ETH' : 'ETH'
fetchAudPriceSafely()
}
async function refreshNative() { nativeBalance.value = await provider.getBalance(address.value) }

function attachEventListeners() {
if (!window.ethereum) return
window.ethereum.on('accountsChanged', handleAccountsChanged)
window.ethereum.on('chainChanged', handleChainChanged)
if (provider && !blockListenerAttached) {
  blockHandler = async () => { try { await refreshNative() } catch {} }
  provider.on('block', blockHandler)
  blockListenerAttached = true
}
}

function detachEventListeners() {
if (window.ethereum) {
  window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
  window.ethereum.removeListener('chainChanged', handleChainChanged)
}
if (provider && blockListenerAttached && blockHandler) {
  provider.removeListener('block', blockHandler)
  blockListenerAttached = false
  blockHandler = null
}
}

async function handleAccountsChanged(accs) {
if (!accs || accs.length === 0) disconnect();
else {
  address.value = accs[0];
  selectedAccount.value = accs[0];
  refreshAll();
  // 自动切换到token tab并刷新
  activeTab.value = 'tokens';
}
}

async function handleChainChanged() { await refreshAll() }

function formatUnitsSafe(raw, decimals) { 
try { 
  return Number(ethers.formatUnits(raw, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 }) 
} catch { return '0' } }

function safeString(fn, fb) { return fn().catch(() => fb) }

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s }

function normalizeErr(e) {
const msg = (e && (e.reason || e.message)) ? (e.reason || e.message) : String(e)
if (msg.toLowerCase().includes('user rejected')) return 'User rejected the request.'
return msg
}

async function fetchAudPriceSafely() {
try {
  const id = (nativeSymbol.value === 'MATIC') ? 'matic-network' : 'ethereum'
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=aud`)
  const json = await res.json()
  audPrice.value = json?.[id]?.aud || null
} catch { audPrice.value = null }
}

onMounted(async () => {
if (!window.ethereum) { warning.value = 'MetaMask not detected.'; return }
provider = new ethers.BrowserProvider(window.ethereum, 'any')
const accs = await provider.send('eth_accounts', [])
if (accs && accs.length > 0) {
  signer = await provider.getSigner()
  address.value = accs[0]
  connected.value = true
  await refreshAll()
  attachEventListeners()
}

// 加载钱包活动记录
await loadWalletActivity()

// 监听来自TradeProjectView的活动更新通知
window.addEventListener('walletActivityUpdated', handleWalletActivityUpdate)

// 设置MetaMask活动监听器
setupMetaMaskActivityListeners()

// 设置页面可见性和窗口焦点监听器
setupPageVisibilityListener()
setupWindowFocusListener()
})

onBeforeUnmount(() => { 
  detachEventListeners()
  window.removeEventListener('walletActivityUpdated', handleWalletActivityUpdate)
})

// 自定义代币输入
const customAddress = ref('')
const customLabel = ref('')
async function addToken(){
console.log('🔄 Adding custom token:', customAddress.value.trim(), customLabel.value.trim())
const ok = await addCustomToken(customAddress.value.trim(), customLabel.value.trim())
console.log('✅ Add token result:', ok)
if (ok) {
  customAddress.value = ''
  customLabel.value = ''
  console.log('🔄 Refreshing tokens after adding...')
  await refreshTokens()
  console.log('📋 Tokens after refresh:', tokens.length)
} else {
  console.log('❌ Failed to add token')
}
}

// 排序（余额 asc/desc）
const sortOpen = ref(false)
const sortOrder = ref('desc')
function toggleSortMenu(){ sortOpen.value = !sortOpen.value }
function setSort(order){ sortOrder.value = order; sortOpen.value = false }
function parseBalance(val){
if (val == null) return 0
if (typeof val === 'number') return val
const num = parseFloat(String(val).replace(/,/g, ''))
return isNaN(num) ? 0 : num
}
const sortedTokens = computed(() => {
const list = Array.from(tokens)
const desc = (a,b) => parseBalance(b.displayBalance) - parseBalance(a.displayBalance)
const asc  = (a,b) => parseBalance(a.displayBalance) - parseBalance(b.displayBalance)
return list.sort(sortOrder.value === 'desc' ? desc : asc)
})

const manualWalletInput = ref('')
function onManualWalletConfirm() {
const addr = manualWalletInput.value.trim()
if (addr && !accounts.value.includes(addr)) {
  accounts.value.push(addr)
  selectedAccount.value = addr
  address.value = addr
  manualWalletInput.value = ''
  warning.value = `New wallet ${addr} added and selected.`
}
}

// 格式化价格变化率显示
const priceChangeDisplay = computed(() => {
  if (priceChange24h.value === null || priceChange24h.value === undefined) {
    return '+0.00%'
  }
  const change = priceChange24h.value
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
})

// 价格变化率样式类
const priceChangeClass = computed(() => {
  if (priceChange24h.value === null || priceChange24h.value === undefined) {
    return 'mm-rise'
  }
  return priceChange24h.value >= 0 ? 'mm-rise' : 'mm-fall'
})

// Activity 相关方法
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化ETH值
function formatEtherValue(value) {
  if (!value) return '0'
  const weiValue = parseInt(value, 16)
  const ethValue = weiValue / Math.pow(10, 18)
  return ethValue.toFixed(6)
}


// 获取活动图标
function getActivityIcon(type) {
  const icons = {
    'buy': '📈',
    'sell': '📉',
    'wallet_connect': '🔗',
    'wallet_disconnect': '❌',
    'network_change': '🌐',
    'metamask_connect': '🦊',
    'metamask_disconnect': '🦊❌',
    'wallet_status_check': '👁️',
    'wallet_focus_check': '🎯',
    'metamask_message': '💬',
    'metamask_transaction': '💰'
  }
  return icons[type] || '📋'
}

// 获取活动标题
function getActivityTitle(type) {
  const titles = {
    'buy': '购买代币',
    'sell': '出售代币',
    'wallet_connect': '钱包已连接',
    'wallet_disconnect': '钱包已断开',
    'network_change': '网络已切换',
    'metamask_connect': 'MetaMask已连接',
    'metamask_disconnect': 'MetaMask已断开',
    'wallet_status_check': '状态已检查',
    'wallet_focus_check': '焦点已检查',
    'metamask_message': 'MetaMask消息',
    'metamask_transaction': 'MetaMask交易'
  }
  return titles[type] || type.toUpperCase()
}

// 从Etherscan API获取交易详情
async function fetchTransactionDetails(txHash) {
  try {
    console.log('🔍 正在从Etherscan获取交易详情:', txHash)
    
    // Etherscan Sepolia API
    const apiUrl = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`
    
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    if (data.result) {
      console.log('✅ 成功获取交易详情:', data.result)
      
      // 获取交易收据
      const receiptUrl = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`
      const receiptResponse = await fetch(receiptUrl)
      const receiptData = await receiptResponse.json()
      
      return {
        success: true,
        transaction: data.result,
        receipt: receiptData.result,
        hash: txHash,
        from: data.result.from,
        to: data.result.to,
        value: data.result.value,
        nonce: data.result.nonce,
        gasUsed: receiptData.result ? receiptData.result.gasUsed : null,
        gasPrice: data.result.gasPrice,
        blockNumber: data.result.blockNumber,
        blockHash: data.result.blockHash,
        status: receiptData.result ? receiptData.result.status : null,
        // 计算交易费用
        transactionFee: receiptData.result ? 
          (parseInt(receiptData.result.gasUsed, 16) * parseInt(data.result.gasPrice, 16)) / Math.pow(10, 18) : 
          null,
        // Etherscan链接
        etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`
      }
    } else {
      console.warn('⚠️ 交易详情获取失败:', data.message)
      return {
        success: false,
        error: data.message || 'Failed to fetch transaction details'
      }
    }
  } catch (error) {
    console.error('❌ 获取交易详情时发生错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 加载钱包活动记录
async function loadWalletActivity() {
  try {
    loadingActivity.value = true
    console.log('🔄 正在加载钱包活动记录...')
    
    // 从localStorage获取交易记录
    const savedActivity = localStorage.getItem('walletActivity')
    if (savedActivity) {
      const activityData = JSON.parse(savedActivity)
      console.log('📂 从localStorage加载活动记录:', activityData.length, '条')
      
      // 为每条记录获取Etherscan详情
      const updatedActivity = []
      for (const activity of activityData) {
        if (activity.transactionHash && activity.type !== 'wallet_connect' && activity.type !== 'wallet_disconnect') {
          const etherscanData = await fetchTransactionDetails(activity.transactionHash)
          if (etherscanData.success) {
            activity.etherscan = {
              hash: etherscanData.hash,
              from: etherscanData.from,
              to: etherscanData.to,
              value: etherscanData.value,
              nonce: etherscanData.nonce,
              gasUsed: etherscanData.gasUsed,
              gasPrice: etherscanData.gasPrice,
              blockNumber: etherscanData.blockNumber,
              blockHash: etherscanData.blockHash,
              status: etherscanData.status,
              transactionFee: etherscanData.transactionFee,
              etherscanUrl: etherscanData.etherscanUrl
            }
          }
        }
        updatedActivity.push(activity)
      }
      
      walletActivity.value = updatedActivity
    } else {
      // 如果没有保存的活动记录，创建一些演示数据
      walletActivity.value = [
        {
          id: Date.now() - 3600000,
          type: 'buy',
          amount: 100,
          project_code: 'TYMU',
          project_name: 'St Ives NSW Residential Project',
          timestamp: Date.now() - 3600000,
          transactionHash: '0xabc123def45678901234567890123456789012345678901234567890123456789012'
        },
        {
          id: Date.now() - 1800000,
          type: 'sell',
          amount: 50,
          project_code: 'SQNB',
          project_name: 'SQNB Property Loan',
          timestamp: Date.now() - 1800000,
          transactionHash: '0xdef456abc12378901234567890123456789012345678901234567890123456789012'
        },
        {
          id: Date.now() - 900000,
          type: 'wallet_connect',
          message: 'Wallet connected to MetaMask',
          wallet_address: fullAddress.value,
          timestamp: Date.now() - 900000
        }
      ]
      
      // 为演示数据获取Etherscan详情
      for (const activity of walletActivity.value) {
        if (activity.transactionHash) {
          const etherscanData = await fetchTransactionDetails(activity.transactionHash)
          if (etherscanData.success) {
            activity.etherscan = {
              from: etherscanData.from,
              to: etherscanData.to,
              value: etherscanData.value,
              gasUsed: etherscanData.gasUsed,
              gasPrice: etherscanData.gasPrice,
              blockNumber: etherscanData.blockNumber,
              blockHash: etherscanData.blockHash,
              status: etherscanData.status,
              etherscanUrl: `https://sepolia.etherscan.io/tx/${activity.transactionHash}`
            }
          }
        }
      }
    }
    
    console.log('✅ 钱包活动记录加载完成:', walletActivity.value.length, '条')
    
  } catch (error) {
    console.error('❌ 加载钱包活动记录失败:', error)
    warning.value = 'Failed to load wallet activity'
  } finally {
    loadingActivity.value = false
  }
}

// 刷新活动记录
async function refreshActivity() {
  await loadWalletActivity()
}

// 手动记录当前钱包状态
function logCurrentWalletStatus() {
  if (connected.value && fullAddress.value) {
    logWalletActivity({
      type: 'wallet_status_check',
      message: 'Current wallet status logged',
      wallet_address: fullAddress.value,
      chain_id: chainId.value,
      network_name: networkLabel.value,
      timestamp: Date.now()
    })
  }
}

// 添加新的活动记录
function addWalletActivity(activityData) {
  console.log('➕ 添加新的钱包活动记录:', activityData)
  
  // 添加Etherscan详情
  if (activityData.transactionHash) {
    fetchTransactionDetails(activityData.transactionHash).then(etherscanData => {
      if (etherscanData.success) {
        activityData.etherscan = {
          from: etherscanData.from,
          to: etherscanData.to,
          value: etherscanData.value,
          gasUsed: etherscanData.gasUsed,
          gasPrice: etherscanData.gasPrice,
          blockNumber: etherscanData.blockNumber,
          blockHash: etherscanData.blockHash,
          status: etherscanData.status,
          etherscanUrl: `https://sepolia.etherscan.io/tx/${activityData.transactionHash}`
        }
      }
      
      // 添加到活动列表
      walletActivity.value.unshift(activityData)
      
      // 保存到localStorage
      localStorage.setItem('walletActivity', JSON.stringify(walletActivity.value))
    })
  } else {
    // 没有交易哈希，直接添加
    walletActivity.value.unshift(activityData)
    localStorage.setItem('walletActivity', JSON.stringify(walletActivity.value))
  }
}

// 处理来自TradeProjectView的活动更新通知
function handleWalletActivityUpdate(event) {
  console.log('📨 收到WalletView活动更新通知:', event.detail)
  
  // 重新加载活动记录
  loadWalletActivity()
}

// MetaMask活动监听器
function setupMetaMaskActivityListeners() {
  console.log('🎧 设置MetaMask活动监听器...')
  
  // 监听账户变化
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('📱 账户变化检测到:', accounts)
      
      if (accounts.length > 0) {
        // 账户连接
        logWalletActivity({
          type: 'wallet_connect',
          message: 'Wallet account connected',
          wallet_address: accounts[0],
          timestamp: Date.now()
        })
      } else {
        // 账户断开
        logWalletActivity({
          type: 'wallet_disconnect',
          message: 'Wallet account disconnected',
          wallet_address: fullAddress.value,
          timestamp: Date.now()
        })
      }
    })
    
    // 监听网络变化
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('🌐 网络变化检测到:', chainId)
      
      const networkName = getNetworkName(chainId)
      logWalletActivity({
        type: 'network_change',
        message: `Network changed to ${networkName}`,
        network_id: chainId,
        network_name: networkName,
        timestamp: Date.now()
      })
    })
    
    // 监听连接状态
    window.ethereum.on('connect', (connectInfo) => {
      console.log('🔗 MetaMask连接检测到:', connectInfo)
      
      logWalletActivity({
        type: 'metamask_connect',
        message: 'MetaMask extension connected',
        chain_id: connectInfo.chainId,
        timestamp: Date.now()
      })
    })
    
    // 监听断开连接
    window.ethereum.on('disconnect', (error) => {
      console.log('❌ MetaMask断开连接:', error)
      
      logWalletActivity({
        type: 'metamask_disconnect',
        message: 'MetaMask extension disconnected',
        error: error.message || 'Unknown error',
        timestamp: Date.now()
      })
    })
    
    // 监听消息
    window.ethereum.on('message', (message) => {
      console.log('💬 MetaMask消息:', message)
      
      logWalletActivity({
        type: 'metamask_message',
        message: 'MetaMask message received',
        message_type: message.type,
        data: message.data,
        timestamp: Date.now()
      })
    })
  }
}

// 获取网络名称
function getNetworkName(chainId) {
  const networks = {
    '0x1': 'Ethereum Mainnet',
    '0x3': 'Ropsten Testnet',
    '0x4': 'Rinkeby Testnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Polygon Mumbai',
    '0x38': 'BSC Mainnet',
    '0x61': 'BSC Testnet'
  }
  
  return networks[chainId] || `Unknown Network (${chainId})`
}

// 记录钱包活动
function logWalletActivity(activityData) {
  try {
    console.log('📝 记录钱包活动:', activityData)
    
    // 添加到活动列表
    walletActivity.value.unshift(activityData)
    
    // 保存到localStorage
    const currentActivity = JSON.parse(localStorage.getItem('walletActivity') || '[]')
    currentActivity.unshift(activityData)
    
    // 限制最多保存100条记录
    if (currentActivity.length > 100) {
      currentActivity.splice(100)
    }
    
    localStorage.setItem('walletActivity', JSON.stringify(currentActivity))
    
    console.log('✅ 钱包活动记录已保存')
    
  } catch (error) {
    console.error('❌ 记录钱包活动失败:', error)
  }
}

// 监听页面可见性变化
function setupPageVisibilityListener() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ 页面重新可见，刷新钱包状态和活动记录')
      
      // 刷新钱包活动记录
      loadWalletActivity()
      
      // 检查钱包连接状态
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
          if (accounts.length > 0 && accounts[0] !== fullAddress.value) {
            logWalletActivity({
              type: 'wallet_status_check',
              message: 'Wallet status checked on page visibility',
              wallet_address: accounts[0],
              timestamp: Date.now()
            })
          }
        }).catch(error => {
          console.error('检查钱包状态失败:', error)
        })
      }
    }
  })
}

// 监听窗口焦点变化
function setupWindowFocusListener() {
  window.addEventListener('focus', () => {
    console.log('🎯 窗口获得焦点，检查钱包状态和刷新活动记录')
    
    // 刷新钱包活动记录
    loadWalletActivity()
    
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          logWalletActivity({
            type: 'wallet_focus_check',
            message: 'Wallet status checked on window focus',
            wallet_address: accounts[0],
            timestamp: Date.now()
          })
        }
      }).catch(error => {
        console.error('检查钱包状态失败:', error)
      })
    }
  })
}

// Activity 筛选方法
function toggleFilters() {
  showFilters.value = !showFilters.value
}

function clearFilters() {
  activityFilters.value = {
    type: '',
    projectCode: '',
    startDate: '',
    endDate: ''
  }
}

function applyFilters() {
  // 筛选逻辑已经在 computed 中处理，这里可以添加额外的逻辑
  console.log('🔍 应用筛选条件:', activityFilters.value)
}

function getCurrentDate() {
  return new Date().toISOString().split('T')[0]
}


// 切换到Activity tab并刷新活动记录
async function switchToActivityTab() {
  activeTab.value = 'activity'
  console.log('🔄 切换到Activity tab，刷新活动记录')
  await loadWalletActivity()
}

// 清除状态检查活动 - 只清理Status Check记录
function clearStatusActivities() {
  if (walletActivity.value.length === 0) {
    console.log('📋 没有状态检查活动需要清除')
    return
  }
  
  // 只过滤掉状态检查相关活动，保留其他所有活动
  const filteredActivities = walletActivity.value.filter(activity => {
    // 只清除状态检查相关活动
    return activity.type !== 'wallet_status_check' && 
           activity.type !== 'wallet_focus_check' &&
           activity.type !== 'network_change'
  })
  
  walletActivity.value = filteredActivities
  
  // 重置分页到第一页
  statusCheckPage.value = 1
  
  console.log('🗑️ 已清除状态检查活动，剩余活动数量:', filteredActivities.length)
  console.log('📊 清除的活动类型: wallet_status_check, wallet_focus_check, network_change')
}


// 状态检查分页控制方法
function goToStatusPage(page) {
  if (page >= 1 && page <= statusCheckTotalPages.value) {
    statusCheckPage.value = page
    console.log(`📄 切换到状态检查第 ${page} 页`)
  }
}

function nextStatusPage() {
  if (statusCheckPage.value < statusCheckTotalPages.value) {
    statusCheckPage.value++
    console.log(`📄 状态检查下一页: ${statusCheckPage.value}`)
  }
}

function prevStatusPage() {
  if (statusCheckPage.value > 1) {
    statusCheckPage.value--
    console.log(`📄 状态检查上一页: ${statusCheckPage.value}`)
  }
}

// 交易活动分页控制方法
function goToTransactionPage(page) {
  if (page >= 1 && page <= transactionTotalPages.value) {
    transactionPage.value = page
    console.log(`📄 切换到交易活动第 ${page} 页`)
  }
}

function nextTransactionPage() {
  if (transactionPage.value < transactionTotalPages.value) {
    transactionPage.value++
    console.log(`📄 交易活动下一页: ${transactionPage.value}`)
  }
}

function prevTransactionPage() {
  if (transactionPage.value > 1) {
    transactionPage.value--
    console.log(`📄 交易活动上一页: ${transactionPage.value}`)
  }
}

// 网络切换方法
function switchNetwork(networkValue) {
  const network = availableNetworks.value.find(n => n.value === networkValue)
  if (network) {
    selectedNetwork.value = networkValue
    console.log(`Switching to network: ${network.label} (Chain ID: ${network.chainId})`)
    
    // 这里可以添加实际的网络切换逻辑
    // 例如：调用MetaMask的wallet_switchEthereumChain方法
    if (window.ethereum) {
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }]
      }).then(() => {
        console.log(`Successfully switched to ${network.label}`)
      }).catch((error) => {
        console.error(`Network switch failed:`, error)
        // 如果网络不存在，可以尝试添加网络
        if (error.code === 4902) {
          addNetwork(network)
        }
      })
    }
  }
}

// 添加网络方法
function addNetwork(network) {
  const networkConfigs = {
    'Ethereum': {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      rpcUrls: [CONTRACT_CONFIG.NETWORK.rpcUrl || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'], // 🔴 需要提供主网RPC URL
      blockExplorerUrls: ['https://etherscan.io'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      }
    }
    // ,
    // 'Polygon': {
    //   chainId: '0x89',
    //   chainName: 'Polygon Mainnet',
    //   rpcUrls: ['https://polygon-rpc.com'],
    //   blockExplorerUrls: ['https://polygonscan.com'],
    //   nativeCurrency: {
    //     name: 'MATIC',
    //     symbol: 'MATIC',
    //     decimals: 18
    //   }
    // },
    // 'Arbitrum': {
    //   chainId: '0xa4b1',
    //   chainName: 'Arbitrum One',
    //   rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    //   blockExplorerUrls: ['https://arbiscan.io'],
    //   nativeCurrency: {
    //     name: 'ETH',
    //     symbol: 'ETH',
    //     decimals: 18
    //   }
    // },
    // 'Optimism': {
    //   chainId: '0xa',
    //   chainName: 'Optimism',
    //   rpcUrls: ['https://mainnet.optimism.io'],
    //   blockExplorerUrls: ['https://optimistic.etherscan.io'],
    //   nativeCurrency: {
    //     name: 'ETH',
    //     symbol: 'ETH',
    //     decimals: 18
      // }
    // }
  }
  
  const config = networkConfigs[network.value]
  if (config && window.ethereum) {
    window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config]
    }).then(() => {
      console.log(`✅ 成功添加网络 ${network.label}`)
    }).catch((error) => {
      console.error(`❌ 添加网络失败:`, error)
    })
  }
}
</script>

<style scoped>
/* 弹窗样式复用 ProfileView */
.modal-mask {
position: fixed;
z-index: 9999;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background: rgba(0,0,0,0.3);
display: flex;
align-items: center;
justify-content: center;
}
.modal-wrapper {
width: 100%;
max-width: 420px;
}
.modal-container {
background: #1d1d36;
border: 1px solid #2f2f3a;
border-radius: 12px;
box-shadow: 0 2px 16px rgba(0,0,0,0.3);
padding: 28px 24px 18px;
font-size: 15px;
color: #ffffff;
}
/* Wallet Management Section */
.mm-wallet-management {
margin-bottom: 12px;
margin-top: 12px;
border: 1px solid #34383d;
border-radius: 16px;
background: #0f172a;
padding: 18px 20px 12px 20px;
display: flex;
align-items: center;
box-shadow: 0 2px 8px rgba(94, 103, 124, 0.04);
}
.mm-wallet-management .field {
width: 100%;
}
.mm-wallet-management .label {
font-size: 14px;
font-weight: 600;
color: var(--text);
margin-bottom: 8px;
display: block;
}
.mm-wallet-management .input.with-icon {
display: flex;
align-items: center;
gap: 8px;
padding: 0;
background: #3d3d5d;
border-color: #0f172a
}
.mm-wallet-management .icon {
width: 28px;
height: 28px;
border-radius: 10px;
background: #f3f4f6;
display: grid;
place-items: center;
box-shadow: 0 2px 6px rgba(15,23,42,.06), inset 0 0 0 1px #e2e8f0;
}
.mm-wallet-management select {
border: 0;
outline: none;
width: 100%;
height: 38px;
background: transparent;
color:#0f172a;
font-size: 15px;
padding-left: 2px;
}
/* ========== MetaMask-like Design ========== */
.mm-page{
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
color: var(--text);
max-width: 960px;
margin: 0 auto;
padding: 24px;
background: var(--bg);
min-height: 100vh;
}

/* 顶部条 */
.mm-topbar{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}
.mm-account{
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

/* Network Section */
.mm-network-section {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 52px; /* 与avatar高度保持一致 */
  margin-left: 62px;
}

.mm-network-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mm-network-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
  line-height: 1.2;
}

.mm-network-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.2;
}
.mm-avatar{
  width:52px;
  height:52px;
  border-radius:50%;
  background: radial-gradient(100% 100% at 30% 20%, #cfe3ff 0%, #b9c8ff 40%, #9db4ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.mm-avatar-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
} 

.mm-account-title{
font-weight:600;
color: var(--text);
}

.mm-account-line{display:flex;align-items:center;gap:8px;font-size:13px;color: var(--text-secondary);}
.mm-addr{max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mm-link{color:var(--blue);text-decoration:none;cursor:pointer;} /**change the style of this button**/
.mm-link:hover{color:var(--blue-ink);text-decoration:underline;}
.mm-status{display:flex;align-items:center;gap:10px;}
.mm-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;}
.mm-status-text{font-size:14px;color: var(--text-secondary);}

/* 按钮 */


.mm-btn{border:1px solid var(--border);background: var(--bg-secondary);border-radius:999px;padding:6px 6px;margin:0 0px;cursor:pointer;font-size:14px;color: var(--text);}
.mm-btn:hover{opacity:.9;}
.mm-outline{border-color:var(--border)}

/* 英雄区 */
.mm-hero{margin-top:8px;}
.mm-balance{font-size:48px;font-weight:800;letter-spacing:-.02em;color: var(--text);}
.mm-subline{margin-top:6px;display:flex;align-items:center;gap:12px;color: var(--text-secondary);font-size:18px;}

/* 操作按钮：一行 */
.mm-actions{display:flex;gap:16px;margin-top:12px;}
.mm-action{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 0;border:none;border-radius:16px;background: var(--card-bg);cursor:pointer;color: var(--text);}
.mm-action-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--brand);color: var(--text);font-weight:700;}
.mm-action-text{font-size:14px}

/* 信息条 */
.mm-info{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px;}
.mm-card{margin-top:20px;border:1px solid var(--border);border-radius:16px;padding:16px;width:300px;height:80px;align-items:center;justify-content:center;}
.mm-card-label{font-size:12px;color: var(--text-secondary);margin-bottom:6px;}
.mm-card-title{font-weight:600;color: var(--text);}
.mm-card-sub{font-size:12px;color: var(--text-secondary);margin-top:4px;}

/* Tabs */
.mm-tabs{display:flex;gap:28px;border-bottom:1px solid var(--border);margin-top:8px;}
.mm-tab{appearance:none;border:none;background:none;padding:14px 0;cursor:pointer;color: var(--text-secondary);font-weight:600;position:relative;border-radius:8px 8px 0 0;transition:all 0.2s ease;}
.mm-tab.is-active{color: var(--text);background: var(--card-bg);padding:14px 16px;margin:0 -16px;}
.mm-tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--text);border-radius:3px 3px 0 0;}

/* Activity 页签样式 */
.mm-activity-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid var(--border);
}

/* Activity 左右分栏布局 */
.mm-activity-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

/* 确保Status Check始终在右侧 */
.mm-activity-left {
  order: 1;
  min-width: 450px;
  width: 100%;
}

/* .mm-activity-right {
  order: 2;
  max-width: 400px;
} */

.mm-activity-left,
.mm-activity-right {
  background: #141426;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px;
}

.mm-activity-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #374151;
}

.mm-button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mm-activity-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.mm-log-status-btn {
  font-size: 12px;
  padding: 6px 12px;
  background: #7a838f;
  border-color: #32353a;
  color: #ffffff;
  transition: all 0.2s ease;
}

.mm-log-status-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.mm-clear-status-btn {
  font-size: 12px;
  padding: 6px 12px;
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  transition: all 0.2s ease;
}

.mm-clear-status-btn:hover {
  background: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-1px);
}

/* 状态检查分页样式 */
.mm-status-pagination {
  margin-top: 16px;
  padding: 16px;
  background: #141426;
  border: 1px solid #374151;
  border-radius: 8px;
}

/* 交易活动分页样式 - 现在在Transaction Activity section底部 */
.mm-transaction-pagination {
  margin-top: 16px;
  padding: 16px;
  background: #141426;
  border: 1px solid #374151;
  border-radius: 8px;
}

.mm-pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.mm-pagination-text {
  color: #ffffff;
  font-weight: 500;
}

.mm-pagination-count {
  color: #9ca3af;
  font-size: 12px;
}

.mm-pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mm-pagination-btn {
  padding: 8px 16px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 6px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mm-pagination-btn:hover:not(:disabled) {
  background: #4b5563;
  border-color: #6b7280;
}

.mm-pagination-btn:disabled {
  background: #1f2937;
  border-color: #374151;
  color: #6b7280;
  cursor: not-allowed;
}

.mm-pagination-pages {
  display: flex;
  gap: 4px;
  max-width:500px;
}

.mm-pagination-page {
  width: 32px;
  height: 32px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 6px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mm-pagination-page:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.mm-pagination-page.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.mm-pagination-ellipsis {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-weight: 500;
  user-select: none;
  font-size: 12px;
}

/* 网络选择器样式 */
.mm-network-select {
  background: transparent;
  border: #FFFFFF;
  color: #ffffff;
  font-size: inherit;
  font-weight: inherit;
  cursor: pointer;
  outline: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 120px;
}

.mm-network-select:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mm-network-select:focus {
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.mm-network-select option {
  background: #1d1d36;
  color: #ffffff;
  padding: 8px 12px;
}

/* Activity 筛选器样式 */
.mm-activity-filters {
  background: #141426;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.mm-filter-row {
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
}

.mm-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.mm-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mm-filter-select {
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #1f2937;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mm-filter-select:hover {
  border-color: #4b5563;
}

.mm-filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.mm-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-date-input {
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #1f2937;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mm-date-input:hover {
  border-color: #4b5563;
}

.mm-date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.mm-date-separator {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.mm-filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mm-btn.mm-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.mm-btn.mm-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.mm-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.mm-filter-results {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #141426;
  border: 1px solid #374151;
  border-radius: 8px;
  margin-bottom: 16px;
}

.mm-results-count {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.mm-clear-filters-btn {
  background: none;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 6px 12px;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mm-clear-filters-btn:hover {
  background: #374151;
  color: #ffffff;
}

.mm-activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.mm-activity-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mm-activity-header h3 {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.mm-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #9ca3af;
}

.mm-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mm-no-activity {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.mm-no-activity-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.mm-no-activity-sub {
  font-size: 14px;
  margin-top: 8px;
}

.mm-activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mm-activity-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin:5px;
  transition: background-color 0.2s ease;
}

.mm-activity-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.mm-activity-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mm-activity-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-activity-icon {
  font-size: 16px;
}

.mm-activity-title {
  font-weight: 600;
  font-size: 14px;
}

.mm-activity-type.buy .mm-activity-title {
  color: #16a34a;
}

.mm-activity-type.sell .mm-activity-title {
  color: #dc2626;
}

.mm-activity-type.wallet_connect .mm-activity-title {
  color: #16a34a;
}

.mm-activity-type.wallet_disconnect .mm-activity-title {
  color: #dc2626;
}

.mm-activity-type.network_change .mm-activity-title {
  color: #3b82f6;
}

.mm-activity-type.metamask_connect .mm-activity-title {
  color: #16a34a;
}

.mm-activity-type.metamask_disconnect .mm-activity-title {
  color: #dc2626;
}

.mm-activity-type.wallet_status_check .mm-activity-title,
.mm-activity-type.wallet_focus_check .mm-activity-title {
  color: #6b7280;
}

.mm-activity-type.metamask_message .mm-activity-title {
  color: #8b5cf6;
}

.mm-activity-time {
  color: #9ca3af;
  font-size: 12px;
}

.mm-activity-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mm-activity-project,
.mm-activity-project-name,
.mm-activity-amount,
.mm-activity-trade-type,
.mm-activity-timestamp,
.mm-activity-wallet,
.mm-activity-network,
.mm-activity-network-id,
.mm-activity-metamask,
.mm-activity-chain,
.mm-activity-error,
.mm-activity-status,
.mm-activity-message,
.mm-activity-message-text,
.mm-activity-transaction-hash,
.mm-activity-transaction-status,
.mm-activity-transaction-from,
.mm-activity-transaction-to,
.mm-activity-transaction-nonce,
.mm-activity-transaction-token-amount,
.mm-activity-transaction-value,
.mm-activity-transaction-block,
.mm-activity-transaction-fee,
.mm-activity-transaction-gas {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mm-activity-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.mm-activity-value {
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 交易类型特殊样式 */
.mm-trade-buy {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.mm-trade-sell {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.mm-activity-etherscan {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mm-activity-etherscan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
}

.mm-activity-etherscan-info:last-child {
  margin-bottom: 0;
}

.mm-status-success {
  color: #16a34a !important;
}

.mm-status-failed {
  color: #dc2626 !important;
}

.mm-activity-footer {
  margin-top: 12px;
  text-align: right;
}

.mm-etherscan-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.mm-etherscan-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* 网络栏 */
.mm-networkbar{display:flex;align-items:center;justify-content:space-between;margin-top:16px;}
.mm-net-left{font-weight:600;color:#FFFFFF;}
.mm-icon{color:#475569}

/* 浅色主题下的网络栏样式 */
[data-theme="light"] .mm-net-left{
  color: #000000;
}

/* Sort menu */
.mm-sort-menu{position:absolute;right:0;top:36px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);padding:6px;z-index:20;min-width:150px}
.mm-sort-item{display:block;width:100%;text-align:left;background:#fff;border:1px solid transparent;border-radius:8px;padding:6px 10px;cursor:pointer;color:#334155}
.mm-sort-item:hover{background:#f8fafc}
.mm-sort-item.active{border-color:#cbd5e1;background:#f1f5f9}

/* Token 列表 */
.mm-tokenlist{margin-top:8px;border:1px solid #2a2a4a;border-radius:16px;overflow:hidden;background:#1d1d36;}
.mm-token-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #2a2a4a;background:#2a2a4a;}
.mm-token-title{margin:0;font-size:16px;font-weight:600;color:#ffffff;}
.mm-refresh-btn{background:none;border:none;color:#ffffff;cursor:pointer;padding:4px;border-radius:4px;transition:all 0.2s ease;}
.mm-refresh-btn:hover{background:rgba(255,255,255,0.1);}
.mm-refresh-btn:disabled{cursor:not-allowed;opacity:0.5;}
.mm-loading-spinner{animation:spin 1s linear infinite;}
.mm-token{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #2a2a4a;color:#ffffff;}
.mm-token:last-child{border-bottom:none;}
.mm-token-left{display:flex;align-items:center;gap:12px;}
.mm-token-icon{width:36px;height:36px;border-radius:50%;background:#2a2a4a;display:flex;align-items:center;justify-content:center;font-weight:700;color:#FFFFFF;}
.mm-eth{background: radial-gradient(100% 100% at 30% 20%, #cfe3ff 0%, #b9c8ff 40%, #9db4ff 100%);}
.mm-network-icon{
  overflow: hidden;
  padding: 2px;
}
.mm-network-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.mm-token-title{font-weight:600;color:#ffffff;}
.mm-dim{color:#94a3b8;}
.mm-rise{color:#10b981;font-size:12px;margin-top:2px;}
.mm-fall{color:#ef4444;font-size:12px;margin-top:2px;}
.mm-token-right{text-align:right;}
.mm-token-amount{font-size:12px;color:#94a3b8;margin-top:2px;}
.mm-token-sub{font-weight:600;color:#ffffff;}
.mm-token-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 2px;color:#94a3b8;font-size:12px;}
.mm-tip{color:#94a3b8}

/* 浅色主题下的Token列表样式 */
[data-theme="light"] .mm-tokenlist{
border: 1px solid #d1d5db;
background: #ffffff;
}
[data-theme="light"] .mm-token-header{
border-bottom: 1px solid #e5e7eb;
background: #f8fafc;
}
[data-theme="light"] .mm-token-title{
color: #000000;
}
[data-theme="light"] .mm-refresh-btn{
color: #374151;
}
[data-theme="light"] .mm-refresh-btn:hover{
background: rgba(0,0,0,0.05);
}
[data-theme="light"] .mm-token{
border-bottom: 1px solid #e5e7eb;
color: #000000;
}
[data-theme="light"] .mm-token:last-child{
border-bottom: none;
}
[data-theme="light"] .mm-token-icon{
background: #f3f4f6;
color: #374151;
}
[data-theme="light"] .mm-token-title{
color: #000000;
}
[data-theme="light"] .mm-dim{
color: #6b7280;
}
[data-theme="light"] .mm-token-amount{
color: #6b7280;
}
[data-theme="light"] .mm-token-sub{
color: #000000;
}
[data-theme="light"] .mm-token-footer{
color: #6b7280;
}
[data-theme="light"] .mm-tip{
color: #6b7280;
}

/* 提示 */
.mm-warn{color:#b45309;font-size:13px;margin-top:8px;}
.mm-error{color:#dc2626;font-size:13px;margin-top:8px;}

/* 复制成功 Toast */
.mm-toast{position:fixed;left:50%;top:64px;transform:translateX(-50%);background:rgba(15,23,42,.92);color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 6px 18px rgba(2,6,23,.25);z-index:50;font-size:14px}

/* 自定义代币输入样式 */
.mm-custom{
margin-top:12px;
border: 1px solid #2a2a4a;
border-radius: 16px;
padding: 18px 20px 12px 20px;
background: #1d1d36;
}
.mm-custom-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.mm-note{color:var(--muted);font-size:13px}
.mm-input{height:36px;border:1px solid #2a2a4a;border-radius:10px;padding:0 10px;outline:none;background:#1d1d36;color:#ffffff;}
.mm-input::placeholder{color:#94a3b8;}

/* 浅色主题下的自定义代币输入样式 */
[data-theme="light"] .mm-custom{
border: 1px solid #d1d5db;
background: #ffffff;
}
[data-theme="light"] .mm-input{
border: 1px solid #d1d5db;
background: #ffffff;
color: #000000;
}
[data-theme="light"] .mm-input::placeholder{
color: #6b7280;
}

/* 警告信息样式 */
.mm-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.85rem;
}

.mm-warning-icon {
  font-size: 1rem;
}

.mm-warning-text {
  flex: 1;
}

@media (max-width: 900px){
.mm-actions{flex-wrap:wrap;}
.mm-action{flex: 0 0 calc(20% - 16px);}

/* 移动端筛选器适配 */
.mm-filter-row {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.mm-filter-group {
  min-width: auto;
  width: 100%;
}

.mm-filter-actions {
  justify-content: center;
  margin-top: 8px;
}
}

@media (max-width: 768px) {
/* 移动端topbar布局调整 */
.mm-topbar {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.mm-account {
  flex: none;
}

.mm-network-section {
  flex: none;
  justify-content: center;
  height: auto; /* 移动端不需要固定高度 */
}

.mm-network-card {
  min-width: auto;
  width: 100%;
  padding: 12px 16px;
  height: auto; /* 移动端自适应高度 */
}

.mm-network-title {
  font-size: 14px;
}

.mm-network-subtitle {
  font-size: 11px;
}

/* 移动端筛选器进一步优化 */
.mm-activity-filters {
  padding: 12px 30px;
}

/* 手机端页边距 */
.container,
.main-content,
.page-container {
  padding-left: 30px !important;
  padding-right: 30px !important;
}

.card,
.wallet-card {
  margin-left: 30px;
  margin-right: 30px;
  width: calc(100% - 60px);
}

.mm-filter-row {
  gap: 10px;
}

.mm-date-range {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.mm-date-separator {
  text-align: center;
  padding: 4px 0;
}

.mm-filter-actions {
  flex-direction: column;
  gap: 8px;
}

.mm-btn {
  width: 100%;
  justify-content: center;
}

/* 移动端Activity分栏布局 */
.mm-activity-columns {
  grid-template-columns: 1fr;
  gap: 16px;
}

.mm-activity-left,
.mm-activity-right {
  padding: 12px;
}

/* 移动端section header适配 */
.mm-activity-section-header {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.mm-button-group {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.mm-log-status-btn,
.mm-clear-status-btn {
  width: 100%;
  justify-content: center;
}

/* MetaMask交易信息样式 */
.mm-activity-transaction {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.mm-activity-transaction-hash,
.mm-activity-transaction-status,
.mm-activity-transaction-block,
.mm-activity-transaction-from,
.mm-activity-transaction-to,
.mm-activity-transaction-value,
.mm-activity-transaction-fee,
.mm-activity-transaction-gas {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.mm-activity-transaction-hash .mm-activity-value {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
  word-break: break-all;
}

.mm-status-success {
  color: #10b981;
  font-weight: 600;
}

.mm-status-failed {
  color: #ef4444;
  font-weight: 600;
}

/* 移动端分页控件适配 */
.mm-pagination-info {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.mm-pagination-controls {
  flex-wrap: wrap;
  gap: 6px;
}

.mm-pagination-btn {
  flex: 1;
  min-width: 80px;
}

.mm-pagination-pages {
  flex-wrap: wrap;
  justify-content: center;
}
}
</style>