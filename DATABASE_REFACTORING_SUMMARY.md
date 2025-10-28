# 数据库重构总结文档

## 📌 重构概览

本次重构主要完成了以下工作：

### ✅ 已完成的工作

1. **数据库表分离**
   - 创建 `project_active` 表 (已代币化项目, RWAT系列)
   - 创建 `project_incoming` 表 (待代币化项目, RWA系列)
   - 实现自动生成project_code的触发器
   - 创建统一查询视图 `v_all_projects`

2. **字段标准化**
   - 所有中英文混杂字段统一为英文存储
   - 标准化13个核心字段的取值规范
   - 创建完整的字段映射配置文件

3. **后端API升级**
   - 新增 `projectRouter_Handler_v2.js` (新业务逻辑)
   - 新增 `projectRouter_v2.js` (新路由配置)
   - 保留向后兼容的旧API端点
   - 新增项目审批API

4. **前端配置**
   - 创建 `fieldMappings.js` 字段映射配置
   - 实现 `getFieldMapping()` 转换函数
   - 实现 `transformFieldValues()` 批量转换
   - 实现 `getReverseMapping()` 反向查询

5. **数据迁移**
   - 创建自动化迁移脚本 `migrate_project_data.js`
   - 智能识别项目状态并分配到对应表
   - 自动生成符合规范的project_code
   - 完整的迁移日志和统计

6. **文档完善**
   - 完整的迁移指南 (`DATABASE_MIGRATION_GUIDE.md`)
   - 详细的实施步骤和验证清单
   - 常见问题解答
   - API端点对照表

---

## 📂 新增文件清单

### 数据库相关
```
Backend/database/
├── create_project_tables.sql          # 建表SQL脚本
└── migrate_project_data.js            # 数据迁移脚本
```

### 后端API
```
Backend/src/routers/
├── projectRouter_v2.js                 # 新路由配置
└── route_handler/
    └── projectRouter_Handler_v2.js     # 新业务逻辑
```

### 前端配置
```
Frontend/Website/src/config/
└── fieldMappings.js                    # 字段映射配置
```

### 文档
```
PROJECT_ANALYSIS_REPORT.md              # 项目分析报告（原有）
DATABASE_MIGRATION_GUIDE.md            # 迁移指南（新增）
DATABASE_REFACTORING_SUMMARY.md        # 重构总结（本文档）
```

---

## 🔄 数据表对比

### 原project表
```
单一表，混合存储所有项目
loan_status: INCOMING | ACTIVE | COMPLETED | DEFAULT
project_code: 不统一（RWA001, RWAT001混杂）
字段值: 中英文混杂
```

### 新表结构

#### project_active (已代币化)
```
project_code: RWAT001, RWAT002, RWAT003...
status: ACTIVE | COMPLETED | DEFAULT
特有: 代币合约地址, 实际认购数
用途: Tokenised RWA页面展示
```

#### project_incoming (待代币化)
```
project_code: RWA001, RWA002, RWA003...
status: INCOMING | UNDER_REVIEW | APPROVED | REJECTED
特有: 预计代币数, 审批信息
用途: To Be Tokenised页面展示
```

---

## 🎯 核心改进点

### 1. 代码命名规范统一

**问题**: 原代码中project_code不统一
```javascript
// 旧代码混用
RWAT001, RWA001, YYD, SQNB, TYMU, LZYT...
```

**解决方案**: 严格区分
```javascript
// 已代币化: RWAT前缀
project_active: RWAT001, RWAT002, RWAT003...

// 待代币化: RWA前缀
project_incoming: RWA001, RWA002, RWA003...
```

### 2. 字段值标准化

**问题**: 数据库存储中英文混杂
```sql
-- 旧数据混乱
property_type: '住宅', 'Residential', 'residential', '商业'
borrower: '个人', 'Individual', 'Company', '公司'
```

**解决方案**: 统一英文存储 + 映射层转换
```sql
-- 数据库统一英文
property_type: 'Residential', 'Commercial', 'Industrial'
borrower: 'Individual', 'Company', 'Trust'

-- 前端显示自动转换
中文: '住宅', '商业', '工业'
英文: 'Residential', 'Commercial', 'Industrial'
```

### 3. 业务逻辑分离

**问题**: 单一表难以区分不同业务阶段
```javascript
// 旧方式: 通过loan_status判断
if (loan_status === 'INCOMING') { /* 待代币化逻辑 */ }
else { /* 已代币化逻辑 */ }
```

**解决方案**: 表级别分离
```javascript
// 新方式: 不同表不同逻辑
await fetch('/project/active')    // 已代币化项目
await fetch('/project/incoming')  // 待代币化项目
```

---

## 🛠️ 实施计划

### 阶段一: 准备阶段 (已完成)
- [x] 分析现有表结构
- [x] 设计新表结构
- [x] 创建字段映射规范
- [x] 编写SQL建表脚本

### 阶段二: 开发阶段 (已完成)
- [x] 实现后端新API
- [x] 实现数据迁移脚本
- [x] 实现字段映射配置
- [x] 编写详细文档

### 阶段三: 迁移阶段 (待执行)
- [ ] 备份生产数据库
- [ ] 执行建表SQL
- [ ] 执行数据迁移
- [ ] 验证数据完整性
- [ ] 备份旧表

### 阶段四: 集成阶段 (待执行)
- [ ] 更新后端路由配置
- [ ] 更新前端service层
- [ ] 更新ListedProjectsView
- [ ] 更新ToBeListedView
- [ ] 集成字段映射

### 阶段五: 测试阶段 (待执行)
- [ ] 单元测试
- [ ] 集成测试
- [ ] 前端功能测试
- [ ] 语言切换测试
- [ ] 性能测试

### 阶段六: 上线阶段 (待执行)
- [ ] 灰度发布
- [ ] 监控运行状态
- [ ] 收集反馈
- [ ] 优化调整

---

## 📊 字段映射规范

### 标准化字段列表 (13个)

1. **property_type** - 物业类型
   ```
   Residential, Commercial, Industrial, Land,
   Mixed_Use, Retail, Office, Warehouse,
   Apartment, House, Townhouse, Unit
   ```

2. **mortgage_type** - 抵押类型
   ```
   First_Mortgage, Second_Mortgage, Third_Mortgage,
   Blanket_Mortgage, Cross_Collateral
   ```

3. **collateral** - 抵押物类型
   ```
   Residential_Property, Commercial_Property,
   Industrial_Property, Land, Mixed_Use_Property,
   Vacant_Land, Development_Site
   ```

4. **borrower** - 借款人类型
   ```
   Individual, Company, Trust, Partnership,
   Joint_Venture, SMSF, Family_Trust, Unit_Trust
   ```

5. **loan_type** - 贷款类型
   ```
   First, Second, Bridging, Construction,
   Development, Refinance, Equity_Release
   ```

6. **loan_purpose** - 贷款用途
   ```
   Purchase, Refinance, Construction, Renovation,
   Development, Investment, Business, Debt_Consolidation
   ```

7. **repayment_arrangement** - 还款安排
   ```
   Interest_Only, Principal_And_Interest,
   Balloon_Payment, Bullet_Repayment
   ```

8. **early_repayment** - 提前还款
   ```
   Allowed, Not_Allowed, With_Penalty,
   Without_Penalty, Partial_Allowed
   ```

9. **security_rank** - 抵押顺位
   ```
   First, Second, Third, Unregistered, Pari_Passu
   ```

10. **status_active** - 已代币化状态
    ```
    ACTIVE, COMPLETED, DEFAULT, SUSPENDED, TERMINATED
    ```

11. **status_incoming** - 待代币化状态
    ```
    INCOMING, UNDER_REVIEW, APPROVED, REJECTED, PENDING
    ```

12. **property_state** - 澳洲州/省
    ```
    NSW, VIC, QLD, WA, SA, TAS, ACT, NT
    ```

13. **loan_product** - 贷款产品 (自由文本)

---

## 💡 使用示例

### 后端API使用

```javascript
// 查询已代币化项目
GET http://localhost:3000/project/active
Response: [
  {
    project_code: "RWAT001",
    property_type: "Residential",  // 英文存储
    borrower: "Individual",
    status: "ACTIVE"
  }
]

// 查询待代币化项目
GET http://localhost:3000/project/incoming
Response: [
  {
    project_code: "RWA001",
    property_type: "Commercial",   // 英文存储
    borrower: "Company",
    status: "INCOMING"
  }
]

// 审批项目
POST http://localhost:3000/project/incoming/RWA001/approve
Body: {
  "approved_by": "admin_user",
  "review_notes": "Approved after review"
}
```

### 前端字段映射使用

```javascript
import { getFieldMapping, useLanguage } from '@/composables/useLanguage'

// 单个字段转换
const propertyTypeZh = getFieldMapping('property_type', 'Residential', 'zh')
// 返回: "住宅"

const propertyTypeEn = getFieldMapping('property_type', 'Residential', 'en')
// 返回: "Residential"

// 批量转换
import { transformFieldValues, TRANSFORMABLE_FIELDS } from '@/config/fieldMappings'

const project = {
  property_type: 'Residential',
  borrower: 'Individual',
  collateral: 'Residential_Property'
}

const transformedProject = transformFieldValues(project, TRANSFORMABLE_FIELDS, 'zh')
// {
//   property_type: '住宅',
//   borrower: '个人',
//   collateral: '住宅物业'
// }
```

---

## ⚠️ 注意事项

### 1. 数据一致性
- 迁移前必须备份
- 迁移后仔细验证数据
- 保留旧表至少1周

### 2. API兼容性
- 新旧API端点同时可用
- 逐步迁移前端调用
- 监控旧端点使用情况

### 3. 字段规范
- 新数据必须使用英文标准值
- 前端显示时自动转换
- 禁止直接存储中文到数据库

### 4. project_code命名
- 已代币化: 必须RWAT前缀
- 待代币化: 必须RWA前缀
- 触发器自动生成，无需手动指定

---

## 🔗 相关文档

1. **[PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md)** - 项目整体分析
2. **[DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)** - 详细迁移指南
3. **[README.md](README.md)** - 项目说明文档

---

## 📈 下一步计划

### 立即执行
1. 执行数据迁移脚本
2. 更新后端index.js使用新路由
3. 测试新API端点

### 短期计划 (本周)
1. 更新前端service层
2. 集成字段映射到组件
3. 完整测试前端功能

### 中期计划 (下周)
1. 优化查询性能
2. 添加缓存机制
3. 编写单元测试

### 长期计划 (本月)
1. 监控数据质量
2. 收集用户反馈
3. 持续优化

---

**文档版本**: v1.0
**最后更新**: 2025-10-27
**负责人**: Development Team
