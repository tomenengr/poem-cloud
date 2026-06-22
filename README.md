# 诗云 · Shiyun

**刘慈欣《诗云》 × 古典诗词 × 现代 AI 可视化**

极致暗黑宇宙风 Web App：深蓝紫黑背景 + 发光粒子 + 星云 + 优雅中文排版。使用 Next.js 15 + TypeScript + Tailwind + shadcn/ui 构建。

> “技术能穷尽所有诗，但能否穷尽美？”

---

## 核心功能

- **3D 诗云星图** (`/star-map`)：@react-three/fiber 实现，可交互旋转、缩放、筛选。诗人节点按作品数量大小、朝代上色，优雅曲线表示关系。点击弹出详情 Modal。
- **Vibe 诗词生成器** (`/generator`)：自然语言提示 → 漂浮诗卡片。支持**本地规则引擎**（始终可用）+ **LLM**（Grok / Claude / OpenAI）。
- **原著与哲思** (`/story`)：故事摘要 + 关键引用 + 简单讨论区。
- **诗人探索** (`/explore`)：完整列表 + 详情页（作品 + 关系）。
- **设置** (`/settings`)：保存 LLM API Key、生成参数。

全部功能响应式，桌面优先，完美中文排版。

---

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000

---

## 数据（真实诗词）

项目已内置大量真实古典诗词（李白、杜甫、苏轼、李清照、辛弃疾、陆游、纳兰性德等 29+ 诗人，40+ 首名篇）。

### 重新生成 / 扩充真实数据

```bash
# 方式一（推荐，立即可用）
npx tsx scripts/prepare-data.ts

# 方式二（使用完整仓库，获取更多诗）
git clone https://github.com/chinese-poetry/chinese-poetry.git /tmp/cp
npx tsx scripts/prepare-data.ts /tmp/cp
```

脚本会输出：
- `data/poets.json`（60+ 目标，当前已大幅扩充）
- `data/poems.json`（每位诗人 2–4 首以上真实作品）
- `data/relations.json`

重新运行脚本后刷新星图即可看到更多真实诗词和更丰富的星云网络。

---

## LLM API Keys

1. 访问 `/settings`
2. 填入任意：
   - Grok (xAI)：https://x.ai/api （OpenAI 兼容）
   - Claude (Anthropic)
   - OpenAI
3. 密钥**只存在于浏览器本地**，通过 `/api/generate` 代理调用（不会泄漏）。

无密钥时始终使用高质量本地规则生成器。

---

## Azure VM Docker 完整部署指南

### 1. 准备 Dockerfile（项目已包含）

项目已包含生产级 `Dockerfile` + `next.config.ts` 配置了 `output: 'standalone'`。

### 2. 在 Azure VM 上部署

```bash
# SSH 进 VM
sudo apt update
sudo apt install -y docker.io git

# 允许当前用户使用 docker（需重新登录或 newgrp docker）
sudo usermod -aG docker $USER
newgrp docker

# 克隆代码
git clone <your-repo-url> poem-cloud
cd poem-cloud

# 构建
docker build -t shiyun:latest .

# 运行（映射到 80 端口）
docker run -d \
  --name shiyun \
  -p 80:3000 \
  --restart unless-stopped \
  shiyun:latest
```

### 查看日志
```bash
docker logs -f shiyun
```

### 更新
```bash
git pull
docker build -t shiyun:latest .
docker stop shiyun && docker rm shiyun
docker run -d --name shiyun -p 80:3000 --restart unless-stopped shiyun:latest
```

### 可选：使用 Caddy 反向代理 + HTTPS

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/setup.deb.sh' | sudo -E bash
sudo apt install caddy

# /etc/caddy/Caddyfile
your-domain.com {
    reverse_proxy localhost:3000
}
```

重启 caddy 后自动获得 HTTPS。

防火墙开放 80 / 443。

---

## 用 Cursor 继续迭代（推荐）

本项目采用“Vibe Coding”风格，视觉优先、代码可读。

### 优秀提示词示例

```
在 /components/StarMap.tsx 里加入 force-directed 布局，让诗人节点根据关系自动排布。
```

```
改进 lib/poetryGenerator.ts，让七律押更合理的韵脚，并支持更多词牌。
```

```
在诗卡片上加“收藏后跳转到故事页”的按钮。
```

```
给 3D 星图加一个“自动漫游”按钮，每 8 秒缓慢飞向随机诗人。
```

```
把诗云星图的连线改成带粒子流动效果的 TubeGeometry。
```

直接把文件扔给 Cursor + 上面提示即可快速出效果。

---

## 项目结构（关键）

```
app/
  layout.tsx + Nav
  page.tsx (首页)
  star-map/page.tsx + components/StarMap.tsx
  generator/page.tsx + components/PoemCard.tsx
  story/ / explore/ / settings/
  api/generate/route.ts
lib/
  poetryGenerator.ts   # 本地核心
  store.ts             # zustand + 持久化
data/
  poets.json / poems.json / relations.json
Dockerfile
```

---

## 技术栈

- Next.js 15 + TypeScript (strict)
- Tailwind + shadcn/ui
- @react-three/fiber + drei + three
- Framer Motion
- Zustand + localStorage
- html2canvas（导出图片）

---

## 致谢

- 刘慈欣《诗云》
- chinese-poetry 开源数据库
- 所有古典诗词作者

---

欢迎在 Cursor / Claude / Cursor + Grok 中继续把这个项目打造成最美的中文科幻诗意 AI 体验。
