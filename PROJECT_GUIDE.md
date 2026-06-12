# 项目说明文档

本文档是完整项目说明，覆盖系统目标、结构、运行方式、部署、数据流和恢复方法。

## 1. 项目目标

这是一个“男装衣橱” Web 应用，目标是提供：
- 衣物管理
- 腕表管理
- 套装浏览
- 历史穿搭浏览
- 穿着统计
- 图片管理
- Excel 导出
- `WearCount` 导入

前端强调：
- 手机访问优先
- 适配竖屏和横屏
- 单页浏览体验

## 2. 技术架构

后端：
- Python
- `http.server` 自建 HTTP 服务
- 由 Mac production / Home AI 运行环境提供正式服务
- SQLite
- `openpyxl` 导出 Excel

前端：
- 原生 HTML / CSS / JavaScript
- 单页路由式页面切换

部署：
- 本地 Windows 可运行
- 正式环境在 Mac production 运行

## 3. 项目目录结构

核心目录：
- [wardrobe_app](C:/Users/xuxin/Documents/男装衣橱/wardrobe_app)
- [web](C:/Users/xuxin/Documents/男装衣橱/web)
- [data](C:/Users/xuxin/Documents/男装衣橱/data)
- [media](C:/Users/xuxin/Documents/男装衣橱/media)
- [scripts](C:/Users/xuxin/Documents/男装衣橱/scripts)

核心文件：
- [app.py](C:/Users/xuxin/Documents/男装衣橱/app.py)
- [WARDROBE_HERMES_PLUGIN.md](C:/Users/xuxin/Documents/男装衣橱/WARDROBE_HERMES_PLUGIN.md)

## 4. 页面与功能

### 4.0 Hermes Mobile 插件入口

衣橱应用可以作为 Hermes Mobile 的嵌入式插件标签加载。插件声明由衣橱后端直接提供：

- `GET /api/v1/hermes/plugin/manifest`
- 嵌入入口：`/?embed=hermes`
- 新 owner 工作区注册：`POST /api/v1/hermes/plugin/workspaces`
- 插件 Web 会话启动：`POST /api/v1/hermes/plugin/launch`
- Hermes iframe origin 注册：`POST /api/v1/hermes/plugin/frame-ancestors`

Hermes Mobile 新建工作区时由 Hermes 生成该工作区的 Access Key，并把 owner、workspace_id 和 key 注册到衣橱。衣橱只在 SQLite 保存 token hash 和 owner 绑定，接口响应不返回 raw key。注册后的模型侧操作仍通过 Wardrobe MCP 工具集完成。

Hermes Mobile 渲染插件 iframe 前应调用 `GET /api/v1/hermes/plugin/manifest?origin=<current window.location.origin>` 检查 `embedding.requested_frame_ancestor_allowed`。允许嵌入的 Hermes origin 是部署配置，不能写死为某个个人域名；应通过注册接口写入。

工作区绑定完成后，Hermes Mobile 不应再让用户在嵌入页输入衣橱用户名密码。正确流程是 Hermes 用 workspace Access Key 调 `POST /api/v1/hermes/plugin/launch` 换一次性短 token，再用 `/?embed=hermes&launch=<token>` 打开 iframe；衣橱消费 token 后创建 owner 对应的 Web session，并重定向回 `/?embed=hermes&plugin_session=<session_id>`。前端会把 `plugin_session` 存入 `sessionStorage`、从地址栏移除，并在同源 API 请求里发送 `X-Wardrobe-Session`，用于 iOS/WebKit iframe 禁用第三方 cookie 的场景。

插件合同不绑定具体机器。当前本工作区的正式生产部署是 Mac production，生产 Hermes Mobile 通过 Mac-local `http://127.0.0.1:8765` 访问 Wardrobe。

NAS 生产环境已取消。不要再使用旧 NAS 路由、Docker、备份或热部署链路作为当前生产源。

当前主要页面：
- 我的衣橱
- 手表收藏
- 穿着统计
- 精选套装
- 历史记录
- 设置
- 商品详情

### 4.1 我的衣橱

功能：
- 按品牌 / Owner / LOC / ROLE / 渠道筛选
- 饼图统计
- 商品明细列表
- 点击 section 进入详情页

### 4.2 手表收藏

功能：
- 按品牌 / Owner 筛选
- 饼图统计
- 商品明细列表
- 点击 section 进入详情页

### 4.3 穿着统计

功能：
- 读取 `WearCount` 导入结果
- 按品牌或角色等维度查看穿着占比
- 按当前登录 Owner 自动过滤当前可见的穿着统计

### 4.3A 保养规划

功能：
- 基于磨损阈值和磨损指数生成保养列表
- 按当前登录 Owner 自动过滤当前可见的保养规划

### 4.4 精选套装

功能：
- 套装列表
- 套装详情
- 支持图片
- 页面顶部支持按 Owner 切换当前 owner 的套装

### 4.5 历史记录

功能：
- 选择日期查看当天明细
- 页面顶部支持按 Owner 切换当前 owner 的历史记录
- “录入今日穿搭”固定写入当前登录 Owner，不跟随页面筛选 Owner
- 支持图片
- 历史记录图片若包含 EXIF GPS 位置信息，会解析为经纬度并显示在图片下方
- 展示 location / relax / weather / 明细项

### 4.6 设置

功能：
- 当前登录用户信息
- 顶部支持当前登录 Owner 自助修改密码
- 注销
- 手动导入 `WearCount`
- 入库新商品
- 显示导入目录和最近导入状态

## 4A. MCP 统计接口设计

Hermes Mobile 的衣橱统计、看板、排行、照片健康检查和数据质量检查应通过 Wardrobe MCP 的统计工具完成，不应在模型端拆成大量 `search_items` / `get_item` 请求后自行聚合。

统计工具按当前后台功能拆分为相对独立的接口：

- `wardrobe.stats_overview`：总览看板，汇总单品、腕表、精选套装、历史记录、照片、保养和数据质量。
- `wardrobe.stats_inventory`：对应“我的衣橱”的库存数量、金额、品牌 / Owner / LOC / ROLE / 渠道 / 年份聚合。
- `wardrobe.stats_watch`：对应“手表收藏”的腕表数量、金额、品牌 / Owner / 年份 / 保养状态聚合。
- 金额统计统一按 `price_cny` 优先、`price_original` 回退；只有两个字段都为空才算未记录价格。
- `price_original` 与 `price_cny` 都保留，但格式统一为纯金额十进制字符串，不写 `¥`、`￥`、`RMB`、`CNY`、逗号或 `元`；原始币种单独写入 `price_original_currency`，用 `CNY`、`EUR`、`USD`、`HKD` 这类大写币种代码。写入 `price_original` 时必须有 `price_original_currency` 或可识别的币种文本。
- `wardrobe.stats_wear`：对应“穿着统计”的总穿着、年度穿着、未穿、品牌 / 角色 / 类别 / 地点聚合和排行。
- MCP/API 机器字段统一使用规范角色：单品 `layer_role` 鞋类为 `Footwear`、裤装为 `Bottom`；历史穿搭 `items[].role` 和精选套装 slot 也使用对应规范值，不再把 `Shoes`/`Pants` 作为写入兼容名。
- `wardrobe.stats_maintenance`：对应“保养规划”的阈值、到期、红 / 橙 / 绿 / 保养中状态。
- `wardrobe.stats_history`：对应“历史记录”的日期、月份、城市、场景、Relax、温度分组。
- `wardrobe.stats_featured_looks`：对应“精选套装”的套装数量、照片状态、单品和品牌参与度。
- `wardrobe.stats_photos`：商品首图、无图记录、本地首图缩略图缓存、旧缩略图文件和损坏文件状态。
- `wardrobe.stats_data_quality`：缺图片、缺材质、缺色系、缺角色、缺保养阈值、重复 code、混合品牌桶等结构化质量检查。

统计工具默认先执行 MCP 分资源同步，只刷新所需资源；聚合计算基于 `.hermes-cache/resources/*.json`，不直接读 SQLite，不拉全量原图，没有图片的商品必须作为合法记录参与统计。

## 5. 数据模型

核心数据库对象：
- `items`
- `photos`
- `outfits`
- `outfit_photos`
- `featured_looks`
- `featured_look_items`
- `featured_look_photos`
- `imports`
- 认证与会话相关表

数据库主文件：
- [wardrobe.db](C:/Users/xuxin/Documents/男装衣橱/data/wardrobe.db)

## 6. 数据流

### 6.1 商品与腕表

当前模式：
- 页面修改 -> 写 SQLite
- 写入成功后 -> 导出 Excel / CSV / Markdown
  衣橱会同时导出总表 `衣橱.xlsx`、面向 ChatGPT 分析的结构化基线 CSV `衣橱.csv`、规则说明 `衣橱_ChatGPT解析规则.md` 和按 owner 拆分的衣橱文件

不再使用：
- 编辑 Excel 后再反向导入数据库

### 6.2 套装

当前模式：
- 页面修改 -> 写 SQLite
- 写入成功后 -> 导出总表 `套装.xlsx` 和按 owner 拆分的套装文件

### 6.3 WearCount

当前模式：
- `WearCount_new*.xlsx` 文件导入已禁用
- 历史穿搭新增必须走 Program API
- 导入或历史记录变更后 -> 导出总表 `WearCount.xlsx` 和按 owner 拆分的 WearCount 文件

## 7. 导入与导出边界

### 保留导入

- 历史穿搭新增通过 `POST /api/v1/history/outfits`

### 取消导入

- `衣橱.xlsx`
- `衣橱.csv`
- `腕表.xlsx`
- `套装.xlsx`
- `WearCount_new*.xlsx`

### 导出目标

Mac production 正式导出：
- 以 Mac production 当前运行配置为准
- Owner-facing Hermes 目录位于 `/Users/hermes-host/HermesMobile/data/drive/users/...`
- 导出文件直接原位覆盖

本地测试导出：
- 项目内 `baseline_exports`

## 8. 图片存储

商品、历史记录、套装都支持图片上传。

当前策略：
- 图片存 SQLite / 媒体目录体系
- 不依赖 Excel 存图

## 9. 登录与权限

当前账号体系：
- `徐欣`：管理员
- `吴萍`：普通用户

权限规则：
- 管理员可见全量
- 普通用户只看授权 owner 范围

会话：
- 使用 cookie
- 已加入一定的会话管理和请求来源校验
- 当前登录用户可在设置页修改自己的密码
- 新密码规则为 8-24 位，必须包含大写字母、小写字母、数字、特殊字符，且不含空格
- 服务重启时不会再把数据库内已修改的密码覆盖回默认哈希

## 10. Mac 生产部署说明

正式环境在 Mac production 上运行。

访问入口：
- Mac production loopback：`http://127.0.0.1:8765/`
- Manifest：`http://127.0.0.1:8765/api/v1/hermes/plugin/manifest`

关键目录：
- 代码：`/Users/hermes-host/HermesMobile/plugins/wardrobe`
- 数据：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 数据库：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data/wardrobe.db`

关键命令思路：
- 先从 Home AI app 工作区生成 plan-only 部署计划
- 通过中心 Mac 部署脚本执行生产同步
- 不覆盖生产数据库或运行时数据
- 重启 `system/com.hermesmobile.plugin.wardrobe`
- 验证 launchd、manifest、Program API/MCP 或 UI 行为

参考：
- [BACKUP_AND_DEPLOY_RUNBOOK.md](BACKUP_AND_DEPLOY_RUNBOOK.md)
- [SAFE_DEPLOY.md](SAFE_DEPLOY.md)
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

## 11. 本地开发说明

本地仍可开发和测试，但不应作为正式写入环境。

原因：
- 正式库在 Mac production
- 本地库和 Mac production 库不是同一份
- 两边同时可写会导致数据分叉

当前处理：
- 已关闭本地正式服务
- 本地默认导出目录改到项目内

## 12. 备份与恢复

### 12.1 代码备份

项目代码备份以当前 Mac production 中心部署脚本创建的 `.deploy-backups` 和 Git 历史为准。不要把旧 NAS 备份目录当作当前生产备份策略。

### 12.1A 线上数据库备份

- 生产数据库位于 `/Users/hermes-host/HermesMobile/plugins/wardrobe/data/wardrobe.db`
- 生产部署备份由中心 Mac 部署流程创建
- 数据修复或迁移前必须单独备份 Mac production 数据库

### 12.2 恢复建议

如果需要恢复项目：

1. 恢复项目代码目录
2. 恢复 Mac production 数据目录
3. 恢复 owner-facing Hermes 导出目录
4. 阅读本文档和 `PROJECT_STATE.md`
5. 重启并验证 Mac production 服务

### 12.3 上下文恢复

如果线程丢失：
- 单纯 zip 不足以恢复所有上下文
- 需要结合：
  - [README.md](C:/Users/xuxin/Documents/男装衣橱/README.md)
  - [PROJECT_STATE.md](C:/Users/xuxin/Documents/男装衣橱/PROJECT_STATE.md)
  - [PROJECT_GUIDE.md](C:/Users/xuxin/Documents/男装衣橱/PROJECT_GUIDE.md)
  - [BACKUP_AND_DEPLOY_RUNBOOK.md](C:/Users/xuxin/Documents/男装衣橱/BACKUP_AND_DEPLOY_RUNBOOK.md)
  - [SAFE_DEPLOY.md](C:/Users/xuxin/Documents/男装衣橱/SAFE_DEPLOY.md)

## 13. 当前关键约定

- Mac production 是当前唯一正式主服务
- 本地只做开发 / 测试
- 衣橱 / 腕表 / 套装以 SQLite 为主
- `WearCount_new*.xlsx` 文件导入已禁用，历史穿搭新增走 Program API
- 生产导出路径以 Mac production 当前配置为准

## 14. 建议后续维护方式

推荐流程：

1. 本地改代码
2. 本地测试
3. 需要生产发布时走 Home AI 中心 Mac 部署脚本
4. 正式数据只在 Mac production 操作
5. 生产变更前备份 Mac production 目标和数据库

## 15. 后续可继续完善的点

- HTTPS / 反向代理运维文档补全
- 更完整的安全加固
- 更系统的运维文档
- 更明确的数据库迁移机制
