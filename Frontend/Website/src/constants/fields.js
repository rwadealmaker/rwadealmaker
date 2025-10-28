// =====================================================
// 统一字段映射配置
// =====================================================
// 用途: 统一管理前端-数据库字段映射关系
// 创建日期: 2025-10-27
// =====================================================

/**
 * 数据库字段到前端字段的映射
 * 用于规范化API响应数据
 */
export const DB_TO_FRONTEND_MAPPING = {
  // ========== 基础信息 ==========
  id: 'id',
  project_code: 'code',
  project_name: 'name',
  property_summary: 'propertySummary',
  status: 'status',

  // ========== 代币信息 ==========
  // project_active
  total_offering_token: 'totalOffering',
  subscribe_token: 'subscribed',
  token_price: 'tokenPrice',
  // project_incoming
  estimated_total_token: 'totalOffering',
  estimated_token_price: 'tokenPrice',

  // ========== 贷款基本信息 ==========
  loan_amount: 'loanAmount',
  interest_rate: 'interestRate',
  loan_term_months: 'loanTermMonths',
  lvr: 'lvr',
  loan_type: 'loanType',
  loan_product: 'loanProduct',
  loan_purpose: 'loanPurpose',

  // ========== 物业信息 ==========
  property_location: 'propertyLocation',
  property_state: 'propertyState',
  property_type: 'propertyType',
  property_value: 'propertyValue',
  site_area: 'siteArea',
  gross_floor_area: 'floorArea',

  // ========== 抵押信息 ==========
  mortgage_type: 'mortgageType',
  collateral: 'collateral',
  security_rank: 'securityRank',

  // ========== 相关主体 ==========
  borrower: 'borrower',
  lender: 'lender',
  issuer: 'issuer',
  guarantor: 'guarantor',
  lawyer: 'lawyer',
  valuer: 'valuer',
  // ❌ 缺失字段
  // sponsor: 'sponsor',  // 数据库无此字段
  // trustee: 'trustee',  // 数据库无此字段

  // ========== 日期信息 ==========
  // project_active
  commencement_date: 'commencementDate',
  expiry_date: 'expiryDate',
  drawdown_date: 'drawdownDate',
  expected_recovery_date: 'expectedRecoveryDate',
  // project_incoming
  expected_commencement_date: 'commencementDate',
  expected_expiry_date: 'expiryDate',
  expected_drawdown_date: 'expectedRecoveryDate',

  // ========== 还款信息 ==========
  repayment_arrangement: 'repaymentArrangement',
  early_repayment: 'earlyRepayment',
  early_repayment_details: 'earlyRepaymentDetails',

  // ========== 违约信息 ==========
  default_interest_rate: 'defaultRate',  // ✅ 注意: 不是 default_rate
  default_triggers: 'defaultTriggers',
  default_process: 'defaultProcess',

  // ========== 文档 ==========
  valuation_report: 'valuationReport',
  mortgage_deed: 'mortgageDeed',
  issuer_token: 'issuerToken',
  loan_token: 'loanToken',

  // ========== 智能合约地址 ==========
  principal_token_address: 'principalTokenAddress',
  interest_token_address: 'interestTokenAddress',
  loan_issuer_address: 'loanIssuerAddress',
  kyc_registry_address: 'kycRegistryAddress',
  trade_contract_address: 'tradeContractAddress',
  compliance_guard_contract_address: 'complianceGuardContractAddress',
  holder_registry: 'holderRegistry',

  // ========== 审核信息 (仅incoming) ==========
  review_notes: 'reviewNotes',
  approved_by: 'approvedBy',
  approved_at: 'approvedAt',

  // ========== 时间戳 ==========
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  created_by: 'createdBy',
  updated_by: 'updatedBy'
}

/**
 * 前端字段到数据库字段的反向映射
 */
export const FRONTEND_TO_DB_MAPPING = Object.fromEntries(
  Object.entries(DB_TO_FRONTEND_MAPPING).map(([db, frontend]) => [frontend, db])
)

/**
 * 需要进行语言映射的字段
 */
export const TRANSLATABLE_FIELDS = [
  'property_type',
  'property_state',
  'mortgage_type',
  'collateral',
  'borrower',
  'loan_type',
  'loan_purpose',
  'repayment_arrangement',
  'early_repayment',
  'security_rank',
  'status'
]

/**
 * 前端需要但数据库缺失的字段（显示为N/A）
 * ✅ 更新: 所有字段已添加到数据库，此对象现在为空
 */
export const MISSING_DB_FIELDS = {
  // 所有字段已添加到数据库 (2025-10-27)
  // sponsor, trustee, lawyer, valuer - 已添加
  // kyc_registry_address, trade_contract_address等 - 已添加
}

/**
 * project_active表特有字段
 */
export const ACTIVE_ONLY_FIELDS = [
  'total_offering_token',
  'subscribe_token',
  'token_price',
  'commencement_date',
  'expiry_date',
  'drawdown_date',
  'expected_recovery_date',
  'issuer_token',
  'loan_token',
  'principal_token_address',
  'interest_token_address',
  'loan_issuer_address'
]

/**
 * project_incoming表特有字段
 */
export const INCOMING_ONLY_FIELDS = [
  'estimated_total_token',
  'estimated_token_price',
  'lawyer',
  'valuer',
  'expected_commencement_date',
  'expected_expiry_date',
  'expected_drawdown_date',
  'review_notes',
  'approved_by',
  'approved_at'
]

/**
 * 字段类型定义
 */
export const FIELD_TYPES = {
  // 数值类型
  DECIMAL: [
    'total_offering_token',
    'subscribe_token',
    'token_price',
    'estimated_total_token',
    'estimated_token_price',
    'loan_amount',
    'interest_rate',
    'lvr',
    'property_value',
    'site_area',
    'gross_floor_area',
    'default_interest_rate'
  ],

  // 整数类型
  INTEGER: [
    'id',
    'loan_term_months'
  ],

  // 日期类型
  DATE: [
    'commencement_date',
    'expiry_date',
    'drawdown_date',
    'expected_recovery_date',
    'expected_commencement_date',
    'expected_expiry_date',
    'expected_drawdown_date',
    'approved_at',
    'created_at',
    'updated_at'
  ],

  // 字符串类型
  STRING: [
    'project_code',
    'project_name',
    'property_summary',
    'status',
    'property_location',
    'property_state',
    'property_type',
    'loan_type',
    'loan_product',
    'loan_purpose',
    'mortgage_type',
    'borrower',
    'lender',
    'issuer',
    'guarantor',
    'lawyer',
    'valuer',
    'collateral',
    'security_rank',
    'repayment_arrangement',
    'early_repayment'
  ],

  // 文本类型
  TEXT: [
    'early_repayment_details',
    'default_triggers',
    'default_process',
    'review_notes'
  ],

  // URL类型
  URL: [
    'valuation_report',
    'mortgage_deed',
    'issuer_token',
    'loan_token'
  ],

  // 以太坊地址类型
  ADDRESS: [
    'principal_token_address',
    'interest_token_address',
    'loan_issuer_address'
  ]
}

/**
 * 将数据库对象映射到前端对象
 * @param {Object} dbData - 数据库返回的数据
 * @param {String} tableType - 表类型 'active' | 'incoming'
 * @returns {Object} 前端格式的数据
 */
export function mapDbToFrontend(dbData, tableType = 'active') {
  if (!dbData) return null

  const mapped = {}

  // 基本字段映射
  Object.entries(DB_TO_FRONTEND_MAPPING).forEach(([dbField, frontendField]) => {
    if (dbData.hasOwnProperty(dbField)) {
      mapped[frontendField] = dbData[dbField]
    }
  })

  // 计算字段
  if (tableType === 'active') {
    mapped.totalOfferingRaw = dbData.total_offering_token || 0
    mapped.subscribedRaw = dbData.subscribe_token || 0
  } else {
    mapped.totalOfferingRaw = dbData.estimated_total_token || 0
    mapped.subscribedRaw = 0
  }

  return mapped
}

/**
 * 将前端对象映射回数据库对象
 * @param {Object} frontendData - 前端数据
 * @param {String} tableType - 表类型 'active' | 'incoming'
 * @returns {Object} 数据库格式的数据
 */
export function mapFrontendToDb(frontendData, tableType = 'active') {
  if (!frontendData) return null

  const mapped = {}

  Object.entries(FRONTEND_TO_DB_MAPPING).forEach(([frontendField, dbField]) => {
    if (frontendData.hasOwnProperty(frontendField)) {
      mapped[dbField] = frontendData[frontendField]
    }
  })

  // 特殊处理：根据表类型调整字段
  if (tableType === 'active') {
    if (frontendData.totalOffering) {
      mapped.total_offering_token = frontendData.totalOffering
      delete mapped.estimated_total_token
    }
  } else {
    if (frontendData.totalOffering) {
      mapped.estimated_total_token = frontendData.totalOffering
      delete mapped.total_offering_token
    }
  }

  return mapped
}

/**
 * 验证字段映射
 */
export function validateFieldMapping() {
  const issues = []

  // 检查是否有重复映射
  const frontendFields = Object.values(DB_TO_FRONTEND_MAPPING)
  const duplicates = frontendFields.filter((item, index) => frontendFields.indexOf(item) !== index)

  if (duplicates.length > 0) {
    issues.push({
      type: 'DUPLICATE_MAPPING',
      fields: [...new Set(duplicates)]
    })
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

export default {
  DB_TO_FRONTEND_MAPPING,
  FRONTEND_TO_DB_MAPPING,
  TRANSLATABLE_FIELDS,
  MISSING_DB_FIELDS,
  ACTIVE_ONLY_FIELDS,
  INCOMING_ONLY_FIELDS,
  FIELD_TYPES,
  mapDbToFrontend,
  mapFrontendToDb,
  validateFieldMapping
}
