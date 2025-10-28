# 前端-数据库字段映射完整分析

## 📊 数据库表结构对比

### PROJECT_ACTIVE (已代币化项目)
| 数据库字段 | 类型 | 说明 |
|-----------|------|------|
| id | bigint | 主键 |
| project_code | varchar(20) | 项目代码 RWAT001... |
| project_name | varchar(255) | 项目名称 |
| property_summary | text | 物业摘要 |
| status | enum | ACTIVE/COMPLETED/DEFAULT |
| total_offering_token | decimal(20,2) | 总发行代币数 |
| subscribe_token | decimal(20,2) | 已认购代币数 |
| token_price | decimal(20,2) | 代币单价 |
| loan_amount | decimal(20,2) | 贷款金额 |
| interest_rate | decimal(5,2) | 年利率 % |
| loan_term_months | int | 贷款期限(月) |
| lvr | decimal(5,2) | 贷款价值比 % |
| property_location | varchar(255) | 物业地址 |
| property_state | varchar(50) | 物业州/省 |
| property_type | varchar(50) | 物业类型 |
| property_value | decimal(20,2) | 物业估值 |
| loan_type | varchar(50) | 贷款类型 |
| loan_product | varchar(100) | 贷款产品 |
| loan_purpose | varchar(100) | 贷款用途 |
| mortgage_type | varchar(50) | 抵押类型 |
| borrower | varchar(100) | 借款人类型 |
| lender | varchar(255) | 贷款方 |
| issuer | varchar(255) | 发行方 |
| guarantor | varchar(255) | 担保方 |
| collateral | varchar(100) | 抵押物类型 |
| security_rank | varchar(50) | 抵押顺位 |
| commencement_date | date | 开始日期 |
| expiry_date | date | 到期日期 |
| drawdown_date | date | 放款日期 |
| expected_recovery_date | date | 预期回收日期 |
| repayment_arrangement | varchar(100) | 还款安排 |
| early_repayment | varchar(20) | 提前还款 |
| early_repayment_details | text | 提前还款详情 |
| default_interest_rate | decimal(5,2) | 违约利率 % |
| default_triggers | text | 违约触发条件 |
| default_process | text | 违约处理流程 |
| valuation_report | varchar(500) | 估值报告URL |
| mortgage_deed | varchar(500) | 抵押文件URL |
| issuer_token | varchar(500) | 发行方代币文档URL |
| loan_token | varchar(500) | 贷款代币文档URL |
| principal_token_address | varchar(42) | 本金代币合约地址 |
| interest_token_address | varchar(42) | 利息代币合约地址 |
| loan_issuer_address | varchar(42) | LoanIssuer合约地址 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | varchar(100) | 创建人 |
| updated_by | varchar(100) | 更新人 |

### PROJECT_INCOMING (待代币化项目)
| 数据库字段 | 类型 | 说明 |
|-----------|------|------|
| id | bigint | 主键 |
| project_code | varchar(20) | 项目代码 RWA001... |
| project_name | varchar(255) | 项目名称 |
| property_summary | text | 物业摘要 |
| status | enum | INCOMING/UNDER_REVIEW/APPROVED/REJECTED |
| estimated_total_token | decimal(20,2) | 预计发行代币数 |
| estimated_token_price | decimal(20,2) | 预计代币单价 |
| loan_amount | decimal(20,2) | 贷款金额 |
| interest_rate | decimal(5,2) | 年利率 % |
| loan_term_months | int | 贷款期限(月) |
| lvr | decimal(5,2) | 贷款价值比 % |
| property_location | varchar(255) | 物业地址 |
| property_state | varchar(50) | 物业州/省 |
| property_type | varchar(50) | 物业类型 |
| property_value | decimal(20,2) | 物业估值 |
| loan_type | varchar(50) | 贷款类型 |
| loan_product | varchar(100) | 贷款产品 |
| loan_purpose | varchar(100) | 贷款用途 |
| mortgage_type | varchar(50) | 抵押类型 |
| borrower | varchar(100) | 借款人类型 |
| lender | varchar(255) | 贷款方 |
| issuer | varchar(255) | 发行方 |
| lawyer | varchar(255) | **律师事务所** ✅ |
| valuer | varchar(255) | **评估师** ✅ |
| guarantor | varchar(255) | 担保方 |
| collateral | varchar(100) | 抵押物类型 |
| security_rank | varchar(50) | 抵押顺位 |
| expected_commencement_date | date | 预计开始日期 |
| expected_expiry_date | date | 预计到期日期 |
| expected_drawdown_date | date | 预计放款日期 |
| repayment_arrangement | varchar(100) | 还款安排 |
| early_repayment | varchar(20) | 提前还款 |
| early_repayment_details | text | 提前还款详情 |
| default_interest_rate | decimal(5,2) | 违约利率 % |
| default_triggers | text | 违约触发条件 |
| default_process | text | 违约处理流程 |
| valuation_report | varchar(500) | 估值报告URL |
| mortgage_deed | varchar(500) | 抵押文件URL |
| review_notes | text | 审核备注 |
| approved_by | varchar(100) | 审批人 |
| approved_at | timestamp | 审批时间 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | varchar(100) | 创建人 |
| updated_by | varchar(100) | 更新人 |

## 🔍 前端字段使用分析

### ListedProjectsView.vue 使用的字段

| 前端字段 | 数据库字段 (project_active) | 匹配状态 |
|---------|---------------------------|---------|
| id | id | ✅ 匹配 |
| code | project_code | ✅ 匹配 |
| name | project_name | ✅ 匹配 |
| status | status | ✅ 匹配 |
| totalOffering | total_offering_token | ✅ 匹配 |
| subscribed | subscribe_token | ✅ 匹配 |
| propertyLocation | property_location | ✅ 匹配 |
| propertyState | property_state | ✅ 匹配 |
| propertyType | property_type | ✅ 匹配 |
| propertyValue | property_value | ✅ 匹配 |
| propertySummary | property_type | ✅ 匹配(使用同一字段) |
| mortgageType | mortgage_type | ✅ 匹配 |
| loanAmount | loan_amount | ✅ 匹配 |
| loanTermMonths | loan_term_months | ✅ 匹配 |
| lvr | lvr | ✅ 匹配 |
| interestRate | interest_rate | ✅ 匹配 |
| defaultRate | default_rate | ❌ **不匹配** 数据库是 `default_interest_rate` |
| commencementDate | commencement_date | ✅ 匹配 |
| expiryDate | expiry_date | ✅ 匹配 |
| expectedRecoveryDate | expected_recovery_date | ✅ 匹配 |
| borrower | borrower | ✅ 匹配 |
| lender | lender | ✅ 匹配 |
| issuer | issuer | ✅ 匹配 |
| sponsor | sponsor | ❌ **N/A** 数据库无此字段 |
| valuer | valuer | ❌ **N/A** project_active表无此字段 |
| lawyer | lawyer | ❌ **N/A** project_active表无此字段 |
| trustee | trustee | ❌ **N/A** 数据库无此字段 |
| collateral | collateral | ✅ 匹配 |
| principalTokenAddress | principal_token_address | ✅ 匹配 |
| interestTokenAddress | interest_token_address | ✅ 匹配 |
| kycRegistryAddress | kyc_registry_address | ❌ **N/A** 数据库无此字段 |
| loanIssuerAddress | loan_issuer_address | ✅ 匹配 |
| tradeContractAddress | trade_contract_address | ❌ **N/A** 数据库无此字段 |
| complianceGuardContractAddress | compliance_guard_contract_address | ❌ **N/A** 数据库无此字段 |
| holderRegistry | Holder_Registry | ❌ **N/A** 数据库无此字段 |

### ToBeListedView.vue 使用的字段

| 前端字段 | 数据库字段 (project_incoming) | 匹配状态 |
|---------|----------------------------|---------|
| id | id | ✅ 匹配 |
| code | project_code | ✅ 匹配 |
| name | project_name | ✅ 匹配 |
| status | status | ✅ 匹配 |
| totalOffering | estimated_total_token | ✅ 匹配 |
| subscribed | N/A (设为0) | ✅ 合理(待代币化无认购) |
| propertyLocation | property_location | ✅ 匹配 |
| propertyState | property_state | ✅ 匹配 |
| propertyType | property_type | ✅ 匹配 |
| propertyValue | property_value | ✅ 匹配 |
| propertySummary | property_type | ✅ 匹配 |
| mortgageType | mortgage_type | ✅ 匹配 |
| loanAmount | loan_amount | ✅ 匹配 |
| loanTermMonths | loan_term_months | ✅ 匹配 |
| lvr | lvr | ✅ 匹配 |
| interestRate | interest_rate | ✅ 匹配 |
| defaultRate | default_interest_rate | ✅ 匹配 |
| commencementDate | expected_commencement_date | ✅ 匹配 |
| expiryDate | expected_expiry_date | ✅ 匹配 |
| expectedRecoveryDate | expected_drawdown_date | ✅ 匹配 |
| borrower | borrower | ✅ 匹配 |
| lender | lender | ✅ 匹配 |
| issuer | issuer | ✅ 匹配 |
| sponsor | sponsor | ❌ **N/A** 数据库无此字段 |
| valuer | valuer | ✅ 匹配 |
| lawyer | lawyer | ✅ 匹配 |
| trustee | trustee | ❌ **N/A** 数据库无此字段 |
| collateral | collateral | ✅ 匹配 |

## ❌ 问题字段汇总

### 1. defaultRate vs default_interest_rate
**问题**: 前端使用 `default_rate`，数据库是 `default_interest_rate`
- **project_active**: 使用 `translatedProject.default_rate` ❌
- **project_incoming**: 使用 `translatedProject.default_interest_rate` ✅
- **建议**: 统一为 `default_interest_rate`

### 2. 缺失字段 - project_active表
以下字段在前端使用但数据库不存在：
- `sponsor` - ❌ N/A
- `valuer` - ❌ N/A (仅incoming表有)
- `lawyer` - ❌ N/A (仅incoming表有)
- `trustee` - ❌ N/A
- `kyc_registry_address` - ❌ N/A
- `trade_contract_address` - ❌ N/A
- `compliance_guard_contract_address` - ❌ N/A
- `Holder_Registry` - ❌ N/A

**建议**:
- 如需这些字段，应添加到project_active表
- 或前端处理时显示 N/A 或 'TBA'

### 3. 缺失字段 - project_incoming表
以下字段在前端使用但数据库不存在：
- `sponsor` - ❌ N/A
- `trustee` - ❌ N/A

### 4. 大小写不一致
- 前端使用 `Holder_Registry` (大写H)
- 数据库应该是 `holder_registry` (小写)

## ✅ 建议的修复方案

### 方案1: 添加缺失字段到数据库
```sql
-- project_active 表添加字段
ALTER TABLE project_active
ADD COLUMN sponsor VARCHAR(255) COMMENT '赞助方' AFTER guarantor,
ADD COLUMN valuer VARCHAR(255) COMMENT '评估师' AFTER issuer,
ADD COLUMN lawyer VARCHAR(255) COMMENT '律师事务所' AFTER issuer,
ADD COLUMN trustee VARCHAR(255) COMMENT '受托方' AFTER guarantor;

-- project_incoming 表添加字段
ALTER TABLE project_incoming
ADD COLUMN sponsor VARCHAR(255) COMMENT '赞助方' AFTER guarantor,
ADD COLUMN trustee VARCHAR(255) COMMENT '受托方' AFTER guarantor;
```

### 方案2: 前端适配现有数据库
- 对于不存在的字段，显示 'N/A' 或 'TBA'
- 修正字段名不一致问题

## 📝 待确认问题

请确认以下字段是否需要：

1. **sponsor (赞助方)** - 两个表都没有
   - [ ] 需要添加到数据库
   - [ ] 前端显示 N/A

2. **trustee (受托方)** - 两个表都没有
   - [ ] 需要添加到数据库
   - [ ] 前端显示 N/A

3. **valuer/lawyer** - project_active表没有
   - [ ] 添加到project_active表
   - [ ] 仅incoming项目显示

4. **合约地址字段** (kyc_registry_address, trade_contract_address等)
   - [ ] 需要添加到数据库
   - [ ] 这些是前端自定义字段

5. **security_rank** - 数据库有但前端未使用
   - [ ] 前端是否需要显示？
