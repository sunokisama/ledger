# 流转账本

面向中日双向代购与日常收支的多币种账本。所有交易保留原始币种，JPY 与 CNY 资金池分别核算；折算只用于查看和统计。

## 当前可用

- 响应式网页与安卓手机布局
- 登录用户隔离及在线数据库持久保存
- 新增、查看、删除流水
- JPY / CNY 原币记录
- 日常与代购交易分类
- 账户、库存、报表与换汇批次界面
- 浅色和深色模式

当前线上版本使用 ChatGPT Sites 登录与 D1 数据库。本仓库可导入 GitHub 后交给 Codex Cloud 继续开发。

## 本地检查

要求 Node.js 22.13 或更高版本。

```bash
npm ci
npm run build
```

数据库结构变更后运行：

```bash
npm run db:generate
```

## 关键目录

```text
app/ledger-app.tsx             主应用界面与交互
app/api/transactions/route.ts  流水 API
db/schema.ts                   数据库结构
drizzle/                       数据库迁移
components/ui/                 通用界面组件
docs/PRODUCT_SPEC.md           完整产品与开发方案
```

## 推荐开发顺序

1. 账户 CRUD 与账户币种校验。
2. 商品、买入批次、部分售出和额外费用。
3. 换汇批次与 FIFO 分摊。
4. 利润、汇兑损益和返点报表。
5. CSV/Excel 导入导出与 PayPay 账单映射。
6. Web PWA 封装 Android 安装包。
