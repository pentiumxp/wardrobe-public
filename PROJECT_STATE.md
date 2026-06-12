# 项目现状说明

优先提示：
- 新线程先读 `RULES_QUICK_REF.md`
- 当前 Wardrobe 正式生产环境是 Mac production
- NAS 生产环境已取消；旧 NAS 发布链路不再使用
- 生产部署默认使用 Home AI 中心 Mac 部署脚本

本文档用于在会话上下文丢失时，快速恢复当前系统状态和关键约定。

## 1. 当前结论

- 正式主服务是 Mac production。
- 本地 Windows 服务不是正式环境，只用于开发或临时测试。
- 衣橱、腕表、套装以 SQLite 数据库为主数据源。
- `WearCount_new*.xlsx` 文件导入已禁用；历史穿搭新增必须走 Program API。
- 旧 NAS 环境、Synology DDNS、NAS Docker、NAS 热部署脚本和 NAS 备份目录都不是当前生产流程。

## 2. 当前生产部署

Mac production 信息：
- 生产插件路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe`
- 生产数据路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 生产数据库：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data/wardrobe.db`
- 生产服务：`system/com.hermesmobile.plugin.wardrobe`
- 生产本机地址：`http://127.0.0.1:8765`
- Home AI 嵌入插件 manifest：`http://127.0.0.1:8765/api/v1/hermes/plugin/manifest`

生产部署必须遵守中心契约：
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-workspace-platform-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-mobile-ui-visual-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

## 3. 本地开发环境

PC / local Windows runtime 是 Hermes Mobile 模块和嵌入式插件的默认开发环境。

本地服务：
- Task Scheduler task：`Wardrobe Local Dev Service`
- Supervisor：`scripts/start-local-dev-supervisor.ps1`
- Registration：`scripts/register-local-dev-service.ps1`
- Loopback dev URL：`http://127.0.0.1:8765/`
- PC LAN dev URL：`http://192.168.10.108:8765/`

本地调试前：
- 默认先把 Mac 生产库同步到本地。
- 同步方向只允许 `Mac 生产 -> 本地`。
- 旧脚本名 `scripts/sync-nas-db-to-local.ps1` 已过时；使用前必须确认它实际从 Mac production 拉取。

## 4. 数据源规则

### 4.1 衣橱

- 新增 / 编辑 / 删除：直接改 SQLite。
- 成功后可导出面向人类或大模型读取的 Excel/CSV/Markdown。
- 不再从 `衣橱.xlsx` 反向导入数据库。

### 4.2 腕表

- 新增 / 编辑 / 删除：直接改 SQLite。
- 成功后可导出 `腕表.xlsx`。
- 不再从 `腕表.xlsx` 反向导入数据库。

### 4.3 套装

- 新增 / 编辑 / 删除：直接改 SQLite。
- 成功后可导出套装文件。
- 不再从 `套装.xlsx` 反向导入数据库。

### 4.4 WearCount

- `WearCount_new*.xlsx` 文件导入已禁用。
- 历史穿搭新增必须走 `POST /api/v1/history/outfits`。

## 5. Program API / MCP

- Program API 稳定命名空间：`/api/v1/...`
- Program API 使用 `Authorization: Bearer <token>`。
- Hermes Mobile 模型侧衣橱能力必须通过 `wardrobe` MCP toolset。
- Wardrobe native AI 已移除；模型执行由 Hermes Mobile 负责。
- MCP 变更后必须验证：
  - 直接 MCP `tools/list`
  - Mac production Gateway callable schema
  - 选中生产 profile / worker 可见 `mcp_wardrobe_*`

## 6. 嵌入式插件 UI

- Wardrobe 可作为 Hermes Mobile 嵌入式插件运行。
- Manifest：`GET /api/v1/hermes/plugin/manifest`
- Embedded entry：`/?embed=hermes`
- 移动端嵌入 UI、底部导航、安全区、手势、菜单或缓存版本变更，优先使用 Home AI iOS PWA debug：

```bash
cd /Users/hermes-dev/HermesMobileDev/app
npm run ios:pwa:debug
```

最终视觉证据按中心视觉契约使用：

```bash
cd /Users/hermes-dev/HermesMobileDev/app
npm run ios:pwa:visual -- --scenario embedded-plugin-shell --plugin-id wardrobe --debug-url http://127.0.0.1:19073/
```

## 7. Mac 生产部署流程

只有用户明确说“部署 / 发布 / 更新线上”时才执行。

先生成 plan-only：

```bash
cd /Users/hermes-dev/HermesMobileDev/app
npm run --silent deploy:macos -- --plugin wardrobe --source /Users/hermes-dev/HermesMobileDev/plugins/wardrobe --json
```

执行部署时使用中心脚本：

```bash
cd /Users/hermes-dev/HermesMobileDev/app
npm run --silent deploy:macos -- \
  --plugin wardrobe \
  --source /Users/hermes-dev/HermesMobileDev/plugins/wardrobe \
  --restart-label system/com.hermesmobile.plugin.wardrobe \
  --health-url http://127.0.0.1:8765/api/v1/hermes/plugin/manifest \
  --execute \
  --password-file <private-local-password-file> \
  --json
```

部署不得覆盖：
- `/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 生产 `wardrobe.db`
- `.hermes-*` 配置、Access Key、缓存
- 生产日志、上传缓存或用户运行时数据

## 8. 当前待办方向

- 保持 Mac-local route validation，避免旧 NAS/LAN 默认值重新进入配置。
- 完成 Wardrobe Reference Contract V1。
- 为嵌入式 UI、长按菜单和底部布局补齐可复用的视觉 harness。
