# Coin's Creative Cabin · STORY NOTES

一座放在浏览器里的私人小说书架：点开一本书，整理它的角色、背景、设定、地图与资料。夜图书馆壁纸配磨砂玻璃卡片，左侧栏直达书架、小说与各内容分区；无需登录，零依赖；站点外壳使用 Jekyll 构建，可直接部署到 GitHub Pages。

> 默认情况下，小说与设定数据只保存在每位访问者自己的浏览器里。只有主动解锁并部署的公开快照，才会进入独立的只读公开书架。

## 功能

- **玻璃拟态外壳**：全屏夜图书馆壁纸 + 磨砂玻璃主卡片，左侧固定导航汇总书架、小说与分区；窄屏自动折叠为顶部导航
- **玻璃下拉菜单**：排序、评论目标、人物关系两端、练笔关联、网页构想分类 / 状态、演算工坊的全部下拉都换成自绘的液态玻璃 listbox，原生控件只保留取值与表单语义。菜单带分组标题与选中勾、自动避开视口边缘，支持方向键 / Home / End / PageUp / PageDown / 回车 / Esc 与首字定位，并通过 `aria-activedescendant` 向读屏软件播报当前选项；对话框内同样可以点选并把焦点交回触发器
- **外观调节**：左侧栏「外观」面板提供晨雾 / 暮色 / 暖纸 / 清透四套风格，并可单独调整强调色、壁纸明暗、玻璃不透明度（58%–100%）、卡片不透明度（34%–90%）、磨砂模糊、玻璃描边与正文字号，实时生效并自动保存在本机；透明度过低时会自动提亮背景并加深次要文字，保证文字清晰
- **外观浮层**：外观面板按按钮周围的可用空间自动向上或向下展开，长页面、短页面、窄屏和滚动时都保持完整可见，不会被页面圆角裁切
- **书架首页**：用书封卡片陈列所有小说，支持搜索、按创作状态筛选、按更新 / 创建时间或书名排序
- **全书字数统计**：书架卡片、小说概览、分区卡片、词条卡片与词条详情页都会显示正文字数（按去除空格与换行后的字符数统计，一万字以上自动换算为「万字」）
- **全局快速搜索**：按 `Ctrl / ⌘ + K` 或点左侧栏「搜索」随时唤起，一次搜索所有小说的标题、类型、简介、标签与正文；结果按相关度排序并高亮关键词，方向键选择、回车直达；空搜索时显示全库最近更新。数据只在本地过滤，不上传任何内容
- **导出小说 Markdown**：小说概览的「故事简介」面板提供「导出 Markdown」，把整本小说的简介、大纲、角色、背景、设定、地图城市与人物关系导出为一个 `.md` 文件，方便备份或整理给 AI 的创作上下文
- **整书 AI 设定包**：小说概览的「整书给 AI」把当前小说的简介、六个分区与人物关系整理成一段可粘贴的上下文，提供「讨论剧情 / 续写上下文 / 自查矛盾」三种预设，可勾选分区并填写「额外关注」；支持预览、一键复制与下载 `.md`，只在本机生成，不上传任何内容
- **公开作品与公开书架**：左侧栏「公开作品」可以为小说解锁公开，并展开每本小说的「条目公开范围」面板，用「跟随 / 公开 / 私密」分段开关逐条设置；条目编辑弹窗里保留同样的控件。解锁的内容会生成一份独立的公开快照，由只读的 `public.html` 展示给所有人。未解锁的小说、私密条目、评论、回收站与关系图布局都不会进入快照；条目公开范围变化后，快照状态会自动提示「建议重新生成」
- **小说工作区**：每本小说都有独立概览，包含故事简介、六个内容分区与最近更新
- **分层侧栏**：进入小说后，当前小说的概览与分区单独归入「当前小说」区块，与上级「我的小说」列表分开；区块平滑展开，切换同一本小说的分区时不会重复播放动画
- **页面高度过渡**：在书架、小说、分区、评论与回收站之间切换时，整体玻璃卡片的底边会在新旧高度之间平滑过渡，底部渐隐随高度同步移动；快速连续切换会从当前高度衔接，并遵循系统的减弱动效设置
- **六个内容分区**：大纲、角色、背景、设定、地图、资料
- **大纲分区**：按总纲、分卷或章节记录主线、转折与伏笔，方便整理发给 AI 的创作上下文
- **大纲整页编辑**：大纲的新增与编辑使用独立整页书写界面，正文区域可以展开写长稿；有未保存修改时离开页面会先确认
- **词条详情页**：每个角色 / 地点 / 设定都有独立页面，可记录标签、概要、详细档案
- **人物关系图**：角色分区可在关系图与档案列表间切换；关系可设为双向或单向箭头，支持拖动角色、缩放与平移画布；每本小说可以建立多张「谱系」，分别整理人物、家族或其他关系，并可重命名与删除
- **六边形地图工坊**：地图词条可打开全屏画布，在可调六边形网格（默认 22×14，最大 48×34）上绘制草原、平原、森林、丘陵、山脉、水域、湖泊、沙漠、雪原、沼泽与火山，铺设河流、道路与地标，放置城市并标记物产与大陆；海岸线分浅滩、浪花、岸线与沙滩多层，河流带源头泉眼与入海口，城市有光晕、投影与玻璃高光；每座城市有独立的名称、颜色与 1–3 格领地范围，支持缩放、拖动画布、撤销 / 重做、生成灵感大陆与导出 PNG，放大到 118% 以上自动切换 3D 立体视角、缩回 102% 以下回到 2D；详情页显示地图预览，词条卡片显示缩略图与城市数量
- **文明 6 地图互导**：地图工坊可以把当前画布导出为 `.Civ6Map`，也可以导入 `.Civ6Map` 继续编辑；导出时按文明 6 标准尺寸自动选档并列出越界提示，导入超出画布上限的官方地图会等比缩放、把河流折线补齐到格边；转换在浏览器本地完成（首次加载约 1MB 的 SQLite 引擎，之后有缓存），模板与来源声明随站点分发
- **练笔房**：独立于小说的刻意练习层级（侧栏「练笔房」，17 道内置题），可按仿写 / 五感 / 场景 / 对话 / 情绪 / 自由抽题，并优先用你自己的角色与地点填空；记录范文、练笔与复盘，可关联最多 4 个词条，一键复制四维点评请求给 AI
- **网页构想收件箱**：侧栏「网页构想」（`#/ideas`）用来记下这个站点下一步要开发的功能。每条构想有分类、心动值（1–5）、状态管线（构想 / 计划做 / 开发中 / 已上线 / 搁置）与一句「最小下一步」；支持搜索、状态筛选、按更新 / 创建 / 推进 / 心动排序。「随机翻一张」会偏向心动值高、正在推进的构想，把愿望变成今天能动手的一步；每条还能一键复制一段给 AI 的可行性讨论请求。构想只保存在本机，不进入公开快照
- **世界演算工坊**：按历法 / 气候 / 民俗 / 命运四个页签推演世界，种子可手改或一键换一套，同一组参数与种子可复现结果，命运结果以信封形式拆封；气候页还可读取本书的一张地图，按山脉与盛行风推演迎风坡、雨影与干旱带，并核对城市、河流、魔泉与沙漠是否自洽；可以把推演存为设定词条，或复制带「世界法则」上下文的拓展请求给 AI
- **词条「给 AI」与灵感抽签**：词条详情页可一键复制词条、别名、概要、正文与反链上下文；书架页的灵感抽签用键盘 `I` 唤起；页脚按真实日期标注月相
- **写作进度与数据安全**：小说可设全书字数目标，概览显示进度卡；数据安全面板提示 90 天未备份并显示本地容量；再次打开站点时，横幅可一键回到上次所在的页面
- **自定义封面**：在「编辑小说资料」中上传自己的竖版图片，自动裁成 2:3 并压缩后只保存在本机；书架与小说页会同步使用，可随时移除恢复生成式书封
- 小说与词条都支持置顶；未上传封面时使用五种色调的生成式书封
- **回收站**：删除的小说 / 词条先进入左侧回收站，可恢复回原来的位置；支持彻底删除与一键清空
- **评论与标注**：每个页面右下角都有一个独立于页面的悬浮「＋ 评论」按钮，可以评论整页、某本小说、某个分区、某张词条卡片，或词条里的简介、详细档案与地图；左侧「评论」目录与「我的书架」同级，支持搜索、排序，并能一键跳回被评论的位置，目标被删除后仍保留评论并标记为失效
- 数据保存在浏览器本地，支持 JSON 导出与导入备份，多标签页自动同步
- 键盘操作：`Ctrl / ⌘ + K` 全局快速搜索，书架页 `N` 新建小说，小说分区页 `N` 新建词条（大纲会打开整页编辑），网页构想页 `N` 新建构想、`R` 随机翻一张，`/` 聚焦当前页搜索（评论页聚焦评论搜索，网页构想页聚焦构想搜索），`Ctrl / ⌘ + Enter` 保存；聚焦玻璃下拉后可用方向键、Home / End、PageUp / PageDown、回车与 Esc 操作
- 响应式布局：桌面为左侧栏 + 内容区，平板与手机自动转为顶部导航、分区胶囊换行；支持 `prefers-reduced-motion`

## 页面结构

站点使用 hash 路由，刷新与浏览器前进 / 后退都能正常工作，也可以直接收藏某一页：

| 地址 | 页面 |
| --- | --- |
| `#/` | 我的书架 |
| `#/publish` | 公开作品与发布 |
| `#/comments` | 评论与标注目录 |
| `#/drills` | 练笔房 |
| `#/ideas` | 网页构想 |
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

公开书架是独立的只读页面 `public.html`，不显示编辑、评论与回收站入口，并使用自己的 hash 路由：

| 地址 | 页面 |
| --- | --- |
| `public.html#/` | 公开书架 |
| `public.html#/novel/<小说ID>` | 公开小说概览 |
| `public.html#/novel/<小说ID>/<分区>` | 公开分区列表 |
| `public.html#/novel/<小说ID>/<分区>/<词条ID>` | 公开词条详情 |

在「公开作品」中点击「本机预览」会打开 `public.html?preview=1`，它读取本机临时生成的预览快照，并在顶部显示「本机预览 · 尚未发布」提示；线上访客打开不带参数的 `public.html` 时，只会读取已部署的 `public-library.json`。

## 公开作品与发布

公开内容是逐层控制的：

- 小说默认「未解锁」。未解锁的小说与它的所有条目只在这台电脑可见，不会出现在公开书架，也不会写入快照。
- 只有已解锁的小说才会进入公开快照。条目默认「跟随小说」；也可以设为「公开」或「私密」。私密条目即使所在小说已解锁也不会进入快照。
- 公开的人物关系只保留两端角色都已公开的连线；评论、回收站、关系图坐标与画布布局、外观设置和其他本机数据都不会导出。
- 公开快照中的小说简介、词条正文与封面会原样公开。上传封面或写下简介、正文前，请确认其中没有不想公开的内容。

发布流程：

1. 在左侧栏打开「公开作品」，用开关解锁要公开的小说；展开每本小说的「条目公开范围」，把不想公开的条目单独设为私密（条目编辑弹窗里也能改）。
2. 先点「本机预览」检查公开书架；确认无误后点「生成公开快照」，下载 `public-library.json`。
3. 用导出的 `public-library.json` 替换站点根目录的同名文件，并部署站点。公开书架只读取这份文件，快照之外的任何内容都不会上传。

公开站点没有后台服务，因此「解锁」不会即时同步到线上；只有部署新的快照后，线上公开书架才会更新。若只是修改了本机内容、没有重新生成并部署快照，线上仍会保持上一版。

## 地图工坊

在地图分区新建或打开一个词条，详情页会显示地图预览；点击预览或「打开地图工坊」进入全屏编辑。

- **地形**：草原地形是默认底色，不需要逐格保存；水域、湖泊、沙漠、森林、丘陵、山脉、平原、雪原、沼泽、火山可以用画笔逐格或按住拖动绘制，橡皮擦恢复草原；物产与大陆归属用「物产」「大陆」工具单独标记，海岸线、河流源尾与城市光影会随绘制实时更新。
- **城市**：选择「城市」工具后点击格子放置；右侧检查器可以改名、切换六种颜色、调整领地范围（1–3 格），或删除选中的城市。领地按“距离最近的城市”自动划分，范围重叠时归最近的一座。检查器标题右侧的折叠按钮可以把城市 / 路径 / 编辑表单收成一行，给画布让出高度；在窄屏或矮窗口下（宽度 ≤980px 且高度 <640px）默认收起，点选地图上的城市会自动展开。
- **视图**：滚轮 / 触控板缩放，拖动画布平移，`适应画布` 回到全图；手机上使用画布右上角的浮动按钮缩放与撤销。桌面顶栏常驻「导出 PNG」与「导出 Civ6 地图」两个快捷按钮，手机端在左侧「灵感与整理」工具栏中操作。
- **历史**：`Ctrl / ⌘ + Z` 撤销，`Ctrl / ⌘ + Shift + Z` 或 `Ctrl + Y` 重做；选中城市后按 `Delete / Backspace` 删除。
- 保存后地图随词条一起存入浏览器本地；关闭时若有未保存修改会先确认。

## 项目结构（Jekyll）

```text
.
├── _config.yml            # 站点标题、描述与构建排除项
├── index.html             # 页面内容（含 front matter，交给 default 布局）
├── public.html            # 只读公开书架（独立静态页面）
├── public-library.json    # 公开快照；只包含解锁的小说与公开条目
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
│   ├── css/public.css     # 公开书架专用样式
│   ├── civ6/template.Civ6Map  # 文明 6 地图模板（MIT 来源见导出对话框）
│   ├── img/story-library.jpg  # 夜图书馆背景壁纸
│   ├── js/app.js          # 全部交互与本地数据逻辑
│   ├── js/glass-select.js # 玻璃下拉：自绘 listbox 接管全部原生 select
│   ├── js/liquid-glass.js # 玻璃边缘折射引擎（改编自 shuding/liquid-glass，MIT）
│   ├── js/public.js       # 公开书架：快照校验、只读渲染与路由
│   ├── js/sql-wasm.js     # 浏览器内 SQLite（.Civ6Map 互导）
│   └── js/sql-wasm.wasm
├── favicon.svg
└── README.md
```

`index.html` 只保留书架与小说工作区的页面结构，由 `default.html` 布局包裹；左侧栏、页脚、模板与对话框拆进 `_includes/`。`styles.css` 负责结构与组件的默认样式，`theme.css` 在其后加载，负责配色、玻璃外壳、壁纸和响应式覆盖。`glass-select.js` 在 `app.js` 之前加载，把页面上的原生 `<select>` 渐进增强为玻璃 listbox；原生控件仍负责取值与 `change` 事件，因此原有表单逻辑不变。`public.html` 不依赖 Jekyll 的布局或 include，是一份可以直接部署的独立静态页面，并单独引入同一份 `glass-select.js`；`public.js` 会再次校验快照字段，只渲染通过校验的公开内容。样式与脚本仍是纯静态文件，不使用任何前端依赖。

## 本地预览

Jekyll 需要先渲染 Liquid 再提供页面，**不能直接双击 `index.html`，也不能用普通静态服务器打开源码目录**，否则只会看到未渲染的页面。

安装 Ruby 后运行：

```bash
gem install jekyll bundler
jekyll serve
```

然后访问 <http://localhost:4000>。修改 `index.html`、`_includes/` 或 `assets/` 后刷新即可；改动 `_config.yml` 需要重启。

如果不想在本地安装 Ruby，也可以先把文件上传到 GitHub，让 GitHub Pages 自动构建（见下一节）。

公开书架 `public.html` 不经过 Jekyll 布局，本地预览时直接访问 <http://localhost:4000/public.html> 即可；带 `?preview=1` 时读取本机预览快照。最方便的方式仍然是在「公开作品」里点击「本机预览」。

## 数据与备份

- 所有内容保存在当前浏览器的 `localStorage` 中，存储键为 `gushibu.library.v1`，不会自动上传到任何服务器。
- 外观设置单独保存在 `gushibu.appearance.v1`，不属于小说数据，也不会写入导出备份。
- 「本机预览」的快照临时保存在 `gushibu.public.preview.v1`，只用于 `public.html?preview=1`，同样不会自动上传；公开站点读取的是部署在根目录的 `public-library.json`。
- 公开快照是唯一会离开本机的小说数据。它只包含已解锁小说中的公开条目；生成后请先在本机预览中核对，再决定是否部署。
- 清理浏览器数据、使用无痕模式、更换浏览器或设备后，原数据将无法读取。
- 建议定期点击「导出备份」保存 JSON 文件；在新设备上点击「导入备份」即可合并。
- 导入以小说 ID、词条 ID、评论 ID、练笔 ID 与构想 ID 去重：内容较新（`updatedAt` 更晚）的版本会覆盖旧版本，置顶状态会保留。
- 删除小说或词条时，内容会先移入回收站，可恢复回原位置；彻底删除或清空回收站后无法找回。指向已删除位置的评论不会消失，而是在评论目录中标记为失效。
- 导出的备份包含全部小说、词条、封面图片、回收站记录、评论、练笔与网页构想；这些记录都会参与导入合并，旧版不含 `comments` / `drills` / `ideas` 的备份仍可正常导入，也支持只导入某一种记录的备份文件。
- 封面图片会先裁成 2:3、压缩为 JPEG 再写入 `localStorage`，但仍会占用本地空间；封面较多的备份 JSON 也会相应变大。
- 本地预览和线上站点的数据互不相通，切换域名后请用导出 / 导入迁移。
- 导出的备份包含全部小说、词条、练笔与网页构想，请勿把备份 JSON 提交到公开仓库。

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
      "visibility": "private | public",
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

顶层的 `drills` 数组保存「练笔房」的刻意练习记录（可选，按 ID 合并，最多 200 条，单段文本上限 8000 字）：

```json
{
  "id": "练习 ID",
  "kind": "imitation | senses | scene | dialogue | emotion | free",
  "title": "题目",
  "novelId": "关联小说 ID（可选）",
  "linked": [
    { "entryId": "关联词条 ID", "sectionKey": "分区键", "title": "名称快照" }
  ],
  "source": "范文原文（选填）",
  "sourceNote": "出处 / 作者（选填）",
  "mine": "我的练笔正文",
  "review": "复盘 / AI 点评（选填）",
  "createdAt": "ISO 时间",
  "updatedAt": "ISO 时间"
}
```

`linked` 最多 4 条，保存词条的 ID 与名称快照：练习卡片上的关联可直达词条；词条详情页会反向显示「相关练笔」；关联的小说或词条被删除后，练习保留、关联标记为失效。

练笔房是独立于小说的顶层层级（侧栏「练笔房」，`#/drills`）：「随机出题」从内置题库抽题并优先用你自己的角色与地点填空；每条练习可一键「复制点评请求」——生成一段已写好的四维点评提示词（细节具体度 / 五感与视角 / 节奏句长 / 与范文差距 + 100 字示范改写），粘贴给任何 AI，收到回复后贴回「复盘 / AI 点评」栏对照保存。词条详情页另有「给 AI」按钮，把单条词条连同别名、概要、正文与「被谁提到」的上下文复制为结构化文本。小说概览的「整书给 AI」则把整本书的正典整理成设定包：按「讨论剧情 / 续写上下文 / 自查矛盾」切换任务说明，勾选要包含的分区，可补充一句重点关注，再复制或下载。这些都是临时的提示词拼装，不写入新增数据结构，也只输出到剪贴板或本地文件，不经过任何服务器。

顶层的 `ideas` 数组保存「网页构想」（可选，按 ID 合并，最多 200 条）：

```json
{
  "id": "构想 ID",
  "title": "构想的名字（最多 120 字）",
  "body": "构想说明（最多 8000 字）",
  "nextStep": "最小下一步（最多 200 字）",
  "kind": "writing | reading | map | ai | visual | engineering | other",
  "status": "spark | planned | building | shipped | parked",
  "excitement": 3,
  "createdAt": "ISO 时间",
  "updatedAt": "ISO 时间"
}
```

`status` 对应「构想 / 计划做 / 开发中 / 已上线 / 搁置」；`excitement` 是 1–5 的心动值，随机翻牌与「心动优先」排序会用到。侧栏只统计未上线、未搁置的「待推进」数量。构想和练笔一样只存在本机，不会写入公开快照；旧备份缺少 `ideas` 字段时按空数组读取，不需要升级版本。

小说可选的 `cover` 只接受站内上传后压缩得到的 `data:image/jpeg`、`data:image/png` 或 `data:image/webp` 数据地址，外部图片链接会被忽略；上传图片会裁成 2:3，输出为 480×720 的 JPEG。小说还可以有可选的 `wordGoal`（正整数，0 或缺省 = 未设定），用于概览「写作进度」面板的目标进度；它是私人写作管理信息，不会进入公开快照。

词条正文里的 `[[名字]]` 是本站的词条链接语法：详情页渲染时解析为指向同小说内同名（或别名）词条的链接；目标不存在时显示为灰色待建链，同名多条时显示为琥珀色警示链。存储永远是原文，导出 Markdown 与公开页均不解析（公开页会把括号还原为纯文本名称）。

每个词条包含 `id / title / subtitle / summary / notes / tags / aliases / status / visibility / pinned / createdAt / updatedAt`；`visibility` 为 `inherit`（跟随小说，默认）、`public` 或 `private`。`aliases` 是别名 / 称谓列表（最多 5 个、单个 12 字），供搜索与反向链接识别「晚姐」这类名字；`status` 是大纲条目的状态标记（`planning` 构思中、`drafting` 写作中、`done` 已完成，缺失或空字符串 = 未标记），目前只有大纲分区使用。角色词条还会记录每张谱系里的节点位置 `graphPositions`（按谱系 ID 保存）。地图词条额外包含 `map` 字段，记录画布尺寸、地形、地标、路径与城市：

```json
{
  "cols": 22,
  "rows": 14,
  "tiles": { "3,4": "water", "4,5": "forest" },
  "features": { "6,7": "ruins" },
  "resources": { "8,6": "iron" },
  "continents": { "8,6": 1 },
  "paths": [
    { "id": "路径 ID", "kind": "river", "points": [{ "col": 2, "row": 3 }] }
  ],
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

`tiles` 只保存非草原地形，键名是 `列,行`；`features` 是地标（遗迹、神殿、要塞等 8 种普通地标，以及圣山、魔泉、世界树、沉没神殿 4 种自然奇观），同样按格保存；`resources` 是按格保存的物产，`continents` 是按格保存的大陆编号（1–4，缺省表示自动划分）；`paths` 是河流与道路（每条最多 400 个点，每图最多 60 条）；画布支持 6–48 列 × 6–34 行，城市坐标从 0 开始，半径 1–3，单张地图最多 40 座城市。文明6导入遇到超过上限的官方地图时会按比例缩放到上限，并在导入摘要里注明原尺寸。评论条目包含可选的 `status`（`open` 待处理，默认 / `resolved` 已解决），切换状态会同时更新 `updatedAt` 以保证多设备合并正确。分区配置集中在 `app.js` 顶部的 `SECTIONS` 常量里，之后要新增分区、改字段名或接入时间线等能力，都可以从这个结构继续扩展。

`public-library.json` 是独立的公开快照，格式为 `{ app, version, kind: "public-library", generatedAt, signature, novels }`。其中每本小说只保留公开字段与已公开条目，不含 `visibility`、`comments`、`trash`、`graphPositions` 等本机字段；`public.js` 读取时还会按白名单再次校验，非法或超长的字段会被丢弃。

## 部署到 GitHub Pages

GitHub Pages 会检测到 `_config.yml` 并自动用 Jekyll 构建，不需要 Actions 工作流，也不需要本地构建产物。

### 用户主页（地址最短）

1. 在 GitHub 新建仓库，仓库名必须是 `<你的用户名>.github.io`。
2. 将以下内容放到仓库根目录（保持文件夹结构）：
   - `_config.yml`
   - `index.html`
   - `public.html`
   - `public-library.json`
   - `_layouts/`（内含 `default.html`）
   - `_includes/`（内含 6 个 HTML 片段）
   - `assets/css/styles.css`
   - `assets/css/theme.css`
   - `assets/css/public.css`
   - `assets/civ6/template.Civ6Map`
   - `assets/img/story-library.jpg`
   - `assets/js/app.js`
   - `assets/js/glass-select.js`
   - `assets/js/liquid-glass.js`
   - `assets/js/public.js`
   - `assets/js/sql-wasm.js`
   - `assets/js/sql-wasm.wasm`
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
git add _config.yml index.html public.html public-library.json _layouts _includes assets favicon.svg README.md
git commit -m "Coin's Creative Cabin：用 Jekyll 搭建的小说设定集"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

也可以直接在 GitHub 仓库页面用 **Add file → Upload files** 上传，注意保留 `_layouts`、`_includes` 和 `assets` 的层级；浏览器上传支持直接拖入文件夹。

### 部署提示

- 如果页面没有立即更新，查看仓库 **Actions** 中 Pages 的构建状态，并在浏览器中强制刷新。
- 仓库代码是公开的。小说原文默认只存在每位访问者自己的浏览器里；仓库中唯一会包含小说内容的文件是主动生成的 `public-library.json`，它只收录解锁的公开内容。不要把导出备份、`docs/` 或其他本机数据放进仓库。
- 不需要 `npm install` 或任何构建脚本；Jekyll 由 GitHub Pages 提供。

## 自定义

- 主题配色、玻璃透明度、字体与响应式断点：优先使用左侧栏「外观」面板实时调整；也可以修改 `assets/css/theme.css` 顶部 `:root` 中的 `--glass-alpha`、`--card-alpha`、`--glass-blur`、`--wallpaper-dim`、`--rim-strength`、`--reading-scale`、`--accent-rgb` 与媒体查询；风格预设与强调色板定义在 `assets/js/app.js` 顶部的 `APPEARANCE_PRESETS` / `ACCENT_PALETTES`，低透明度下的文字保护由 `html.is-sheer` 控制，面板浮层定位由 `positionAppearancePanel()` 计算。组件基础样式在 `assets/css/styles.css`，书封色调在 `.tone-*` 变量。
- 背景壁纸：替换 `assets/img/story-library.jpg`（建议使用 16:9 或更宽的图片）；路径在 `theme.css` 的 `--wallpaper` 变量中。
- 站点标题、描述与构建排除项：修改 `_config.yml`；页面 `<title>` 与 meta 描述在 `_includes/head.html`。
- 页面主体文案：修改 `index.html`；侧边栏与页脚文案在 `_includes/sidebar.html`、`_includes/site-footer.html`。
- 公共区块与对话框：修改 `_includes/templates.html`、`_includes/dialogs.html`。
- 分区名称、字段提示、空状态文案与交互：修改 `assets/js/app.js` 中的 `SECTIONS`；若调整存储结构，请同步更新存储键或在读取时做兼容处理。
- 地图外观与规则：修改 `assets/js/app.js` 顶部的 `MAP_TERRAINS`（地形名称与配色）、`MAP_CITY_COLORS`（城市颜色）和 `MAP_DEFAULT_COLS` / `MAP_DEFAULT_ROWS`（新地图尺寸）；SVG 样式在 `assets/css/theme.css` 中以 `.map-` 开头的规则里。
- 公开书架：结构在 `public.html`，只读渲染与快照校验在 `assets/js/public.js`，专用样式在 `assets/css/public.css`；公开首屏文案可直接修改 `public.html`，快照字段上限在 `public.js` 的 `sanitizeNovel` / `sanitizeEntry` / `sanitizeMap` 中。
