<template>
  <div class="container pf-page">
    <!-- 移动端顶部导航 -->
    <div class="pf-mobile-header">
      <div class="pf-mobile-nav">
        <button class="pf-mobile-menu-btn" @click="toggleMobileSidebar">
          <span class="pf-menu-icon">☰</span>
        </button>
        <h1 class="pf-mobile-title">Portfolio</h1>
        <div class="pf-mobile-actions">
          <button class="pf-mobile-action-btn" @click="showSettings = !showSettings">⚙️</button>
        </div>
      </div>
    </div>

    <!-- 移动端侧边栏遮罩 -->
    <div v-if="mobileSidebarOpen" class="pf-mobile-overlay" @click="closeMobileSidebar"></div>

    <div class="pf-main-content">
      <div class="pf-body">
        <!-- 侧栏：Accounts -->
        <aside class="pf-sidebar" :class="{ 'pf-sidebar-mobile-open': mobileSidebarOpen }">
          <div class="pf-side-head">
            <h2>My Wallet</h2>
            <div class="pf-side-tools">
              <span class="gear" @click="showSettings = !showSettings">⚙️</span>
              <span class="plus" @click="addAccount" title="Add wallets in Wallet page">＋</span>
            </div>
          </div>

          <!-- 账户组 -->
          <div class="pf-acc-group">
            <button class="pf-acc-title" @click="accGroupOpen = !accGroupOpen">
              <span>Decentralized</span>
              <span class="caret" :class="{open: accGroupOpen}">▾</span>
            </button>

            <div v-show="accGroupOpen" class="pf-acc-list">
              <div 
                v-for="account in accounts" 
                :key="account.address" 
                class="pf-acc-item"
                :class="{ active: selectedAccount === account.address }"
                @click="selectAccount(account.address)"
              >
                <div class="pf-avatar">
                  <img 
                    :src="getWalletIcon(account.address)" 
                    :alt="getWalletName(account.address)"
                    class="pf-wallet-icon"
                    @error="handleImageError"
                  />
                </div>
                <div class="pf-acc-info">
                  <div class="pf-acc-name">{{ account.name || getWalletName(account.address) }}</div>
                  <div class="pf-wallet-type">{{ getWalletType(account.address) }}</div>
                  <div class="pf-addr" :title="account.address">
                    {{ formatAddress(account.address) }}
                  </div>
                  <div class="pf-acc-balance">
                    {{ getAccountBalance(account.address) }} {{ nativeSymbol }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 当前选中账户的投资概览 -->
          <div v-if="selectedAccount" class="pf-account-overview">
            <h3>Account Overview</h3>
            
            <!-- 投资统计卡片 -->
            <div class="pf-stats">
              <div class="pf-stat-card">
                <div class="pf-stat-label">Total Investment</div>
                <div class="pf-stat-value">AUD{{ getAccountTotalInvestment(selectedAccount).toFixed(2) }}</div>
              </div>
              <div class="pf-stat-card">
                <div class="pf-stat-label">Interest Income</div>
                <div class="pf-stat-value" :class="{ positive: getAccountTotalGain(selectedAccount) >= 0, negative: getAccountTotalGain(selectedAccount) < 0 }">
                  {{ getAccountTotalGain(selectedAccount) >= 0 ? '+' : '' }}AUD{{ getAccountTotalGain(selectedAccount).toFixed(2) }}
                </div>
              </div>
              <div class="pf-stat-card">
                <div class="pf-stat-label">ROI</div>
                <div class="pf-stat-value" :class="{ positive: getAccountROI(selectedAccount) >= 0, negative: getAccountROI(selectedAccount) < 0 }">
                  {{ getAccountROI(selectedAccount) >= 0 ? '+' : '' }}{{ getAccountROI(selectedAccount).toFixed(2) }}%
                </div>
              </div>
            </div>

            <!-- 资产分布饼图 -->
            <div class="pf-sidebar-pie-section">
              <div class="pf-chart-header">
                <h4>Current Assets Distribution</h4>
              </div>
              <p class="pf-chart-subtitle">All purchased assets across all wallets</p>
              
              <div class="pf-pie-chart-container">
                <div class="pf-pie-chart">
                  <svg viewBox="0 0 200 200" class="pf-pie-svg">
                    <!-- 背景圆环 -->
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="20"
                    />
                    <!-- 数据圆环 -->
                    <circle
                      v-for="(holding, index) in holdings"
                      :key="holding.code"
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      :stroke="getPieColor(index)"
                      stroke-width="20"
                      :stroke-dasharray="getPieDashArray(holding)"
                      :stroke-dashoffset="getPieDashOffset(index)"
                      transform="rotate(-90 100 100)"
                    />
                    <!-- 引导线和百分比标签 -->
                    <g v-for="(holding, index) in holdings" :key="`label-${holding.code}`">
                      <!-- 引导线 -->
                      <line
                        :x1="getLabelPosition(index).startX"
                        :y1="getLabelPosition(index).startY"
                        :x2="getLabelPosition(index).endX"
                        :y2="getLabelPosition(index).endY"
                        :stroke="getPieColor(index)"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                      <!-- 百分比文本 -->
                      <text
                        :x="getLabelPosition(index).textX"
                        :y="getLabelPosition(index).textY"
                        :fill="getPieColor(index)"
                        font-size="20"
                        font-weight="600"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        class="pf-pie-label-text"
                      >
                        {{ getAssetPercentage(holding).toFixed(2) }}%
                      </text>
                    </g>
                  </svg>
                  <div class="pf-pie-center">
                    <div class="pf-pie-total">AUD{{ currentValue.toFixed(2) }}</div>
                    <div class="pf-pie-label">Total Value</div>
                  </div>
                </div>
                
                <!-- 图例 -->
                <div class="pf-chart-legend">
                  <div v-for="(holding, index) in holdings" :key="holding.code" class="pf-legend-item">
                    <div class="pf-legend-left">
                      <div class="pf-legend-color" :style="{ backgroundColor: getPieColor(index) }"></div>
                      <div class="pf-legend-code">{{ holding.code }}</div>
                    </div>
                    <div class="pf-legend-right">
                      <div class="pf-legend-value">AUD{{ (holding.amount * holding.currentPrice).toFixed(2) }}</div>
                      <!-- <div class="pf-legend-percentage">{{ getAssetPercentage(holding).toFixed(2) }}%</div> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 主区域 -->
        <main class="pf-main">
          <!-- 投资概览 -->
          <div class="pf-hero">
            <div class="pf-balance">
              AUD{{ getAccountTotalInvestment(selectedAccount).toFixed(2) }}
            </div>
            <!-- <div class="pf-change">
                AUD{{ currentValue.toFixed(2) }}
            </div> -->
            <!-- <div class="pf-change" :class="{ positive: totalGain >= 0, negative: totalGain < 0 }">
              {{ totalGain >= 0 ? '+' : '' }}AUD{{ totalGain.toFixed(2) }} ({{ roi >= 0 ? '+' : '' }}{{ roi.toFixed(2) }}%)
            </div> -->
          </div>

          <!-- Tabs -->
          <nav class="pf-tabs">
            <button
              v-for="t in tabs"
              :key="t"
              class="pf-tab"
              :class="{active: activeTab===t}"
              @click="activeTab=t"
            >{{ t }}</button>
          </nav>
          
          <!-- 项目详情 -->
          <div v-if="activeTab==='Projects'" class="pf-projects">
            <div v-if="accountProjects.length === 0" class="pf-empty-projects">
              <div class="pf-empty-icon"></div>
              <h4>No project available</h4>
              <p>Complete some trades in the Trade page to see your project dashboard</p>
              <button class="pf-btn pf-btn-primary" @click="goToProjects">
                Browse Projects
              </button>
            </div>
            <div v-else class="pf-projects-grid">
              <div v-for="project in accountProjects" :key="project.code" class="pf-project-card">
                <div class="pf-project-header">
                  <img :src="project.image" :alt="project.code" class="pf-project-image" />
                  <div class="pf-project-info">
                    <h4>{{ project.code }}</h4>
                    <p>{{ project.subtitle }}</p>
                  </div>
                </div>
                <div class="pf-project-metrics">
                  <div class="pf-project-metric">
                    <span class="pf-metric-label">Target Yield</span>
                    <span class="pf-metric-value">{{ project.targetYield }}%</span>
                  </div>
                  <div class="pf-project-metric">
                    <span class="pf-metric-label">Risk Level</span>
                    <span class="pf-metric-value" :class="'risk-' + project.risk">{{ project.risk }}</span>
                  </div>
                  <div class="pf-project-metric" v-if="getProjectHolding(project.code)">
                    <span class="pf-metric-label">Holding Amount</span>
                    <span class="pf-metric-value">{{ getProjectHolding(project.code).currentValue.toFixed(2) }} tokens</span>
                  </div>
                  <div class="pf-project-metric" v-if="getProjectHolding(project.code)">
                    <span class="pf-metric-label">Interest Received</span>
                    <!-- <span class="pf-metric-value">{{ calculateInterestReceived(project.code).toFixed(2) }} tokens</span> -->
                  </div>
                  <div class="pf-project-metric" v-if="getProjectHolding(project.code)">
                    <span class="pf-metric-label">Interest Accrued</span>
                    <!-- <span class="pf-metric-value">{{ calculateInterestAccrued(project.code).toFixed(2) }} tokens</span> -->
                  </div>
                </div>
                <div class="pf-project-actions">
                  <button class="pf-project-btn" @click="goToTrade(project.code)">Buy</button>
                  <button class="pf-project-btn pf-project-btn-secondary" @click="goToDetail(project.code)">Details</button>
                  <button class="pf-project-btn pf-project-btn-interest" @click="sellInterest(project.code)">Sell Interest</button>
                </div>
              </div>
            </div>
          </div>

          <!-- My Watchlist -->
          <div v-if="activeTab==='My Watchlist'" class="pf-watchlist">
            <div class="pf-watchlist-header">
              <h3></h3>
              <div class="pf-watchlist-stats">
                <span class="pf-watchlist-count">{{ watchlistProjects.length }} Projects</span>
              </div>
            </div>
            
            <div v-if="watchlistProjects.length === 0" class="pf-empty-watchlist">
              <div class="pf-empty-icon"></div>
              <h4>No projects in your watchlist</h4>
              <p>Add projects to your watchlist from the Projects page to track them here.</p>
              <button class="pf-btn pf-btn-primary" @click="goToProjects">
                Browse Projects
              </button>
            </div>
            
            <div v-else class="pf-watchlist-grid">
              <div v-for="project in watchlistProjects" :key="project.code" class="pf-watchlist-card">
                <div class="pf-watchlist-card-header">
                  <img :src="project.image || getProjectImage(project.code)" :alt="project.code" class="pf-watchlist-image" />
                  <div class="pf-watchlist-info">
                    <h4>{{ project.code }} • {{ project.name }}</h4>
                    <p>{{ project.subtitle }}</p>
                  </div>
                  <div class="pf-watchlist-actions">
                    <button class="pf-remove-btn" @click="removeFromWatchlist(project.code)" title="Remove from watchlist">
                      ✕
                    </button>
                  </div>
                </div>
                
                <div class="pf-watchlist-metrics">
                  <div class="pf-watchlist-metric">
                    <span class="pf-watchlist-label">LOAN SIZE</span>
                    <span class="pf-watchlist-value">AUD{{ formatNumber(project.loan_amount || 0) }}</span>
                  </div>
                  <div class="pf-watchlist-metric">
                    <span class="pf-watchlist-label">EST. YIELD</span>
                    <span class="pf-watchlist-value" style="color: #16a34a;">{{ project.target_yield }}%</span>
                  </div>
                  <div class="pf-watchlist-metric">
                    <span class="pf-watchlist-label">STATUS</span>
                    <span class="pf-watchlist-value" :style="{ color: getStatusColor(project.status) }">{{ getStatusText(project.status) }}</span>
                  </div>
                </div>
                
                <div class="pf-watchlist-progress">
                  <div class="pf-watchlist-progress-bar">
                    <div class="pf-watchlist-progress-fill" :style="{ width: getWatchlistProgress(project) + '%' }"></div>
                  </div>
                  <div class="pf-watchlist-progress-text">{{ getWatchlistProgress(project) }}% Subscribed</div>
                </div>
                
                <div class="pf-watchlist-actions-bottom">
                  <button class="pf-watchlist-btn pf-watchlist-btn-primary" @click="goToProjectDetail(project.code)">
                    View Details
                  </button>
                  <button v-if="project.status === 'active'" class="pf-watchlist-btn pf-watchlist-btn-secondary" @click="goToTrade(project.code)">
                    Trade
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 项目分析 -->
          <div v-if="activeTab==='Analysis'" class="pf-analysis">
            <!-- 交易分析概览 -->
            <div class="pf-analysis-overview">
              <div class="pf-analysis-header">
                <h3>Transaction Analysis</h3>
                <div class="pf-analysis-actions">
                  <button class="pf-analysis-btn" @click="refreshTransactionData" :disabled="loadingTransactions">
                    <span v-if="loadingTransactions">🔄</span>
                    <span v-else>Refresh</span>
                  </button>
                </div>
              </div>
              
              <!-- 交易统计卡片 -->
              <div class="pf-analysis-stats-four">
                  <div class="pf-analysis-stat-card">
                    <div class="pf-stat-content">
                      <div class="pf-stat-label-inline">Total Transactions: <span class="pf-stat-number">{{ totalTransactionCount }}</span></div>
                    </div>
                  </div>
                  <div class="pf-analysis-stat-card">
                    <div class="pf-stat-content">
                      <div class="pf-stat-label-inline">Buy Orders: <span class="pf-stat-number">{{ totalBuyCount }}</span></div>
                    </div>
                  </div>
                  <div class="pf-analysis-stat-card">
                    <div class="pf-stat-content">
                      <div class="pf-stat-label-inline">Sell Orders: <span class="pf-stat-number">{{ totalSellCount }}</span></div>
                    </div>
                  </div>
                  <div class="pf-analysis-stat-card">
                    <div class="pf-stat-content">
                      <div class="pf-stat-label-inline">Total Value: <span class="pf-stat-number">AUD{{ totalTransactionValue.toFixed(2) }}</span></div>
                    </div>
                  </div>
              </div>
            </div>

            <!-- 按日期和类型分组显示交易 -->
            <div class="pf-transaction-breakdown">
              <div class="pf-breakdown-header">
                <h4>Transaction Breakdown by Date & Type</h4>
                <div class="pf-breakdown-controls">
                  <select v-model="analysisTimeframe" class="pf-select">
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 3 Months</option>
                    <option value="1y">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
              
              <div class="pf-breakdown-content">
                <div v-if="loadingTransactions" class="pf-analysis-loading">
                  <div class="pf-spinner"></div>
                  <span>Loading transaction analysis...</span>
                </div>
                <div v-else-if="transactionBreakdownData.length === 0" class="pf-analysis-empty">
                  <!-- <div class="pf-empty-icon">📊</div> -->
                  <p>No transaction data available</p>
                  <p class="pf-empty-hint">Complete some trades to see detailed analysis</p>
                </div>
                <div v-else class="pf-breakdown-list">
                  <div v-for="dayGroup in transactionBreakdownData" :key="dayGroup.date" class="pf-day-group">
                    <div class="pf-day-header">
                      <div class="pf-day-date">{{ formatAnalysisDate(dayGroup.date) }}</div>
                      <div class="pf-day-summary">
                        <span class="pf-day-total">{{ dayGroup.totalTransactions }} transactions</span>
                        <span class="pf-day-value">AUD{{ dayGroup.totalValue.toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="pf-day-transactions">
                      <div v-for="typeGroup in dayGroup.types" :key="typeGroup.type" class="pf-type-group">
                        <div class="pf-type-header">
                          <div class="pf-type-icon" :class="typeGroup.type">
                            {{ typeGroup.type === 'buy' ? '📈' : '📉' }}
                          </div>
                          <div class="pf-type-info">
                            <div class="pf-type-name">{{ typeGroup.type.toUpperCase() }}</div>
                            <div class="pf-type-count">{{ typeGroup.count }} transactions</div>
                          </div>
                          <div class="pf-type-value">
                            <div class="pf-type-amount">AUD{{ typeGroup.totalAmount.toFixed(2) }}</div>
                            <div class="pf-type-avg">Avg: AUD{{ typeGroup.averageAmount.toFixed(2) }}</div>
                          </div>
                        </div>
                        <div class="pf-type-projects">
                          <div v-for="project in typeGroup.projects" :key="project.projectCode" class="pf-project-summary">
                            <div class="pf-project-info">
                              <div class="pf-project-code">{{ project.projectCode }}</div>
                              <div class="pf-project-name">{{ project.projectName }}</div>
                            </div>
                            <div class="pf-project-stats">
                              <div class="pf-project-count">{{ project.count }} txns</div>
                              <div class="pf-project-value">AUD{{ project.totalAmount.toFixed(2) }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 资产总结图表 -->
            <!-- <div class="pf-asset-summary">
              <div class="pf-summary-header">
                <h3>Asset Summary</h3>
                <div class="pf-summary-stats">
                  <div class="pf-summary-stat">
                    <span class="pf-stat-number">{{ holdings.length }}</span>
                    <span class="pf-stat-label">Assets</span>
                  </div>
                  <div class="pf-summary-stat">
                    <span class="pf-stat-number">AUD{{ currentValue.toFixed(2) }}</span>
                    <span class="pf-stat-label">Total Value</span>
                  </div>
                </div>
              </div> -->
              
              <!-- 交易记录柱状图 -->
              <!-- <div class="pf-transaction-chart">
                <div class="pf-chart-header">
                  <h4>Transaction History</h4>
                  <div class="pf-chart-controls">
                   <select v-model="chartTimeframe" class="pf-select">
                     <option value="3d">Last 3 Days</option>
                     <option value="7d">Last 7 Days</option>
                     <option value="30d">Last 30 Days</option>
                     <option value="90d">Last 3 Months</option>
                     <option value="1y">Last Year</option>
                   </select>
                    <button @click="refreshTransactionData" class="pf-refresh-btn">🔄</button>
                  </div>
                </div>
                
                <!-- 交易摘要统计
                <div class="pf-chart-summary">
                  <!-- <div class="pf-chart-summary-header">
                    <h3>Today's Transactions</h3>
                  </div> 
                  <div class="pf-summary-item">
                    <div class="pf-summary-label">Total</div>
                    <div class="pf-summary-value">
                      {{ todayTransactionStats.totalTransactions.toFixed(2) }} 
                      <!-- (AUD{{ (todayTransactionStats.totalBuy + todayTransactionStats.totalSell).toFixed(2) }}) 
                    </div>
                  </div>
                  <div class="pf-summary-item">
                    <div class="pf-summary-label">Buy</div>
                    <div class="pf-summary-value">
                      {{ todayTransactionStats.totalBuy .toFixed(2)}}
                    </div>
                  </div>
                  <div class="pf-summary-item">
                    <div class="pf-summary-label">Sell</div>
                    <div class="pf-summary-value">
                      {{ todayTransactionStats.totalSell }}
                    </div>
                  </div>
                </div>
                
                <div class="pf-bar-chart-container">
                  <div v-if="loadingTransactions" class="pf-chart-loading">
                    <div class="pf-spinner"></div>
                    <span>Loading transaction data...</span>
                  </div>
                  <div v-else-if="transactionChartData.length === 0" class="pf-chart-empty">
                    <div class="pf-empty-icon"></div>
                    <p>No transaction data available</p>
                  </div>
                  <div v-else class="pf-bar-chart">
                    <div 
                      ref="chartBarsContainer"
                      class="pf-chart-bars"
                      :style="{ '--bar-count': transactionChartData.length }"
                    >
                      <div 
                        v-for="(item, index) in transactionChartData" 
                        :key="index"
                        class="pf-bar-item"
                      >
                        <div class="pf-bar-container">
                          <div class="pf-bar-buy" :style="{ height: getBarHeight(item.cumulativeBuyValue, maxTransactions) + '%' }"></div>
                          <div class="pf-bar-sell" :style="{ height: getBarHeight(item.cumulativeSellValue, maxTransactions) + '%' }"></div>
                        </div>
                        <div class="pf-bar-label">{{ item.date }}</div>
                        <div class="pf-bar-tooltip">
                          <div class="pf-tooltip-buy">Cumulative Buy: AUD{{ item.cumulativeBuyValue.toFixed(2) }}</div>
                          <div class="pf-tooltip-sell">Cumulative Sell: AUD{{ item.cumulativeSellValue.toFixed(2) }}</div>
                          <div class="pf-tooltip-net">Net Value: AUD{{ item.netValue.toFixed(2) }}</div>
                        </div>
                      </div>
                    </div>
                  </div> -->
                  
                  <!-- 折线图 -->
                  <!-- <div v-if="transactionChartData.length > 0" class="pf-line-chart">
                    <div class="pf-line-chart-container">
                      <svg 
                        ref="lineChartSvg"
                        class="pf-line-svg"
                        :viewBox="`0 0 ${lineChartWidth} ${lineChartHeight}`"
                        preserveAspectRatio="none"
                      > -->
                        <!-- 网格线 -->
                        <!-- <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        <!-- Buy折线
                        <polyline
                          :points="buyLinePoints"
                          fill="none"
                          stroke="#10b981"
                          stroke-width="2"
                          class="pf-line-buy"
                        /> 
                        
                        <!-- Sell折线 -->
                        <!-- <polyline
                          :points="sellLinePoints"
                          fill="none"
                          stroke="#ef4444"
                          stroke-width="2"
                          class="pf-line-sell"
                        /> -->
                        
                        <!-- Buy数据点 -->
                        <!-- <circle
                          v-for="(point, index) in buyDataPoints"
                          :key="`buy-${index}`"
                          :cx="point.x"
                          :cy="point.y"
                          r="4"
                          fill="#10b981"
                          class="pf-line-point pf-line-point-buy"
                          @mouseenter="showTooltip($event, point, 'buy')"
                          @mouseleave="hideTooltip"
                        /> -->
                        
                        <!-- Sell数据点 -->
                        <!-- <circle
                          v-for="(point, index) in sellDataPoints"
                          :key="`sell-${index}`"
                          :cx="point.x"
                          :cy="point.y"
                          r="4"
                          fill="#ef4444"
                          class="pf-line-point pf-line-point-sell"
                          @mouseenter="showTooltip($event, point, 'sell')"
                          @mouseleave="hideTooltip"
                        />
                      </svg>
                    </div> -->
                    
                    <!-- 折线图tooltip -->
                    <!-- <div 
                      v-if="lineTooltip.visible"
                      class="pf-line-tooltip"
                      :style="{ 
                        left: lineTooltip.x + 'px', 
                        top: lineTooltip.y + 'px' 
                      }"
                    >
                      <div class="pf-tooltip-content">
                        <div class="pf-tooltip-date">{{ lineTooltip.date }}</div>
                        <div class="pf-tooltip-value" :class="`pf-tooltip-${lineTooltip.type}`">
                          {{ lineTooltip.content }}
                        </div>
                      </div>
                    </div>
                  </div> -->
                  
                  <!-- 统一图例 -->
                  <!-- <div class="pf-unified-legend">
                    <div class="pf-legend-item">
                      <div class="pf-legend-color pf-buy-color"></div>
                      <span>Buy Value (AUD)</span>
                    </div>
                    <div class="pf-legend-item">
                      <div class="pf-legend-color pf-sell-color"></div>
                      <span>Sell Value (AUD)</span>
                    </div>
                  </div> -->
                <!-- </div>
              </div> -->

            <!-- </div>

            <div class="pf-analysis-grid"> -->
              <!-- 收益分布图 -->
              <!-- <div class="pf-analysis-card">
                <h4>Return Distribution</h4>
                <div class="pf-chart-placeholder">
                  <div class="pf-chart-bars">
                    <div v-for="holding in holdings" :key="holding.code" class="pf-chart-bar">
                      <div class="pf-chart-bar-fill" :style="{ height: getPriceBarHeight(holding.change) + '%' }"></div>
                      <div class="pf-chart-bar-label">{{ holding.code }}</div>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- 风险评估 -->
              <!-- <div class="pf-analysis-card">
                <h4>Risk Assessment</h4>
                <div class="pf-risk-metrics">
                  <div class="pf-risk-item">
                    <span class="pf-risk-label">Portfolio Risk</span>
                    <span class="pf-risk-value">{{ portfolioRisk }}</span>
                  </div>
                  <div class="pf-risk-item">
                    <span class="pf-risk-label">Diversification</span>
                    <span class="pf-risk-value">{{ diversification.toFixed(2) }}%</span>
                  </div>
                </div>
              </div> -->

              <!-- 交易建议 -->
              <!-- <div class="pf-analysis-card">
                <h4>Trading Insights</h4>
                <div class="pf-insights">
                  <div v-for="insight in tradingInsights" :key="insight.id" class="pf-insight-item">
                    <div class="pf-insight-icon">{{ insight.icon }}</div>
                    <div class="pf-insight-text">{{ insight.text }}</div>
                  </div>
                </div>
              </div> -->
            
            <!-- </div> -->
          </div>

          <!-- 交易历史 -->
          <div v-if="activeTab==='Transactions'" class="pf-transactions">
            <div class="pf-transactions-header">
              <div class="pf-transactions-actions">
                <button class="pf-filter-btn" @click="showFilters = !showFilters">
                  Filter
                </button>
                <button class="pf-refresh-btn" @click="refreshTransactions" :disabled="loadingTransactions">
                  <span v-if="loadingTransactions">🔄</span>
                  <span v-else>Refresh</span>
                </button>
              </div>
            </div>
            
            <div v-if="showFilters" class="pf-filters">
              <select v-model="filterType" class="pf-filter-select">
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <select v-model="filterProject" class="pf-filter-select">
                <option value="">All Projects</option>
                <option v-for="project in projects" :key="project.code" :value="project.code">
                  {{ project.code }}
                </option>
              </select>
            </div>

            <div class="pf-transactions-list">
              <div v-if="filteredTransactions.length === 0" class="pf-no-transactions">
                <div class="pf-empty-icon"></div>
                <p>No transaction data available</p>
                <p class="pf-empty-hint">Complete some trades in the Trade page to see your transaction history</p>
              </div>
                <div v-else>
                 <div v-for="transaction in filteredTransactions" :key="transaction.id" class="pf-transaction-item">
                    <div class="pf-transaction-icon" :class="transaction.type">
                      {{ transaction.type === 'buy' ? '📈' : '📉' }}
                  </div>
                  <div class="pf-transaction-details">
                    <div class="pf-transaction-title">
                      {{ transaction.type.toUpperCase() }} {{ transaction.amount || transaction.purchase_amount }} {{ transaction.projectCode }}
                    </div>
                    <div class="pf-transaction-subtitle">
                      Project: {{ transaction.projectCode }}
                    </div>
                    <div class="pf-transaction-subtitle" v-if="transaction.trade_type">
                      Type: {{ transaction.trade_type }}
                    </div>
                  </div>
                  <div class="pf-transaction-value">
                    <div class="pf-transaction-time">{{ formatTime(transaction.created_at || transaction.timestamp) }}</div>
                    <div class="pf-transaction-price">Amount: {{ transaction.amount || transaction.purchase_amount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div> 
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useWallet } from '/src/composables/useWallet'
import { useRouter } from 'vue-router'
import { productAPI, transactionAPI } from '@/service/api'
import { useDatabaseSync } from '@/service/dataSyncService.js'

const router = useRouter()
const { fullAddress, shortAddress, connected, nativeBalanceDisplay, nativeSymbol } = useWallet()

// 检查是否有绑定的钱包 - 移除限制，允许页面完全展示
const hasBoundWallets = computed(() => {
  return true // 总是返回true，移除钱包绑定限制
})

// 基础数据
const actions = [
  { text: 'Trade', icon: '📈' },
  { text: 'Swap', icon: '🔄' },
  { text: 'Bridge', icon: '🌉' },
  { text: 'Send', icon: '📤' },
  { text: 'Stake', icon: '🔒' },
]
const tabs = ['Projects', 'My Watchlist', 'Analysis', 'Transactions']
const activeTab = ref('Projects')

// 图表容器引用
const chartBarsContainer = ref(null)

// 时间范围选择器
const timeframes = [
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' }
]
const selectedTimeframe = ref('1d')

// 交易图表相关数据
const chartTimeframe = ref('3d')
const loadingTransactions = ref(false)
const transactionChartData = ref([])

// 分析页面相关数据
const analysisTimeframe = ref('30d')

// 折线图相关数据
const lineChartWidth = ref(800)
const lineChartHeight = ref(200)
const lineTooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  content: '',
  type: ''
})

// 状态管理
const showSettings = ref(false)
const showFilters = ref(false)
const filterType = ref('')
const filterProject = ref('')
const accGroupOpen = ref(true)
const selectedAccount = ref('')

// API交易数据
const apiTransactions = ref([]) // 从API获取的交易数据

// 移动端状态管理
const mobileSidebarOpen = ref(false)

// 数据库同步相关
let unsubscribeProducts = null

// 账户数据 - 从localStorage加载绑定的钱包账户
const accounts = ref([])

// Watchlist 数据
const watchlist = ref([])
const watchlistProjects = ref([])

// 从数据库加载项目数据
async function loadProjects() {
  try {
    projectsLoading.value = true
    projectsError.value = null
    console.log('🔄 PortfolioView: 从数据库加载项目数据...')
    
    const response = await productAPI.getAllProducts()
    
    if (response.status === 0) {
      projects.value = response.data || []
      console.log('✅ PortfolioView: 项目数据加载成功，共', projects.value.length, '个项目')
    } else {
      projectsError.value = response.message || '获取项目数据失败'
      console.error('❌ PortfolioView: API返回错误:', response)
    }
  } catch (error) {
    projectsError.value = '网络错误，无法获取项目数据'
    console.error('❌ PortfolioView: 加载项目数据失败:', error)
  } finally {
    projectsLoading.value = false
  }
}

// 加载 watchlist 数据
function loadWatchlist() {
  try {
    const savedWatchlist = localStorage.getItem('projectWatchlist')
    if (savedWatchlist) {
      watchlist.value = JSON.parse(savedWatchlist)
      console.log('📂 Portfolio loaded watchlist:', watchlist.value)
    } else {
      watchlist.value = []
    }
  } catch (error) {
    console.error('❌ Portfolio: 加载 watchlist 失败:', error)
    watchlist.value = []
  }
}

// 获取 watchlist 中的项目详情
async function loadWatchlistProjects() {
  try {
    if (watchlist.value.length === 0) {
      watchlistProjects.value = []
      return
    }

    console.log('🔄 Portfolio: 加载 watchlist 项目详情...')
    
    // 优先使用已缓存的项目数据
    const cachedProjects = projects.value.length > 0 ? projects.value : null
    
    if (cachedProjects) {
      // 使用缓存的项目数据
      updateWatchlistProjects(cachedProjects)
    } else {
      // 如果没有缓存数据，从API获取
      const response = await productAPI.getAllProducts()
      
      if (response.status === 0) {
        const allProjects = response.data || []
        updateWatchlistProjects(allProjects)
      } else {
        console.error('❌ Portfolio: 获取 watchlist 项目失败:', response)
        watchlistProjects.value = []
      }
    }
  } catch (error) {
    console.error('❌ Portfolio: 加载 watchlist 项目失败:', error)
    watchlistProjects.value = []
  }
}

// 更新 watchlist 项目数据
function updateWatchlistProjects(allProjects) {
  // 过滤出在 watchlist 中的项目，并添加原始数值用于计算
  watchlistProjects.value = allProjects.filter(project => 
    watchlist.value.includes(project.code)
  ).map(project => ({
    ...project,
    // 添加原始数值用于进度计算
    totalOfferingRaw: project.total_offering_token || 0,
    subscribedRaw: project.subscribe_token || 0,
    // 格式化显示字段
    totalOffering: project.total_offering_token ? `AUD${project.total_offering_token.toLocaleString()}` : 'AUD0',
    subscribed: project.subscribe_token ? `AUD${project.subscribe_token.toLocaleString()}` : 'AUD0'
  }))
  
  console.log('✅ Portfolio: watchlist 项目更新成功，共', watchlistProjects.value.length, '个项目')
}

// 从 watchlist 移除项目
function removeFromWatchlist(projectCode) {
  try {
    const index = watchlist.value.indexOf(projectCode)
    if (index > -1) {
      watchlist.value.splice(index, 1)
      localStorage.setItem('projectWatchlist', JSON.stringify(watchlist.value))
      
      // 从 watchlistProjects 中移除
      watchlistProjects.value = watchlistProjects.value.filter(p => p.code !== projectCode)
      
      console.log('✅ Portfolio: 已从 watchlist 移除项目:', projectCode)
    }
  } catch (error) {
    console.error('❌ Portfolio: 移除 watchlist 项目失败:', error)
  }
}

// 获取项目图片
function getProjectImage(code) {
  const imageMap = {
    'RWA001': '/pics/TYMU.png',
    'RWA002': '/pics/SQNB.png',
    'RWA003': '/pics/LZYT.png',
    'YYD': '/pics/YYD.png',
    'COMP': '/pics/TYMU.png'
  }
  return imageMap[code] || '/pics/TYMU.png'
}

// 计算认购进度
function getSubscriptionProgress(product) {
  if (!product) {
    return 0
  }
  
  // 使用原始数值进行计算
  const total = product.totalOfferingRaw || 0
  const subscribed = product.subscribedRaw || 0
  
  if (total === 0) return 0
  
  const progress = (subscribed / total) * 100
  return Math.round(progress * 100) / 100 // 保留两位小数
}

// 计算 watchlist 项目进度
function getWatchlistProgress(product) {
  return getSubscriptionProgress(product)
}

// 格式化数字
function formatNumber(value) {
  if (!value) return '0'
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toLocaleString()
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    'ACTIVE': '#16a34a',
    'INCOMING': '#d97706',
    'PERFORMING': '#2563eb',
    'COMPLETED': '#6b7280',

  }
  return colorMap[status] || '#6b7280'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'ACTIVE': 'Active',
    'INCOMING': 'Incoming',
    'PERFORMING': 'Performing',
    'COMPLETED': 'Completed',
    'active': 'Active',
    'upcoming': 'Upcoming',
    'research': 'Research',
    'planning': 'Planning',
    'completed': 'Completed'
  }
  return statusMap[status] || 'Unknown'
}

// 导航到项目详情
function goToProjectDetail(code) {
  router.push({ name: 'detail', params: { code: code } })
}

// 导航到交易页面
function goToTrade(code) {
  router.push({ name: 'tradeProject', params: { code } })
}

// 导航到项目页面
function goToProjects() {
  router.push({ name: 'projects' })
}

// 从localStorage加载绑定的钱包账户，与WalletView保持一致
function loadBoundAccounts() {
  try {
    const savedAccounts = localStorage.getItem('walletBoundAccounts')
    if (savedAccounts) {
      const boundAddresses = JSON.parse(savedAccounts)
      accounts.value = boundAddresses.map((address, index) => ({
        address: address,
        name: `Wallet ${index + 1}`,
        balance: 0 // 初始余额，后续会从useWallet更新
      }))
      console.log('📂 Portfolio loaded bound accounts:', accounts.value)
    } else {
      // 如果没有绑定的账户，使用当前连接的钱包
      if (fullAddress.value) {
        accounts.value = [{
          address: fullAddress.value,
          name: 'Main Account',
          balance: 0
        }]
        console.log('📂 Portfolio using current connected wallet:', fullAddress.value)
      } else {
        // 如果也没有连接的钱包，提供默认的演示账户
        accounts.value = [{
          address: '0x1234567890123456789012345678901234567890',
          name: 'Demo Account',
          balance: 1.5
        }]
        console.log('📂 Portfolio using demo account for display')
      }
    }
    
    // 更新余额信息
    updateAccountBalances()
    
    // 初始化交易数据
    initializeTransactionData()
    
  } catch (error) {
    console.error('❌ Failed to load bound accounts:', error)
    accounts.value = [{
      address: 'Please connect your wallet',
      name: 'No Account',
      balance: 0
    }]
    // 初始化交易数据
    initializeTransactionData()
  }
}

// 更新账户余额，从useWallet获取真实的余额数据
function updateAccountBalances() {
  accounts.value.forEach(account => {
    // 如果当前账户是连接的钱包，使用useWallet的余额
    if (account.address === fullAddress.value && connected.value) {
      // 从useWallet获取余额
      const balanceInEther = nativeBalanceDisplay.value
      account.balance = parseFloat(balanceInEther) || 0
      console.log(`💰 Updated balance for ${account.address}: ${account.balance} ${nativeSymbol.value}`)
    } else {
      // 对于其他账户，保持现有余额或使用默认值
      if (account.balance === 0) {
        account.balance = Math.random() * 2 // 随机演示余额
      }
    }
  })
}

// 初始化交易数据
function initializeTransactionData() {
  if (accounts.value.length === 0) return
  
  // 为每个账户初始化交易数据
  const newAccountTransactions = {}
  
  accounts.value.forEach((account, index) => {
    if (index === 0) {
      // 第一个账户的交易数据
      newAccountTransactions[account.address] = [
        {
          id: 1,
          type: 'buy',
          projectCode: 'TYMU',
          amount: 100,
          price: 1.00,
          timestamp: Date.now() - 3600000,
        },
        {
          id: 2,
          type: 'buy',
          projectCode: 'SQNB',
          amount: 50,
          price: 1.02,
          timestamp: Date.now() - 7200000,
        }
      ]
    } else if (index === 1) {
      // 第二个账户的交易数据
      newAccountTransactions[account.address] = [
        {
          id: 3,
          type: 'sell',
          projectCode: 'LZYT',
          amount: 25,
          price: 0.98,
          timestamp: Date.now() - 10800000,
        },
        {
          id: 4,
          type: 'buy',
          projectCode: 'YYD',
          amount: 75,
          price: 1.05,
          timestamp: Date.now() - 14400000,
        }
      ]
    } else {
      // 其他账户的交易数据
      newAccountTransactions[account.address] = [
        {
          id: 5,
          type: 'buy',
          projectCode: 'TYMU',
          amount: 200,
          price: 0.99,
          timestamp: Date.now() - 18000000,
        }
      ]
    }
  })
  
  accountTransactions.value = newAccountTransactions
  console.log('📊 Portfolio initialized transaction data:', accountTransactions.value)
}

// 交易数据（按账户分组）- 初始化为空，在loadBoundAccounts后填充
const accountTransactions = ref({})


// 项目数据 - 从数据库获取
const projects = ref([])
const projectsLoading = ref(true)
const projectsError = ref(null)

// 计算属性
const filteredTransactions = computed(() => {
  // 使用从API获取的交易数据
  let filtered = [...apiTransactions.value]
  
  // 如果没有交易数据，返回空数组
  if (filtered.length === 0) {
    console.log('📊 PortfolioView: 没有找到API交易数据')
    return []
  }
  
  // 转换数据格式以匹配模板需求
  filtered = filtered.map(transaction => ({
    id: transaction.id || Date.now() + Math.random(),
    type: transaction.trade_type === 'BUY_TOKEN' ? 'buy' : 'sell',
    projectCode: transaction.project_code,
    projectName: 'Unknown Project', // API只返回project_code，不返回项目名称
    amount: transaction.purchase_amount,
    price: 1.00, // API不返回价格信息
    timestamp: new Date(transaction.created_at).getTime(),
    userAddress: selectedAccount.value
  }))
  
  // 应用筛选器
  if (filterType.value) {
    filtered = filtered.filter(t => t.type === filterType.value)
  }
  
  if (filterProject.value) {
    filtered = filtered.filter(t => t.projectCode === filterProject.value)
  }
  
  // 按时间倒序排列
  return filtered.sort((a, b) => b.timestamp - a.timestamp)
})

// 获取指定账户的最近交易记录
const getRecentTransactions = (accountAddress) => {
  if (!accountAddress || !accountTransactions.value[accountAddress]) {
    // 如果没有选中账户，返回默认的演示交易数据
    return [
      {
        id: Date.now() - 3600000,
        type: 'buy',
        amount: 100,
        projectCode: 'TYMU',
        project_code: 'TYMU',
        project_name: 'St Ives NSW Residential Project',
        price: 1.00,
        timestamp: Date.now() - 3600000
      },
      {
        id: Date.now() - 1800000,
        type: 'sell',
        amount: 50,
        projectCode: 'SQNB',
        project_code: 'SQNB',
        project_name: 'SQNB Property Loan',
        price: 1.02,
        timestamp: Date.now() - 1800000
      }
    ]
  }
  
  // 返回最近的交易记录，按时间倒序排列
  return accountTransactions.value[accountAddress]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5) // 只显示最近5条记录
}

// 从WalletView获取wallet activity数据
const getWalletActivityData = () => {
  try {
    const walletActivity = JSON.parse(localStorage.getItem('walletActivity') || '[]')
    console.log('📊 PortfolioView: 获取到WalletView活动数据:', walletActivity.length, '条记录')
    return walletActivity
  } catch (error) {
    console.error('❌ PortfolioView: 获取wallet activity数据失败:', error)
    return []
  }
}

// 获取指定账户的持仓 - 基于WalletView的transaction activity数据
const getAccountHoldings = (accountAddress) => {
  if (!accountAddress) return []
  
  // 从WalletView获取wallet activity数据
  const walletActivity = getWalletActivityData()
  
  // 筛选出该账户的transaction activity（buy/sell类型）
  const transactionActivities = walletActivity.filter(activity => 
    activity.type === 'buy' || activity.type === 'sell'
  )
  
  console.log('📊 PortfolioView: 账户', accountAddress, '的交易活动:', transactionActivities.length, '条')
  
  const holdingMap = new Map()
  
  // 计算每个项目的持仓
  transactionActivities.forEach(tx => {
    const key = tx.project_code || tx.projectCode
    if (!holdingMap.has(key)) {
      holdingMap.set(key, { code: key, amount: 0, totalCost: 0, totalInvestment: 0 })
    }
    
    const holding = holdingMap.get(key)
    // 获取项目当前价格 - 从数据库获取的项目数据
    const project = projects.value.find(p => p.code === key)
    const currentPrice = project ? (project.currentPrice || 1.00) : 1.00
    
    if (tx.type === 'buy') {
      holding.amount += tx.amount
      holding.totalCost += tx.amount * currentPrice // 使用当前价格计算成本
      holding.totalInvestment += tx.amount * (tx.price || currentPrice) // 使用交易时的价格计算投资
    } else {
      holding.amount -= tx.amount
      holding.totalCost -= tx.amount * currentPrice // 使用当前价格计算成本
      holding.totalInvestment -= tx.amount * (tx.price || currentPrice) // 使用交易时的价格计算投资
    }
  })
  
  // 添加当前价格和变化
  return Array.from(holdingMap.values())
    .filter(h => h.amount > 0)
    .map(holding => {
      const project = projects.value.find(p => p.code === holding.code)
      const currentPrice = project ? (project.currentPrice || 1.00) : 1.00
      const currentValue = holding.amount * currentPrice
      const change = holding.totalInvestment > 0 ? ((currentValue - holding.totalInvestment) / holding.totalInvestment) * 100 : 0
      
      return {
        ...holding,
        currentPrice,
        change
      }
    })
}

// 获取指定账户的总投资 - 基于transaction activity的投资总额
const getAccountTotalInvestment = (accountAddress) => {
  const holdings = getAccountHoldings(accountAddress)
  const totalInvestment = holdings.reduce((sum, holding) => sum + (holding.totalInvestment || 0), 0)
  console.log('💰 PortfolioView: 账户', accountAddress, '总投资:', totalInvestment)
  return totalInvestment
}

// 获取指定账户的当前价值 - 基于transaction activity的当前价值
const getAccountCurrentValue = (accountAddress) => {
  const holdings = getAccountHoldings(accountAddress)
  const currentValue = holdings.reduce((sum, holding) => sum + (holding.amount * holding.currentPrice), 0)
  console.log('📈 PortfolioView: 账户', accountAddress, '当前价值:', currentValue)
  return currentValue
}

// 获取指定账户的总收益 - 基于transaction activity的收益计算
const getAccountTotalGain = (accountAddress) => {
  const currentValue = getAccountCurrentValue(accountAddress)
  const totalInvestment = getAccountTotalInvestment(accountAddress)
  const totalGain = currentValue - totalInvestment
  console.log('📊 PortfolioView: 账户', accountAddress, '总收益:', totalGain, '(当前价值:', currentValue, '- 总投资:', totalInvestment, ')')
  return totalGain
}

// 获取指定项目的holding信息
const getProjectHolding = (projectCode) => {
  if (!selectedAccount.value) return null
  
  const accountHoldings = getAccountHoldings(selectedAccount.value)
  const holding = accountHoldings.find(h => h.code === projectCode)
  
  if (holding) {
    return {
      amount: holding.amount,
      currentPrice: holding.currentPrice,
      currentValue: holding.amount * holding.currentPrice,
      totalInvestment: holding.totalInvestment,
      change: holding.change
    }
  }
  
  return null
}

// 计算项目的interest received amount（已收取利息币）
const calculateInterestReceived = (projectCode) => {
  const holding = getProjectHolding(projectCode)
  if (!holding) return 0
  
  const project = projects.value.find(p => p.code === projectCode)
  if (!project) return 0
  
  // 基于持有金额和项目收益率计算已收到的利息
  const annualYield = project.targetYield || 0
  const monthlyYield = annualYield / 12 / 100
  
  // 假设持有时间为6个月（可以根据实际持有时间调整）
  const holdingMonths = 6
  const interestReceived = holding.amount * holding.currentPrice * monthlyYield * holdingMonths
  
  return interestReceived
}

// 计算项目的interest accrued amount（待收取利息币）
const calculateInterestAccrued = (projectCode) => {
  const holding = getProjectHolding(projectCode)
  if (!holding) return 0
  
  const project = projects.value.find(p => p.code === projectCode)
  if (!project) return 0
  
  // 基于持有金额和项目收益率计算待收取的利息
  const annualYield = project.targetYield || 0
  const monthlyYield = annualYield / 12 / 100
  
  // 计算从上次收取利息到现在的累计利息
  // 假设上次收取是3个月前，现在有3个月的待收取利息
  const accruedMonths = 3
  const interestAccrued = holding.amount * holding.currentPrice * monthlyYield * accruedMonths
  
  return interestAccrued
}

// 获取指定账户的ROI - 基于transaction activity的ROI计算
const getAccountROI = (accountAddress) => {
  const totalInvestment = getAccountTotalInvestment(accountAddress)
  const totalGain = getAccountTotalGain(accountAddress)
  const roi = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0
  console.log('📈 PortfolioView: 账户', accountAddress, 'ROI:', roi.toFixed(2) + '%', '(总收益:', totalGain, '/ 总投资:', totalInvestment, ')')
  return roi
}

// 获取所有在网站购买的所有资产的分布
const getAllAssetsDistribution = () => {
  // 从WalletView获取所有交易活动数据
  const walletActivity = getWalletActivityData()
  
  // 筛选出所有transaction activity（buy/sell类型）
  const transactionActivities = walletActivity.filter(activity => 
    activity.type === 'buy' || activity.type === 'sell'
  )
  
  console.log('📊 PortfolioView: 获取所有资产分布，共', transactionActivities.length, '条交易记录')
  
  const assetMap = new Map()
  
  // 计算每个项目的总持仓（所有账户合并）
  transactionActivities.forEach(tx => {
    const key = tx.project_code || tx.projectCode
    if (!assetMap.has(key)) {
      assetMap.set(key, { 
        code: key, 
        amount: 0, 
        totalCost: 0, 
        totalInvestment: 0,
        projectName: tx.project_name || 'Unknown Project'
      })
    }
    
    const asset = assetMap.get(key)
    // 获取项目当前价格 - 从数据库获取的项目数据
    const project = projects.value.find(p => p.code === key)
    const currentPrice = project ? (project.currentPrice || 1.00) : 1.00
    asset.currentPrice = currentPrice
    
    if (tx.type === 'buy') {
      asset.amount += parseFloat(tx.amount) || 0
      asset.totalCost += (parseFloat(tx.amount) || 0) * (parseFloat(tx.price) || 1.00)
      asset.totalInvestment += (parseFloat(tx.amount) || 0) * (parseFloat(tx.price) || 1.00)
    } else if (tx.type === 'sell') {
      asset.amount -= parseFloat(tx.amount) || 0
      asset.totalCost -= (parseFloat(tx.amount) || 0) * (parseFloat(tx.price) || 1.00)
      // 卖出时，totalInvestment保持不变（已实现投资）
    }
  })
  
  // 过滤掉数量为0或负数的资产
  const validAssets = Array.from(assetMap.values()).filter(asset => asset.amount > 0)
  
  console.log('📊 PortfolioView: 所有资产分布:', validAssets)
  return validAssets
}

// 为了兼容性，保留原有的计算属性（基于当前选中账户或默认数据）
const holdings = computed(() => {
  // 优先显示所有资产的分布
  const allAssets = getAllAssetsDistribution()
  if (allAssets.length > 0) {
    return allAssets
  }
  
  // 如果没有交易数据，返回默认的演示数据
  return [
    { code: 'TYMU', amount: 100, totalCost: 100, currentPrice: 1.00, change: 2.5 },
    { code: 'SQNB', amount: 50, totalCost: 51, currentPrice: 1.02, change: -1.2 },
    { code: 'LZYT', amount: 25, totalCost: 24.5, currentPrice: 0.98, change: 0.8 },
    { code: 'YYD', amount: 75, totalCost: 78.75, currentPrice: 1.05, change: 3.1 }
  ]
})
// 计算所有资产的总投资
const totalInvestment = computed(() => {
  const allAssets = getAllAssetsDistribution()
  if (allAssets.length > 0) {
    const total = allAssets.reduce((sum, asset) => sum + (asset.totalInvestment || 0), 0)
    console.log('💰 PortfolioView: 所有资产总投资:', total)
    return total
  }
  
  if (selectedAccount.value) {
    return getAccountTotalInvestment(selectedAccount.value)
  }
  return 254.25 // 默认总投资
})

// 计算所有资产的当前价值
const currentValue = computed(() => {
  const allAssets = getAllAssetsDistribution()
  if (allAssets.length > 0) {
    const total = allAssets.reduce((sum, asset) => sum + (asset.amount * asset.currentPrice), 0)
    console.log('📈 PortfolioView: 所有资产当前价值:', total)
    return total
  }
  
  if (selectedAccount.value) {
    return getAccountCurrentValue(selectedAccount.value)
  }
  return 267.75 // 默认当前价值
})

// 计算所有资产的总收益
const totalGain = computed(() => {
  const currentVal = currentValue.value
  const investment = totalInvestment.value
  const gain = currentVal - investment
  console.log('📊 PortfolioView: 所有资产总收益:', gain, '(当前价值:', currentVal, '- 总投资:', investment, ')')
  return gain
})

// 计算所有资产的ROI
const roi = computed(() => {
  const investment = totalInvestment.value
  const gain = totalGain.value
  const roiValue = investment > 0 ? (gain / investment) * 100 : 0
  console.log('📈 PortfolioView: 所有资产ROI:', roiValue.toFixed(2) + '%', '(总收益:', gain, '/ 总投资:', investment, ')')
  return roiValue
})

// 获取当前账户下购买的项目
const accountProjects = computed(() => {
  if (!selectedAccount.value) {
    // 如果没有选中账户，返回所有项目作为演示
    return projects.value
  }
  
  const accountHoldings = getAccountHoldings(selectedAccount.value)
  const projectCodes = accountHoldings.map(holding => holding.code)
  
  return projects.value.filter(project => projectCodes.includes(project.code))
})

const portfolioRisk = computed(() => {
  const riskScores = { low: 1, medium: 2, high: 3 }
  const weightedRisk = holdings.value.reduce((sum, holding) => {
    const project = projects.value.find(p => p.code === holding.code)
    const riskScore = project ? riskScores[project.risk] || 2 : 2
    return sum + (riskScore * holding.amount * holding.currentPrice)
  }, 0)
  
  const totalValue = currentValue.value
  if (totalValue === 0) return 'Low'
  
  const avgRisk = weightedRisk / totalValue
  if (avgRisk <= 1.5) return 'Low'
  if (avgRisk <= 2.5) return 'Medium'
  return 'High'
})

const diversification = computed(() => {
  const holdingCount = holdings.value.length
  const maxDiversification = projects.value.length
  return maxDiversification > 0 ? Math.min((holdingCount / maxDiversification) * 100, 100) : 0
})

// 交易图表相关计算属性
const allTransactions = computed(() => {
  // 获取所有账户的交易记录
  const allTxs = []
  Object.values(accountTransactions.value).forEach(accountTxs => {
    allTxs.push(...accountTxs)
  })
  
  // 如果没有交易数据，返回默认的演示数据
  if (allTxs.length === 0) {
    return [
      {
        id: 1,
        type: 'buy',
        projectCode: 'TYMU',
        amount: 100,
        price: 1.00,
        timestamp: Date.now() - 3600000,
      },
      {
        id: 2,
        type: 'buy',
        projectCode: 'SQNB',
        amount: 50,
        price: 1.02,
        timestamp: Date.now() - 7200000,
      },
      {
        id: 3,
        type: 'sell',
        projectCode: 'LZYT',
        amount: 25,
        price: 0.98,
        timestamp: Date.now() - 10800000,
      },
      {
        id: 4,
        type: 'buy',
        projectCode: 'YYD',
        amount: 75,
        price: 1.05,
        timestamp: Date.now() - 14400000,
      }
    ]
  }
  
  return allTxs
})

const maxTransactions = computed(() => {
  if (transactionChartData.value.length === 0) return 1
  // 基于累计价值计算最大值
  return Math.max(...transactionChartData.value.map(item => item.cumulativeBuyValue + item.cumulativeSellValue))
})

// 折线图数据点计算
const buyDataPoints = computed(() => {
  if (transactionChartData.value.length === 0) return []
  
  const data = transactionChartData.value
  const maxValue = maxTransactions.value
  const padding = 20
  const chartWidth = lineChartWidth.value - padding * 2
  const chartHeight = lineChartHeight.value - padding * 2
  
  return data.map((item, index) => ({
    x: data.length === 1 ? padding + chartWidth / 2 : padding + (index * chartWidth) / (data.length - 1),
    y: padding + chartHeight - (item.cumulativeBuyValue / maxValue) * chartHeight,
    value: item.cumulativeBuyValue,
    date: item.date,
    count: item.buy
  }))
})

const sellDataPoints = computed(() => {
  if (transactionChartData.value.length === 0) return []
  
  const data = transactionChartData.value
  const maxValue = maxTransactions.value
  const padding = 20
  const chartWidth = lineChartWidth.value - padding * 2
  const chartHeight = lineChartHeight.value - padding * 2
  
  return data.map((item, index) => ({
    x: data.length === 1 ? padding + chartWidth / 2 : padding + (index * chartWidth) / (data.length - 1),
    y: padding + chartHeight - (item.cumulativeSellValue / maxValue) * chartHeight,
    value: item.cumulativeSellValue,
    date: item.date,
    count: item.sell
  }))
})

// 折线路径点
const buyLinePoints = computed(() => {
  return buyDataPoints.value.map(point => `${point.x},${point.y}`).join(' ')
})

const sellLinePoints = computed(() => {
  return sellDataPoints.value.map(point => `${point.x},${point.y}`).join(' ')
})

// 当天交易统计（基于实际交易数据）
const todayTransactionStats = computed(() => {
  if (transactionChartData.value.length === 0) {
    console.log('📊 当天交易统计: 无交易数据')
    return {
      totalBuy: 0,
      totalSell: 0,
      totalTransactions: 0,
      buyPercentage: 0,
      sellPercentage: 0
    }
  }
  
  // 获取今天的数据（最后一个数据点）
  const todayData = transactionChartData.value[transactionChartData.value.length - 1]
  console.log('📊 当天交易统计: 今天数据', todayData)
  
  const totalBuy = todayData.cumulativeBuyValue || 0
  const totalSell = todayData.cumulativeSellValue || 0
  const totalTransactions = totalBuy + totalSell
  
  const stats = {
    totalBuy,
    totalSell,
    totalTransactions,
    buyPercentage: totalTransactions > 0 ? (totalBuy / totalTransactions) * 100 : 0,
    sellPercentage: totalTransactions > 0 ? (totalSell / totalTransactions) * 100 : 0
  }
  
  console.log('📊 当天交易统计: 计算结果', stats)
  return stats
})

// 总交易统计
const totalTransactionCount = computed(() => {
  return filteredTransactions.value.length
})

const totalBuyCount = computed(() => {
  return filteredTransactions.value.filter(tx => tx.type === 'buy').length
})

const totalSellCount = computed(() => {
  return filteredTransactions.value.filter(tx => tx.type === 'sell').length
})

const totalTransactionValue = computed(() => {
  return filteredTransactions.value.reduce((total, tx) => total + parseFloat(tx.amount || 0), 0)
})

// 交易分析数据 - 按日期和类型分组
const transactionBreakdownData = computed(() => {
  if (filteredTransactions.value.length === 0) return []
  
  // 根据时间范围过滤交易
  const now = new Date()
  const filteredTxs = filteredTransactions.value.filter(tx => {
    if (analysisTimeframe.value === 'all') return true
    
    const txDate = new Date(tx.timestamp)
    const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24))
    
    switch (analysisTimeframe.value) {
      case '7d': return daysDiff <= 7
      case '30d': return daysDiff <= 30
      case '90d': return daysDiff <= 90
      case '1y': return daysDiff <= 365
      default: return true
    }
  })
  
  // 按日期分组
  const groupedByDate = {}
  filteredTxs.forEach(tx => {
    const dateKey = new Date(tx.timestamp).toISOString().split('T')[0]
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = []
    }
    groupedByDate[dateKey].push(tx)
  })
  
  // 转换为数组并按日期排序
  return Object.entries(groupedByDate)
    .map(([date, transactions]) => {
      // 按类型分组
      const groupedByType = {}
      transactions.forEach(tx => {
        if (!groupedByType[tx.type]) {
          groupedByType[tx.type] = []
        }
        groupedByType[tx.type].push(tx)
      })
      
      // 计算每种类型的统计信息
      const types = Object.entries(groupedByType).map(([type, txs]) => {
        // 按项目分组
        const groupedByProject = {}
        txs.forEach(tx => {
          const key = tx.projectCode || 'Unknown'
          if (!groupedByProject[key]) {
            groupedByProject[key] = []
          }
          groupedByProject[key].push(tx)
        })
        
        // 计算项目统计
        const projects = Object.entries(groupedByProject).map(([projectCode, projectTxs]) => {
          const totalAmount = projectTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
          return {
            projectCode,
            projectName: projectTxs[0].projectName || 'Unknown Project',
            count: projectTxs.length,
            totalAmount
          }
        })
        
        const totalAmount = txs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
        const averageAmount = txs.length > 0 ? totalAmount / txs.length : 0
        
        return {
          type,
          count: txs.length,
          totalAmount,
          averageAmount,
          projects
        }
      })
      
      const totalTransactions = transactions.length
      const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
      
      return {
        date,
        totalTransactions,
        totalValue,
        types
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排列
})

// 基于All Assets Distribution的交易统计
const assetBasedTransactionStats = computed(() => {
  const currentVal = currentValue.value
  const totalInv = totalInvestment.value
  const gain = currentVal - totalInv
  
  return {
    totalBuy: Math.max(totalInv, currentVal * 0.8),
    totalSell: Math.max(0, gain * 0.3),
    netValue: Math.max(totalInv, currentVal * 0.8) - Math.max(0, gain * 0.3),
    buyPercentage: currentVal > 0 ? ((Math.max(totalInv, currentVal * 0.8) / currentVal) * 100) : 0,
    sellPercentage: currentVal > 0 ? ((Math.max(0, gain * 0.3) / currentVal) * 100) : 0
  }
})

const tradingInsights = computed(() => {
  const insights = []
  
  if (totalGain.value > 0) {
    insights.push({
      id: 1,
      icon: '📈',
      text: `Portfolio is up ${roi.value.toFixed(1)}%. Consider taking some profits.`
    })
  } else {
    insights.push({
      id: 1,
      icon: '📉',
      text: `Portfolio is down ${Math.abs(roi.value).toFixed(1)}%. Consider dollar-cost averaging.`
    })
  }
  
  if (diversification.value < 50) {
    insights.push({
      id: 2,
      icon: '⚠️',
      text: 'Low diversification. Consider spreading risk across more projects.'
    })
  }
  
  const bestPerformer = holdings.value.reduce((best, current) => 
    current.change > best.change ? current : best, holdings.value[0] || { change: 0, code: '' })
  
  if (bestPerformer.change > 5) {
    insights.push({
      id: 3,
      icon: '🎯',
      text: `${bestPerformer.code} is performing well (+${bestPerformer.change.toFixed(1)}%). Consider increasing allocation.`
    })
  }
  
  return insights
})

// 方法
const handleAction = (action) => {
  switch (action) {
    case 'Buy':
    case 'Sell':
      router.push('/listedprojects')
      break
    case 'Swap':
      router.push('/swap')
      break
    case 'Bridge':
      router.push('/bridge')
      break
    case 'Send':
      router.push('/send')
      break
    case 'Stake':
      router.push('/wallet')
      break
  }
}

// 账户管理方法
const selectAccount = async (accountAddress) => {
  selectedAccount.value = accountAddress
  console.log('📂 Portfolio selected account:', accountAddress)
  
  // 切换账户时重新加载交易数据
  await loadTransactionsFromAPI()
}

const addAccount = () => {
  // 在Portfolio中不能添加新账户，只能显示在Wallet中绑定的账户
  alert('请在Wallet页面绑定新的钱包账户。Portfolio只显示已绑定的钱包。')
}

// 移动端侧边栏控制
const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

// 跳转到Wallet页面
const goToWallet = () => {
  router.push('/wallet')
}

// 刷新绑定钱包状态
const refreshBoundWallets = () => {
  console.log('🔄 Refreshing bound wallets...')
  loadBoundAccounts()
  
  if (accounts.value.length > 0) {
    console.log('✅ Found bound wallets:', accounts.value.length)
    // 如果有绑定的钱包，选择第一个
    if (accounts.value.length > 0) {
      selectedAccount.value = accounts.value[0].address
    }
    // 更新余额信息
    updateAccountBalances()
  } else {
    console.log('ℹ️ No bound wallets found')
  }
}

// 处理钱包断开连接
const handleWalletDisconnect = () => {
  console.log('🔌 Handling wallet disconnect...')
  
  // 清空当前选中的账户（如果它是连接的钱包）
  if (selectedAccount.value === fullAddress.value) {
    selectedAccount.value = null
  }
  
  // 更新账户列表，移除连接的钱包
  accounts.value = accounts.value.filter(account => account.address !== fullAddress.value)
  
  // 如果还有绑定的账户，选择第一个
  if (accounts.value.length > 0) {
    selectedAccount.value = accounts.value[0].address
  } else {
    // 如果没有绑定的账户，提供默认演示账户
    accounts.value = [{
      address: '0x1234567890123456789012345678901234567890',
      name: 'Demo Account',
      balance: 1.5
    }]
    selectedAccount.value = accounts.value[0].address
  }
  
  // 刷新交易数据
  refreshTransactionData()
  
  console.log('✅ Wallet disconnect handled, current accounts:', accounts.value.length)
}

// 处理钱包重新连接
const handleWalletReconnect = () => {
  console.log('🔌 Handling wallet reconnect...')
  
  // 重新加载绑定的账户
  loadBoundAccounts()
  
  // 如果当前连接的钱包在绑定列表中，选择它
  const connectedAccount = accounts.value.find(account => account.address === fullAddress.value)
  if (connectedAccount) {
    selectedAccount.value = connectedAccount.address
  } else if (accounts.value.length > 0) {
    // 否则选择第一个账户
    selectedAccount.value = accounts.value[0].address
  }
  
  // 更新余额信息
  updateAccountBalances()
  
  // 刷新交易数据
  refreshTransactionData()
  
  console.log('✅ Wallet reconnect handled, selected account:', selectedAccount.value)
}

// 处理钱包地址变化
const handleWalletAddressChange = (newAddress) => {
  console.log('🔄 Handling wallet address change to:', newAddress)
  
  // 更新账户列表中的地址
  const oldAccount = accounts.value.find(account => account.address === fullAddress.value)
  if (oldAccount) {
    oldAccount.address = newAddress
    selectedAccount.value = newAddress
  }
  
  // 更新余额信息
  updateAccountBalances()
  
  // 刷新交易数据
  refreshTransactionData()
  
  console.log('✅ Wallet address change handled')
}

const formatAddress = (address) => {
  if (!address) return '—'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 获取钱包图标
const getWalletIcon = (address) => {
  if (!address) return '/icons/login-wallet-icon.png'
  
  // 从localStorage获取连接的钱包类型
  const connectedWallet = localStorage.getItem('connectedWallet')
  
  if (connectedWallet === 'metamask') {
    return '/icons/metamask.png'
  } else if (connectedWallet === 'okx') {
    return '/icons/okx.png'
  } else if (connectedWallet === 'binance') {
    return '/icons/binance.png'
  } else if (connectedWallet === 'phantom') {
    return '/icons/phantom.png'
  }
  
  // 默认图标
  return '/icons/login-wallet-icon.png'
}

// 获取钱包名称
const getWalletName = (address) => {
  if (!address) return 'Unknown Wallet'
  
  const connectedWallet = localStorage.getItem('connectedWallet')
  
  if (connectedWallet === 'metamask') {
    return 'MetaMask'
  } else if (connectedWallet === 'okx') {
    return 'OKX Wallet'
  } else if (connectedWallet === 'binance') {
    return 'Binance Wallet'
  } else if (connectedWallet === 'phantom') {
    return 'Phantom'
  }
  
  return 'Wallet'
}

// 获取钱包类型
const getWalletType = (address) => {
  if (!address) return 'Unknown'
  
  const connectedWallet = localStorage.getItem('connectedWallet')
  
  if (connectedWallet === 'metamask') {
    return 'EVM Wallet'
  } else if (connectedWallet === 'okx') {
    return 'EVM Wallet'
  } else if (connectedWallet === 'binance') {
    return 'EVM Wallet'
  } else if (connectedWallet === 'phantom') {
    return 'Solana Wallet'
  }
  
  return 'Wallet'
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/icons/login-wallet-icon.png'
}

const getAccountBalance = (accountAddress) => {
  const account = accounts.value.find(acc => acc.address === accountAddress)
  if (!account) return '0.0000'
  
  // 如果当前账户是连接的钱包，使用useWallet的实时余额
  if (accountAddress === fullAddress.value && connected.value) {
    const balanceInEther = nativeBalanceDisplay.value
    return parseFloat(balanceInEther).toFixed(4)
  }
  
  // 对于其他账户，返回存储的余额
  return account.balance.toFixed(4)
}

const refreshPortfolio = async () => {
  // 从数据库重新加载项目数据
  await loadProjects()
  
  // 模拟价格更新（如果需要的话）
  // projects.value.forEach(project => {
  //   const change = (Math.random() - 0.5) * 0.1 // ±5% change
  //   project.currentPrice *= (1 + change)
  //   project.change = change * 100
  // })
}

// 从API获取交易数据
const loadTransactionsFromAPI = async () => {
  try {
    console.log('📊 PortfolioView: 从API获取交易数据...')
    console.log('📊 PortfolioView: 当前选中的账户:', selectedAccount.value)
    
    // 如果没有选中的账户，使用当前连接的钱包地址
    const targetAddress = selectedAccount.value || fullAddress.value
    
    if (!targetAddress) {
      console.log('⚠️ PortfolioView: 没有可用的钱包地址，跳过交易数据获取')
      apiTransactions.value = []
      return
    }
    
    const params = {
      userAddress: targetAddress,
      limit: 100,
      offset: 0
    }
    
    console.log('📊 PortfolioView: 请求参数:', params)
    
    const response = await transactionAPI.getTransactionHistory(params)
    
    if (response.status === 0) {
      apiTransactions.value = response.data || []
      console.log('✅ PortfolioView: 成功获取', apiTransactions.value.length, '条交易记录')
      console.log('📊 PortfolioView: 交易记录详情:', apiTransactions.value)
    } else {
      console.error('❌ PortfolioView: 获取交易数据失败:', response.message)
      apiTransactions.value = []
    }
    
  } catch (error) {
    console.error('❌ PortfolioView: 获取交易数据异常:', error)
    apiTransactions.value = []
  }
}

// 刷新交易数据
const refreshTransactions = async () => {
  loadingTransactions.value = true
  try {
    console.log('🔄 PortfolioView: 刷新交易数据...')
    
    // 从API获取交易数据
    await loadTransactionsFromAPI()
    
    console.log('📊 PortfolioView: 获取到', apiTransactions.value.length, '条交易记录')
    
  } catch (error) {
    console.error('❌ PortfolioView: 刷新交易数据失败:', error)
  } finally {
    loadingTransactions.value = false
  }
}

// 交易图表相关方法
const refreshTransactionData = async () => {
  loadingTransactions.value = true
  try {
    await generateTransactionChartData()
  } catch (error) {
    console.error('Failed to refresh transaction data:', error)
  } finally {
    loadingTransactions.value = false
  }
}

const generateTransactionChartData = async () => {
  console.log('📊 PortfolioView: 基于Current Assets生成交易图表数据')
  
  // 获取当前资产分布数据
  const currentHoldings = holdings.value
  console.log('📊 PortfolioView: 当前资产分布:', currentHoldings)
  
  // 获取时间范围
  const days = getDaysFromTimeframe(chartTimeframe.value)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - ((days - 1) * 24 * 60 * 60 * 1000))
  
  console.log('📅 PortfolioView: 日期范围设置:', {
    days: days,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  })
  
  // 从WalletView获取真实交易活动数据
  const walletActivity = getWalletActivityData()
  const transactionActivities = walletActivity.filter(activity => 
    activity.type === 'buy' || activity.type === 'sell'
  )
  
  console.log('📊 PortfolioView: 获取到真实交易数据', transactionActivities.length, '条记录')
  
  // 按日期分组交易数据
  const groupedData = new Map()
  
  // 初始化所有日期，从startDate到endDate（包括今天）
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
    const dateKey = date.toISOString().split('T')[0]
    groupedData.set(dateKey, { 
      date: formatDateLabel(date), 
      dateKey: dateKey,
      buy: 0, 
      sell: 0,
      buyAmount: 0,  // 买入数量累计
      sellAmount: 0, // 卖出数量累计
      buyValue: 0,   // 买入价值累计
      sellValue: 0   // 卖出价值累计
    })
  }
  
  // 处理真实交易数据
  if (transactionActivities.length > 0) {
    transactionActivities.forEach(tx => {
      const txDate = new Date(tx.timestamp)
      const dateKey = txDate.toISOString().split('T')[0]
      
      // 只处理在时间范围内的交易
      if (groupedData.has(dateKey)) {
        const dayData = groupedData.get(dateKey)
        const amount = parseFloat(tx.amount) || 0
        const price = parseFloat(tx.price) || 1.00
        const value = amount * price
        
        if (tx.type === 'buy') {
          dayData.buy++
          dayData.buyAmount += amount
          dayData.buyValue += value
        } else if (tx.type === 'sell') {
          dayData.sell++
          dayData.sellAmount += amount
          dayData.sellValue += value
        }
      }
    })
  }
  
  // 如果没有真实交易数据，基于Current Assets生成模拟数据
  if (transactionActivities.length === 0 && currentHoldings.length > 0) {
    console.log('📊 PortfolioView: 无真实交易数据，基于Current Assets生成模拟数据')
    
    // 计算总资产价值
    const totalAssetValue = currentHoldings.reduce((sum, holding) => 
      sum + (holding.amount * holding.currentPrice), 0
    )
    
    // 为每个资产生成历史交易数据
    currentHoldings.forEach((holding, index) => {
      const assetValue = holding.amount * holding.currentPrice
      const assetPercentage = (assetValue / totalAssetValue) * 100
      
      // 为每个资产生成过去几天的交易数据
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
        const dateKey = date.toISOString().split('T')[0]
        const dayData = groupedData.get(dateKey)
        
        if (dayData) {
          // 根据资产价值和时间衰减生成交易数据
          const timeDecay = Math.max(0.1, 1 - (i / days) * 0.8)
          const randomFactor = 0.5 + Math.random() * 1.0
          
          // 计算当天的交易价值（基于资产百分比）
          const dailyValue = (assetValue * assetPercentage / 100) * timeDecay * randomFactor * 0.1
          
          // 随机决定是买入还是卖出
          const isBuy = Math.random() > 0.3 // 70%概率是买入
          
          if (isBuy) {
            dayData.buy++
            dayData.buyAmount += dailyValue / holding.currentPrice
            dayData.buyValue += dailyValue
          } else {
            const sellValue = dailyValue * 0.6
            dayData.sell++
            dayData.sellAmount += sellValue / holding.currentPrice
            dayData.sellValue += sellValue
          }
        }
      }
    })
  }
  
  // 计算累计值
  let cumulativeBuyValue = 0
  let cumulativeSellValue = 0
  let cumulativeBuyAmount = 0
  let cumulativeSellAmount = 0
  
  // 转换为数组并排序，同时计算累计值
  const sortedData = Array.from(groupedData.values()).sort((a, b) => {
    return new Date(a.dateKey) - new Date(b.dateKey)
  })
  
  // 为每个数据点添加累计值
  transactionChartData.value = sortedData.map(dayData => {
    cumulativeBuyValue += dayData.buyValue
    cumulativeSellValue += dayData.sellValue
    cumulativeBuyAmount += dayData.buyAmount
    cumulativeSellAmount += dayData.sellAmount
    
    return {
      ...dayData,
      cumulativeBuyValue,
      cumulativeSellValue,
      cumulativeBuyAmount,
      cumulativeSellAmount,
      netValue: cumulativeBuyValue - cumulativeSellValue
    }
  })
  
  console.log('📊 PortfolioView: 交易图表数据生成完成，共', transactionChartData.value.length, '个数据点')
  console.log('📊 PortfolioView: 累计买入价值:', cumulativeBuyValue)
  console.log('📊 PortfolioView: 累计卖出价值:', cumulativeSellValue)
  console.log('📊 PortfolioView: 净价值:', cumulativeBuyValue - cumulativeSellValue)
  
  // 滚动到最右侧显示最新数据
  scrollChartToRight()
}

const getDaysFromTimeframe = (timeframe) => {
  switch (timeframe) {
    case '3d': return 3
    case '7d': return 7
    case '30d': return 30
    case '90d': return 90
    case '1y': return 365
    default: return 3
  }
}

const formatDateLabel = (date) => {
  const now = new Date()
  // 重置时间到午夜，确保日期比较准确
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = today - targetDate
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // 根据时间范围显示不同的日期格式
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  
  // 对于3天内的数据，显示具体日期
  if (diffDays <= 3) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }
  
  // 对于一周内的数据，显示星期和日期
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }
  
  // 对于更长时间范围，显示月日
  if (diffDays < 30) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }
  
  // 对于更长时间范围，显示月年
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: '2-digit'
  })
}

const getBarHeight = (value, max) => {
  if (max === 0) return 0
  // 调整计算方式，为标签留出更多空间
  // 使用80%的最大高度，为标签预留20%空间
  const maxHeight = 80
  const minHeight = value > 0 ? 8 : 0 // 提高最小高度
  return Math.max((value / max) * maxHeight, minHeight)
}

// 计算交易百分比
const getTransactionPercentage = (item, maxTransactions) => {
  if (maxTransactions === 0) return 0
  const totalValue = item.buyValue + item.sellValue
  const percentage = (totalValue / maxTransactions) * 100
  return percentage.toFixed(1)
}

// 折线图tooltip显示
const showTooltip = (event, point, type) => {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.pf-line-chart-container')
  const containerRect = container.getBoundingClientRect()
  
  lineTooltip.value = {
    visible: true,
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top - 50,
    content: `${type === 'buy' ? 'Buy' : 'Sell'}: ${point.count} (AUD${point.value.toFixed(2)})`,
    type: type,
    date: point.date
  }
}

// 折线图tooltip隐藏
const hideTooltip = () => {
  lineTooltip.value.visible = false
}

// 滚动图表到最右侧
const scrollChartToRight = () => {
  nextTick(() => {
    const container = chartBarsContainer.value
    if (container) {
      container.scrollLeft = container.scrollWidth - container.clientWidth
    }
  })
}

// 计算总买入价值 - 基于All Assets Distribution
const getTotalBuyValue = () => {
  // 优先使用图表数据，如果没有则基于资产分布计算
  if (transactionChartData.value.length > 0) {
    return transactionChartData.value.reduce((sum, item) => sum + item.buyValue, 0)
  }
  
  // 基于资产分布计算总买入价值
  const totalInvestment = totalInvestment.value
  const currentVal = currentValue.value
  return Math.max(totalInvestment, currentVal * 0.8) // 假设80%是买入
}

// 计算总卖出价值 - 基于All Assets Distribution
const getTotalSellValue = () => {
  // 优先使用图表数据，如果没有则基于资产分布计算
  if (transactionChartData.value.length > 0) {
    return transactionChartData.value.reduce((sum, item) => sum + item.sellValue, 0)
  }
  
  // 基于资产分布计算总卖出价值
  const currentVal = currentValue.value
  const totalInvestment = totalInvestment.value
  const gain = currentVal - totalInvestment
  return Math.max(0, gain * 0.3) // 假设30%的收益被卖出
}

// 计算净价值 - 基于All Assets Distribution
const getNetValue = () => {
  const buyValue = getTotalBuyValue()
  const sellValue = getTotalSellValue()
  return buyValue - sellValue
}

const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// 格式化分析页面日期
const formatAnalysisDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 检查是否是今天
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  
  // 检查是否是昨天
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // 返回格式化的日期
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const getPriceBarHeight = (change) => {
  const maxChange = Math.max(...holdings.value.map(h => Math.abs(h.change)), 1)
  return Math.min(Math.abs(change) / maxChange * 100, 100)
}

// 饼图相关方法
const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

const getPieColor = (index) => {
  return pieColors[index % pieColors.length]
}

const getAssetPercentage = (holding) => {
  if (currentValue.value === 0) return 0
  return (holding.amount * holding.currentPrice / currentValue.value) * 100
}

const getPieDashArray = (holding) => {
  const percentage = getAssetPercentage(holding)
  const circumference = 2 * Math.PI * 80 // r = 80
  const dashLength = (percentage / 100) * circumference
  return `${dashLength} ${circumference}`
}

const getPieDashOffset = (index) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    const holding = holdings.value[i]
    const percentage = getAssetPercentage(holding)
    const circumference = 2 * Math.PI * 80
    offset -= (percentage / 100) * circumference
  }
  return offset
}

// 计算标签位置和引导线
const getLabelPosition = (index) => {
  const holding = holdings.value[index]
  const percentage = getAssetPercentage(holding)
  
  // 计算当前扇形的起始角度和中心角度
  let startAngle = 0
  for (let i = 0; i < index; i++) {
    const prevHolding = holdings.value[i]
    const prevPercentage = getAssetPercentage(prevHolding)
    startAngle += (prevPercentage / 100) * 360
  }
  
  const centerAngle = startAngle + (percentage / 100) * 360 / 2
  const angleInRadians = (centerAngle - 90) * Math.PI / 180 // 转换为弧度，-90度是因为从顶部开始
  
  // 饼图中心点
  const centerX = 100
  const centerY = 100
  const radius = 80
  
  // 扇形边缘点
  const edgeX = centerX + Math.cos(angleInRadians) * radius
  const edgeY = centerY + Math.sin(angleInRadians) * radius
  
  // 引导线终点（稍微向外延伸）
  const labelDistance = 50
  const endX = centerX + Math.cos(angleInRadians) * (radius + labelDistance)
  const endY = centerY + Math.sin(angleInRadians) * (radius + labelDistance)
  
  return {
    startX: edgeX,
    startY: edgeY,
    endX: endX,
    endY: endY,
    textX: endX,
    textY: endY
  }
}

// 折线图相关方法
const generatePriceHistory = (holding, timeframe) => {
  const points = 6
  const history = []
  const basePrice = holding.currentPrice
  const volatility = 0.1 // 10% 波动率
  
  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.5) * volatility
    const price = basePrice * (1 + randomChange)
    history.push({
      time: i,
      price: Math.max(price, basePrice * 0.8) // 最低不低于当前价格的80%
    })
  }
  
  // 确保最后一个点是当前价格
  history[points - 1] = {
    time: points - 1,
    price: basePrice
  }
  
  return history
}



const goToDetail = (code) => {
  router.push({ name: 'detail', params: { code } })
}

const sellInterest = (code) => {
  // 跳转到交易页面，并设置交易类型为出售利息
  router.push({ 
    name: 'tradeProject', 
    params: { code },
    query: { type: 'sell', interest: true }
  })
}

// 生命周期
let priceUpdateInterval

onMounted(async () => {
  // 先加载项目数据
  await loadProjects()
  
  // 加载 watchlist 数据
  loadWatchlist()
  await loadWatchlistProjects()
  
  // 设置数据库同步
  setupDatabaseSync()
  
  // 加载绑定的钱包账户
  loadBoundAccounts()
  
  // 初始化交易图表数据
  await generateTransactionChartData()
  
  // 初始化选中账户
  if (accounts.value.length > 0) {
    selectedAccount.value = accounts.value[0].address
  }
  
  // 加载交易数据
  await loadTransactionsFromAPI()
  refreshTransactionData()
  
  // 每30秒更新一次价格
  priceUpdateInterval = setInterval(refreshPortfolio, 30000)
  
  // 监听WalletView的wallet activity变化
  window.addEventListener('walletActivityUpdated', handleWalletActivityUpdate)
  
  // 监听wallet连接状态变化
  window.addEventListener('walletConnected', handleWalletReconnect)
  window.addEventListener('walletDisconnected', handleWalletDisconnect)
  window.addEventListener('walletAddressChanged', (event) => {
    console.log('🔄 Wallet address changed event received:', event.detail)
    handleWalletAddressChange(event.detail.newAddress)
  })
  
  // 监听ethereum provider事件
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('🔄 Ethereum accounts changed:', accounts)
      if (accounts && accounts.length > 0) {
        handleWalletAddressChange(accounts[0])
      } else {
        handleWalletDisconnect()
      }
    })
    
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('🔄 Ethereum chain changed:', chainId)
      // 链变化时刷新数据
      refreshTransactionData()
    })
  }
  
  // 监听时间范围变化
  watch(chartTimeframe, async () => {
    console.log('📊 PortfolioView: 时间范围变化，重新生成图表数据:', chartTimeframe.value)
    await generateTransactionChartData()
  })
  
  // 测试数据关联 - 检查是否能正确读取WalletView的transaction activity
  const walletActivity = getWalletActivityData()
  const transactionActivities = walletActivity.filter(activity => 
    activity.type === 'buy' || activity.type === 'sell'
  )
  
  console.log('🚀 PortfolioView初始化: 检测到WalletView交易活动数据:', transactionActivities.length, '条')
  if (transactionActivities.length > 0) {
    console.log('📊 PortfolioView: 交易活动详情:', transactionActivities)
    console.log('💰 PortfolioView: 计算的总投资:', getAccountTotalInvestment(selectedAccount.value))
    console.log('📈 PortfolioView: 计算的当前价值:', getAccountCurrentValue(selectedAccount.value))
    console.log('📊 PortfolioView: 计算的总收益:', getAccountTotalGain(selectedAccount.value))
    console.log('📈 PortfolioView: 计算的ROI:', getAccountROI(selectedAccount.value))
  }
  
  // 监听路由变化，当用户点击portfolio导航时自动刷新
  watch(() => router.currentRoute.value.path, (newPath, oldPath) => {
    if (newPath === '/portfolio' && newPath !== oldPath) {
      console.log('🔄 PortfolioView: 检测到portfolio页面访问，自动刷新数据...')
      refreshPortfolio()
      refreshTransactions()
    }
  }, { immediate: false })
})

// 设置数据库同步
const setupDatabaseSync = () => {
  const { subscribeProducts, getLastRefreshTime } = useDatabaseSync()
  
  // 订阅产品数据更新
  unsubscribeProducts = subscribeProducts((products) => {
    console.log('📡 PortfolioView: 收到产品数据更新，共', products.length, '个项目')
    projects.value = products
    
    // 同时更新 watchlist 项目数据
    if (watchlist.value.length > 0) {
      updateWatchlistProjects(products)
    }
  })
  
  // 设置最后刷新时间
  const lastRefresh = getLastRefreshTime()
  if (lastRefresh) {
    console.log('🕐 PortfolioView: 最后刷新时间:', lastRefresh)
  }
}

// 清理数据库同步
const cleanupDatabaseSync = () => {
  if (unsubscribeProducts) {
    unsubscribeProducts()
  }
}

// 处理WalletView的wallet activity更新
const handleWalletActivityUpdate = (event) => {
  console.log('🔄 PortfolioView: 检测到WalletView交易活动更新:', event.detail)
  
  // 强制重新计算所有相关数据
  // Vue的响应式系统会自动更新依赖这些数据的计算属性
  
  // 测试数据关联是否正确工作
  const walletActivity = getWalletActivityData()
  const transactionActivities = walletActivity.filter(activity => 
    activity.type === 'buy' || activity.type === 'sell'
  )
  
  console.log('📊 PortfolioView: 当前交易活动数据:', transactionActivities.length, '条')
  console.log('💰 PortfolioView: 计算的总投资:', getAccountTotalInvestment(selectedAccount.value))
  console.log('📈 PortfolioView: 计算的当前价值:', getAccountCurrentValue(selectedAccount.value))
  console.log('📊 PortfolioView: 计算的总收益:', getAccountTotalGain(selectedAccount.value))
  console.log('📈 PortfolioView: 计算的ROI:', getAccountROI(selectedAccount.value))
}

onUnmounted(() => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
  }
  
  // 清理数据库同步
  cleanupDatabaseSync()
  
  // 移除事件监听器
  window.removeEventListener('walletActivityUpdated', handleWalletActivityUpdate)
  window.removeEventListener('walletConnected', handleWalletReconnect)
  window.removeEventListener('walletDisconnected', handleWalletDisconnect)
  window.removeEventListener('walletAddressChanged', handleWalletAddressChange)
  
  // 移除ethereum provider事件监听器
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', handleWalletAddressChange)
    window.ethereum.removeListener('chainChanged', refreshTransactionData)
  }
  
  // 移除resize监听器
  window.removeEventListener('resize', updateLineChartWidth)
})

  // 监听时间范围变化，更新交易图表数据
  watch(chartTimeframe, () => {
    refreshTransactionData()
  })
  
  // 监听窗口大小变化，调整折线图宽度
  const updateLineChartWidth = () => {
    const container = document.querySelector('.pf-line-chart-container')
    if (container) {
      lineChartWidth.value = container.offsetWidth
    }
  }
  
  window.addEventListener('resize', updateLineChartWidth)
  nextTick(() => {
    updateLineChartWidth()
  })
  
  // 监听资产分布变化，实时更新交易图表数据
  watch(holdings, () => {
    console.log('📊 PortfolioView: 资产分布变化，重新生成交易图表数据')
    refreshTransactionData()
  }, { deep: true })

// 监听useWallet状态变化，实时更新余额和dashboard数据
watch([fullAddress, nativeBalanceDisplay, connected], (newValues, oldValues) => {
  const [newAddress, newBalance, newConnected] = newValues
  const [oldAddress, oldBalance, oldConnected] = oldValues || [null, null, null]
  
  console.log('🔄 Wallet state changed:', {
    connected: { from: oldConnected, to: newConnected },
    address: { from: oldAddress, to: newAddress },
    balance: { from: oldBalance, to: newBalance }
  })
  
  // 更新账户余额
  updateAccountBalances()
  
  // 如果钱包断开连接，清空相关数据
  if (oldConnected && !newConnected) {
    console.log('🔌 Wallet disconnected, clearing dashboard data...')
    handleWalletDisconnect()
  }
  
  // 如果钱包重新连接，刷新数据
  if (!oldConnected && newConnected) {
    console.log('🔌 Wallet reconnected, refreshing dashboard data...')
    handleWalletReconnect()
  }
  
  // 如果地址变化，更新选中的账户
  if (oldAddress && newAddress && oldAddress !== newAddress) {
    console.log('🔄 Wallet address changed, updating selected account...')
    handleWalletAddressChange(newAddress)
  }
}, { deep: true })

// 监听localStorage中绑定账户的变化
// 查看合约详情
const viewContract = (transaction) => {
  console.log('📄 查看合约详情:', transaction)
  // 跳转到合约页面，传递交易信息
  router.push({
    path: '/contract',
    query: {
      projectCode: transaction.projectCode,
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      timestamp: transaction.timestamp
    }
  })
}

window.addEventListener('storage', (e) => {
  if (e.key === 'walletBoundAccounts') {
    console.log('🔄 Detected wallet bound accounts change, reloading...')
    loadBoundAccounts()
    // 如果当前选中的账户被移除，选择第一个可用账户
    if (accounts.value.length > 0 && !accounts.value.find(acc => acc.address === selectedAccount.value)) {
      selectedAccount.value = accounts.value[0].address
    }
  }
})
</script>

<style scoped>
/* Portfolio页面主题适配 */
.pf-page {
  --pf-bg: var(--bg);
  --pf-panel: var(--card-bg);
  --pf-text: var(--text);
  --pf-muted: var(--text-secondary);
  --pf-muted-2: var(--text-secondary);
  --pf-border: var(--border);
  --pf-shadow: var(--shadow);
  --pf-primary: #3b82f6;
  --pf-primary-ink: #1e40af;
  --pf-danger: #ef4444;
}

/* No Wallet Page Styles */
.pf-no-wallet-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--pf-bg);
}

.pf-no-wallet-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.pf-no-wallet-hero {
  margin-bottom: 40px;
}

.pf-no-wallet-icon {
  margin-bottom: 24px;
}

.pf-wallet-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: block;
}

.pf-no-wallet-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--pf-text);
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pf-no-wallet-description {
  font-size: 1.2rem;
  color: var(--pf-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.pf-no-wallet-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.pf-feature-card {
  background: var(--pf-panel);
  border: 1px solid var(--pf-border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: var(--pf-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pf-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(15,23,42,.15);
}

.pf-feature-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.pf-feature-card h3 {
  color: var(--pf-text);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.pf-feature-card p {
  color: var(--pf-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.pf-no-wallet-actions {
  margin: 40px 0;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.pf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.pf-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pf-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.pf-btn-secondary {
  background: var(--pf-panel);
  color: var(--pf-text);
  border: 1px solid var(--pf-border);
  box-shadow: var(--pf-shadow);
}

.pf-btn-secondary:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15,23,42,.1);
}

.pf-btn-icon {
  width: 20px;
  height: 20px;
}

.pf-no-wallet-help {
  margin-top: 40px;
  padding: 24px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.pf-no-wallet-help h4 {
  color: var(--pf-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.pf-no-wallet-help ol {
  list-style: none;
  padding: 0;
  counter-reset: step-counter;
}

.pf-no-wallet-help li {
  color: var(--pf-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 12px;
  padding-left: 32px;
  position: relative;
  counter-increment: step-counter;
}

.pf-no-wallet-help li::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  background: #9ab3dc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.pf-no-wallet-help strong {
  color: var(--pf-text);
  font-weight: 600;
}

/* Responsive styles */
@media (max-width: 768px) {
  .pf-no-wallet-page {
    padding: 16px;
  }
  
  .pf-no-wallet-title {
    font-size: 2rem;
  }
  
  .pf-no-wallet-description {
    font-size: 1.1rem;
  }
  
  .pf-no-wallet-features {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .pf-feature-card {
    padding: 20px;
  }
  
  .pf-no-wallet-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .pf-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pf-no-wallet-title {
    font-size: 1.8rem;
  }
  
  .pf-no-wallet-description {
    font-size: 1rem;
  }
  
  .pf-no-wallet-help {
    padding: 20px;
  }
}
.pf-page{background:var(--pf-bg);min-height:100vh;color:var(--pf-text);}
.pf-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;position:sticky;top:0;z-index:10;background:var(--pf-bg);}
.pf-actions{display:flex;gap:12px;flex-wrap:wrap;}
.pf-pill{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:14px;background:var(--pf-panel);border:1px solid var(--pf-border);box-shadow:var(--pf-shadow);font-weight:600;cursor:pointer;color:var(--pf-text);}
.pf-pill-ico{width:22px;height:22px;display:grid;place-items:center;border-radius:999px;background:var(--bg-secondary);}
.pf-pill:hover{transform:translateY(-1px)}
.pf-add{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:14px;background:var(--pf-panel);border:1px solid var(--pf-border);box-shadow:var(--pf-shadow);font-weight:600;cursor:pointer;color:var(--pf-text);}
.pf-add-ico{font-size:18px;line-height:1}
.pf-body{display:grid;grid-template-columns:280px 1fr;gap:16px;padding:0 20px 24px;margin-top: 30px;;}
.pf-sidebar{margin-left:50px;margin-top:17px;width:300px;background:var(--pf-panel);border:1px solid var(--pf-border);border-radius:16px;box-shadow:var(--pf-shadow);padding:16px;}
.pf-side-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.pf-side-head h2{font-size:20px;font-weight:800;color:var(--pf-text);}
.pf-side-tools{display:flex;gap:10px;color:var(--pf-muted)}
.pf-acc-group{margin-top:8px;}
.pf-acc-title{font-size:16px;width:100%;display:flex;align-items:center;justify-content:space-between;background:transparent;border:none;padding:6px 6px;border-radius:10px;cursor:pointer;font-weight:600;color:var(--pf-text);}
.caret{transition:.2s transform ease}
.caret.open{transform:rotate(180deg)}
.pf-acc-item{display:flex;align-items:center;gap:10px;margin-top:8px;padding:8px;border-radius:10px;background:var(--bg-secondary)}
.pf-avatar{width:28px;height:28px;border-radius:50%;background:var(--bg-secondary);box-shadow: inset 0 0 0 2px var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;}
.pf-wallet-icon{width:20px;height:20px;border-radius:50%;object-fit:cover;}
.pf-addr{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;color:var(--pf-muted)}

.pf-main{width:800px;background:var(--pf-panel);border:1px solid var(--pf-border);border-radius:16px;box-shadow:var(--pf-shadow);padding:16px 18px;margin-left:66px;margin-top:16px;}
.pf-hero{padding:8px 4px 12px;border-bottom:1px solid var(--pf-border)}
.pf-balance{font-size:56px;font-weight:900;letter-spacing:-.02em;display:flex;align-items:center;gap:10px;color:var(--pf-text);}
.pf-eye{border:none;background:transparent;cursor:pointer;font-size:20px;color:var(--pf-text);}
.pf-change{color:var(--pf-danger);font-weight:600;margin-top:4px}
.pf-tabs{display:flex;gap:32px;margin-top:8px;}
.pf-tab{appearance:none;background:none;border:none;cursor:pointer;padding:14px 0;font-weight:700;color:var(--pf-muted);position:relative;}
.pf-tab.active{color:var(--pf-primary)}
.pf-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--pf-primary);border-radius:3px;}
.pf-toolbar{display:flex;gap:14px;align-items:center;padding:16px 0;}
.pf-chip{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--pf-border);background:var(--pf-panel);border-radius:999px;box-shadow:var(--pf-shadow);font-weight:600;cursor:pointer;color:var(--pf-text);}
.pf-chip-ghost{background:var(--bg-secondary);color:var(--pf-text);border-color:var(--pf-border)}
.pf-chip-text{white-space:nowrap}
.pf-chain-badges{display:flex;align-items:center;margin-left:-4px}
.pf-badge{width:24px;height:24px;border-radius:999px;display:grid;place-items:center;background:var(--bg-secondary);margin-left:-6px;border:2px solid var(--pf-panel);font-size:12px}
.pf-badge.eth{background:#dbeafe}
.pf-badge.op{background:#ffe4e6}
.pf-badge.arb{background:#dcfce7}
.pf-badge.more{background:#e2e8f0}
.pf-chip-caret{color:var(--pf-muted-2)}
.pf-empty{display:grid;place-items:center;padding:48px 0 56px;text-align:center;gap:16px}
.pf-empty-ico{font-size:40px;color:var(--pf-text);}
.pf-empty-title{font-weight:800;font-size:20px;color:var(--pf-text);}
.pf-cta{padding:12px 18px;border-radius:12px;background:var(--bg-secondary);color:var(--pf-text);border:1px solid var(--pf-border);box-shadow:var(--pf-shadow);cursor:pointer}
.pf-cta:hover{opacity:.9}
.pf-placeholder{padding:18px}
.pf-card{border:1px solid var(--pf-border);border-radius:12px;padding:16px;background:var(--pf-panel);color:var(--pf-muted)}

/* 账户管理样式 */
.pf-acc-list{margin-top:8px;}
.pf-acc-item{display:flex;align-items:center;gap:12px;margin-bottom:8px;padding:12px;border-radius:12px;cursor:pointer;transition:all 0.2s ease;border:1px solid transparent;}
.pf-acc-item:hover{background:var(--hover-bg);border-color:var(--pf-border);}
.pf-acc-item.active{background:var(--pf-primary);border-color:var(--pf-primary);}
.pf-acc-info{flex:1;}
.pf-acc-name{font-weight:600;color:var(--pf-text);margin-bottom:2px;}
.pf-wallet-type{font-size:10px;color:var(--pf-muted);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;}
.pf-acc-balance{font-size:12px;color:var(--pf-muted);margin-top:2px;}
.pf-avatar{width:32px;height:32px;border-radius:50%;background:var(--bg-secondary);box-shadow: inset 0 0 0 2px var(--pf-border);display:flex;align-items:center;justify-content:center;overflow:hidden;}
.pf-wallet-icon{width:24px;height:24px;border-radius:50%;object-fit:cover;}

/* 账户概览样式 */
.pf-account-overview{margin-top:20px;padding-top:20px;border-top:1px solid var(--pf-border);}
.pf-account-overview h3{margin-bottom:12px;font-size:16px;font-weight:700;color:var(--pf-text);}
.pf-account-overview h4{margin-bottom:8px;font-size:14px;font-weight:600;color:var(--pf-text);}

/* 统计卡片样式 */
.pf-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
.pf-stat-card{padding:12px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--pf-border);}
.pf-stat-label{font-size:11px;color:var(--pf-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;}
.pf-stat-value{font-size:14px;font-weight:700;color:var(--pf-text);}
.pf-stat-value.positive{color:#16a34a;}
.pf-stat-value.negative{color:#dc2626;}

/* 最近交易记录样式 - 与TradeProjectView保持一致 */
.pf-holdings{margin-top:16px;}
.no-trades{text-align:center;color:var(--pf-muted);font-size:14px;padding:20px 0;}
.pf-trade-item{padding:12px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--pf-border);margin-bottom:8px;}
.pf-trade-item:last-child{margin-bottom:0;}
.pf-trade-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.pf-trade-type{padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;}
.pf-trade-type.buy{background:#dcfce7;color:#16a34a;}
.pf-trade-type.sell{background:#fee2e2;color:#dc2626;}
.pf-trade-time{font-size:11px;color:var(--pf-muted);}
.pf-trade-info{display:flex;flex-direction:column;gap:4px;}
.pf-trade-project-section,.pf-trade-amount-section{display:flex;justify-content:space-between;align-items:center;}
.pf-label{font-size:12px;color:var(--pf-muted);font-weight:500;}
.pf-value{font-size:12px;color:var(--pf-text);font-weight:600;}

/* 交易历史样式 */
.pf-transactions-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.pf-transactions-header h3{margin:0;font-size:18px;font-weight:700;color:var(--pf-text);}
.pf-transactions-actions{display:flex;gap:8px;align-items:center;}
.pf-filter-btn{padding:6px 12px;border:1px solid var(--pf-border);border-radius:8px;background:var(--bg-secondary);color:var(--pf-text);cursor:pointer;font-size:14px;}
.pf-filter-btn:hover{background:var(--hover-bg);}
.pf-refresh-btn{padding:6px 12px;border:1px solid var(--pf-border);border-radius:8px;background:var(--bg-secondary);color:var(--pf-text);cursor:pointer;font-size:14px;transition:all 0.2s ease;}
.pf-refresh-btn:hover:not(:disabled){background:var(--hover-bg);}
.pf-refresh-btn:disabled{opacity:0.6;cursor:not-allowed;}

.pf-filters{display:flex;gap:12px;margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:10px;}
.pf-filter-select{padding:6px 10px;border:1px solid var(--pf-border);border-radius:6px;background:var(--pf-panel);color:var(--pf-text);font-size:14px;}

.pf-transaction-item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:var(--pf-panel);border:1px solid var(--pf-border);margin-bottom:8px;}
.pf-transaction-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;}
.pf-transaction-icon.buy{background:#dcfce7;color:#16a34a;}
.pf-transaction-icon.sell{background:#fee2e2;color:#dc2626;}
.pf-transaction-details{flex:1;}
.pf-transaction-title{font-weight:600;color:var(--pf-text);margin-bottom:2px;}
.pf-transaction-subtitle{font-size:12px;color:var(--pf-muted);margin-bottom:4px;}
.pf-transaction-time{font-size:12px;color:var(--pf-muted);}
.pf-transaction-value{text-align:right;}
.pf-transaction-price{font-weight:600;color:var(--pf-text);}
.pf-transaction-total{font-size:12px;color:var(--pf-muted);margin-top:2px;}

/* 空状态样式 */
.pf-no-transactions{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;}
.pf-empty-icon{font-size:48px;margin-bottom:16px;opacity:0.5;}
.pf-no-transactions p{margin:8px 0;color:var(--pf-muted);}
.pf-empty-hint{font-size:14px;color:var(--pf-muted);}

/* 资产总结图表样式 */
.pf-asset-summary{margin-bottom:24px;padding:20px;border-radius:16px;background:var(--pf-panel);border:1px solid var(--pf-border);max-width: 820px;}
.pf-summary-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.pf-summary-header h3{margin:0;font-size:20px;font-weight:700;color:var(--pf-text);}
.pf-summary-stats{display:flex;gap:24px;}
.pf-summary-stat{
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pf-stat-number{display:block;font-size:18px;font-weight:700;color:var(--pf-text);margin-bottom:4px;}
.pf-stat-number.positive{color:#16a34a;}
.pf-stat-number.negative{color:#dc2626;}
.pf-stat-label{font-size:12px;color:var(--pf-muted);text-transform:uppercase;letter-spacing:0.5px;}

/* 交易图表样式 */
.pf-transaction-chart{
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 16px;
  background: var(--pf-panel);
  border: 1px solid var(--pf-border);
}

/* 图表摘要样式 */
.pf-chart-summary{
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--pf-border);
}

.pf-chart-summary-header{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.pf-chart-summary-header h3{
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--pf-text);
  text-align: center;
}

.pf-summary-item{
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pf-summary-label{
  font-size: 12px;
  color: var(--pf-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.pf-summary-value{
  font-size: 16px;
  font-weight: 700;
  color: var(--pf-text);
  text-align: center;
}

.pf-summary-value.pf-buy-color{
  color: #10b981;
}

.pf-summary-value.pf-sell-color{
  color: #ef4444;
}

.pf-summary-value.pf-positive{
  color: #10b981;
}

.pf-summary-value.pf-negative{
  color: #ef4444;
}

.pf-chart-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pf-chart-header h4{
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--pf-text);
}

.pf-chart-controls{
  display: flex;
  align-items: center;
  gap: 12px;
}

.pf-select{
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--pf-border);
  background: var(--bg-secondary);
  color: var(--pf-text);
  font-size: 14px;
  cursor: pointer;
}

.pf-refresh-btn{
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--pf-border);
  background: var(--bg-secondary);
  color: var(--pf-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.pf-refresh-btn:hover{
  background: #374151;
  color: #5a5757;
}

.pf-bar-chart-container{
  margin-top: 16px;
}

.pf-chart-loading{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #9ca3af;
}

.pf-spinner{
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pf-chart-empty{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #9ca3af;
}

.pf-empty-icon{
  font-size: 32px;
  opacity: 0.5;
}

.pf-bar-chart{
  position: relative;
  width: 100%;
  overflow-x: auto;
}

/* 确保7天数据能够完整显示 */
.pf-chart-bars[style*="--bar-count: 7"] {
  min-width: 100%;
  justify-content: space-between;
  gap: 6px; /* 减少gap以节省空间 */
  padding-left: 8px;
  padding-right: 8px;
}

/* 7天数据的特殊优化 */
.pf-chart-bars[style*="--bar-count: 7"] .pf-bar-item {
  flex: 1 1 auto;
  min-width: 45px;
  max-width: 75px;
  width: auto; /* 让flex自动计算宽度 */
}

.pf-chart-bars{
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 320px; /* 增加高度为数据标签留出更多空间 */
  padding: 30px 16px 40px 16px; /* 顶部增加padding为数据标签留空间 */
  border-bottom: 1px solid #374151;
  border-left: 1px solid #374151;
  min-width: 100%;
  overflow-x: auto;
  justify-content: space-between; /* 确保柱子均匀分布 */
}

.pf-bar-item{
  flex: 0 0 auto;
  min-width: 32px;
  max-width: 120px;
  width: calc(100% / var(--bar-count, 7));
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: width 0.3s ease;
}

/* 根据数据点数量调整柱状图宽度 */
.pf-chart-bars[style*="--bar-count: 3"] .pf-bar-item {
  width: calc((100% - 16px) / 3); /* 减去gap的总宽度 */
  min-width: 60px;
  max-width: 120px;
  flex: 1;
}

/* 7天样式已在上面的特殊优化中定义 */

.pf-chart-bars[style*="--bar-count: 30"] .pf-bar-item {
  width: calc((100% - 232px) / 30); /* 减去gap的总宽度 */
  min-width: 20px;
  max-width: 40px;
  flex: 1;
}

.pf-chart-bars[style*="--bar-count: 90"] .pf-bar-item {
  width: calc((100% - 712px) / 90); /* 减去gap的总宽度 */
  min-width: 12px;
  max-width: 20px;
  flex: 1;
}

.pf-chart-bars[style*="--bar-count: 365"] .pf-bar-item {
  width: calc((100% - 2912px) / 365); /* 减去gap的总宽度 */
  min-width: 8px;
  max-width: 12px;
  flex: 1;
}

.pf-bar-container{
  position: relative;
  width: 100%;
  height: 280px; /* 调整高度与图表高度匹配 */
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.pf-bar-buy{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  background: #10b981;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s ease;
  min-height: 2px;
}

.pf-bar-sell{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  background: #ef4444;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s ease;
  min-height: 2px;
}

.pf-bar-item:hover .pf-bar-buy{
  background: #059669;
}

.pf-bar-item:hover .pf-bar-sell{
  background: #dc2626;
}



.pf-bar-label{
  margin-top: 20px; /* 增加上边距 */
  font-size: 11px; /* 稍微减小字体以适应更多数据 */
  color: #ffffff; /* 改为白色，更清晰 */
  text-align: center;
  white-space: nowrap; /* 防止标签换行 */
  overflow: hidden; /* 隐藏溢出文本 */
  text-overflow: ellipsis; /* 用省略号表示溢出 */
  max-width: 100%; /* 确保标签不超出容器 */
  font-weight: 500; /* 增加字体粗细 */
  background: rgba(0, 0, 0, 0.3); /* 添加半透明背景 */
  padding: 2px 4px; /* 添加内边距 */
  border-radius: 4px; /* 添加圆角 */
}

.pf-bar-tooltip{
  position: absolute;
  bottom: 30;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #ffffff;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
}

.pf-bar-item:hover .pf-bar-tooltip{
  opacity: 1;
}

.pf-tooltip-buy{
  color: #10b981;
  margin-bottom: 2px;
}

.pf-tooltip-sell{
  color: #ef4444;
  margin-bottom: 2px;
}

.pf-tooltip-total{
  color: #ffffff;
  font-weight: 600;
  border-top: 1px solid #374151;
  padding-top: 4px;
  margin-top: 4px;
}

.pf-chart-legend{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 100%;
}

.pf-legend-item{
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ffffff;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.pf-legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.pf-legend-color{
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.pf-buy-color{
  background: #10b981;
}

.pf-sell-color{
  background: #ef4444;
}

/* 响应式设计 - 移动设备 */
@media (max-width: 768px) {
  .pf-chart-bars {
    gap: 4px;
    padding: 0 8px;
  }
  
  .pf-bar-item {
    min-width: 24px;
    max-width: 60px;
  }
  
  .pf-chart-bars[style*="--bar-count: 3"] .pf-bar-item {
    min-width: 48px;
  }
  
  .pf-chart-bars[style*="--bar-count: 7"] .pf-bar-item {
    min-width: 35px;
    max-width: 55px;
    flex: 1 1 auto;
  }
  
  .pf-chart-bars[style*="--bar-count: 30"] .pf-bar-item {
    min-width: 16px;
  }
  
  .pf-chart-bars[style*="--bar-count: 90"] .pf-bar-item {
    min-width: 10px;
  }
  
  .pf-chart-bars[style*="--bar-count: 365"] .pf-bar-item {
    min-width: 6px;
  }
  
  
  
  .pf-bar-label {
    font-size: 9px; /* 移动设备上更小的字体 */
    margin-top: 8px; /* 减少上边距 */
    color: #ffffff; /* 保持白色 */
    font-weight: 500; /* 保持字体粗细 */
  }
}

/* 小屏幕设备 */
@media (max-width: 480px) {
  .pf-chart-bars {
    gap: 2px;
    padding: 0 4px;
  }
  
  .pf-bar-item {
    min-width: 20px;
    max-width: 40px;
  }
  
  .pf-chart-bars[style*="--bar-count: 3"] .pf-bar-item {
    min-width: 40px;
  }
  
  .pf-chart-bars[style*="--bar-count: 7"] .pf-bar-item {
    min-width: 30px;
    max-width: 45px;
    flex: 1 1 auto;
  }
  
  .pf-chart-bars[style*="--bar-count: 30"] .pf-bar-item {
    min-width: 12px;
  }
  
  .pf-chart-bars[style*="--bar-count: 90"] .pf-bar-item {
    min-width: 8px;
  }
  
  .pf-chart-bars[style*="--bar-count: 365"] .pf-bar-item {
    min-width: 4px;
  }
  
  /* 折线图响应式样式 */
  .pf-line-chart-container {
    height: 150px;
  }
  
  .pf-line-legend {
    gap: 15px;
    margin-top: 8px;
  }
  
  .pf-legend-line {
    width: 16px;
  }
  
  .pf-tooltip-content {
    font-size: 10px;
    padding: 6px 8px;
  }
  
  
  .pf-bar-label {
    font-size: 8px; /* 小屏幕设备上更小的字体 */
    margin-top: 6px; /* 进一步减少上边距 */
    color: #ffffff; /* 保持白色 */
    font-weight: 500; /* 保持字体粗细 */
  }
}

/* 图表行布局 */
.pf-charts-row{display:flex;gap:24px;align-items:flex-start;justify-content:center;}
.pf-price-chart{flex:1;min-width:0;}
.pf-pie-chart-section{flex:0 0 400px;min-width:400px;max-width:500px;}

/* 侧栏饼图样式 */
.pf-sidebar-pie-section{margin-bottom:4px;padding:16px;border-radius:12px;background:var(--pf-panel);border:1px solid var(--pf-border);}
.pf-sidebar-pie-section .pf-chart-header{margin-bottom:16px;}
.pf-sidebar-pie-section .pf-chart-header h4{margin:0;font-size:16px;font-weight:700;color:var(--pf-text);}
.pf-sidebar-pie-section .pf-chart-subtitle{margin:4px 0 0 0;font-size:12px;color:var(--pf-muted);font-weight:400;}
.pf-sidebar-pie-section .pf-pie-chart-container{display:flex;flex-direction:column;align-items:center;gap:3px;}
.pf-sidebar-pie-section .pf-pie-chart{margin-top:10px;margin-bottom:10px;width:130px;height:200px;}
.pf-sidebar-pie-section .pf-pie-svg{width:100%;height:100%;}
.pf-sidebar-pie-section .pf-chart-legend{width:100%;}
.pf-sidebar-pie-section .pf-legend-item{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;}
.pf-sidebar-pie-section .pf-legend-item:last-child{margin-bottom:0;}
.pf-sidebar-pie-section .pf-legend-left{display:flex;align-items:center;gap:6px;flex:1;min-width:0;}
.pf-sidebar-pie-section .pf-legend-right{display:flex;flex-direction:column;align-items:flex-end;gap:1px;}
.pf-sidebar-pie-section .pf-legend-color{width:12px;height:12px;border-radius:2px;}
.pf-sidebar-pie-section .pf-legend-code{font-weight:600;color:var(--pf-text);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pf-sidebar-pie-section .pf-legend-value{font-size:12px;color:var(--pf-muted);white-space:nowrap;}
.pf-sidebar-pie-section .pf-legend-percentage{font-size:24px;color:var(--pf-muted);white-space:nowrap;}

.pf-chart-container{display:flex;align-items:center;gap:32px;}
.pf-pie-chart{position:relative;width:200px;height:200px;}
.pf-pie-svg{width:100%;height:100%;}
.pf-pie-center{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;}
.pf-pie-total{font-size:20px;font-weight:700;color:var(--pf-text);margin-bottom:4px;}
.pf-pie-label{font-size:12px;color:var(--pf-muted);text-transform:uppercase;letter-spacing:0.5px;}

/* 饼图标签样式 */
.pf-pie-label-text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 20px;
  font-weight: 600;
  fill: var(--pf-text);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.pf-chart-legend{flex:1;}
.pf-legend-item{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;}
.pf-legend-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
.pf-legend-right{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
.pf-legend-color{width:16px;height:16px;border-radius:4px;flex-shrink:0;}
.pf-legend-code{font-weight:600;color:var(--pf-text);font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pf-legend-value{font-size:20px;color:var(--pf-muted);white-space:nowrap;}
.pf-legend-percentage{font-size:20px;color:var(--pf-muted);white-space:nowrap;}


/* 分析页面样式 */
.pf-analysis {
  padding: 20px;
}

.pf-analysis-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;}
.pf-analysis-card{padding:16px;border-radius:12px;background:#141426;border:1px solid var(--border);}
.pf-analysis-card h4{margin:0 0 12px 0;font-size:16px;font-weight:700;color:#ffffff;}

/* 交易分析概览 */
.pf-analysis-overview {
  margin-bottom: 30px;
}

.pf-analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pf-analysis-header h3 {
  color: var(--dark-text);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.pf-analysis-actions {
  display: flex;
  gap: 10px;
}

.pf-analysis-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pf-analysis-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.pf-analysis-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 交易统计卡片 */
.pf-analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

/* 一行四个统计卡片 */
.pf-analysis-stats-four {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 30px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .pf-analysis-stats-four {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .pf-analysis-stats-four {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.pf-analysis-stat-card {
  background: var(--dark-panel);
  border: 1px solid var(--dark-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  width: 180px;
}

.pf-analysis-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.pf-stat-icon {
  font-size: 32px;
  width: 12px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
}

.pf-stat-content {
  flex: 1;
  width: 12px;
  height: 12px;
  margin:2px;
  padding:2px;
  
}

.pf-stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--dark-text);
  line-height: 1.2;
}

.pf-stat-label {
  font-size: 14px;
  color: var(--dark-muted);
  margin-top: 4px;
}

.pf-stat-label-inline {
  font-size: 14px;
  color: var(--dark-muted);
  line-height: 1.2;
}

.pf-stat-label-inline .pf-stat-number {
  font-size: 16px;
  font-weight: 700;
  color: var(--dark-text);
  margin-left: 4px;
}

/* 交易分析详情 */
.pf-transaction-breakdown {
  background: var(--dark-panel);
  border: 1px solid var(--dark-border);
  border-radius: 12px;
  overflow: hidden;
}

.pf-breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--dark-border);
  background: rgba(31, 41, 55, 0.5);
}

.pf-breakdown-header h4 {
  color: var(--dark-text);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.pf-breakdown-controls {
  display: flex;
  gap: 10px;
  background: var(--dark-bg);
}

.pf-select {
  background: var(--dark-bg);
  border: 1px solid var(--dark-border);
  color: var(--dark-text);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.pf-breakdown-content {
  padding: 0;
}

.pf-analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--dark-muted);
}

.pf-analysis-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--dark-muted);
  text-align: center;
}

.pf-analysis-empty .pf-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pf-empty-hint {
  font-size: 14px;
  margin-top: 8px;
  color: var(--dark-muted);
}

/* 日期分组 */
.pf-breakdown-list {
  max-height: 600px;
  overflow-y: auto;
}

.pf-day-group {
  border-bottom: 1px solid var(--dark-border);
}

.pf-day-group:last-child {
  border-bottom: none;
}

.pf-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(31, 41, 55, 0.3);
  border-bottom: 1px solid var(--dark-border);
}

.pf-day-date {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-text);
}

.pf-day-summary {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pf-day-total {
  font-size: 14px;
  color: var(--dark-muted);
}

.pf-day-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.pf-day-transactions {
  padding: 0;
}

/* 类型分组 */
.pf-type-group {
  border-bottom: 1px solid rgba(74, 85, 104, 0.2);
}

.pf-type-group:last-child {
  border-bottom: none;
}

.pf-type-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(31, 41, 55, 0.1);
}

.pf-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.pf-type-icon.buy {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.pf-type-icon.sell {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pf-type-info {
  flex: 1;
}

.pf-type-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-text);
}

.pf-type-count {
  font-size: 14px;
  color: var(--dark-muted);
  margin-top: 2px;
}

.pf-type-value {
  text-align: right;
}

.pf-type-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-text);
}

.pf-type-avg {
  font-size: 14px;
  color: var(--dark-muted);
  margin-top: 2px;
}

/* 项目详情 */
.pf-type-projects {
  padding: 0 20px 16px 20px;
}

.pf-project-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(31, 41, 55, 0.2);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.pf-project-summary:hover {
  background: rgba(31, 41, 55, 0.3);
}

.pf-project-summary:last-child {
  margin-bottom: 0;
}

.pf-project-info {
  flex: 1;
}

.pf-project-code {
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-text);
}

.pf-project-name {
  font-size: 12px;
  color: var(--dark-muted);
  margin-top: 2px;
}

.pf-project-stats {
  text-align: right;
}

.pf-project-count {
  font-size: 14px;
  color: var(--dark-muted);
}

.pf-project-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-text);
  margin-top: 2px;
}

/* Asset Distribution 图例响应式样式 */
@media (max-width: 768px) {
  .pf-chart-legend {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .pf-legend-item {
    padding: 6px;
    gap: 6px;
  }
  
  .pf-legend-color {
    width: 10px;
    height: 10px;
  }
  
  .pf-legend-code {
    font-size: 11px;
  }
  
  .pf-legend-value {
    font-size: 10px;
  }
  
  .pf-legend-percentage {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .pf-chart-legend {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  
  .pf-legend-item {
    padding: 4px;
    gap: 4px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .pf-legend-left {
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }
  
  .pf-legend-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  
  .pf-legend-color {
    width: 8px;
    height: 8px;
  }
}

.pf-chart-placeholder{height:200px;display:flex;align-items:end;justify-content:center;gap:20px;padding:20px 0;}
.pf-chart-bars{display:flex;align-items:end;gap:16px;height:100%;}
.pf-chart-bar{display:flex;flex-direction:column;align-items:center;gap:8px;}
.pf-chart-bar-fill{width:24px;background:var(--primary);border-radius:4px 4px 0 0;min-height:4px;transition:height 0.3s ease;}
.pf-chart-bar-label{font-size:12px;color:#9ca3af;}

/* 折线图样式 */
.pf-line-chart {
  margin-top: 20px;
  position: relative;
}

.pf-line-chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: #1f2937;
  border-radius: 8px;
  overflow: hidden;
}

.pf-line-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.pf-line-buy {
  stroke: #10b981;
  stroke-width: 2;
  fill: none;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.3));
}

.pf-line-sell {
  stroke: #ef4444;
  stroke-width: 2;
  fill: none;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.3));
}

.pf-line-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.pf-line-point:hover {
  r: 6;
  filter: drop-shadow(0 0 8px currentColor);
}

.pf-line-point-buy:hover {
  filter: drop-shadow(0 0 8px #10b981);
}

.pf-line-point-sell:hover {
  filter: drop-shadow(0 0 8px #ef4444);
}

.pf-unified-legend {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #1f2937;
  border-radius: 6px;
  border: 1px solid #374151;
}

.pf-unified-legend .pf-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ffffff;
}

.pf-unified-legend .pf-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.pf-buy-color {
  background: #10b981;
}

.pf-sell-color {
  background: #ef4444;
}

.pf-line-tooltip {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  transform: translateX(-50%);
}

.pf-tooltip-content {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pf-tooltip-date {
  color: #9ca3af;
  font-size: 10px;
  margin-bottom: 4px;
}

.pf-tooltip-value {
  font-weight: 600;
}

.pf-tooltip-buy {
  color: #10b981;
}

.pf-tooltip-sell {
  color: #ef4444;
}

.pf-tooltip-net {
  color: #ffffff;
  font-weight: 600;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 4px;
  margin-top: 4px;
}

.pf-risk-item{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #374151;}
.pf-risk-item:last-child{border-bottom:none;}
.pf-risk-label{font-size:14px;color:#ffffff;}
.pf-risk-value{font-weight:600;color:#ffffff;}

.pf-insight-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:#1f2937;margin-bottom:8px;}
.pf-insight-icon{font-size:16px;}
.pf-insight-text{font-size:14px;color:#ffffff;}

/* 项目卡片样式 */
.pf-projects-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;}
.pf-project-card{
  width:320px;
  margin-left:5px;
  padding:16px;
  border-radius:12px;
  background:#141426;
  border:1px solid var(--border);}
.pf-project-header{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.pf-project-image{width:40px;height:40px;border-radius:8px;}
.pf-project-info{flex:1;}
.pf-project-info h4{margin:0 0 4px 0;font-size:16px;font-weight:700;color:#ffffff;}
.pf-project-info p{margin:0;font-size:12px;color:#9ca3af;}

.pf-project-metrics{margin-bottom:16px;}
.pf-project-metric{display:flex;justify-content:space-between;align-items:center;padding:4px 0;}
.pf-metric-label{font-size:12px;color:#9ca3af;}
.pf-metric-value{font-size:14px;font-weight:600;color:#ffffff;}
.pf-metric-value.risk-low{color:#16a34a;}
.pf-metric-value.risk-medium{color:#d97706;}
.pf-metric-value.risk-high{color:#dc2626;}

.pf-project-actions{display:flex;gap:8px;flex-wrap:wrap;}
.pf-project-btn{padding:8px 16px;border-radius:8px;border:1px solid #374151;background:#1f2937;color:#ffffff;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s ease;}
.pf-project-btn:hover{background:#d97706;}
.pf-project-btn-secondary{background:var(--primary);color:#fff;border-color:var(--primary);}
.pf-project-btn-secondary:hover{background:var(--primary-ink);}
.pf-project-btn-interest{background:#dc2626;color:#fff;border-color:#dc2626;}
.pf-project-btn-interest:hover{background:#b91c1c;}

/* Watchlist 样式 */
.pf-watchlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.pf-watchlist-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.pf-watchlist-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pf-watchlist-count {
  font-size: 14px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
}

.pf-empty-watchlist {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.pf-empty-projects {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.pf-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pf-empty-watchlist h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--text);
}

.pf-empty-projects h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--text);
}

.pf-empty-watchlist p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.pf-empty-projects p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.pf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.pf-btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.pf-btn-primary:hover {
  background: var(--primary-ink);
}

.pf-watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.pf-watchlist-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.pf-watchlist-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.pf-watchlist-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.pf-watchlist-image {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}

.pf-watchlist-info {
  flex: 1;
}

.pf-watchlist-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.pf-watchlist-info p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.pf-watchlist-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.pf-remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.pf-remove-btn:hover {
  background: #dc2626;
  color: #fff;
}

.pf-watchlist-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.pf-watchlist-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pf-watchlist-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.pf-watchlist-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.pf-watchlist-progress {
  margin-bottom: 16px;
}

.pf-watchlist-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.pf-watchlist-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.pf-watchlist-progress-text {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
}

.pf-watchlist-actions-bottom {
  display: flex;
  gap: 8px;
}

.pf-watchlist-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.pf-watchlist-btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.pf-watchlist-btn-primary:hover {
  background: var(--primary-ink);
}

.pf-watchlist-btn-secondary {
  background: transparent;
  color: var(--primary);
  border-color: var(--primary);
}

.pf-watchlist-btn-secondary:hover {
  background: var(--primary);
  color: #fff;
}

/* Watchlist 响应式样式 */
@media (max-width: 768px) {
  .pf-watchlist-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .pf-watchlist-card {
    padding: 16px;
  }
  
  .pf-watchlist-metrics {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .pf-watchlist-actions-bottom {
    flex-direction: column;
    gap: 8px;
  }
  
  .pf-watchlist-btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .pf-watchlist-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .pf-watchlist-card {
    padding: 12px;
  }
  
  .pf-watchlist-card-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .pf-watchlist-actions {
    position: static;
    margin-top: 8px;
  }
}

@media (max-width:1024px){.pf-body{grid-template-columns:1fr}.pf-sidebar{order:2}.pf-main{order:1}}

/* 移动端专用样式 */
.pf-mobile-header {
  display: none;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 12px 16px;
}

.pf-mobile-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}

.pf-mobile-menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.pf-mobile-menu-btn:hover {
  background: var(--panel);
}

.pf-mobile-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.pf-mobile-actions {
  display: flex;
  gap: 8px;
}

.pf-mobile-action-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.pf-mobile-action-btn:hover {
  background: var(--panel);
}

.pf-mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.pf-sidebar-mobile-open {
  transform: translateX(0) !important;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .pf-mobile-header {
    display: block;
  }
  
  .pf-mobile-overlay {
    display: block;
  }
  
  .pf-body {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
    margin-top: 0;
  }
  
  .pf-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    border-radius: 0;
    margin: 0;
    overflow-y: auto;
  }
  
  .pf-main {
    width: 100%;
    margin: 0;
    border-radius: 0;
    min-height: calc(100vh - 60px);
  }
  
  .pf-hero {
    padding: 16px;
    text-align: center;
  }
  
  .pf-balance {
    font-size: 36px;
    margin-bottom: 8px;
  }
  
  .pf-tabs {
    gap: 16px;
    padding: 0 16px;
    margin-top: 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .pf-tabs::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
  
  .pf-tab {
    padding: 12px 0;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .pf-projects-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .pf-project-card {
    padding: 16px;
  }
  
  .pf-project-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .pf-project-image {
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }
  
  .pf-project-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 16px 0;
  }
  
  .pf-project-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .pf-project-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
  
  .pf-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .pf-stat-card {
    padding: 12px;
  }
  
  .pf-stat-value {
    font-size: 18px;
  }
  
  .pf-pie-chart-container {
    padding: 16px;
  }
  
  .pf-pie-chart {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }
  
  .pf-chart-legend {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 16px;
  }
  
  .pf-legend-item {
    padding: 8px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .pf-transaction-chart {
    padding: 16px;
  }
  
  .pf-chart-bars {
    gap: 4px;
    padding: 0 8px;
  }
  
  .pf-bar-item {
    min-width: 24px;
    max-width: 60px;
  }
  
  .pf-line-chart-container {
    height: 150px;
  }
  
  .pf-transaction-list {
    padding: 16px;
  }
  
  .pf-transaction-item {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .pf-transaction-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .pf-transaction-details {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .pf-mobile-header {
    padding: 8px 12px;
  }
  
  .pf-mobile-title {
    font-size: 16px;
  }
  
  .pf-balance {
    font-size: 28px;
  }
  
  .pf-tabs {
    padding: 0 12px;
    gap: 12px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .pf-tabs::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
  
  .pf-tab {
    padding: 10px 0;
    font-size: 13px;
  }
  
  .pf-projects-grid {
    padding: 12px;
    gap: 12px;
  }
  
  .pf-project-card {
    padding: 12px;
  }
  
  .pf-project-metrics {
    gap: 8px;
  }
  
  .pf-project-metric {
    padding: 8px;
  }
  
  .pf-pie-chart {
    width: 160px;
    height: 160px;
  }
  
  .pf-chart-bars {
    gap: 2px;
    padding: 0 4px;
  }
  
  .pf-bar-item {
    min-width: 20px;
    max-width: 40px;
  }
  
  .pf-line-chart-container {
    height: 120px;
  }
  
  .pf-transaction-list {
    padding: 12px;
  }
  
  .pf-transaction-item {
    padding: 10px;
  }
}
</style>
