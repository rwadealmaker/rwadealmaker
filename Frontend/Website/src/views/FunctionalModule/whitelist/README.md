# FunctionalModule 目录说明

## 概述

FunctionalModule 目录用于存放可复用的功能模块组件，这些组件可以在多个页面中使用，提高代码的可维护性和复用性。

## 组件列表

### WhitelistApplication.vue

白名单申请功能组件，提供完整的白名单申请流程管理。

#### 功能特性

- **状态管理**: 支持 'none', 'pending', 'approved', 'rejected' 四种状态
- **智能显示**: 根据状态动态显示不同的UI和操作按钮
- **完整流程**: 包含申请确认、处理进度、结果反馈的完整用户流程
- **合约集成**: 内置合约服务集成，支持区块链交互
- **事件通信**: 通过事件与父组件通信，保持组件独立性

#### Props

```javascript
{
  isKycVerified: {
    type: Boolean,
    default: false,
    description: 'KYC验证状态'
  },
  userInfo: {
    type: Object,
    default: () => ({}),
    description: '用户信息，包含firstName, lastName, dob, country, docType'
  }
}
```

#### Events

```javascript
{
  success: '白名单操作成功时触发',
  error: '白名单操作失败时触发',
  info: '白名单信息提示时触发'
}
```

#### 使用方法

```vue
<template>
  <WhitelistApplication 
    :is-kyc-verified="isKycVerified"
    :user-info="userInfo"
    @success="handleSuccess"
    @error="handleError"
    @info="handleInfo"
  />
</template>

<script>
import WhitelistApplication from '@/views/FunctionalModule/WhitelistApplication.vue'

export default {
  components: {
    WhitelistApplication
  },
  data() {
    return {
      isKycVerified: true,
      userInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        country: 'US',
        docType: 'passport'
      }
    }
  },
  methods: {
    handleSuccess(message) {
      console.log('Success:', message)
    },
    handleError(message) {
      console.log('Error:', message)
    },
    handleInfo(message) {
      console.log('Info:', message)
    }
  }
}
</script>
```

#### 状态说明

1. **none**: 未申请状态
   - 显示: "Apply for Whitelist"
   - 按钮: "Apply Now"
   - 颜色: 灰色

2. **pending**: 申请中状态
   - 显示: "Whitelist Application Pending"
   - 按钮: "Check Status"
   - 颜色: 橙色

3. **approved**: 已批准状态
   - 显示: "Whitelist Approved" + 对勾图标
   - 按钮: "Start Trading"
   - 颜色: 绿色

4. **rejected**: 已拒绝状态
   - 显示: "Whitelist Application Rejected"
   - 按钮: "Reapply"
   - 颜色: 红色

#### 合约集成

组件内置了合约服务集成，支持：

- 自动初始化合约连接
- KYC级别查询
- 白名单申请提交
- 状态实时更新
- 错误处理

#### 样式定制

组件使用scoped样式，可以通过CSS变量或深度选择器进行定制：

```css
/* 自定义颜色主题 */
.whitelist-application {
  --primary-color: #ea7a2e;
  --success-color: #16a34a;
  --warning-color: #f97316;
  --error-color: #dc2626;
}
```

## 开发指南

### 添加新组件

1. 在 `FunctionalModule` 目录下创建新的 `.vue` 文件
2. 确保组件具有良好的封装性和可复用性
3. 提供清晰的 Props 和 Events 接口
4. 编写完整的样式，使用scoped避免样式冲突
5. 更新此README文档

### 组件设计原则

1. **单一职责**: 每个组件只负责一个功能模块
2. **高内聚低耦合**: 组件内部逻辑紧密，与外部组件松耦合
3. **可配置性**: 通过Props提供配置选项
4. **事件驱动**: 通过Events与父组件通信
5. **样式隔离**: 使用scoped样式避免冲突
6. **错误处理**: 完善的错误处理和用户反馈

### 测试建议

1. **单元测试**: 测试组件的各种状态和交互
2. **集成测试**: 测试与父组件的交互
3. **视觉测试**: 确保在不同主题下的显示效果
4. **边界测试**: 测试异常情况和错误处理

## 扩展计划

### 计划添加的组件

1. **KycVerification.vue**: KYC验证流程组件
2. **WalletConnection.vue**: 钱包连接组件
3. **TransactionStatus.vue**: 交易状态显示组件
4. **NotificationCenter.vue**: 通知中心组件
5. **UserProfile.vue**: 用户资料编辑组件

### 组件库规划

- 建立统一的组件设计系统
- 创建组件文档网站
- 实现组件的自动测试
- 提供组件使用示例

## 维护说明

- 定期更新组件以适配新的业务需求
- 保持向后兼容性
- 及时修复bug和安全问题
- 优化性能和用户体验

---

**注意**: 此目录下的组件应该保持独立性，避免直接依赖特定的页面逻辑或全局状态。
