# WearCount_new 增量表规则

`WearCount_new*.xlsx` 是唯一有效的增量导入格式。

## 1. 用途

`WearCount_new` 不再回灌整本 `WearCount` 主表。

它只承载“某一天新增或修正的一次穿搭记录”。系统收到后会：

1. 写入或合并当天记录
2. 按规则更新数据库里的累计穿着数据
3. 自动重新导出完整 `WearCount.xlsx`

## 2. 文件名规则

- 文件名必须包含 `WearCount_new`
- 例如：
  - `WearCount_new.xlsx`
  - `WearCount_new_2026-04-03.xlsx`

## 3. 工作表结构

必须包含两个 sheet：

1. `DAILY_LOG`
2. `ITEMS`

## 4. DAILY_LOG sheet

只允许 1 行有效记录。

建议表头：

| Date | City | Wear_Mode | Scene | Forecast_Temp | Notes | Owner |
|------|------|-----------|-------|---------------|-------|-------|

字段语义：

- `Date`
  - 必填
  - 建议格式：`YYYY-MM-DD`
- `City`
  - 这里实际表示 `Location`
  - 会写入数据库的 `inventory_loc`
- `Wear_Mode`
  - 独立表示穿着模式
  - 默认可写 `normal`
  - 写 `home / 居家` 时会触发低磨损模式
- `Scene`
  - 表示当天真实场景
  - 会写入数据库的 `scene_tag`
- `Forecast_Temp`
  - 表示同城同日核心活动时段的预报温度口径
  - 会写入历史记录的温度字段
- `Notes`
  - 选填
- `Owner`
  - 选填
  - 默认 `徐欣`

## 5. ITEMS sheet

一件商品一行。

建议表头：

| Code | Role | Has_Base_Layer |
|------|------|----------------|

字段说明：

- `Code`
  - 必填
  - 商品正式货号
  - 必须能在数据库里命中
- `Role`
  - 选填
  - 可用值：
    - `Outer`
    - `Middle`
    - `Inner`
    - `Bottom`
    - `Footwear`
    - `Accessory`
    - `Watch`
  - 不要写 `Top` 这类泛角色；上装应明确写成 `Inner / Middle / Outer`
  - 留空时，系统会使用数据库中的 `layer_role`
- `Has_Base_Layer`
  - 必填
  - 表示该件商品这次穿着时是否有打底
  - 可接受：
    - 真：`1` / `true` / `yes` / `是` / `有`
    - 假：`0` / `false` / `no` / `否` / `无`

## 6. 计数规则

每件命中的商品都会执行：

- `Total + 1`
- 年度列 `+ 1`
- `last_worn_on = Date`

`Wear` 增量规则：

- `Outer`
  - 固定 `+1`
- `Inner`
  - 有打底：`+1`
  - 无打底：`+2`
- `Middle`
  - 有打底：`+1`
  - 无打底：`+2`
- `Bottom`
  - 有打底：`+1`
  - 无打底：`+2`
- `Footwear`
  - 固定 `+0`
- `Watch`
  - 固定 `+0`
- `Accessory`
  - 固定 `+0`

如果 `Wear_Mode` 这一列填的是 `home / 居家` 这类低磨损场景，则服装类 `Wear` 再乘 `0.5`：

- `+1 -> +0.5`
- `+2 -> +1`

`Footwear / Watch / Accessory` 不受低磨损减半影响。

## 7. 同日修正规则

如果再次导入同一 `Date` 的 `WearCount_new`：

- 系统会先撤销该日期上一次导入的增量
- 再应用这次新的增量

因此同一天可以直接重导修正，不会重复累计。

## 8. 生成要求

让 ChatGPT 生成增量表时，应满足：

1. 只生成 1 条 `DAILY_LOG`
2. `ITEMS` 里列出当天实际穿过的正式货号
3. 对 `Inner / Middle / Bottom` 明确给出 `Has_Base_Layer`
4. 不生成主表累计结果列
5. 不生成整本 `WearCount` 主表

## 9. 给 ChatGPT 的简短提示

可以直接这样说：

“请按 `WearCount_new` 增量格式生成一个 Excel：

- 包含 `DAILY_LOG` 和 `ITEMS` 两个 sheet
- `DAILY_LOG` 只保留 1 行
- 其中 `City` 字段实际表示 `Location`
- `DAILY_LOG` 使用列：`Date`、`City`、`Wear_Mode`、`Scene`、`Forecast_Temp`、`Notes`、`Owner`
- `ITEMS` 一件商品一行
- `ITEMS` 必须包含 `Code`、`Role`、`Has_Base_Layer`
- 不要生成主表累计字段
- 日期使用北京时间”
## 10. 兼容列名补充

`DAILY_LOG` 现在额外支持以下列名：

- `Scene`
  - 表示当天真实场景
  - 会单独写入历史记录的 `scene_tag`
- `Forecast_Temp`
  - 推荐使用的温度列名
  - 会写入历史记录的温度显示
- `Forecast`
  - 等同于当天温度字段
  - 会写入历史记录的温度显示

推荐现在优先使用这组列：

| Date | City | Wear_Mode | Scene | Forecast_Temp | Notes | Owner |
|------|------|-----------|-------|---------------|-------|-------|

其中：
- `City` = `Location`
- `Wear_Mode` = `穿着模式`
- `Scene` = `场景`
- `Forecast_Temp` = `温度`
