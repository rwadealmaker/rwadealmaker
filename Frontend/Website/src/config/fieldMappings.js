// =====================================================
// RWA Deal Maker 字段映射配置
// =====================================================
// 用途: 数据库英文字段值与中英文显示的映射关系
// 更新日期: 2025-10-27
// 说明: 数据库存储英文值（无下划线），通过此配置映射到中英文显示
// =====================================================

/**
 * 字段映射配置对象
 * 结构: { fieldName: { en: {...}, zh: {...} } }
 */
export const FIELD_MAPPINGS = {

  // ==================== 物业类型 (Property Type) ====================
  property_type: {
    en: {
      'Residential': 'Residential',
      'Commercial': 'Commercial',
      'Industrial': 'Industrial',
      'Land': 'Land',
      'Mixed Use': 'Mixed Use',
      'Retail': 'Retail',
      'Office': 'Office',
      'Warehouse': 'Warehouse',
      'Apartment': 'Apartment',
      'House': 'House',
      'Single House': 'Single House',
      'Residential House': 'Residential House',
      'Townhouse': 'Townhouse',
      'Unit': 'Unit',
      'Commercial Property': 'Commercial Property',
      'Industrial Property': 'Industrial Property',
      'Land Development': 'Land Development',
      'Residential Construction': 'Residential Construction'
    },
    zh: {
      'Residential': '住宅',
      'Commercial': '商业',
      'Industrial': '工业',
      'Land': '土地',
      'Mixed Use': '混合用途',
      'Retail': '零售',
      'Office': '办公',
      'Warehouse': '仓库',
      'Apartment': '公寓',
      'House': '独立屋',
      'Single House': '独栋别墅',
      'Residential House': '独立住宅',
      'Townhouse': '联排别墅',
      'Unit': '单元房',
      'Commercial Property': '商业地产',
      'Industrial Property': '工业地产',
      'Land Development': '土地开发',
      'Residential Construction': '住宅建设'
    }
  },

  // ==================== 抵押类型 (Mortgage Type) ====================
  mortgage_type: {
    en: {
      'First Mortgage': 'First Mortgage',
      'Second Mortgage': 'Second Mortgage',
      'Third Mortgage': 'Third Mortgage',
      'Blanket Mortgage': 'Blanket Mortgage',
      'Cross Collateral': 'Cross Collateral'
    },
    zh: {
      'First Mortgage': '第一顺位抵押',
      'Second Mortgage': '第二顺位抵押',
      'Third Mortgage': '第三顺位抵押',
      'Blanket Mortgage': '综合抵押',
      'Cross Collateral': '交叉抵押'
    }
  },

  // ==================== 抵押物类型 (Collateral Type) ====================
  collateral: {
    en: {
      'Residential Property': 'Residential Property',
      'Commercial Property': 'Commercial Property',
      'Industrial Property': 'Industrial Property',
      'Land': 'Land',
      'Mixed Use Property': 'Mixed Use Property',
      'Vacant Land': 'Vacant Land',
      'Development Site': 'Development Site',
      'Strata Title': 'Strata Title',
      'Freehold': 'Freehold',
      'Leasehold': 'Leasehold',
      'Australian Residential Security': 'Australian Residential Security',
      'Metro Commercial': 'Metro Commercial',
      'Metro Development': 'Metro Development',
      'Metro Residential': 'Metro Residential'
    },
    zh: {
      'Residential Property': '住宅物业',
      'Commercial Property': '商业物业',
      'Industrial Property': '工业物业',
      'Land': '土地',
      'Mixed Use Property': '混合用途物业',
      'Vacant Land': '空置土地',
      'Development Site': '开发用地',
      'Strata Title': '分层地契',
      'Freehold': '永久产权',
      'Leasehold': '租赁产权',
      'Australian Residential Security': '澳洲住宅抵押贷款',
      'Metro Commercial': '都市商业抵押',
      'Metro Development': '都市开发抵押',
      'Metro Residential': '都市住宅抵押'
    }
  },

  // ==================== 借款人类型 (Borrower Type) ====================
  borrower: {
    en: {
      'Individual': 'Individual',
      'Company': 'Company',
      'Trust': 'Trust',
      'Partnership': 'Partnership',
      'Joint Venture': 'Joint Venture',
      'SMSF': 'SMSF',
      'Family Trust': 'Family Trust',
      'Unit Trust': 'Unit Trust',
      'Discretionary Trust': 'Discretionary Trust'
    },
    zh: {
      'Individual': '个人',
      'Company': '公司',
      'Trust': '信托',
      'Partnership': '合伙企业',
      'Joint Venture': '合资企业',
      'SMSF': '自管养老金',
      'Family Trust': '家族信托',
      'Unit Trust': '单位信托',
      'Discretionary Trust': '全权信托'
    }
  },

  // ==================== 贷款类型 (Loan Type) ====================
  loan_type: {
    en: {
      'First': 'First Mortgage',
      'Second': 'Second Mortgage',
      'Bridging': 'Bridging Loan',
      'Construction': 'Construction Loan',
      'Development': 'Development Loan',
      'Refinance': 'Refinance Loan',
      'Equity Release': 'Equity Release',
      'Line of Credit': 'Line of Credit'
    },
    zh: {
      'First': '第一抵押贷款',
      'Second': '第二抵押贷款',
      'Bridging': '过桥贷款',
      'Construction': '建筑贷款',
      'Development': '开发贷款',
      'Refinance': '再融资贷款',
      'Equity Release': '权益释放贷款',
      'Line of Credit': '信用额度'
    }
  },

  // ==================== 贷款用途 (Loan Purpose) ====================
  loan_purpose: {
    en: {
      'Purchase': 'Purchase',
      'Refinance': 'Refinance',
      'Construction': 'Construction',
      'Renovation': 'Renovation',
      'Development': 'Development',
      'Investment': 'Investment',
      'Business': 'Business',
      'Debt Consolidation': 'Debt Consolidation',
      'Cash Out': 'Cash Out',
      'Equity Release': 'Equity Release'
    },
    zh: {
      'Purchase': '购买',
      'Refinance': '再融资',
      'Construction': '建设',
      'Renovation': '装修',
      'Development': '开发',
      'Investment': '投资',
      'Business': '商业用途',
      'Debt Consolidation': '债务整合',
      'Cash Out': '套现',
      'Equity Release': '权益释放'
    }
  },

  // ==================== 还款安排 (Repayment Arrangement) ====================
  repayment_arrangement: {
    en: {
      'Interest Only': 'Interest Only',
      'Principal and Interest': 'Principal and Interest',
      'Balloon Payment': 'Balloon Payment',
      'Bullet Repayment': 'Bullet Repayment',
      'Amortizing': 'Amortizing',
      'Non Amortizing': 'Non-Amortizing'
    },
    zh: {
      'Interest Only': '仅付息',
      'Principal and Interest': '本息同还',
      'Balloon Payment': '气球式还款',
      'Bullet Repayment': '到期一次性还款',
      'Amortizing': '摊销式还款',
      'Non Amortizing': '非摊销式还款'
    }
  },

  // ==================== 提前还款 (Early Repayment) ====================
  early_repayment: {
    en: {
      'Allowed': 'Allowed',
      'Not Allowed': 'Not Allowed',
      'With Penalty': 'With Penalty',
      'Without Penalty': 'Without Penalty',
      'Partial Allowed': 'Partial Allowed'
    },
    zh: {
      'Allowed': '允许',
      'Not Allowed': '不允许',
      'With Penalty': '允许(有罚金)',
      'Without Penalty': '允许(无罚金)',
      'Partial Allowed': '允许部分提前还款'
    }
  },

  // ==================== 抵押顺位 (Security Rank) ====================
  security_rank: {
    en: {
      'First': 'First',
      'Second': 'Second',
      'Third': 'Third',
      'Unregistered': 'Unregistered',
      'Pari Passu': 'Pari Passu'
    },
    zh: {
      'First': '第一顺位',
      'Second': '第二顺位',
      'Third': '第三顺位',
      'Unregistered': '未登记',
      'Pari Passu': '平等顺位'
    }
  },

  // ==================== 项目状态 - Active (Project Status - Active) ====================
  status_active: {
    en: {
      'ACTIVE': 'Active',
      'COMPLETED': 'Completed',
      'DEFAULT': 'Default',
      'SUSPENDED': 'Suspended',
      'TERMINATED': 'Terminated'
    },
    zh: {
      'ACTIVE': '进行中',
      'COMPLETED': '已完成',
      'DEFAULT': '违约',
      'SUSPENDED': '暂停',
      'TERMINATED': '终止'
    }
  },

  // ==================== 项目状态 - Incoming (Project Status - Incoming) ====================
  status_incoming: {
    en: {
      'INCOMING': 'Incoming',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'PENDING': 'Pending'
    },
    zh: {
      'INCOMING': '即将上市',
      'UNDER_REVIEW': '审核中',
      'APPROVED': '已批准',
      'REJECTED': '已拒绝',
      'PENDING': '待定'
    }
  },

  // ==================== 澳洲州/省 (Australian States) ====================
  property_state: {
    en: {
      'NSW': 'New South Wales',
      'VIC': 'Victoria',
      'QLD': 'Queensland',
      'WA': 'Western Australia',
      'SA': 'South Australia',
      'TAS': 'Tasmania',
      'ACT': 'Australian Capital Territory',
      'NT': 'Northern Territory'
    },
    zh: {
      'NSW': '新南威尔士州',
      'VIC': '维多利亚州',
      'QLD': '昆士兰州',
      'WA': '西澳大利亚州',
      'SA': '南澳大利亚州',
      'TAS': '塔斯马尼亚州',
      'ACT': '澳大利亚首都领地',
      'NT': '北领地'
    }
  }
}

/**
 * 获取字段映射值
 * @param {string} fieldName - 字段名称 (如 'property_type')
 * @param {string} fieldValue - 字段值 (如 'Single House')
 * @param {string} language - 语言 ('en' | 'zh')
 * @returns {string} 映射后的显示值
 */
export function getFieldMapping(fieldName, fieldValue, language = 'en') {
  if (!fieldValue) return fieldValue || 'N/A'

  const fieldMap = FIELD_MAPPINGS[fieldName]
  if (!fieldMap) return fieldValue

  const langMap = fieldMap[language]
  if (!langMap) return fieldValue

  return langMap[fieldValue] || fieldValue
}

/**
 * 获取字段所有可选值 (用于下拉菜单)
 * @param {string} fieldName - 字段名称
 * @param {string} language - 语言
 * @returns {Array<{value: string, label: string}>}
 */
export function getFieldOptions(fieldName, language = 'en') {
  const fieldMap = FIELD_MAPPINGS[fieldName]
  if (!fieldMap || !fieldMap[language]) return []

  const langMap = fieldMap[language]
  return Object.keys(langMap).map(value => ({
    value: value,
    label: langMap[value]
  }))
}

/**
 * 批量转换对象中的字段值
 * @param {Object} data - 数据对象
 * @param {Array<string>} fields - 需要转换的字段列表
 * @param {string} language - 目标语言
 * @returns {Object} 转换后的对象
 */
export function transformFieldValues(data, fields, language = 'en') {
  const result = { ...data }

  fields.forEach(fieldName => {
    if (result[fieldName]) {
      result[fieldName] = getFieldMapping(fieldName, result[fieldName], language)
    }
  })

  return result
}

/**
 * 获取反向映射 (从显示值获取数据库值)
 * @param {string} fieldName - 字段名称
 * @param {string} displayValue - 显示值
 * @param {string} language - 语言
 * @returns {string} 数据库值
 */
export function getReverseMapping(fieldName, displayValue, language = 'en') {
  const fieldMap = FIELD_MAPPINGS[fieldName]
  if (!fieldMap || !fieldMap[language]) return displayValue

  const langMap = fieldMap[language]
  const entry = Object.entries(langMap).find(([_, label]) => label === displayValue)

  return entry ? entry[0] : displayValue
}

// 导出字段名称列表（用于批量转换）
export const TRANSFORMABLE_FIELDS = [
  'property_type',
  'mortgage_type',
  'collateral',
  'borrower',
  'loan_type',
  'loan_purpose',
  'repayment_arrangement',
  'early_repayment',
  'security_rank',
  'property_state'
]

export default {
  FIELD_MAPPINGS,
  getFieldMapping,
  getFieldOptions,
  transformFieldValues,
  getReverseMapping,
  TRANSFORMABLE_FIELDS
}
