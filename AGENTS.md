# 项目级执行约束

回答保持中性、客观、科学、证据导向，不迎合，不提供情绪价值，不夸张，不主观拔高。

## 高优先级规则

0. 新线程启动顺序固定。
   在当前工作区开始 substantive work 之前，必须优先读取：
   - `.agent-context/README.md`
   - `.agent-context/PROJECT_CONTEXT.md`
   - `.agent-context/HANDOFF.md`
   - 然后再读根目录规则文档
   不要先去搜索 `C:\Users\xuxin\Documents\Agent` 下的通用脚本或桥接文档，再回头理解本项目。

1. 先核实，再回答。
   对“又回退了”“本地对、线上不对”“之前已经修过”这类问题，先检查当前代码、当前资源版本、当前运行态，再给结论。

2. 不要重复处理已解决问题。
   用户指出的是新问题时，不要复述之前已经解决的旧问题，除非当前问题直接依赖它。

3. 环境边界固定。
   - Mac 是当前唯一正式生产环境。
   - NAS 生产环境已取消；不要再按 NAS 生产流程部署、备份或验证。
   - 本地 Windows 只用于开发和测试。
   - 不能用本地 `wardrobe.db` 覆盖 Mac 生产库。

4. Home AI AI Operations Control Plane 是 H1/H2、部署、视觉调试、MCP/schema、插件开通、跨模块问题的第一入口。
   - 中心契约版本：`20260611-v3`
   - 本插件 pointer：`docs/HOME_AI_PLATFORM_CONTRACT.md`
   - 先从 Home AI 中心 workspace 运行 intake：
     `cd /Users/hermes-dev/HermesMobileDev/app && node scripts/ai-ops-control-plane.js intake --task "<task>" --json`
   - 已知变更文件时，再运行 required-checks：
     `node scripts/ai-ops-control-plane.js required-checks --changed-file <path> --json`
   - iOS/Appium/Simulator/WebView mutating action 前必须先申请 visual lane；完成后释放。
   - 测试、视觉核验、部署和生产 smoke 通过后写入 `$HOME/.homeai-qa/wardrobe-evidence-ledger.jsonl`。
   - 复杂事故使用 incident cassette，不把长日志、私密内容或原始截图说明塞进 handoff。

4a. 插件主线程 / source thread 在分派 Worker 前必须先跑 Home AI 主线程路由 preflight。
   - 命令：
     `node /Users/hermes-dev/HermesMobileDev/app/scripts/main-thread-routing-preflight.js --source-thread-role plugin_main --task "<task>" --changed-file <path> --mode classify`
   - 如果结果是 `classification=plugin_worker`，只能分派一个 bounded `plugin_worker` 任务卡，并且卡片必须包含 terminal return、privacy boundary、conflict rule 和 expected validation；如果没有合法 lane，返回 `blocked` 并说明缺失 lane。
   - 不要把 Task Intake、deploy lanes、audit lanes、Loop lanes 或当前插件 source thread 当作 Worker fallback。
   - Worker terminal return-card body 和 Owner-visible receipt 必须使用中文（`zh-CN`）。
   - 分派前必须先 resolve/list 稳定可复用的 `plugin_worker` Worker pool；复用 available lane，任务活动期间标记 busy，terminal return 后释放为 available/idle。
   - 只允许在 `missing_role_lane`、`pool_exhausted` 或 `no_legal_lane` 时创建新 Worker；拒绝用任务标题、问题摘要、诊断 id 或修复标题命名的一次性 Worker，避免 Worker sprawl。
   - heartbeat 属于每张 task card，不属于 Worker；同一 Worker 上两张 active cards 需要两条独立 heartbeat。
   - Watchdog 默认超时 `1800000ms` / 30 分钟，batch `8`，max auto-resume `1`；恢复时必须 resume/activate 同一张 stale task card，不创建任务标题 Worker。

5. 本地调试前，默认先同步 Mac 生产库到本地。
   旧的 `scripts/sync-nas-db-to-local.ps1` 名称已经过时；使用前必须确认它当前实际从 Mac 生产库拉取，不能从 NAS 拉取，也不能反向写回生产库。

6. 用户说“部署 / 发布 / 更新线上”时，默认含义固定为 Mac 生产部署：
   - 先读取 Home AI 中心部署契约：
     `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`
   - 先生成 plan-only 部署计划
   - 备份 Mac 生产目标
   - 只同步代码，不覆盖生产数据库或运行时数据
   - 通过 Home AI 中心部署脚本执行
   - 重启受影响的 Mac launchd 服务并验证
   未明确说“部署 / 发布 / 更新线上”时，只更新和验证本地开发环境。

7. 禁止旧 NAS 发布链路。
   - 不使用 `docker compose --build`、`wardrobe-hot-deploy.sh`、NAS SSH、NAS Docker 或 Synology 共享目录作为当前生产发布路径。
   - 旧 NAS 文档和 handoff 中的 NAS 发布记录只作为历史来源，不作为当前执行规则。

8. 先读短文档，再读长文档。
   新线程或上下文压缩后，优先查看：
   - `RULES_QUICK_REF.md`
   - `BACKUP_AND_DEPLOY_RUNBOOK.md`
   - `PROJECT_STATE.md`

## 当前稳定约定

- 当前生产源：Mac Studio / Home AI Mac production
- Mac 生产插件路径：
  - `/Users/hermes-host/HermesMobile/plugins/wardrobe`
- Mac 生产数据路径：
  - `/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- Mac 生产服务：
  - `system/com.hermesmobile.plugin.wardrobe`
- Mac 生产本机服务地址：
  - `http://127.0.0.1:8765`
- Home AI Platform Contract Pointer：
  - `docs/HOME_AI_PLATFORM_CONTRACT.md`
- AI Ops evidence ledger：
  - `$HOME/.homeai-qa/wardrobe-evidence-ledger.jsonl`
- 衣橱、腕表、套装以 SQLite 为主数据源；Excel 只做导出结果，不再回灌。
- `WearCount_new*.xlsx` 文件导入已禁用；历史穿搭新增必须走 Program API。
