# 男装衣橱

这是一个基于 Python + SQLite + 原生前端页面的衣橱管理应用。

当前正式环境：
- 主服务：Mac production
- 生产插件路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe`
- 生产数据路径：`/Users/hermes-host/HermesMobile/plugins/wardrobe/data`
- 生产本机地址：`http://127.0.0.1:8765`
- 生产服务：`system/com.hermesmobile.plugin.wardrobe`
- 本地 Windows：仅用于开发和测试

NAS 生产环境已取消。旧 Synology/NAS 文档只作为历史迁移来源，不作为当前生产部署规则。

## 新线程优先阅读

先读这几份短文档：
- [RULES_QUICK_REF.md](RULES_QUICK_REF.md)
- [BACKUP_AND_DEPLOY_RUNBOOK.md](BACKUP_AND_DEPLOY_RUNBOOK.md)
- [PROJECT_STATE.md](PROJECT_STATE.md)

再按需要读：
- [PROJECT_GUIDE.md](PROJECT_GUIDE.md)
- [SAFE_DEPLOY.md](SAFE_DEPLOY.md)
- [WEARCOUNT_NEW_FORMAT.md](WEARCOUNT_NEW_FORMAT.md)

如果涉及 Home AI 平台、Mac 生产部署、MCP 或移动端嵌入 UI，还必须读取中心契约：
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-workspace-platform-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-mobile-ui-visual-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`

## 本地开发运行

```powershell
python app.py
```

默认地址：

```text
http://127.0.0.1:8765
```
