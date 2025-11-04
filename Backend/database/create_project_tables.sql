-- =====================================================
-- RWA Deal Maker 项目表结构重构
-- =====================================================
-- 创建日期: 2025-10-27
-- 说明: 将原project表拆分为project_active和project_incoming两个表
--       project_active: 已代币化项目 (RWAT001, RWAT002...)
--       project_incoming: 待代币化项目 (RWA001, RWA002...)
-- =====================================================

-- =====================================================
-- 1. 创建 project_active 表 (已代币化RWA项目)
-- =====================================================
CREATE TABLE IF NOT EXISTS `project_active` (
  -- 主键和基本信息
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '项目ID',
  `project_code` VARCHAR(20) NOT NULL UNIQUE COMMENT '项目代码 (RWAT001, RWAT002...)',
  `project_name` VARCHAR(255) NOT NULL COMMENT '项目名称',
  `property_summary` TEXT COMMENT '物业摘要',

  -- 项目状态 (已代币化项目的状态)
  `status` ENUM('ACTIVE', 'COMPLETED', 'DEFAULT') NOT NULL DEFAULT 'ACTIVE' COMMENT '项目状态',

  -- 代币信息
  `total_offering_token` DECIMAL(20, 2) DEFAULT 0 COMMENT '总发行代币数',
  `subscribe_token` DECIMAL(20, 2) DEFAULT 0 COMMENT '已认购代币数',
  `token_price` DECIMAL(20, 2) DEFAULT 1 COMMENT '代币单价',

  -- 贷款基本信息 (全部英文)
  `loan_amount` DECIMAL(20, 2) COMMENT '贷款金额',
  `interest_rate` DECIMAL(5, 2) COMMENT '底层资产年利率 (%) - 底层资产的实际收益率',
  `estimated_return` DECIMAL(5, 2) COMMENT '预期收益率 (%) - 给投资人的Token收益率',
  `loan_term_months` INT COMMENT '贷款期限 (月)',
  `lvr` DECIMAL(5, 2) COMMENT '贷款价值比 (LVR %)',

  -- 物业信息 (全部英文)
  `property_location` VARCHAR(255) COMMENT '物业地址',
  `property_state` VARCHAR(50) COMMENT '物业州/省',
  `property_type` VARCHAR(50) COMMENT '物业类型 (Residential/Commercial/Industrial/Land)',
  `property_value` DECIMAL(20, 2) COMMENT '物业估值',

  -- 贷款类型信息 (全部英文)
  `loan_type` VARCHAR(50) COMMENT '贷款类型 (First/Second)',
  `loan_product` VARCHAR(100) COMMENT '贷款产品',
  `loan_purpose` VARCHAR(100) COMMENT '贷款用途 (Purchase/Refinance/Construction)',
  `mortgage_type` VARCHAR(50) COMMENT '抵押类型 (First_Mortgage/Second_Mortgage)',

  -- 参与方信息 (全部英文)
  `borrower` VARCHAR(100) COMMENT '借款人类型 (Individual/Company/Trust)',
  `lender` VARCHAR(255) COMMENT '贷款方',
  `issuer` VARCHAR(255) COMMENT '发行方',
  `guarantor` VARCHAR(255) COMMENT '担保方',

  -- 抵押物信息 (全部英文)
  `collateral` VARCHAR(100) COMMENT '抵押物类型 (Residential_Property/Commercial_Property/Land)',
  `security_rank` VARCHAR(50) COMMENT '抵押顺位 (First/Second)',

  -- 时间信息
  `commencement_date` DATE COMMENT '开始日期',
  `expiry_date` DATE COMMENT '到期日期',
  `drawdown_date` DATE COMMENT '放款日期',
  `expected_recovery_date` DATE COMMENT '预期回收日期',

  -- 还款信息
  `repayment_arrangement` VARCHAR(100) COMMENT '还款安排 (Interest_Only/Principal_And_Interest)',
  `early_repayment` VARCHAR(20) COMMENT '提前还款 (Allowed/Not_Allowed)',
  `early_repayment_details` TEXT COMMENT '提前还款详情',

  -- 违约信息 (全部英文)
  `default_interest_rate` DECIMAL(5, 2) COMMENT '违约利率 (%)',
  `default_triggers` TEXT COMMENT '违约触发条件',
  `default_process` TEXT COMMENT '违约处理流程',

  -- 文档链接
  `valuation_report` VARCHAR(500) COMMENT '估值报告URL',
  `mortgage_deed` VARCHAR(500) COMMENT '抵押文件URL',
  `issuer_token` VARCHAR(500) COMMENT '发行方代币文档URL',
  `loan_token` VARCHAR(500) COMMENT '贷款代币文档URL',

  -- 合约地址
  `principal_token_address` VARCHAR(42) COMMENT '本金代币合约地址 (LPRI)',
  `interest_token_address` VARCHAR(42) COMMENT '利息代币合约地址 (LINT)',
  `loan_issuer_address` VARCHAR(42) COMMENT 'LoanIssuer合约地址',

  -- 审计字段
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` VARCHAR(100) COMMENT '创建人',
  `updated_by` VARCHAR(100) COMMENT '更新人',

  -- 索引
  INDEX `idx_project_code` (`project_code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_property_type` (`property_type`),
  INDEX `idx_loan_type` (`loan_type`),
  INDEX `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='已代币化RWA项目表';


-- =====================================================
-- 2. 创建 project_incoming 表 (待代币化RWA项目)
-- =====================================================
CREATE TABLE IF NOT EXISTS `project_incoming` (
  -- 主键和基本信息
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '项目ID',
  `project_code` VARCHAR(20) NOT NULL UNIQUE COMMENT '项目代码 (RWA001, RWA002...)',
  `project_name` VARCHAR(255) NOT NULL COMMENT '项目名称',
  `property_summary` TEXT COMMENT '物业摘要',

  -- 项目状态 (待代币化项目的状态)
  `status` ENUM('INCOMING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'INCOMING' COMMENT '项目状态',

  -- 预计代币信息
  `estimated_total_token` DECIMAL(20, 2) DEFAULT 0 COMMENT '预计发行代币数',
  `estimated_token_price` DECIMAL(20, 2) DEFAULT 1 COMMENT '预计代币单价',

  -- 贷款基本信息 (全部英文)
  `loan_amount` DECIMAL(20, 2) COMMENT '贷款金额',
  `interest_rate` DECIMAL(5, 2) COMMENT '年利率 (%)',
  `loan_term_months` INT COMMENT '贷款期限 (月)',
  `lvr` DECIMAL(5, 2) COMMENT '贷款价值比 (LVR %)',

  -- 物业信息 (全部英文)
  `property_location` VARCHAR(255) COMMENT '物业地址',
  `property_state` VARCHAR(50) COMMENT '物业州/省',
  `property_type` VARCHAR(50) COMMENT '物业类型 (Residential/Commercial/Industrial/Land)',
  `property_value` DECIMAL(20, 2) COMMENT '物业估值',

  -- 贷款类型信息 (全部英文)
  `loan_type` VARCHAR(50) COMMENT '贷款类型 (First/Second)',
  `loan_product` VARCHAR(100) COMMENT '贷款产品',
  `loan_purpose` VARCHAR(100) COMMENT '贷款用途 (Purchase/Refinance/Construction)',
  `mortgage_type` VARCHAR(50) COMMENT '抵押类型 (First_Mortgage/Second_Mortgage)',

  -- 参与方信息 (全部英文)
  `borrower` VARCHAR(100) COMMENT '借款人类型 (Individual/Company/Trust)',
  `lender` VARCHAR(255) COMMENT '贷款方',
  `issuer` VARCHAR(255) COMMENT '发行方',
  `guarantor` VARCHAR(255) COMMENT '担保方',

  -- 抵押物信息 (全部英文)
  `collateral` VARCHAR(100) COMMENT '抵押物类型 (Residential_Property/Commercial_Property/Land)',
  `security_rank` VARCHAR(50) COMMENT '抵押顺位 (First/Second)',

  -- 预计时间信息
  `expected_commencement_date` DATE COMMENT '预计开始日期',
  `expected_expiry_date` DATE COMMENT '预计到期日期',
  `expected_drawdown_date` DATE COMMENT '预计放款日期',

  -- 还款信息
  `repayment_arrangement` VARCHAR(100) COMMENT '还款安排 (Interest_Only/Principal_And_Interest)',
  `early_repayment` VARCHAR(20) COMMENT '提前还款 (Allowed/Not_Allowed)',
  `early_repayment_details` TEXT COMMENT '提前还款详情',

  -- 违约信息 (全部英文)
  `default_interest_rate` DECIMAL(5, 2) COMMENT '违约利率 (%)',
  `default_triggers` TEXT COMMENT '违约触发条件',
  `default_process` TEXT COMMENT '违约处理流程',

  -- 文档链接
  `valuation_report` VARCHAR(500) COMMENT '估值报告URL',
  `mortgage_deed` VARCHAR(500) COMMENT '抵押文件URL',

  -- 审批信息
  `review_notes` TEXT COMMENT '审核备注',
  `approved_by` VARCHAR(100) COMMENT '审批人',
  `approved_at` TIMESTAMP NULL COMMENT '审批时间',

  -- 审计字段
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` VARCHAR(100) COMMENT '创建人',
  `updated_by` VARCHAR(100) COMMENT '更新人',

  -- 索引
  INDEX `idx_project_code` (`project_code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_property_type` (`property_type`),
  INDEX `idx_loan_type` (`loan_type`),
  INDEX `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待代币化RWA项目表';


-- =====================================================
-- 3. 数据迁移脚本 (从旧project表迁移数据)
-- =====================================================
-- 注意: 仅在需要迁移旧数据时执行

-- 迁移已代币化项目 (loan_status = 'ACTIVE' 或 'COMPLETED')
-- INSERT INTO project_active
-- SELECT
--   id, project_code, project_name, property_summary,
--   CASE
--     WHEN loan_status = 'ACTIVE' THEN 'ACTIVE'
--     WHEN loan_status = 'COMPLETED' THEN 'COMPLETED'
--     WHEN loan_status = 'DEFAULT' THEN 'DEFAULT'
--     ELSE 'ACTIVE'
--   END as status,
--   total_offering_token, subscribe_token, 1 as token_price,
--   loan_amount, interest_rate, loan_term_months, lvr,
--   property_location, property_state, property_type, property_value,
--   loan_type, loan_product, loan_purpose, mortgage_type,
--   borrower, lender, issuer, guarantor,
--   collateral, security_rank,
--   commencement_date, expiry_date, drawdown_date, expected_recovery_date,
--   repayment_arrangement, early_repayment, early_repayment_details,
--   default_interest_rate, default_triggers, default_process,
--   valuation_report, mortgage_deed, issuer_token, loan_token,
--   NULL as principal_token_address,
--   NULL as interest_token_address,
--   NULL as loan_issuer_address,
--   created_at, updated_at, created_by, updated_by
-- FROM project
-- WHERE loan_status IN ('ACTIVE', 'COMPLETED', 'DEFAULT');

-- 迁移待代币化项目 (loan_status = 'INCOMING')
-- INSERT INTO project_incoming
-- SELECT
--   id, project_code, project_name, property_summary,
--   'INCOMING' as status,
--   total_offering_token as estimated_total_token,
--   1 as estimated_token_price,
--   loan_amount, interest_rate, loan_term_months, lvr,
--   property_location, property_state, property_type, property_value,
--   loan_type, loan_product, loan_purpose, mortgage_type,
--   borrower, lender, issuer, guarantor,
--   collateral, security_rank,
--   commencement_date as expected_commencement_date,
--   expiry_date as expected_expiry_date,
--   drawdown_date as expected_drawdown_date,
--   repayment_arrangement, early_repayment, early_repayment_details,
--   default_interest_rate, default_triggers, default_process,
--   valuation_report, mortgage_deed,
--   NULL as review_notes,
--   NULL as approved_by,
--   NULL as approved_at,
--   created_at, updated_at, created_by, updated_by
-- FROM project
-- WHERE loan_status = 'INCOMING';


-- =====================================================
-- 4. 创建视图 (方便统一查询)
-- =====================================================
CREATE OR REPLACE VIEW `v_all_projects` AS
SELECT
  project_code,
  project_name,
  property_summary,
  status,
  'ACTIVE' as project_category,
  loan_amount,
  interest_rate,
  loan_term_months,
  property_location,
  property_type,
  created_at
FROM project_active
UNION ALL
SELECT
  project_code,
  project_name,
  property_summary,
  status,
  'INCOMING' as project_category,
  loan_amount,
  interest_rate,
  loan_term_months,
  property_location,
  property_type,
  created_at
FROM project_incoming;


-- =====================================================
-- 5. 创建触发器 (自动生成project_code)
-- =====================================================
-- 触发器: 自动生成project_active的project_code
DROP TRIGGER IF EXISTS `trg_project_active_code`;
DELIMITER $$
CREATE TRIGGER `trg_project_active_code`
BEFORE INSERT ON `project_active`
FOR EACH ROW
BEGIN
  DECLARE next_id INT;

  IF NEW.project_code IS NULL OR NEW.project_code = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_code, 5) AS UNSIGNED)), 0) + 1
    INTO next_id
    FROM project_active
    WHERE project_code REGEXP '^RWAT[0-9]+$';

    SET NEW.project_code = CONCAT('RWAT', LPAD(next_id, 3, '0'));
  END IF;
END$$
DELIMITER ;

-- 触发器: 自动生成project_incoming的project_code
DROP TRIGGER IF EXISTS `trg_project_incoming_code`;
DELIMITER $$
CREATE TRIGGER `trg_project_incoming_code`
BEFORE INSERT ON `project_incoming`
FOR EACH ROW
BEGIN
  DECLARE next_id INT;

  IF NEW.project_code IS NULL OR NEW.project_code = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_code, 4) AS UNSIGNED)), 0) + 1
    INTO next_id
    FROM project_incoming
    WHERE project_code REGEXP '^RWA[0-9]+$';

    SET NEW.project_code = CONCAT('RWA', LPAD(next_id, 3, '0'));
  END IF;
END$$
DELIMITER ;


-- =====================================================
-- 完成
-- =====================================================
-- 执行完成后,请检查:
-- 1. 两个表是否创建成功: SHOW TABLES LIKE 'project_%';
-- 2. 触发器是否创建成功: SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%';
-- 3. 视图是否创建成功: SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';
