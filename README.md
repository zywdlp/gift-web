# 礼品管理后台前端

基于 Vue 3、Vite、TypeScript 与 Element Plus 的礼品管理后台。

## 当前功能

- 密码与图形验证码登录
- 动态菜单与 RBAC 权限路由
- 礼品管理入口
- 管理员个人中心与修改密码
- 用户、角色、菜单、部门与操作日志页面能力（按后台菜单授权显示）

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm `>=8`

## 本地运行

```bash
pnpm install
pnpm dev
```

开发服务器默认监听 `3000` 端口，并将 `/dev-api` 代理到 `.env.development` 中的后端地址。

## 生产部署

执行 `pnpm build` 后，将生成的静态文件部署到 Nginx 或 Caddy。生产环境需将 `/prod-api` 反向代理到 NestJS 后端。

## 配置

- `.env.development`：本地开发端口、API 地址及标题
- `.env.production`：生产环境 API 前缀、标题与部署基础路径
