# 🚀 快速开始指南

本指南将帮助你快速完成数据库重构的所有步骤。

---

## ⚡ 快速执行清单

### ☑️ 步骤 1: 备份数据库（必须！）

```bash
# 连接到你的服务器
ssh user@your-server

# 备份当前数据库
mysqldump -h 13.239.255.133 -P 10559 -u root -p123456 rwa > rwa_backup_$(date +%Y%m%d).sql

# 确认备份文件存在
ls -lh rwa_backup_*.sql
```

### ☑️ 步骤 2: 执行数据库建表

```bash
# 方法1: 使用mysql命令行
mysql -h 13.239.255.133 -P 10559 -u root -p123456 rwa < Backend/database/create_project_tables.sql

# 方法2: 或者手动执行
# 1. 登录MySQL
mysql -h 13.239.255.133 -P 10559 -u root -p123456 rwa

# 2. 在MySQL命令行中执行
source Backend/database/create_project_tables.sql;

# 3. 验证表已创建
SHOW TABLES LIKE 'project_%';
# 应该看到: project_active, project_incoming

# 4. 验证触发器已创建
SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%';
# 应该看到两个触发器

# 5. 退出
exit;
```

### ☑️ 步骤 3: 数据迁移（可选，如果有旧数据）

```bash
# 进入Backend目录
cd Backend

# 安装依赖（如果还没安装）
npm install

# 执行迁移脚本
node database/migrate_project_data.js

# 查看输出，确认迁移成功
# ✅ 应该看到:
#    - 迁移完成的项目数量
#    - 已代币化项目数
#    - 待代币化项目数
```

### ☑️ 步骤 4: 验证数据

```sql
# 登录MySQL
mysql -h 13.239.255.133 -P 10559 -u root -p123456 rwa

# 检查数据量
SELECT 'project_active' as table_name, COUNT(*) as count FROM project_active
UNION ALL
SELECT 'project_incoming', COUNT(*) FROM project_incoming;

# 检查project_code格式
SELECT project_code, project_name, status FROM project_active LIMIT 5;
SELECT project_code, project_name, status FROM project_incoming LIMIT 5;

# 退出
exit;
```

### ☑️ 步骤 5: 启动后端服务

```bash
# 进入Backend目录
cd Backend

# 启动服务（已自动使用新路由）
npm start

# 应该看到:
# ✅ 服务器3000端口已启动成功
# ✅ 数据库连接成功!
```

### ☑️ 步骤 6: 测试API

```bash
# 测试查询所有项目（合并查询）
curl http://localhost:3000/project/select

# 测试查询已代币化项目
curl http://localhost:3000/project/active

# 测试查询待代币化项目
curl http://localhost:3000/project/incoming

# 测试查询单个项目
curl http://localhost:3000/project/active/RWAT001
curl http://localhost:3000/project/incoming/RWA001
```

### ☑️ 步骤 7: 启动前端

```bash
# 进入Frontend/Website目录
cd Frontend/Website

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:5173 (或显示的端口)
```

### ☑️ 步骤 8: 测试前端功能

1. **测试已代币化页面**
   - 访问: http://localhost:5173/listedprojects
   - 应该显示project_active表的数据
   - project_code格式: RWAT001, RWAT002...

2. **测试待代币化页面**
   - 访问: http://localhost:5173/to-be-listed
   - 应该显示project_incoming表的数据
   - project_code格式: RWA001, RWA002...

3. **测试语言切换**
   - 切换到中文，检查字段是否显示为中文
   - 切换到英文，检查字段是否显示为英文
   - 测试字段: property_type, borrower, collateral等

4. **测试字段映射**
   - 数据库: `property_type = 'Residential'`
   - 中文显示: "住宅"
   - 英文显示: "Residential"

---

## 📝 已完成的代码修改

### ✅ 后端修改

1. **Backend/index.js** - 使用新路由
   ```javascript
   // 已更新为:
   const projectRouter = require('./src/routers/projectRouter_v2')
   ```

2. **Backend/src/routers/projectRouter_v2.js** - 新路由配置
   - GET /project/active - 查询已代币化项目
   - GET /project/incoming - 查询待代币化项目
   - 保留向后兼容端点

3. **Backend/src/routers/route_handler/projectRouter_Handler_v2.js** - 新业务逻辑
   - insertProjectActive()
   - selectProjectActive()
   - insertProjectIncoming()
   - selectProjectIncoming()
   - approveProjectIncoming()
   - rejectProjectIncoming()

### ✅ 前端修改

1. **Frontend/Website/src/service/api.ts** - API接口更新
   ```javascript
   // 新增方法:
   projectAPI.getActiveProjects()    // 获取已代币化项目
   projectAPI.getIncomingProjects()  // 获取待代币化项目
   ```

2. **Frontend/Website/src/config/fieldMappings.js** - 字段映射配置
   - 13个字段的完整映射表
   - getFieldMapping() - 单个字段转换
   - transformFieldValues() - 批量转换

3. **Frontend/Website/src/composables/useLanguage.js** - 语言切换集成
   ```javascript
   // 新增功能:
   translateField(fieldName, fieldValue)  // 转换单个字段
   transformFields(data)                  // 批量转换
   ```

---

## 🎯 使用示例

### 在Vue组件中使用字段映射

```vue
<template>
  <div>
    <!-- 方法1: 直接使用translateField -->
    <p>物业类型: {{ translateField('property_type', project.property_type) }}</p>
    <p>借款人: {{ translateField('borrower', project.borrower) }}</p>
    <p>抵押物: {{ translateField('collateral', project.collateral) }}</p>

    <!-- 方法2: 批量转换整个对象 -->
    <div v-for="key in Object.keys(transformedProject)" :key="key">
      {{ key }}: {{ transformedProject[key] }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const { translateField, transformFields } = useLanguage()

const project = ref({
  property_type: 'Residential',
  borrower: 'Individual',
  collateral: 'Residential_Property'
})

// 批量转换
const transformedProject = computed(() => {
  return transformFields(project.value)
})
</script>
```

### 在ListedProjectsView中调用API

```javascript
// ListedProjectsView.vue
import { projectAPI } from '@/service/api'

async function loadProjects() {
  const response = await projectAPI.getActiveProjects()
  if (response.status === 0) {
    projects.value = response.data
  }
}
```

### 在ToBeListedView中调用API

```javascript
// ToBeListedView.vue
import { projectAPI } from '@/service/api'

async function loadProjects() {
  const response = await projectAPI.getIncomingProjects()
  if (response.status === 0) {
    projects.value = response.data
  }
}
```

---

## 🐛 常见问题快速解决

### Q: 后端启动报错"Cannot find module projectRouter_v2"
**A**: 确认文件路径正确
```bash
ls Backend/src/routers/projectRouter_v2.js
# 应该存在
```

### Q: API返回404
**A**: 检查后端是否使用了新路由
```javascript
// Backend/index.js 第42行应该是:
const projectRouter = require('./src/routers/projectRouter_v2')
```

### Q: 前端字段映射不生效
**A**: 检查是否导入了字段映射函数
```javascript
import { useLanguage } from '@/composables/useLanguage'
const { translateField } = useLanguage()
```

### Q: 数据库触发器不工作
**A**: 手动创建触发器
```sql
-- 查看是否存在
SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%';

-- 如果不存在，重新执行建表脚本
source Backend/database/create_project_tables.sql;
```

---

## 📞 需要帮助？

查看详细文档:
- **[DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)** - 完整迁移指南
- **[DATABASE_REFACTORING_SUMMARY.md](DATABASE_REFACTORING_SUMMARY.md)** - 重构总结
- **[PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md)** - 项目分析报告

---

**更新时间**: 2025-10-27
**版本**: v2.0
