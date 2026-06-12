# 备份与部署运行手册

这份手册用于减少新线程或长会话压缩后的执行漂移。

## 1. 环境定义

- 正式环境：Mac production
- 生产插件路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe`
- 生产数据路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 生产服务：`system/com.hermesmobile.plugin.wardrobe`
- 生产本机地址：`http://127.0.0.1:8765`
- 本地 Windows：只用于开发和测试

NAS 生产环境已取消。旧 NAS 发布、备份、Docker、Synology 共享目录和热部署脚本不再是当前生产流程。

## 2. 本地调试标准流程

1. 先把 Mac 生产库同步到本地。
   - 同步方向只允许 `Mac 生产 -> 本地`。
   - 旧脚本名 `scripts/sync-nas-db-to-local.ps1` 已过时；使用前必须确认其实际来源已经改为 Mac 生产库。

2. 在本地调试并验证。
   本地地址通常是：
   - `http://127.0.0.1:8765/`

3. 本地验证通过后停止。
   只有用户明确说“部署 / 发布 / 更新线上”时，才执行 Mac 生产部署。

## 3. Mac 生产部署标准流程

默认不要执行生产部署。本节只在用户明确说“部署 / 发布 / 更新线上”时使用。

1. 读取中心部署契约：
   - `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

2. 生成 plan-only 部署计划：

   ```bash
   cd /Users/hermes-dev/HermesMobileDev/app
   npm run --silent deploy:macos -- --plugin wardrobe --source /Users/hermes-dev/HermesMobileDev/plugins/wardrobe --json
   ```

3. 检查计划：
   - target 必须是 `plugin:wardrobe`
   - source 必须是 `/Users/hermes-dev/HermesMobileDev/plugins/wardrobe`
   - production path 必须是 `/Users/hermes-host/HermesMobile/plugins/wardrobe`
   - dirty tree 时必须列出本次要部署的具体文件
   - 不得包含生产数据库、运行时配置、Access Key、缓存、日志或本地测试数据

4. 执行受控部署：

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

5. 验证：
   - Mac launchd 服务处于运行状态
   - `http://127.0.0.1:8765/api/v1/hermes/plugin/manifest` 返回 `200`
   - 相关页面、Program API、MCP schema 或数据 readback 符合本次变更
   - 如果改动了移动端嵌入 UI，按中心视觉契约运行 Home AI iOS PWA debug / visual harness

6. 记录 handoff：
   - source ref 或 dirty files
   - backup path
   - restart label
   - validation result
   - rollback path
   - residual risk

## 4. 明确禁止

- 禁止把本地 `wardrobe.db` 覆盖 Mac 生产库。
- 禁止覆盖 Mac 生产运行时数据目录。
- 禁止把本地测试导出目录当成正式导出目录。
- 禁止使用旧 NAS 发布链路作为当前生产部署方式。
- 禁止在未核实当前运行版本时直接宣称“已修复”。

## 5. 对话与定位规则

- 用户说“又回退了”“之前就做过”，优先按定位失败处理。
- 先查当前代码、当前版本、当前运行态。
- 再回答，不要复述历史上已经完成的旧结论。
