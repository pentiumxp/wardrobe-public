# 已废止：Synology / NAS 部署说明

NAS 生产环境已取消。本文档不再是当前部署手册，不得用于生产发布、备份、验证或故障恢复。

当前正式生产环境是 Mac production：
- 生产插件路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe`
- 生产数据路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 生产服务：`system/com.hermesmobile.plugin.wardrobe`
- 生产本机地址：`http://127.0.0.1:8765`

当前部署入口：
- [RULES_QUICK_REF.md](RULES_QUICK_REF.md)
- [BACKUP_AND_DEPLOY_RUNBOOK.md](BACKUP_AND_DEPLOY_RUNBOOK.md)
- [SAFE_DEPLOY.md](SAFE_DEPLOY.md)
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

禁止继续使用旧 NAS 链路：
- Synology 共享目录同步
- NAS SSH / sudo / Docker
- `wardrobe-hot-deploy.sh`
- NAS `docker compose`
- NAS 数据库备份作为当前生产备份
