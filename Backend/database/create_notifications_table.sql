-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    
    /* 用户标识 */
    user_id BIGINT NULL COMMENT '用户ID',
    user_wallet_address VARCHAR(42) NULL COMMENT '用户钱包地址',
    
    /* 关联信息 */
    subscription_id BIGINT NULL COMMENT '关联的认购申请ID',
    
    /* 通知内容 */
    type ENUM(
        'SUBSCRIPTION_APPLIED',      -- 认购申请成功
        'SUBSCRIPTION_UNDER_REVIEW', -- 认购审核中
        'SUBSCRIPTION_APPROVED',     -- 认购已通过
        'SUBSCRIPTION_REJECTED',     -- 认购被拒绝
        'PAYMENT_REQUIRED',          -- 需要支付
        'PAYMENT_SUBMITTED',         -- 支付已提交
        'PAYMENT_CONFIRMED',         -- 支付已确认
        'COMPLETED',                 -- 认购完成
        'TRANSACTION_SUCCESS',       -- 交易成功
        'NEW_PROJECT_LAUNCHED',      -- 新项目上线
        'SUBSCRIPTION_PROGRESS',     -- 认购进度更新
        'KYC_STATUS_UPDATE',         -- KYC状态更新
        'WHITELIST_STATUS_UPDATE',   -- 白名单状态更新
        'PRINCIPAL_TOKEN_RECEIVED',  -- 收到本金代币
        'INTEREST_TOKEN_RECEIVED',   -- 收到利息代币
        'PROJECT_MATURITY'           -- 项目到期
    ) NOT NULL COMMENT '通知类型',
    
    title VARCHAR(255) NOT NULL COMMENT '通知标题',
    body TEXT NOT NULL COMMENT '通知内容',
    payload JSON NULL COMMENT '额外数据（JSON格式）',
    
    /* 状态 */
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读（0=未读，1=已读）',
    
    /* 时间戳 */
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    /* 索引 */
    INDEX idx_user_id (user_id),
    INDEX idx_user_wallet (user_wallet_address),
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    
    /* 外键约束 */
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户通知表';
