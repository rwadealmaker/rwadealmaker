# 数据库重构与迁移指南

## 📋 概述

本指南描述如何将RWA Deal Maker项目的数据库从单一`project`表重构为`project_active`（已代币化）和`project_incoming`（待代币化）两个独立表，并实现字段的中英文映射。

### 重构目标

1. **表分离**: 将项目按状态分为两个独立表
   - `project_active`: RWAT001, RWAT002... (Tokenised RWA)
   - `project_incoming`: RWA001, RWA002... (To Be Tokenised RWA)

2. **字段标准化**: 所有字段值统一使用英文存储
   - property_type: `Residential`, `Commercial`
   - borrower: `Individual`, `Company`, `Trust`
   - collateral: `Residential_Property`, `Commercial_Property`

3. **中英文映射**: 通过配置文件实现显示层的多语言支持

---

## 🗂️ 新表结构

### project_active (已代币化RWA)

```sql
主键: id
唯一键: project_code (RWAT001, RWAT002...)
状态: ACTIVE | COMPLETED | DEFAULT
特有字段:
  - total_offering_token (总发行代币数)
  - subscribe_token (已认购代币数)
  - token_price (代币单价)
  - principal_token_address (本金代币合约)
  - interest_token_address (利息代币合约)
  - loan_issuer_address (贷款发行合约)
```

### project_incoming (待代币化RWA)

```sql
主键: id
唯一键: project_code (RWA001, RWA002...)
状态: INCOMING | UNDER_REVIEW | APPROVED | REJECTED
特有字段:
  - estimated_total_token (预计发行代币数)
  - estimated_token_price (预计代币单价)
  - expected_commencement_date (预计开始日期)
  - expected_expiry_date (预计到期日期)
  - review_notes (审核备注)
  - approved_by (审批人)
  - approved_at (审批时间)
```

---

## 🚀 实施步骤

### 第一步: 数据库准备

#### 1.1 备份现有数据
```bash
# 在执行任何操作前，先备份数据库
mysqldump -h 13.239.255.133 -P 10559 -u root -p123456 rwa > rwa_backup_20251027.sql
```

#### 1.2 创建新表
```bash
# 连接到数据库
mysql -h 13.239.255.133 -P 10559 -u root -p123456 rwa

# 执行表创建脚本
source Backend/database/create_project_tables.sql;
```

#### 1.3 验证表创建
```sql
-- 检查表是否创建成功
SHOW TABLES LIKE 'project_%';

-- 检查触发器
SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%';

-- 检查视图
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';
```

### 第二步: 数据迁移

#### 2.1 执行迁移脚本
```bash
cd Backend
node database/migrate_project_data.js
```

#### 2.2 验证迁移结果
```sql
-- 检查迁移数据量
SELECT 'project_active' as table_name, COUNT(*) as count FROM project_active
UNION ALL
SELECT 'project_incoming', COUNT(*) FROM project_incoming
UNION ALL
SELECT 'project_backup', COUNT(*) FROM project;

-- 检查project_code格式
SELECT project_code, project_name FROM project_active LIMIT 10;
SELECT project_code, project_name FROM project_incoming LIMIT 10;

-- 检查是否有重复的project_code
SELECT project_code, COUNT(*) as count
FROM project_active
GROUP BY project_code
HAVING count > 1;
```

#### 2.3 备份旧表
```sql
-- 重命名旧表（保留备份）
RENAME TABLE project TO project_backup;
```

### 第三步: 后端API更新

#### 3.1 更新index.js，使用新路由
```javascript
// Backend/index.js
// 替换旧的projectRouter
const projectRouter = require('./src/routers/projectRouter_v2')
app.use('/project', projectRouter)
```

#### 3.2 测试新API端点
```bash
# 测试查询已代币化项目
curl http://localhost:3000/project/active

# 测试查询待代币化项目
curl http://localhost:3000/project/incoming

# 测试查询单个项目
curl http://localhost:3000/project/active/RWAT001
curl http://localhost:3000/project/incoming/RWA001

# 测试向后兼容的旧端点
curl http://localhost:3000/project/select
curl http://localhost:3000/project/select/RWAT001
```

### 第四步: 前端集成

#### 4.1 安装字段映射模块
```javascript
// Frontend/Website/src/service/projectDataService.js
import { getFieldMapping, transformFieldValues, TRANSFORMABLE_FIELDS } from '@/config/fieldMappings'
```

#### 4.2 在projectDataService中添加字段转换
```javascript
// 标准化项目数据时自动转换字段
standardizeProjectData(rawData) {
  const language = getCurrentLanguage() // 'en' 或 'zh'

  const standardized = {
    // ... 原有字段映射 ...
  }

  // 自动转换需要映射的字段
  return transformFieldValues(standardized, TRANSFORMABLE_FIELDS, language)
}
```

#### 4.3 更新API调用
```javascript
// ListedProjectsView.vue - 调用已代币化项目API
async loadProjects() {
  const response = await fetch('http://localhost:3000/project/active')
  // ...
}

// ToBeListedView.vue - 调用待代币化项目API
async loadProjects() {
  const response = await fetch('http://localhost:3000/project/incoming')
  // ...
}
```

### 第五步: 语言切换集成

#### 5.1 在useLanguage composable中集成
```javascript
// Frontend/Website/src/composables/useLanguage.js
import { getFieldMapping } from '@/config/fieldMappings'

// 添加字段映射函数
const translateField = (fieldName, fieldValue) => {
  return getFieldMapping(fieldName, fieldValue, currentLanguage.value)
}

// 导出供组件使用
return {
  t,
  translateField,
  currentLanguage,
  setLanguage
}
```

#### 5.2 在组件中使用
```vue
<template>
  <div>
    <!-- 自动根据语言显示 -->
    <span>{{ translateField('property_type', project.property_type) }}</span>
    <span>{{ translateField('borrower', project.borrower) }}</span>
    <span>{{ translateField('collateral', project.collateral) }}</span>
  </div>
</template>

<script setup>
import { useLanguage } from '@/composables/useLanguage'
const { translateField } = useLanguage()
</script>
```

---

## 📝 字段标准化规范

### 数据库存储值 (英文)

| 字段 | 标准值示例 |
|------|-----------|
| property_type | `Residential`, `Commercial`, `Industrial`, `Land` |
| mortgage_type | `First_Mortgage`, `Second_Mortgage` |
| collateral | `Residential_Property`, `Commercial_Property`, `Land` |
| borrower | `Individual`, `Company`, `Trust`, `Partnership` |
| loan_type | `First`, `Second`, `Bridging`, `Construction` |
| loan_purpose | `Purchase`, `Refinance`, `Construction`, `Investment` |
| repayment_arrangement | `Interest_Only`, `Principal_And_Interest` |
| early_repayment | `Allowed`, `Not_Allowed`, `With_Penalty` |
| security_rank | `First`, `Second`, `Third` |
| property_state | `NSW`, `VIC`, `QLD`, `WA`, `SA`, `TAS`, `ACT`, `NT` |

### 显示映射 (中文)

查看 `Frontend/Website/src/config/fieldMappings.js` 获取完整映射表。

示例：
- `Residential` → 住宅
- `Commercial` → 商业
- `Individual` → 个人
- `Company` → 公司
- `First_Mortgage` → 第一顺位抵押

---

## 🔄 API端点变更对照

### 新端点 (推荐使用)

| 方法 | 旧端点 | 新端点 | 说明 |
|------|--------|--------|------|
| GET | `/project/select` | `/project/active` | 查询已代币化项目 |
| GET | `/project/select` | `/project/incoming` | 查询待代币化项目 |
| GET | `/project/select/:code` | `/project/active/:code` | 查询单个已代币化项目 |
| GET | `/project/select/:code` | `/project/incoming/:code` | 查询单个待代币化项目 |
| POST | `/project/insert` | `/project/active` | 添加已代币化项目 |
| POST | `/project/insert` | `/project/incoming` | 添加待代币化项目 |
| PUT | - | `/project/active/:code` | 更新已代币化项目 |
| PUT | - | `/project/incoming/:code` | 更新待代币化项目 |
| POST | - | `/project/incoming/:code/approve` | 审批待代币化项目 |
| POST | - | `/project/incoming/:code/reject` | 拒绝待代币化项目 |

### 向后兼容端点 (保留)

旧端点仍然可用，会根据参数自动路由到正确的表：
- `GET /project/select` - 返回合并后的所有项目
- `GET /project/select/:code` - 根据code前缀自动判断查询哪个表
- `POST /project/insert` - 根据status字段判断插入到哪个表

---

## ✅ 验证清单

### 数据库层面
- [ ] 新表创建成功
- [ ] 触发器工作正常（自动生成project_code）
- [ ] 数据迁移完整无误
- [ ] 旧表已备份

### 后端API层面
- [ ] 新API端点正常响应
- [ ] 向后兼容端点仍可用
- [ ] project_code格式正确（RWAT/RWA前缀）
- [ ] 错误处理完善

### 前端层面
- [ ] 字段映射配置正确
- [ ] 语言切换正常工作
- [ ] ListedProjectsView显示已代币化项目
- [ ] ToBeListedView显示待代币化项目
- [ ] 所有英文字段正确显示为中文

---

## 🔧 常见问题

### Q1: 迁移后旧端点不工作了？
**A**: 检查`Backend/index.js`是否更新为使用`projectRouter_v2`。如果使用新路由，旧端点应该仍然可用（向后兼容）。

### Q2: project_code没有自动生成？
**A**: 检查触发器是否创建成功：
```sql
SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%';
```

### Q3: 中英文映射不生效？
**A**: 确认以下几点：
1. `fieldMappings.js`文件已创建
2. 组件中正确导入了`translateField`函数
3. 数据库字段值使用的是标准英文值（如`Residential`而不是`住宅`）

### Q4: 数据迁移后出现重复数据？
**A**: 清空表后重新迁移：
```sql
TRUNCATE TABLE project_active;
TRUNCATE TABLE project_incoming;
-- 重新执行迁移脚本
node Backend/database/migrate_project_data.js
```

### Q5: 如何回滚到旧版本？
**A**:
```sql
-- 删除新表
DROP TABLE IF EXISTS project_active;
DROP TABLE IF EXISTS project_incoming;

-- 恢复旧表
RENAME TABLE project_backup TO project;

-- 恢复旧路由
-- 在Backend/index.js中改回使用projectRouter
```

---

## 📊 性能优化建议

1. **索引优化**
   - 新表已自动创建必要的索引
   - 根据实际查询情况可添加复合索引

2. **缓存策略**
   - 字段映射结果可缓存在内存中
   - 项目列表可使用Redis缓存

3. **分页查询**
   ```sql
   SELECT * FROM project_active
   LIMIT 20 OFFSET 0;
   ```

---

## 📞 技术支持

如遇到问题，请检查：
1. 数据库连接配置 (Backend/src/database/dbConfig.js)
2. 环境变量 (.env文件)
3. Node.js版本 (需要18+)
4. MySQL版本 (需要8.0+)

---

**更新日期**: 2025-10-27
**版本**: v2.0.0
**维护者**: RWA Deal Maker Team
