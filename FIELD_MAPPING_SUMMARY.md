# 字段映射和数据标准化完成总结

## 📊 完成日期
2025-10-27

## ✅ 完成任务

### 1. 数据库字段标准化

#### project_active 表
已将所有中文字段值标准化为英文（无下划线格式）：

| 字段名 | 原值 | 新值 |
|--------|------|------|
| property_type | 独栋别墅 | Single House |
| mortgage_type | 第一抵押权人 | First Mortgage |
| collateral | 澳洲住宅抵押贷款 | Australian Residential Security |
| borrower | 机构 | Company |

#### project_incoming 表
已将所有中英文混合值标准化为纯英文（无下划线格式）：

| 字段名 | 原值 | 新值 |
|--------|------|------|
| property_type | 澳洲商业地产/Australian Commercial Property | Commercial Property |
| property_type | 澳洲土地开发/Australian Land Development | Land Development |
| property_type | 澳洲住宅建设/Australian Residential Construction | Residential Construction |
| property_type | 澳洲联排别墅/Australian Townhouse | Townhouse |
| property_type | 澳洲独立住宅/Australian Residential House | Residential House |
| property_type | 澳洲工业地产/Australian Industrial Property | Industrial Property |
| borrower | 个人 | Individual |
| borrower | Company | Company |
| collateral | Metro Commercial | Metro Commercial ✓ (保持不变) |
| collateral | Metro Development | Metro Development ✓ (保持不变) |
| collateral | Metro Residential | Metro Residential ✓ (保持不变) |

### 2. 字段映射配置文件

创建/更新了完整的映射配置文件：
**文件位置**: `Frontend/Website/src/config/fieldMappings.js`

#### 支持的字段类型

1. **property_type** (物业类型)
   - 包含17种类型的英文/中文映射
   - 新增：Commercial Property, Industrial Property, Land Development, Residential Construction, Residential House

2. **mortgage_type** (抵押类型)
   - First Mortgage → 第一顺位抵押
   - Second Mortgage → 第二顺位抵押
   - 等5种类型

3. **collateral** (抵押物类型)
   - 包含14种类型的英文/中文映射
   - 新增：Metro Commercial, Metro Development, Metro Residential

4. **borrower** (借款人类型)
   - Individual → 个人
   - Company → 公司
   - Trust → 信托
   - 等9种类型

5. **loan_type** (贷款类型)
6. **loan_purpose** (贷款用途)
7. **repayment_arrangement** (还款安排)
8. **early_repayment** (提前还款)
9. **security_rank** (抵押顺位)
10. **property_state** (澳洲州/省)

#### 提供的功能函数

```javascript
// 1. 获取单个字段的映射值
getFieldMapping(fieldName, fieldValue, language)
// 例：getFieldMapping('property_type', 'Single House', 'zh') → '独栋别墅'

// 2. 批量转换对象中的字段
transformFieldValues(data, fields, language)
// 例：自动转换项目对象中的所有可翻译字段

// 3. 获取字段的所有可选值（用于下拉菜单）
getFieldOptions(fieldName, language)

// 4. 反向映射（从显示值获取数据库值）
getReverseMapping(fieldName, displayValue, language)
```

### 3. API端点验证

#### 测试结果

**端点**: `GET http://localhost:3001/project/active`
```json
{
  "project_code": "RWAT001",
  "property_type": "Single House",
  "mortgage_type": "First Mortgage",
  "collateral": "Australian Residential Security",
  "borrower": "Company"
}
```

**端点**: `GET http://localhost:3001/project/incoming`
```json
{
  "project_code": "RWA001",
  "property_type": "Commercial Property",
  "borrower": "Company",
  "collateral": "Metro Commercial"
}
```

### 4. 前端集成

已更新以下前端文件：

1. **fieldMappings.js** - 映射配置文件
2. **useLanguage.js** - 集成字段映射功能
3. **ListedProjectsView.vue** - 使用新的API和映射
4. **api.ts** - 新增`getActiveProjects()`和`getIncomingProjects()`方法

## 📋 数据库迁移记录

### 迁移统计

- **project_active**: 1 条记录 (RWAT001)
- **project_incoming**: 10 条记录 (RWA001-RWA010)

### 字段更新统计

#### project_incoming 表更新：
- property_type: 10 条记录已更新
  - Commercial Property: 2 条
  - Land Development: 1 条
  - Residential Construction: 1 条
  - Townhouse: 1 条
  - Residential House: 4 条
  - Industrial Property: 1 条
- borrower: 1 条记录已更新 (个人 → Individual)

## 🎯 使用示例

### 前端使用示例

```javascript
import { getFieldMapping, transformFieldValues } from '@/config/fieldMappings'
import { useLanguage } from '@/composables/useLanguage'

// 在组件中
const { currentLanguage, translateField } = useLanguage()

// 方式1: 直接翻译单个字段
const propertyTypeZh = translateField('property_type', 'Single House')
// 返回: '独栋别墅' (如果当前语言是中文)

// 方式2: 批量转换项目数据
const project = {
  property_type: 'Commercial Property',
  borrower: 'Company',
  collateral: 'Metro Commercial'
}

const translatedProject = transformFieldValues(
  project,
  ['property_type', 'borrower', 'collateral'],
  'zh'
)
// 返回: {
//   property_type: '商业地产',
//   borrower: '公司',
//   collateral: '都市商业抵押'
// }
```

### 添加新字段值

如需添加新的字段值映射，编辑 `fieldMappings.js`：

```javascript
property_type: {
  en: {
    'New Type': 'New Type'  // 添加英文映射
  },
  zh: {
    'New Type': '新类型'     // 添加中文映射
  }
}
```

## 📁 相关文件

### 后端文件
- `Backend/.env` - 数据库配置
- `Backend/index.js` - 使用 projectRouter_v2
- `Backend/src/routers/projectRouter_v2.js` - 新路由配置
- `Backend/src/routers/route_handler/projectRouter_Handler_v2.js` - 路由处理器
- `Backend/database/create_tables_no_triggers.sql` - 表创建脚本
- `Backend/database/simple_migration.js` - 数据迁移脚本
- `Backend/database/update_field_values.js` - 字段值更新脚本
- `Backend/database/update_to_no_underscore.js` - 去下划线脚本
- `Backend/database/update_incoming_to_english.js` - incoming表英文化脚本

### 前端文件
- `Frontend/Website/src/config/fieldMappings.js` - **核心映射配置**
- `Frontend/Website/src/composables/useLanguage.js` - 语言切换集成
- `Frontend/Website/src/service/api.ts` - API方法
- `Frontend/Website/src/views/core/ListedProjectsView.vue` - 已代币化项目页面
- `Frontend/Website/src/views/core/ToBeListedView.vue` - 待代币化项目页面

## 🔧 维护说明

### 添加新项目时

1. 在数据库中只存储英文值（无下划线，使用空格）
2. 确保该值已在 `fieldMappings.js` 中配置了中英文映射
3. 如果是新类型的值，先更新 `fieldMappings.js`，然后再录入数据库

### 数据规范

- ✅ 使用：`Single House`, `First Mortgage`, `Commercial Property`
- ❌ 避免：`Single_House`, `First_Mortgage`, `Commercial_Property`
- ❌ 避免：混合中英文如 `澳洲商业地产/Australian Commercial Property`

## 🎉 成果

1. ✅ 数据库完全英文化，无中文字段值
2. ✅ 所有字段值使用友好的空格格式（无下划线）
3. ✅ 完整的中英文映射配置文件
4. ✅ 自动语言切换功能
5. ✅ 新的API端点支持表分离查询
6. ✅ 前端集成完成，准备就绪

## 📞 测试端口

- 后端测试服务器：`http://localhost:3001`
- API端点：
  - GET `/project/active` - 已代币化项目
  - GET `/project/incoming` - 待代币化项目
  - GET `/project/select` - 所有项目（向后兼容）
