# 安全部署规则

本文档只描述一件事：开发工作区代码如何安全部署到 Mac production，而不覆盖生产数据。

## 1. 总原则

- Mac 是当前唯一正式生产环境。
- NAS 生产环境已取消。
- 开发工作区不是正式数据源。
- 生产数据库只允许在 Mac production 上由受控流程原地迁移或备份恢复。
- 绝不允许用本地 `wardrobe.db` 覆盖 Mac 生产库。

## 2. 允许同步的内容

允许从开发工作区同步到 Mac production：
- `app.py`
- `wardrobe_app/`
- `web/`
- 相关文档
- 必要脚本

## 3. 禁止同步的内容

禁止同步到 Mac production：
- 本地 `data/wardrobe.db`
- 本地导出目录
- 本地 `.hermes-*` 配置、Access Key、缓存
- 本地日志、上传缓存、临时调试文件
- 任何未在部署计划中列出的 dirty 文件

## 4. 部署流程

只有用户明确说“部署 / 发布 / 更新线上”时才执行。

1. 读取中心部署契约：
   - `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

2. 生成 plan-only 部署计划：

   ```bash
   cd /Users/hermes-dev/HermesMobileDev/app
   npm run --silent deploy:macos -- --plugin wardrobe --source /Users/hermes-dev/HermesMobileDev/plugins/wardrobe --json
   ```

3. 确认计划只包含本次需要的文件，并且不会覆盖生产数据。

4. 执行中心部署脚本：

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

5. 验证生产行为。

## 5. 验证要求

按变更面选择最小充分验证：
- Python 语法 / 单元测试
- Mac launchd 服务状态
- `GET http://127.0.0.1:8765/api/v1/hermes/plugin/manifest`
- Program API readback
- MCP `tools/list` 和 Gateway callable schema
- 嵌入式 UI 的 Home AI iOS PWA debug / visual harness

## 6. 本地调试

如需本地调试，默认先把 Mac 生产库拉到本地，再启动本地服务。

同步方向只允许：
- `Mac 生产 -> 本地`

不允许：
- `本地 -> Mac 生产` 直接覆盖数据库文件

旧脚本名 `scripts/sync-nas-db-to-local.ps1` 已过时；使用前必须确认它实际读取 Mac production。
