# Coin's Creative Cabin · STORY NOTES

一座放在浏览器里的私人小说书架：点开一本书，整理它的角色、背景、设定、地图与资料。夜图书馆壁纸配磨砂玻璃卡片，左侧栏直达书架、小说与各内容分区；无需登录，零依赖；站点外壳使用 Jekyll 构建，可直接部署到 GitHub Pages。

> 小说与设定数据只保存在每位访问者自己的浏览器里，Jekyll 只负责生成静态页面外壳。

## 功能

- **玻璃拟态外壳**：全屏夜图书馆壁纸 + 磨砂玻璃主卡片，左侧固定导航汇总书架、小说与分区；窄屏自动折叠为顶部导航
- **外观调节**：左侧栏「外观」面板提供晨雾 / 暮色 / 暖纸 / 清透四套风格，并可单独调整强调色、壁纸明暗、玻璃不透明度（58%–100%）、卡片不透明度（34%–90%）、磨砂模糊、玻璃描边与正文字号，实时生效并自动保存在本机；透明度过低时会自动提亮背景并加深次要文字，保证文字清晰
- **外观浮层**：外观面板按按钮周围的可用空间自动向上或向下展开，长页面、短页面、窄屏和滚动时都保持完整可见，不会被页面圆角裁切
- **书架首页**：用书封卡片陈列所有小说，支持搜索、按创作状态筛选、按更新 / 创建时间或书名排序
- **小说工作区**：每本小说都有独立概览，包含故事简介、六个内容分区与最近更新
- **六个内容分区**：大纲、角色、背景、设定、地图、资料
- **大纲分区**：按总纲、分卷或章节记录主线、转折与伏笔，方便整理发给 AI 的创作上下文
- **大纲整页编辑**：大纲的新增与编辑使用独立整页书写界面，正文区域可以展开写长稿；有未保存修改时离开页面会先确认
- **词条详情页**：每个角色 / 地点 / 设定都有独立页面，可记录标签、概要、详细档案
- **人物关系图**：角色分区可在关系图与档案列表间切换；关系可设为双向或单向箭头，支持拖动角色、缩放与平移画布；每本小说可以建立多张「谱系」，分别整理人物、家族或其他关系，并可重命名与删除
- **六边形地图工坊**：地图词条可打开全屏画布，在 22×14 六边形网格上绘制地形、放置城市；每座城市有独立的名称、颜色与 1–3 格领地范围，支持缩放、拖动画布、撤销 / 重做；详情页显示地图预览，词条卡片显示缩略图与城市数量
- **自定义封面**：在「编辑小说资料」中上传自己的竖版图片，自动裁成 2:3 并压缩后只保存在本机；书架与小说页会同步使用，可随时移除恢复生成式书封
- 小说与词条都支持置顶；未上传封面时使用五种色调的生成式书封
- **回收站**：删除的小说 / 词条先进入左侧回收站，可恢复回原来的位置；支持彻底删除与一键清空
- **评论与标注**：每个页面右下角都有一个独立于页面的悬浮「＋ 评论」按钮，可以评论整页、某本小说、某个分区、某张词条卡片，或词条里的简介、详细档案与地图；左侧「评论」目录与「我的书架」同级，支持搜索、排序，并能一键跳回被评论的位置，目标被删除后仍保留评论并标记为失效
- 数据保存在浏览器本地，支持 JSON 导出与导入备份，多标签页自动同步
- 键盘操作：书架页 `N` 新建小说，小说分区页 `N` 新建词条（大纲会打开整页编辑），`/` 聚焦当前页搜索（评论页聚焦评论搜索），`Ctrl / ⌘ + Enter` 保存
- 响应式布局：桌面为左侧栏 + 内容区，平板与手机自动转为顶部导航、分区胶囊换行；支持 `prefers-reduced-motion`

## 页面结构

站点使用 hash 路由，刷新与浏览器前进 / 后退都能正常工作，也可以直接收藏某一页：

| 地址 | 页面 |
| --- | --- |
| `#/` | 我的书架 |
| `#/comments` | 评论与标注目录 |
| `#/trash` | 回收站 |
| `#/novel/<小说ID>` | 某本小说的概览 |
| `#/novel/<小说ID>/outline` | 大纲列表 |
| `#/novel/<小说ID>/outline/new` | 新增大纲（整页） |
| `#/novel/<小说ID>/outline/<词条ID>/edit` | 编辑大纲（整页） |
| `#/novel/<小说ID>/characters` | 角色列表 |
| `#/novel/<小说ID>/world` | 背景列表 |
| `#/novel/<小说ID>/settings` | 设定列表 |
| `#/novel/<小说ID>/maps` | 地图列表 |
| `#/novel/<小说ID>/notes` | 资料列表 |
| `#/novel/<小说ID>/<分区>/<词条ID>` | 词条详情 |

## 地图工坊

在地图分区新建或打开一个词条，详情页会显示地图预览；点击预览或「打开地图工坊」进入全屏编辑。

- **地形**：草原地形是默认底色，不需要逐格保存；水域、沙漠、森林、丘陵、山脉、平原可以用画笔逐格或按住拖动绘制，橡皮擦恢复草原。
- **城市**：选择「城市」工具后点击格子放置；右侧检查器可以改名、切换六种颜色、调整领地范围（1–3 格），或删除选中的城市。领地按“距离最近的城市”自动划分，范围重叠时归最近的一座。
- **视图**：滚轮 / 触控板缩放，拖动画布平移，`适应画布` 回到全图；手机上使用画布右上角的浮动按钮缩放与撤销。
- **历史**：`Ctrl / ⌘ + Z` 撤销，`Ctrl / ⌘ + Shift + Z` 或 `Ctrl + Y` 重做；选中城市后按 `Delete / Backspace` 删除。
- 保存后地图随词条一起存入浏览器本地；关闭时若有未保存修改会先确认。

## 项目结构（Jekyll）

```text
.
├── _config.yml            # 站点标题、描述与构建排除项
├── index.html             # 页面内容（含 front matter，交给 default 布局）
├── _layouts/
│   └── default.html       # HTML 骨架：左侧栏 + 内容区 + 页脚
├── _includes/
│   ├── head.html          # <head> 内容：标题、图标、样式
│   ├── icon-sprite.html   # SVG 图标集合
│   ├── sidebar.html       # 左侧栏：书架、小说列表、分区、导入导出
│   ├── site-footer.html   # 页脚
│   ├── templates.html     # 前端使用的 <template>
│   └── dialogs.html       # 新建 / 编辑 / 导入等 <dialog>
├── assets/
│   ├── css/styles.css     # 组件与基础布局
│   ├── css/theme.css      # 玻璃拟态主题、壁纸与响应式覆盖
│   ├── img/story-library.jpg  # 夜图书馆背景壁纸
│   └── js/app.js          # 全部交互与本地数据逻辑
├── favicon.svg
└── README.md
```

`index.html` 只保留书架与小说工作区的页面结构，由 `default.html` 布局包裹；左侧栏、页脚、模板与对话框拆进 `_includes/`。`styles.css` 负责结构与组件的默认样式，`theme.css` 在其后加载，负责配色、玻璃外壳、壁纸和响应式覆盖。样式与脚本仍是纯静态文件，不使用任何前端依赖。

## 本地预览

Jekyll 需要先渲染 Liquid 再提供页面，**不能直接双击 `index.html`，也不能用普通静态服务器打开源码目录**，否则只会看到未渲染的页面。

安装 Ruby 后运行：

```bash
gem install jekyll bundler
jekyll serve
```

然后访问 <http://localhost:4000>。修改 `index.html`、`_includes/` 或 `assets/` 后刷新即可；改动 `_config.yml` 需要重启。

如果不想在本地安装 Ruby，也可以先把文件上传到 GitHub，让 GitHub Pages 自动构建（见下一节）。

## 数据与备份

- 所有内容保存在当前浏览器的 `localStorage` 中，存储键为 `gushibu.library.v1`，不会上传到任何服务器。
- 外观设置单独保存在 `gushibu.appearance.v1`，不属于小说数据，也不会写入导出备份。
- 清理浏览器数据、使用无痕模式、更换浏览器或设备后，原数据将无法读取。
- 建议定期点击「导出备份」保存 JSON 文件；在新设备上点击「导入备份」即可合并。
- 导入以小说 ID、词条 ID 和评论 ID 去重：内容较新（`updatedAt` 更晚）的版本会覆盖旧版本，置顶状态会保留。
- 删除小说或词条时，内容会先移入回收站，可恢复回原位置；彻底删除或清空回收站后无法找回。指向已删除位置的评论不会消失，而是在评论目录中标记为失效。
- 导出的备份包含全部小说、词条、封面图片、回收站记录与评论；这三类记录都会参与导入合并，旧版不含 `comments` 的备份仍可正常导入，也支持只导入评论的备份文件。
- 封面图片会先裁成 2:3、压缩为 JPEG 再写入 `localStorage`，但仍会占用本地空间；封面较多的备份 JSON 也会相应变大。
- 本地预览和线上站点的数据互不相通，切换域名后请用导出 / 导入迁移。
- 导出的备份包含全部小说与词条，请勿把备份 JSON 提交到公开仓库。

## 数据结构

`gushibu.library.v1` 的内容形如：

```json
{
  "version": 1,
  "novels": [
    {
      "id": "小说 ID",
      "title": "书名",
      "genre": "类型",
      "summary": "一句话简介",
      "description": "故事简介",
      "status": "planning | drafting | revising | done",
      "tone": 0,
      "cover": "data:image/jpeg;base64,...（可选，自定义封面）",
      "pinned": false,
      "createdAt": "ISO 时间",
      "updatedAt": "ISO 时间",
      "entries": {
        "outline": [],
        "characters": [],
        "world": [],
        "settings": [],
        "maps": [],
        "notes": []
      },
      "relationGraphs": [
        { "id": "primary", "title": "人物关系", "createdAt": "ISO 时间" }
      ],
      "relations": [
        {
          "id": "关系 ID",
          "source": "角色 ID",
          "target": "角色 ID",
          "label": "师徒",
          "directed": true,
          "graphId": "primary"
        }
      ]
    }
  ],
  "trash": [
    {
      "id": "回收站记录 ID",
      "type": "novel | entry",
      "deletedAt": "ISO 时间",
      "novelId": "所属小说 ID",
      "novelTitle": "所属小说名",
      "sectionKey": "分区键（小说记录为 null）",
      "sectionLabel": "分区名（小说记录为 null）",
      "entryId": "词条 ID（小说记录为 null）",
      "entryTitle": "词条名（小说记录为 null）",
      "index": 0,
      "payload": { "删除时的完整快照": true }
    }
  ],
  "comments": [
    {
      "id": "评论 ID",
      "body": "评论内容",
      "createdAt": "ISO 时间",
      "updatedAt": "ISO 时间",
      "target": {
        "kind": "page | novel | section | entry | entry-card | block",
        "hash": "#/novel/<小说ID>/<分区>",
        "anchor": "page | entry:<词条ID> | block:<summary|notes|map>",
        "novelId": "小说 ID 或 null",
        "novelTitle": "小说名快照",
        "sectionKey": "分区键或 null",
        "sectionLabel": "分区名快照",
        "entryId": "词条 ID 或 null",
        "entryTitle": "词条名快照",
        "block": "summary | notes | map | null",
        "label": "位置快照"
      }
    }
  ]
}
```

`trash` 与 `comments` 都是可选的；回收站记录保存了删除前的完整快照与原位置序号，因此恢复小说或词条（包括地图数据）会回到原来的顺序。评论的 `target` 同时保存了稳定 ID 和当时的名称快照：跳转时按 ID 重新解析当前位置与名称，目标不存在时按快照展示为失效。评论按 ID 合并，最多保留 1000 条，正文上限 2000 字。

小说可选的 `cover` 只接受站内上传后压缩得到的 `data:image/jpeg`、`data:image/png` 或 `data:image/webp` 数据地址，外部图片链接会被忽略；上传图片会裁成 2:3，输出为 480×720 的 JPEG。

每个词条包含 `id / title / subtitle / summary / notes / tags / pinned / createdAt / updatedAt`；角色词条还会记录每张谱系里的节点位置 `graphPositions`（按谱系 ID 保存）。地图词条额外包含 `map` 字段，记录画布尺寸、地形与城市：

```json
{
  "cols": 22,
  "rows": 14,
  "tiles": { "3,4": "water", "4,5": "forest" },
  "cities": [
    {
      "id": "城市 ID",
      "name": "白港",
      "col": 8,
      "row": 6,
      "color": "#4f6df5",
      "radius": 2
    }
  ]
}
```

`tiles` 只保存非草原地形，键名是 `列,行`；城市坐标从 0 开始，半径 1–3，单张地图最多 40 座城市。分区配置集中在 `app.js` 顶部的 `SECTIONS` 常量里，之后要新增分区、改字段名或接入时间线等能力，都可以从这个结构继续扩展。

## 部署到 GitHub Pages

GitHub Pages 会检测到 `_config.yml` 并自动用 Jekyll 构建，不需要 Actions 工作流，也不需要本地构建产物。

### 用户主页（地址最短）

1. 在 GitHub 新建仓库，仓库名必须是 `<你的用户名>.github.io`。
2. 将以下内容放到仓库根目录（保持文件夹结构）：
   - `_config.yml`
   - `index.html`
   - `_layouts/`（内含 `default.html`）
   - `_includes/`（内含 6 个 HTML 片段）
   - `assets/css/styles.css`
   - `assets/css/theme.css`
   - `assets/img/story-library.jpg`
   - `assets/js/app.js`
   - `favicon.svg`
   - `README.md`（可选）
3. 不要在仓库里放 `.nojekyll`。若仓库之前上传过纯静态版本，请先删除根目录的 `.nojekyll`、`styles.css` 和 `app.js`，只保留新的 Jekyll 结构；否则 Pages 会跳过 Jekyll，页面将无法正确渲染。
4. 打开仓库的 **Settings → Pages → Build and deployment**：
   - **Source**：`Deploy from a branch`
   - **Branch**：`main`
   - **Folder**：`/ (root)`
   - 点击 **Save**
5. 等待 **Actions** 中的 `pages build and deployment` 完成（约 1–2 分钟），访问 `https://<你的用户名>.github.io/`。

### 项目主页

仓库名可以随意，访问地址为 `https://<你的用户名>.github.io/<仓库名>/`。站点全部使用相对路径，不需要修改代码，Pages 设置同上。

### 第一次推送

```bash
git init
git add _config.yml index.html _layouts _includes assets favicon.svg README.md
git commit -m "Coin's Creative Cabin：用 Jekyll 搭建的小说设定集"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

也可以直接在 GitHub 仓库页面用 **Add file → Upload files** 上传，注意保留 `_layouts`、`_includes` 和 `assets` 的层级；浏览器上传支持直接拖入文件夹。

### 部署提示

- 如果页面没有立即更新，查看仓库 **Actions** 中 Pages 的构建状态，并在浏览器中强制刷新。
- 仓库代码是公开的，但小说内容只存在每位访问者自己的浏览器里，不会进入仓库。
- 不需要 `npm install` 或任何构建脚本；Jekyll 由 GitHub Pages 提供。

## 自定义

- 主题配色、玻璃透明度、字体与响应式断点：优先使用左侧栏「外观」面板实时调整；也可以修改 `assets/css/theme.css` 顶部 `:root` 中的 `--glass-alpha`、`--card-alpha`、`--glass-blur`、`--wallpaper-dim`、`--rim-strength`、`--reading-scale`、`--accent-rgb` 与媒体查询；风格预设与强调色板定义在 `assets/js/app.js` 顶部的 `APPEARANCE_PRESETS` / `ACCENT_PALETTES`，低透明度下的文字保护由 `html.is-sheer` 控制，面板浮层定位由 `positionAppearancePanel()` 计算。组件基础样式在 `assets/css/styles.css`，书封色调在 `.tone-*` 变量。
- 背景壁纸：替换 `assets/img/story-library.jpg`（建议使用 16:9 或更宽的图片）；路径在 `theme.css` 的 `--wallpaper` 变量中。
- 站点标题、描述与构建排除项：修改 `_config.yml`；页面 `<title>` 与 meta 描述在 `_includes/head.html`。
- 页面主体文案：修改 `index.html`；侧边栏与页脚文案在 `_includes/sidebar.html`、`_includes/site-footer.html`。
- 公共区块与对话框：修改 `_includes/templates.html`、`_includes/dialogs.html`。
- 分区名称、字段提示、空状态文案与交互：修改 `assets/js/app.js` 中的 `SECTIONS`；若调整存储结构，请同步更新存储键或在读取时做兼容处理。
- 地图外观与规则：修改 `assets/js/app.js` 顶部的 `MAP_TERRAINS`（地形名称与配色）、`MAP_CITY_COLORS`（城市颜色）和 `MAP_DEFAULT_COLS` / `MAP_DEFAULT_ROWS`（新地图尺寸）；SVG 样式在 `assets/css/theme.css` 中以 `.map-` 开头的规则里。
