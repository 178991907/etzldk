# 自律宝贝 (Discipline Baby) - V3.0

一个基于 Cloudflare Workers + KV 存储的极简自律管理工具。支持番茄钟、多维任务管理、勋章荣誉系统及愿望清单。

## V3.0 重大更新
- **番茄时钟 (Pomodoro)**：内置美观的环形计时器，支持专注、短休、长休三种模式。
- **全多维解锁逻辑**：奖品和荣誉现在可以基于任务数、坚持天数、成长值 (XP) 或指定任务完成来解锁。
- **全模块编辑功能**：支持对所有任务、荣誉方案、奖品方案进行二次编辑。
- **本地时间同步修复**：解决了跨时区导致的一次性任务无法在首页显示的 Bug。

## 部署说明
1. 确保已安装 [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-upgrading/)。
2. 在 Cloudflare 控制台创建一个 KV 命名空间。
3. 修改 `wrangler.toml` 中的 `kv_namespaces` 绑定 ID。
4. 执行以下命令进行部署：
   ```bash
   wrangler deploy
   ```

## 核心特性
- **纯单文件架构**：整个应用（前端 + 后端 API）集成在一个 `_worker.js` 文件中。
- **无状态持久化**：使用 Cloudflare KV 实现多端数据同步。
- **极致视觉体验**：采用 Tailwind CSS 和 Lucide 图标库，打造原生 App 级的手感。
