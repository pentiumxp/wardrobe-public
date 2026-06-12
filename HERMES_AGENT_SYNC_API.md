# Hermes 衣橱 Program API 规范模板

本文档由 Codex / 衣橱服务生成并维护，是不含 Access Key 的接口规范模板。带 owner 绑定 Access Key 的可执行版本会写入各 owner 的衣橱目录，当前文件名约定为：

```text
Hermes_衣橱_API规范.md
```

## 0. MCP wrapper required for Hermes Mobile clients

Hermes Mobile / agents must use the local `wardrobe-mcp` wrapper as the wardrobe entrypoint when it is mounted. The MCP wrapper is not a replacement for the Program API; it is a tool layer that reads the active owner `.hermes-wardrobe/config.json` and `access-key.txt`, then calls the existing `/api/v1/...` endpoints.

Current MCP contract is documented in:

```text
WARDROBE_MCP.md
```

Wardrobe also exposes an embedded Hermes Mobile plugin manifest:

```text
GET /api/v1/hermes/plugin/manifest
```

The manifest declares the `/?embed=hermes` tab entry and the `wardrobe` MCP toolset. Hermes Mobile should call `GET /api/v1/hermes/plugin/manifest?origin=<current window.location.origin>` before rendering the iframe and check `embedding.requested_frame_ancestor_allowed`. New Hermes Mobile workspaces register their owner-bound generated Access Key through `POST /api/v1/hermes/plugin/workspaces`; Wardrobe stores only the token hash in SQLite and returns only a token prefix plus owner/workspace metadata.

Plugin frame embedding is deployment configuration, not a repository constant. If the manifest reports that the current Hermes origin is not allowed, register that origin through `POST /api/v1/hermes/plugin/frame-ancestors` with `owners:write`, `admin:*`, or an authenticated same-origin Wardrobe admin session. Non-local origins must be HTTPS origins without path/query/fragment. Do not hardcode a specific Hermes domain in shared docs, skills, or source code.

After a workspace is registered, Hermes Mobile must not show the Wardrobe username/password login for that plugin tab. It should call `POST /api/v1/hermes/plugin/launch` with the workspace Access Key and `workspace_id`, receive a short one-time `launch_token`, then open the iframe at `/?embed=hermes&launch=<launch_token>`. Wardrobe consumes that token once, creates the normal owner web session cookie, and redirects back to `/?embed=hermes&plugin_session=<session_id>`. The frontend stores `plugin_session` in `sessionStorage`, removes it from the visible URL, and sends `X-Wardrobe-Session` on same-origin API calls. This header path is the iOS/WebKit fallback when iframe cookies are blocked. Never put the long-lived Access Key in an iframe URL.

The plugin contract is deployment-location independent. Current production is Mac production, and Hermes Mobile should use the Mac-local Wardrobe service such as `http://127.0.0.1:8765`, avoiding public DNS entirely.

Rules:

- Program API remains the production backend contract behind MCP; it is not an automatic Hermes Mobile fallback.
- Direct Program API use is limited to explicit diagnostics, emergency repair, or Codex/operator maintenance when the user asks for it.
- If a required MCP tool is not mounted, report a mounted-tool/schema gap and stop or fail closed instead of using direct HTTP.
- If an MCP tool returns auth/network/API failure, report that underlying failure instead of retrying the same action through direct Program API.
- MCP must not read or write SQLite directly.
- MCP must not return or log raw Access Keys.
- MCP tools must keep the resource-level sync behavior: compare per-resource checksum/count and refresh only changed resources.
- MCP tools must keep first-photo thumbnail cache behavior: cache only current first-photo safe thumbnails, never all original images.
- Products without photos are valid and must not fail sync or recommendations.
- Aggregate, dashboard, ranking, wear, photo-health, and data-quality questions should use MCP statistics tools rather than many per-item `search_items` / `get_item` calls. Statistics tools compute from MCP-maintained resource caches and refresh only their required resources.

维护边界：

- 本文档只维护 Program API、认证、同步、历史入库、字段语义和禁用链路。
- 具体搭配规则由 Hermes 维护的 `Hermes_衣橱搭配规则.md` 或 owner 目录内同用途文档维护。
- Hermes Mobile 日常配衣、入库、回写、查图应通过 `wardrobe-mcp`；本文档是 MCP 背后的 Program API 契约。只有用户明确要求诊断/手工修复时，才直连 Program API。
- 不要把 Access Key 回显到聊天、交付文档、日志或 source check。

## 1. 认证

所有接口使用 Program API Bearer Token。Access Key 只绑定当前 owner，不得用于写入其他 owner 的历史记录。

请求头生成规则：

- Header name: `Authorization`
- Header value: `Bearer ` + owner API 规范文档中 Access Key 的原文
- 不要把 `<Access Key>`、`...`、`已脱敏`、`REDACTED` 或任何占位说明当作 token。

权限范围：

- `sync:read`
- `items:read`
- `items:write`
- `history:write`

## 2. 服务地址

当前 Wardrobe 正式生产环境是 Mac production。Hermes Mobile / Hermes-StePhen 在 Mac production 上应使用本机地址：

```text
http://127.0.0.1:8765
```

不要使用旧 NAS、Synology DDNS 或远程 LAN 地址作为当前生产默认值。

## 3. 同步接口

Wardrobe MCP 负责维护 owner 绑定的永久本地缓存。Hermes Mobile / Agent 只调用 MCP 工具并消费其返回的资源路径、metadata 和缩略图路径，不应直接写入、重命名、清理或用旧 `.hermes-cache` 文件自行判断新鲜度。缓存不是临时任务产物，不放在上传目录、会话目录或 `.hermes-cleaned/`，固定放在当前 owner 衣橱目录下：

- `.hermes-cache/outfit-context-manifest.json`
- `.hermes-cache/resources/items.json`
- `.hermes-cache/resources/wear_counts.json`
- `.hermes-cache/resources/featured_looks.json`
- `.hermes-cache/resources/wear_history.json`
- `.hermes-cache/resources/primary_photo_thumbnails.json`
- `.hermes-cache/resources/rules.json`
- `.hermes-cache/photos/{item_code}_{photo_id}_{checksum}.jpg`

MCP 缓存至少保存：

- `owner`
- `schema_version`
- `etag`
- `data_version`
- `resources[].checksum`
- resource JSON files
- first-photo thumbnail image files
- `cached_at`
- `base_url`

每次开始日常搭配任务前，Hermes 必须先调用 `wardrobe.sync`，由 MCP 请求 manifest。缓存存在时也不能跳过 manifest；否则无法判断服务器是否有新增、修改或删除。`If-None-Match` 只能由 MCP 从已验证的 `outfit-context-manifest.json` 或资源缓存 checksum 生成。

固定流程：

1. Hermes 解析当前 owner 工作区并调用 Wardrobe MCP；MCP 读取 `.hermes-wardrobe/config.json` 与 Access Key 文件。
2. MCP 读取并校验 `.hermes-cache/outfit-context-manifest.json` 和 `.hermes-cache/resources/*.json`；确认 owner、schema 和各资源 checksum 基本一致。
3. MCP 请求 manifest；有本地 etag 时发送 `If-None-Match`。
4. manifest 返回 `304`：MCP 复用本地分资源缓存，但仍要验证 owner、schema_version 和必要资源文件存在。
5. manifest 返回 `200`：MCP 逐项比较 `resources[].checksum` 与 `resources[].count`；只请求 checksum/count 变化或本地缺失/校验失败的资源端点，并原子写入对应资源缓存文件。
6. manifest/API 不可用、401/403/404 或网络失败：Hermes 不得说“已同步最新”；MCP 只能在已验证缓存存在时报告 stale/offline/cache fallback 并返回缓存结果；没有有效缓存则停止并报告接口问题。

资源 checksum 包含 sync `schema_version`、资源名和资源版本载荷；当 `items[]` 输出字段变化时必须提升 `schema_version`，让旧缓存失效并重新拉取对应资源。

### MCP 统计工具

Hermes Mobile 遇到汇总类问题时，应优先调用 Wardrobe MCP 统计工具，而不是把大量明细记录拉入模型上下文后自行统计。统计工具由 MCP 负责按需调用 `wardrobe.sync`，只刷新必要资源，并在 owner-local `.hermes-cache/resources/*.json` 上聚合；默认不拉原图，也不因为单品没有照片而失败。

当前统计工具：

- `wardrobe.stats_overview`
- `wardrobe.stats_inventory`
- `wardrobe.stats_watch`
- `wardrobe.stats_wear`
- `wardrobe.stats_maintenance`
- `wardrobe.stats_history`
- `wardrobe.stats_featured_looks`
- `wardrobe.stats_photos`
- `wardrobe.stats_data_quality`

使用规则：

1. 看板/资产/数量/金额/品牌占比：用 `stats_inventory` 或 `stats_watch`。
2. 穿着次数、年度穿着、轮换排名：用 `stats_wear`。`stats_wear(period=year, year=YYYY)` 的年份基准是穿着发生日期 `wear_history.wear_date` / `worn_at`，不是 `acquired_at` / 购买登记日期。
3. 保养阈值、到期、红橙绿分级：用 `stats_maintenance`。
4. 历史穿搭按日期、月份、城市、场景统计：用 `stats_history`。
5. 精选套装使用率或套装内单品参与度：用 `stats_featured_looks`。
6. 首图/缩略图缓存/无图记录健康检查：用 `stats_photos`。
7. 缺字段、重复 code、混合品牌桶等质量检查：用 `stats_data_quality`。
8. 统计结果指向少量目标单品后，才用 `wardrobe.search_items` / `wardrobe.get_item` 做详细读回或修正。

金额统计规则：`stats_inventory` / `stats_watch` 的 `metric=amount` 使用 `price_cny` 作为优先价格字段；如果 `price_cny` 为空但 `price_original` 有值，则回退使用 `price_original`。不得把已有 `price_original` 的单品当作未记录价格处理。

年度口径规则：`stats_inventory(period=year, year=YYYY)` 表示按 `acquired_at` 统计当年新增/登记库存；`stats_wear(period=year, year=YYYY)` 表示按 `wear_history.wear_date` / `worn_at` 统计当年实际穿着。`stats_wear` 返回 `date_basis: "wear_date"`，并同时给出 `wear_year_field_sum` 和 `wear_history_count`；两者不一致时返回 warning，供调用方发现缓存或历史补全问题。

价格格式规则：`price_original` 与 `price_cny` 都必须保留，但存储/API/MCP 缓存格式统一为纯金额十进制字符串，例如 `61400` 或 `29900.5`；不要写入 `¥`、`￥`、`RMB`、`CNY`、逗号、空格或 `元`。服务端会在入库和读出时规范化这些符号。

原始货币规则：`price_original_currency` 是 `price_original` 的原始币种，使用大写币种代码，例如 `CNY`、`EUR`、`USD`、`HKD`。只要写入 `price_original`，就必须写入 `price_original_currency`，或让服务端能从原始金额文本中识别币种。不要把币种混写进 `price_original` 或 `price_cny`。

### Manifest

```http
GET /api/v1/sync/outfit-context/manifest
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
If-None-Match: "<本地保存的 etag>"
```

本地没有缓存时，不要发送 `If-None-Match`。

有更新时返回 `200 OK`：

```json
{
  "owner": "徐欣",
  "scope": "outfit_context",
  "schema_version": 4,
  "data_version": "v4-...",
  "etag": "sha256:...",
  "resource_base_endpoint": "/api/v1/sync/outfit-context/resources",
  "resources": [
    {
      "name": "items",
      "count": 164,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/items"
    },
    {
      "name": "wear_counts",
      "count": 164,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/wear_counts"
    },
    {
      "name": "featured_looks",
      "count": 15,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/featured_looks"
    },
    {
      "name": "wear_history",
      "count": 42,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/wear_history"
    },
    {
      "name": "primary_photo_thumbnails",
      "count": 120,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/primary_photo_thumbnails"
    },
    {
      "name": "rules",
      "count": 1,
      "checksum": "sha256:...",
      "endpoint": "/api/v1/sync/outfit-context/resources/rules"
    }
  ]
}
```

无更新时返回：

```http
304 Not Modified
ETag: "sha256:..."
```

### Resource

```http
GET /api/v1/sync/outfit-context/resources/{name}
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
If-None-Match: "<该资源上次保存的 checksum>"
```

可用资源名：

- `items`
- `wear_counts`
- `featured_looks`
- `wear_history`
- `primary_photo_thumbnails`
- `rules`

返回：

```json
{
  "owner": "徐欣",
  "scope": "outfit_context",
  "schema_version": 4,
  "resource": "wear_counts",
  "data_version": "v4-wear_counts-...",
  "checksum": "sha256:...",
  "count": 164,
  "data": [],
  "wear_counts": []
}
```

资源响应直接由 SQLite 主数据生成，不依赖 CSV 导出、Drive 同步或共享目录刷新。

旧的全量端点 `/api/v1/sync/outfit-context/bundle` 不再作为同步协议使用；客户端不得因为 global `etag` / `data_version` 改变就下载全量单品。

## 4. Resource 字段

API 字段说明只描述数据语义，不定义具体搭配策略。

- `items`: 当前 owner 的单品与腕表主数据；不包含动态穿着计数字段。
- `wear_counts`: 每个单品的 `wear_total`、`wear_year`、`wear_maintenance`、`maint_count`、`last_worn_on` 和 `maintenance_due`。
- `featured_looks`: 已保存精选套装。
- `wear_history`: 历史穿搭摘要。
- `primary_photo_thumbnails`: 每件有照片单品的第一张主图缩略图缓存 metadata。
- `rules`: 机器可读接口规则。
- `code`: 单品唯一键，历史写入必须使用它。
- `display_name`: 推荐输出可用的人类可读名称；`items` 资源会提供。
- `name`: 兼容旧客户端的名称别名；`items` 资源会提供。
- `section`: SQLite 主数据中的原始单品标题；旧缓存可能只有这个字段。
- `brand` / `official_desc`: 品牌与官方描述；当旧缓存缺少 `name/display_name/section` 时用于拼接显示名称。
- `owner`: 归属人。
- `status`: 状态。
- `maintenance_state`: 保养状态。
- `recommendation_eligible`: 是否默认可进入正式推荐候选。
- `layer_role`: 规范单品角色，只允许 `Inner`、`Middle`、`Outer`、`Bottom`、`Footwear`、`Watch`、`Accessory`、`Dress`、`Home`、`Bespoke`。鞋类写 `Footwear`，不得写 `Shoes`；裤装写 `Bottom`，不得写 `Pants`。
- `outer_type`: 外层语义，如 `Coat`、`Jacket`、`Knit_Outer`、`Shirt_Outer`、`Vest_Outer`。
- `scene_tag`: 场景语义，如 `Comfort`、`City`、`Outdoor`、`Home`、`Watch`。
- `relax_index`: 视觉松弛度数据字段。
- `temp_min` / `temp_max`: 单品适穿温区数据字段。
- `standalone_min` / `standalone_max`: Inner/Middle 脱外套后单穿成立温区数据字段。
- `material`: 材质数据字段。
- `primary_color` / `secondary_color`: 主色系与辅助色系数据字段。
- `price_cny`: 人民币价格字段；统计金额优先使用该字段；格式为纯金额十进制字符串。
- `price_original`: 原始入库/购买价格字段；当 `price_cny` 为空时，统计金额回退使用该字段；格式为纯金额十进制字符串。
- `price_original_currency`: `price_original` 的原始币种；格式为大写币种代码，例如 `CNY`、`EUR`、`USD`、`HKD`；写入 `price_original` 时必填。
- `wear_total` / `wear_year` / `last_worn_on`: 轮换参考字段，位于 `wear_counts` 资源，不位于 `items` 资源。
- `primary_photo`: `items` 资源中的当前第一张照片 metadata；包含 `photo_id`、`checksum`、`thumbnail_path`、`content_path`、`cache_filename`。
- `thumbnail_path`: bearer-token 缩略图下载路径，返回安全 JPEG。
- `content_path`: bearer-token 原图下载路径；只在细节/OCR/交付需要时按需拉取。
- `wear_threshold`: 磨损/保养阈值数字字段；新品入库时如用户指定“磨损阈值”“保养阈值”“thr”“maintenance_threshold”等，应写入结构化 `item.wear_threshold`，不要只写 notes。

名称字段读取规则：

1. 新 `items` 资源：优先 `display_name`，其次 `name`。
2. 旧缓存：回退到 `section`，再回退到 `brand + official_desc`，最后用 `code`。
3. 不得因为没有 `name` 字段就把候选池判为 0。

首图缩略图缓存规则：

1. MCP 日常同步只缓存 `primary_photo_thumbnails` 资源和每件单品第一张主图的安全 JPEG 缩略图。
2. MCP 将缩略图保存到 `.hermes-cache/photos/{cache_filename}`；必须确认文件非 0B，MIME 为 `image/jpeg`，文件名使用资源返回的 `cache_filename`。
3. MCP 对比 `primary_photo_thumbnails[].checksum`，只下载 checksum 变化、本地缺失或本地校验失败的缩略图。
4. Agent 做版型、穿法、厚薄、颜色辅助判断时优先使用 MCP 返回的本地首图缩略图路径。
5. 只有用户要求细节、需要 OCR 标签/小字、视觉比对或交付原图时，才通过 `content_path` 拉原图。
6. 产品没有照片是合法状态：`items[].photo_count=0`、`items[].primary_photo=null`，且不会出现在 `primary_photo_thumbnails` 资源里；MCP 必须跳过缩略图缓存并返回无图状态，不得让整次同步失败。
7. 单张缩略图下载失败、404、0B 或 MIME 不对时，MCP 只标记该 item 无可用本地缩略图并继续处理其他 item；不得因此判定 manifest/resource 同步失败。
8. `.hermes-cache/photos/*.jpg` 只能由当前 `primary_photo_thumbnails` 资源索引使用；旧文件名、旧 `photo_id` 或旧 checksum 不得反推“当前第一张图”。
9. 当 `primary_photo_thumbnails` 资源更新时，MCP 应忽略或清理不再出现在当前资源里的旧首图缩略图文件。

## 5. 单品查询接口

```http
GET /api/v1/items?limit=500
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

可用过滤参数：

- `q`
- `brand`
- `status`
- `loc`
- `layer_role`
- `kind=wardrobe|watch`

单个货号查询：

```http
GET /api/v1/items/{code}
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

## 6. 新产品入库接口

Hermes 负责先根据照片完成识别、字段归纳和结构化；衣橱 API 只负责鉴权、校验、保存结构化结果和可选照片，不做图片识别。

```http
POST /api/v1/items
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: application/json
Idempotency-Key: <稳定唯一键>
```

建议先用 `dry_run: true` 校验，再正式写入。

### 衣物示例

```json
{
  "mode": "create_only",
  "dry_run": true,
  "source": "hermes-photo-analysis",
  "external_id": "hermes-item-货号或批次号",
  "item": {
    "owner": "徐欣",
    "kind": "wardrobe",
    "code": "货号或唯一 Ref",
    "brand": "品牌",
    "section": "产品名称",
    "loc": "SH",
    "layer_role": "Outer",
    "outer_type": "Jacket",
    "scene_tag": "City",
    "relax_index": 3,
    "temp_min": 12,
    "temp_max": 22,
    "standalone_min": null,
    "standalone_max": null,
    "primary_color": "Navy",
    "secondary_color": "Grey",
    "official_desc": "Hermes 图片分析后的描述",
    "price_original": "61400",
    "price_original_currency": "CNY",
    "price_cny": "59900",
    "series": "",
    "size": "",
    "acquired_at": "YYYY-MM-DD",
    "official_color_code": "",
    "material": "材质",
    "care": "",
    "wear_threshold": 30,
    "notes": "识别依据和不确定项",
    "status": "Active"
  },
  "photos": [
    { "file_name": "front.jpg", "content_type": "image/jpeg", "data_base64": "<base64>" }
  ]
}
```

MCP write/update note:

- Hermes Mobile should submit item writes through `wardrobe.write_item`.
- For existing item corrections, use `mode: "upsert"` either as a top-level MCP argument or as `payload.mode`.
- `duplicate_code` means the request used create-only semantics for an existing item. Retry the same MCP tool with `mode: "upsert"` when the user intended an update; do not request generic HTTP or direct Program API fallback.

### JPG / multipart 图片上传

Hermes Mobile 如果拿到的是本地 JPG/JPEG 文件，不需要先转成 base64；应使用 `multipart/form-data` 直接上传文件字节。

新建产品并随附图片：

```http
POST /api/v1/items
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: multipart/form-data
Idempotency-Key: <稳定唯一键>
```

multipart 字段：

- `payload`：JSON 字符串，内容与上面的 `POST /api/v1/items` JSON 请求体相同。
- `photos[]` / `photo` / `file` / `images[]`：一个或多个图片文件，支持 `.jpg`、`.jpeg`、`.png`、`.webp`、`.gif`、`.heic`；`Content-Type` 应为 `image/*`。

给已存在单品补充照片：

```http
POST /api/v1/items/{code}/photos
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: multipart/form-data
Idempotency-Key: <稳定唯一键>
```

multipart 字段：

- `dry_run`：建议先传 `true` 验证，不保存。
- `replace_photos`：可选；`true` 表示先删除该单品旧照片再写入新照片，默认追加。
- `photos[]` / `photo` / `file` / `images[]`：图片文件。
- `{code}` 必须按 URL path segment 编码；腕表 Ref 或货号里有 `/` 时用 `%2F`。

同一个补图接口也支持原始图片二进制直传，适合没有 multipart 构造能力、但可以把附件字节作为 raw body 发送的工具：

```http
POST /api/v1/items/{code}/photos?dry_run=true&filename=IMG_5155.jpeg
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: image/jpeg
X-Filename: IMG_5155.jpeg
Idempotency-Key: <稳定唯一键>

<JPEG bytes>
```

raw body 规则：

- `Content-Type` 使用实际图片类型，例如 `image/jpeg`、`image/png`；也可用 `application/octet-stream`，但必须提供带合法图片扩展名的 `filename` 或 `X-Filename`。
- `dry_run`、`replace_photos`、`filename` 可放在 query string；`X-Dry-Run`、`X-Replace-Photos`、`X-Filename` 也可作为 header。
- raw body 只用于给已存在单品补图；新建产品仍需先用 JSON 或 multipart `payload` 提交结构化 `item` 字段。

注意：裸 `path`、`file://...` 或本地路径字符串不是上传；HTTP 工具必须把文件内容作为 multipart file part 或 raw image body 发给接口。服务器不会读取 Hermes Mobile 设备上的本地路径。

### 产品照片顺序 / 第一张预览图

产品照片按 `sort_order ASC, id ASC` 排序；第一张就是客服或自动分析工具应优先拉取的预览/全图。

单品详情会返回有序照片列表：

```http
GET /api/v1/items/{code}
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

响应字段：

- `item.photos[]`：按当前顺序排列的照片元数据。
- `item.primary_photo`：当前第一张照片；没有照片时为 `null`。
- `item.primary_photo_content_path`：当前第一张照片的 bearer-token 下载路径。
- `item.primary_photo_thumbnail_path`：当前第一张照片的安全 JPEG 缩略图下载路径。

下载当前第一张缩略图：

```http
GET /api/v1/items/{code}/photos/primary/thumbnail
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

下载当前第一张原图：

```http
GET /api/v1/items/{code}/photos/primary/content
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

下载指定照片：

```http
GET /api/v1/items/{code}/photos/{photo_id}/content
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
```

调整照片顺序：

```http
POST /api/v1/items/{code}/photos/order
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: application/json
```

把某张照片设为第一张：

```json
{ "primary_photo_id": 123 }
```

完整重排：

```json
{ "photo_ids": [123, 121, 122] }
```

规则：

- 需要 `items:write` scope；owner key 只能调整自己 owner 的产品照片。
- `{code}` 必须 URL path segment 编码；货号里有 `/` 时用 `%2F`。
- `photo_ids` 必须包含该产品当前全部照片 ID，不能缺失、重复或包含其他产品的照片。
- 支持 `dry_run: true` 预览顺序，不写库。
- 调整后再次 `GET /api/v1/items/{code}`，以返回的 `primary_photo` / `primary_photo_content_path` 为准。
- 如果用户已说明“顺序已经切换”或正在做当前首图视觉核验，必须先读取 live `GET /api/v1/items/{code}` 的 `primary_photo` / `photos[]` 顺序；不得直接信任本地 `.hermes-cache/photos/` 里的旧缩略图。

### 腕表示例

```json
{
  "mode": "create_only",
  "dry_run": true,
  "item": {
    "owner": "徐欣",
    "kind": "watch",
    "code": "腕表 Ref",
    "brand": "品牌（使用已有品牌规范值，例如 Vacheron Constantin）",
    "section": "腕表名称（应包含方位/材质/表盘颜色等区分信息）",
    "primary_color": "Blue",
    "material": "材质",
    "wear_threshold": 30,
    "official_desc": "中文说明",
    "notes": "机芯/尺寸/识别依据",
    "acquired_at": "YYYY-MM-DD"
  }
}
```

字段规则：

- 该接口需要 `items:write` scope；普通 owner key 只能写入 token 绑定 owner，跨 owner 需要 `items:write:any` 或 `admin:*`。
- `dry_run: true` 只校验，不写库、不保存图片、不导出。
- `mode=create_only` 遇到重复 `code` 返回冲突；`mode=upsert` 或 `replace` 会更新同 owner 已有记录。
- `kind=watch` 会强制 `layer_role=Watch`，并写入腕表导出；`kind=wardrobe` 写入衣橱导出。
- `item.layer_role` 必须使用规范单品角色：`Inner`、`Middle`、`Outer`、`Bottom`、`Footwear`、`Watch`、`Accessory`、`Dress`、`Home`、`Bespoke`。不再提供 `Shoes`/`Pants` 写入兼容。
- 新产品入库应优先沿用当前 owner 数据里已有的 `brand` 规范值；已知别名如 `江诗丹顿`、`Vacheron Constantin 江诗丹顿` 会规范化为 `Vacheron Constantin`，避免新建重复品牌。
- 腕表 `section` 是 App 和 `items` 同步资源的主显示标题，应由 Hermes 在写入前规范化，包含能区分同系列变体的信息，尤其是方位/限定名、材质和表盘颜色。API 不自动推断或追加盘面颜色；`primary_color`、`secondary_color`、`official_desc` 只作为结构化字段保存。
- `wear_threshold` 是磨损/保养阈值数字字段；Hermes 入库交互里用户说“磨损阈值”“保养阈值”“thr”“maintenance_threshold”等，应映射为 `item.wear_threshold`。未知可省略或填 `null`/`0`；不要把它和当前累计磨损 `wear_maintenance` 混用。
- 图片是可选项。JSON 请求可提交 `photos[]` 的 `data_base64` 或 `data_url`；multipart 请求可直接提交 JPG/JPEG/PNG 等图片文件；已存在产品还可用 `Content-Type: image/jpeg` raw body 补图。单张上限沿用上传限制，默认最多 12 张。
- 推荐 Hermes 稳定流程：先用 JSON `POST /api/v1/items` 完成结构化入库和 readback；再用 `POST /api/v1/items/{code}/photos` 通过 raw image body 或 multipart file part 补传图片。
- 新建产品时可在 `POST /api/v1/items` multipart 请求里随附图片；已存在产品可用 `POST /api/v1/items/{code}/photos` 追加或替换图片。
- `photos[]` 仅用于保存产品照片；Hermes 必须先完成图片分析并提交结构化字段。
- 正式写入成功后系统会更新 SQLite 主数据并触发对应 CSV 导出；manifest 与变化资源的 checksum 会因 SQLite 数据变化而更新。

## 7. 历史穿搭写入接口

```http
POST /api/v1/history/outfits
Authorization: 运行时填写为 Bearer + 空格 + owner Access Key 原文
Content-Type: application/json
Idempotency-Key: <稳定唯一键>
```

建议先用 `dry_run: true` 校验，再正式写入。

示例：

```json
{
  "owner": "徐欣",
  "wear_date": "YYYY-MM-DD",
  "city": "Shanghai",
  "inventory_loc": "SH",
  "wear_mode": "normal",
  "scene_tag": "City",
  "temp_low": 16,
  "temp_high": 23,
  "temp_value": 20,
  "notes": "当日穿搭说明",
  "source": "hermes",
  "external_id": "hermes-xuxin-YYYY-MM-DD",
  "mode": "create_only",
  "dry_run": true,
  "items": [
    { "code": "单品货号", "role": "Outer", "has_base_layer": false }
  ]
}
```

字段规则：

- `wear_date` 必须是 `YYYY-MM-DD`。
- `temp_low`、`temp_high`、`temp_value` 必须是 `wear_date` 当天、`city` 对应地点的真实天气温度。
- 不得把衣物字段 `temp_min`、`temp_max`、`standalone_min`、`standalone_max` 当作当天气温；这些字段只表示单品适穿温区。
- 无法获得当天真实温度时，温度字段应填 `null` 或省略，不要从衣物候选池推断。
- 通常应满足 `temp_low <= temp_value <= temp_high`；若只知道区间，可只填 `temp_low` 和 `temp_high`。
- 调用天气工具前必须先把中文地点标准化为英文城市名；不要先用中文查失败后再用英文重试。默认映射：`上海` / `崇明` / `陆家嘴` / `国金` -> `Shanghai, China`；`杭州` -> `Hangzhou, China`；`香港` -> `Hong Kong`。
- 细分地点、商场、路线可保留在 `notes` 或场景说明里；天气查询和 API `city` 字段优先使用英文规范城市名。
- `mode` 可选：`create_only`、`upsert`、`replace`；默认使用 `create_only`，避免覆盖已有日期。
- `items[].code` 必须来自当前 owner 的 `items` 同步资源、`GET /api/v1/items`、`衣橱_*.csv` 或 `腕表.csv` 记录。
- `items[].role` 必须使用规范穿搭角色：`Inner`、`Middle`、`Outer`、`Bottom`、`Footwear`、`Accessory`、`Watch`。不再提供 `Shoes`/`Pants` 写入兼容；精选套装内部 slot 使用小写 `inner/middle/outer/bottom/footwear/watch`。
- `has_base_layer` 仅在内层/中层等需要解释磨损增量时填写；不确定时填 `false`。
- `external_id` 应稳定且唯一；重复请求会按幂等规则返回同一结果。
- 正式写入成功后系统会更新 `outfits / outfit_items / wearcount_daily_updates`，并触发 CSV 导出。

## 8. 禁用链路

不得生成或投递：

- `WearCount_new*.xlsx`
- `DAILY_LOG` / `ITEMS` sheet
- 任何等待衣橱程序导入的历史穿搭 Excel

历史穿搭入库只走 Program API。
