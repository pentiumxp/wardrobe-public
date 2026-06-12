# 高优先级速查

这份文档只保留最容易在长线程中丢失、但最重要的执行规则。

## 环境与数据源

- Mac 是当前唯一正式生产环境。
- NAS 生产环境已取消；不要再按 NAS 生产流程部署、备份或验证。
- 本地 Windows 只用于开发和测试。
- SQLite 是衣橱、腕表、套装的主数据源。
- Excel 只做导出结果，不再作为这些主表的回灌源。
- `WearCount_new*.xlsx` 文件导入已禁用；历史穿搭新增必须走 Program API。

## 本地调试

- 默认先把 Mac 生产库同步到本地，再做判断。
- 同步方向只允许：
  - `Mac 生产 -> 本地`
- 旧脚本名 `scripts/sync-nas-db-to-local.ps1` 已过时；使用前必须确认它实际从 Mac 生产库拉取，不能从 NAS 拉取，也不能反向写回生产库。

## Mac 生产部署

默认不要执行生产部署。只有用户明确说“部署 / 发布 / 更新线上”时，才执行本节流程。

用户说“部署 / 发布 / 更新线上”时，默认固定为 Mac 生产部署：

1. 读取中心部署契约
   `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

2. 先生成 plan-only 部署计划
   ```bash
   cd /Users/hermes-dev/HermesMobileDev/app
   npm run --silent deploy:macos -- --plugin wardrobe --source /Users/hermes-dev/HermesMobileDev/plugins/wardrobe --json
   ```

3. 备份 Mac 生产目标
   备份位置由中心部署脚本在生产目标下创建，通常位于：
   - `/Users/hermes-host/HermesMobile/plugins/wardrobe/.deploy-backups/`

4. 只同步代码
   禁止覆盖：
   - `/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
   - 生产 `wardrobe.db`
   - `.hermes-*` 运行时配置、Access Key、缓存和用户数据

5. 执行受控部署并验证
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

## 禁止旧 NAS 链路

- 不使用 NAS 作为当前生产环境。
- 不调用 NAS Docker、Synology 共享目录、`wardrobe-hot-deploy.sh` 或旧 NAS SSH 发布链路。
- 不执行旧 NAS `docker compose --build`、热同步、容器重启或 NAS 生产库备份流程。
- 旧 NAS 文档和 handoff 中的部署记录只作为历史来源，不作为当前执行规则。

## 回答与定位规则

- 用户说“又回退了”“之前已经做过”，先查当前代码、当前版本、当前运行态。
- 不要重复解释已解决问题。
- 结论必须基于当前实际运行状态，不基于旧记忆。
