/**
 * astra-site — localized code comments: ja / zh-CN
 */
export const SNIPPET_COMMENTS_EAST: Record<string, Record<string, string[]>> = {
  'home.store': {
    ja: ['// ミューテーションはリアクティブ — DOM が自動更新されます。'],
    'zh-CN': ['// 变更即响应 — DOM 自行更新。'],
  },
  'home.router': {
    ja: ['// app.tsx — route() はリアクティブ：アクティブなルート ⇒ コンポーネント。', '// ルートファイル不要、設定不要、switch 不要。'],
    'zh-CN': ['// app.tsx — route() 是响应式的：激活路由 ⇒ 组件。', '// 无需路由文件、无需配置、无需 switch。'],
  },
  'advanced.jsx-out': {
    ja: ['// 入力 (JSX):', '// コンパイラの出力（概略）:'],
    'zh-CN': ['// 输入 (JSX):', '// 编译器输出（大致）:'],
  },
  'advanced.css-out': {
    ja: ['// 入力:', '// 出力:', '// 1. CSS がファイルに抽出される: assets/card-a1b2c3.css', '// 2. テンプレートが参照に置き換わる:', '// 3. HTML 内: <link rel="stylesheet" href="/assets/card-a1b2c3.css">'],
    'zh-CN': ['// 输入:', '// 输出:', '// 1. CSS 被提取到文件: assets/card-a1b2c3.css', '// 2. 模板被替换为引用:', '// 3. 在 HTML 中: <link rel="stylesheet" href="/assets/card-a1b2c3.css">'],
  },
  'advanced.server-out': {
    ja: ['// 入力:', '// 出力 — クライアント（バンドルに含まれる）:', '// 出力 — サーバー（ミドルウェアに登録される）:'],
    'zh-CN': ['// 输入:', '// 输出 — 客户端（包含在 bundle 中）:', '// 输出 — 服务端（注册在中间件中）:'],
  },
  'advanced.config': {
    ja: ['// vite.config.ts', '// または \'vanilla\'', '// RPC エンドポイントのプレフィックス'],
    'zh-CN': ['// vite.config.ts', '// 或 \'vanilla\'', '// RPC 端点前缀'],
  },
  'advanced.inference-store': {
    ja: ['// → string', '// → number', '// → { bio: string; avatar: string }', '// → string[]', '// user.name は string（推論、注釈なし）', '// user.profile.bio は string（深く推論）', '// user.tags は string[]（初期配列から推論）'],
    'zh-CN': ['// → string', '// → number', '// → { bio: string; avatar: string }', '// → string[]', '// user.name 是 string（推断，未注解）', '// user.profile.bio 是 string（深层推断）', '// user.tags 是 string[]（由初始数组推断）'],
  },
  'advanced.inference-server': {
    ja: ['// db.product.findUnique は Product | null を返す', '// 戻り値の型は推論されクライアントへ伝播する:', '// const getProduct: (id: string) => Promise<Product | null>', '// 手動注釈なし、重複なし'],
    'zh-CN': ['// db.product.findUnique 返回 Product | null', '// 返回类型被推断并传播到客户端:', '// const getProduct: (id: string) => Promise<Product | null>', '// 无需手写注解，无重复'],
  },
  'advanced.inference-e2e': {
    ja: ['// types/products.ts（共有）', '// server/products.server.ts', '// pages/products.tsx（クライアント）', '// ↑ products は Product[] — 型はサーバーからクライアントへ', '// 自動で、コード生成なし、定義の重複なし'],
    'zh-CN': ['// types/products.ts（共享）', '// server/products.server.ts', '// pages/products.tsx（客户端）', '// ↑ products 是 Product[] — 类型从服务端传到客户端', '// 全自动，无代码生成，无重复定义'],
  },
  'advanced.vite-config': {
    ja: ['// vite.config.ts', '// RPC プレフィックス', '// コンパイラのモード', '// monorepo/dev のみ必要'],
    'zh-CN': ['// vite.config.ts', '// RPC 前缀', '// 编译器模式', '// 仅在 monorepo/dev 需要'],
  },
  'ai.endpoints': {
    ja: ['// src/ai.ts — サーバーで実行（キーは出荷されない）', '// src/app.tsx — クライアント: 型付き呼び出し', '// { text: string }', '// トークンがライブで届く'],
    'zh-CN': ['// src/ai.ts — 在服务端运行（密钥从不外发）', '// src/app.tsx — 客户端: 类型化调用', '// { text: string }', '// token 实时到达'],
  },
  'ai.streaming': {
    ja: ['// トークンごとに TextNode を 1 回ミューテーション'],
    'zh-CN': ['// 每个 token 一次 TextNode 变更'],
  },
  'ai.build': {
    ja: ['// クライアントが受け取る: const faq = [{"q":"...","a":"..."}];'],
    'zh-CN': ['// 客户端收到: const faq = [{"q":"...","a":"..."}];'],
  },
  'cli.server-split': {
    ja: ['// src/server/posts.server.ts — 1 つの関数、コンパイラが分割', '// このコードはブラウザに一切出荷されない。', '// src/pages/posts.tsx — クライアントは型付き async 関数を見る'],
    'zh-CN': ['// src/server/posts.server.ts — 一个函数，由编译器拆分', '// 这段代码永远不会发送到浏览器。', '// src/pages/posts.tsx — 客户端看到的是类型化 async 函数'],
  },
  'comparison.react-rerender': {
    ja: ['// React: コンポーネント全体が再実行される', '// この本体全体が毎回のレンダーで実行される', '// ← クリックごとに出力される', '// AstraJS: コンポーネントは一度だけ実行', '// このコードはマウント時のみ実行', '// ← 一度だけ出力', '// state.count の TextNode だけが更新される'],
    'zh-CN': ['// React: 整个组件重新执行', '// 每次渲染都会执行整个函数体', '// ← 每次点击都会打印', '// AstraJS: 组件只执行一次', '// 这段代码只在挂载时运行', '// ← 只打印一次', '// 只有 state.count 的 TextNode 更新'],
  },
  'comparison.react-hooks': {
    ja: ['// React: フックのルール、手動メモ化', '// 条件分岐内でフックは呼べない', '// 安定した参照には useCallback が必要', '// 派生値には useMemo が必要', '// AstraJS: ルールなし、手動メモ化なし', '// store() はどこでも動く', '// コンパイラが自動でメモ化', '// useCallback も useMemo も不要'],
    'zh-CN': ['// React: hooks 规则、手动记忆化', '// 不能在条件语句中调用 hooks', '// 需要 useCallback 保持引用稳定', '// 需要 useMemo 计算派生值', '// AstraJS: 无规则、无手动记忆化', '// store() 随处可用', '// 编译器自动记忆化', '// 无需 useCallback，无需 useMemo'],
  },
  'comparison.vue': {
    ja: ['// --- vs ---', '// AstraJS TSX（同じファイル）'],
    'zh-CN': ['// --- vs ---', '// AstraJS TSX（同一文件）'],
  },
  'comparison.angular-cd': {
    ja: ['// Angular: Zone.js が setTimeout、HTTP、イベントを傍受...', '// ツリー全体で change detection が発火', '// Angular はコンポーネントの全バインディングを再評価', '// AstraJS: Proxy は正確なサブスクライバだけに通知', '// この TextNode だけが更新される。他は何も。'],
    'zh-CN': ['// Angular: Zone.js 拦截 setTimeout、HTTP、事件...', '// 在整个树上触发 change detection', '// Angular 重新求值组件的全部绑定', '// AstraJS: Proxy 只通知精确的订阅者', '// 只有这个 TextNode 更新。别无其他。'],
  },
  'deployment.config': {
    ja: ['// astra.config.json', '// node | vercel | cloudflare | static'],
    'zh-CN': ['// astra.config.json', '// node | vercel | cloudflare | static'],
  },
  'fund.pure': {
    ja: ['// 純関数 — 状態なし、ラッピングなし', '// 直接使用:'],
    'zh-CN': ['// 纯函数 — 无状态、无包装', '// 直接使用:'],
  },
  'fund.counter': {
    ja: ['// store() はリアクティブな Proxy を作成', '// この関数は一度だけ実行される', '// コンパイラは {state.count} を変換', '// → effect(() => { textNode.nodeValue = state.count; })', '// count が変わると、その TextNode だけが更新される。'],
    'zh-CN': ['// store() 创建一个响应式 Proxy', '// 该函数只执行一次', '// 编译器将 {state.count} 转换为', '// effect(() => { textNode.nodeValue = state.count; })', '// count 变化时只有该 TextNode 更新。'],
  },
  'fund.proxy': {
    ja: ['// 読み取り → Proxy は「name」を読んだことを記録', '// effect() 内ならサブスクリプションが作られる', '// \'Ada\'', '// 書き込み → Proxy は「name」のサブスクライバだけに通知', '// 内部では:', '//   1. 値が更新される', '//   2. 「name」に登録した各 effect に通知', '//   3. effects がコールバックを実行', '//   4. 「name」の TextNode だけが DOM で更新', '// ネストされたオブジェクトもリアクティブ（遅延 proxy）', '// → 「profile.bio」のサブスクライバだけ更新'],
    'zh-CN': ['// 读取 → Proxy 记录你正在读取 "name"', '// 若发生在 effect() 内，会创建订阅', '// \'Ada\'', '// 写入 → Proxy 只通知 "name" 的订阅者', '// 内部流程:', '//   1. 更新值', '//   2. 通知每个订阅 "name" 的 effect', '//   3. effects 执行回调', '//   4. 只有 "name" 的 TextNode 在 DOM 中更新', '// 嵌套对象同样响应式（惰性 proxy）', '// → 只有 "profile.bio" 的订阅者更新'],
  },
  'fund.arrays': {
    ja: ['// 配列のミューテーション → リアクティブ', '// 「items」と「items.length」のサブスクライバに通知', '// 「items[0]」のサブスクライバに通知', '// 完全置換 → 「items」のサブスクライバに通知'],
    'zh-CN': ['// 数组变更 → 响应式', '// 通知 "items" 和 "items.length" 的订阅者', '// 通知 "items[0]" 的订阅者', '// 整体替换 → 通知 "items" 的订阅者'],
  },
  'fund.batch': {
    ja: ['// これら 3 つのミューテーション → DOM 更新は 1 サイクル', '// エフェクトは 3 回ではなく 1 回実行。', '// DOM ノードは 1 つのマイクロタスクで更新される。'],
    'zh-CN': ['// 这 3 次变更 → 1 个 DOM 更新周期', '// 效果只执行一次，而非三次。', '// DOM 节点在单个微任务中更新。'],
  },
  'fund.jsx': {
    ja: ['// === あなたのコード (JSX) ===', '// === コンパイラが生成するもの（概略）===', '// 細粒度のリアクティブバインディング'],
    'zh-CN': ['// === 你的代码 (JSX) ===', '// === 编译器生成的内容（大致）===', '// 细粒度响应式绑定'],
  },
  'fund.cond': {
    ja: ['// あなたが書く:', '// コンパイラが生成する:', '// show が変わると <span> が DOM に挿入/削除される', '// 親の <div> は再作成されない。'],
    'zh-CN': ['// 你写的是:', '// 编译器生成:', '// show 变化时，<span> 在 DOM 中插入/移除', '// 无需重建父 <div>。'],
  },
  'fund.list': {
    ja: ['// あなたが書く:', '// コンパイラはキーベースの差分で bindList を生成:', '// - 新しい項目 → 作成', '// - 削除された項目 → 削除', '// - 並べ替えられた項目 → 移動（再作成なし）', '// - 同じキーの項目 → 保持'],
    'zh-CN': ['// 你写的是:', '// 编译器生成带 key 差分的 bindList:', '// - 新项 → 创建', '// - 移除项 → 删除', '// - 重排项 → 移动（不重建）', '// - 相同 key 的项 → 保留'],
  },
  'fund.events': {
    ja: ['// ネイティブイベント — 即時実行', '// 再開可能なイベント — JS は JIT で読み込み'],
    'zh-CN': ['// 原生事件 — 立即执行', '// 可恢复事件 — JS 按需加载'],
  },
  'i18n.install': {
    ja: ['// package.json', '// vite.config.ts', '// monorepo のみ'],
    'zh-CN': ['// package.json', '// vite.config.ts', '// 仅 monorepo'],
  },
  'i18n.setup': {
    ja: ['// 初期言語', '// キー欠落時のフォールバック'],
    'zh-CN': ['// 初始语言', '// 键缺失时的回退'],
  },
  'i18n.react': {
    ja: ['// ← このノードだけが変わる'],
    'zh-CN': ['// ← 只有这个节点变化'],
  },
  'i18n.interp': {
    ja: ['// → "¡Hola, Ada!"'],
    'zh-CN': ['// → "¡Hola, Ada!"'],
  },
  'i18n.format': {
    ja: ['// es → "1.234.567,89" · en → "1,234,567.89"', '// ロケール形式の日付', '// ロケールの接続詞を使ったリスト', '// \'rtl\' は ar/he/fa/ur、それ以外は \'ltr\''],
    'zh-CN': ['// es → "1.234.567,89" · en → "1,234,567.89"', '// 本地化格式的日期', '// 使用本地连词的列表', '// ar/he/fa/ur 为 \'rtl\'，其余为 \'ltr\''],
  },
  'integrations.tailwind-vite': {
    ja: ['// vite.config.ts', '// JSX → DOM コンパイラ', '// Tailwind v4'],
    'zh-CN': ['// vite.config.ts', '// JSX → DOM 编译器', '// Tailwind v4'],
  },
  'integrations.tailwind-css': {
    ja: ['/* src/main.css */', '/* エントリー内: */'],
    'zh-CN': ['/* src/main.css */', '/* 在入口文件中: */'],
  },
  'integrations.tailwind-config': {
    ja: ['// tailwind.config.js — .tsx もスキャン', '/**/', '// postcss.config.js'],
    'zh-CN': ['// tailwind.config.js — 同时扫描 .tsx', '/**/', '// postcss.config.js'],
  },
  'integrations.material-web': {
    ja: ['// npm install @material/web'],
    'zh-CN': ['// npm install @material/web'],
  },
  'integrations.shoelace': {
    ja: ['// Shoelace'],
    'zh-CN': ['// Shoelace'],
  },
  'integrations.charts': {
    ja: ['// コンポーネントのアンマウント時に自動クリーンアップ'],
    'zh-CN': ['// 组件卸载时自动清理'],
  },
  'introduction.vite': {
    ja: ['// vite.config.ts'],
    'zh-CN': ['// vite.config.ts'],
  },
  'rendering.ssr': {
    ja: ['// SSR はサーバーでデフォルト有効', '// 特別な設定は不要', '// server()'],
    'zh-CN': ['// 服务端默认启用 SSR', '// 无需特殊配置', '// server()'],
  },
  'rendering.ssg': {
    ja: ['// SSG ページは server({ type: \'pre-build\' }) を使用', '// 結果はビルド中に HTML へ埋め込まれる', '// ビルド時: db.post.findMany() が実行される', '// 生成された HTML にシリアライズ済みの投稿が含まれる', '// 本番: 静的 HTML を配信、DB クエリなし'],
    'zh-CN': ['// SSG 页面使用 server({ type: \'pre-build\' })', '// 结果在构建时嵌入 HTML', '// 构建时: 执行 db.post.findMany()', '// 生成的 HTML 包含序列化的文章', '// 生产环境: 提供静态 HTML，无数据库查询'],
  },
  'rendering.isr': {
    ja: ['// ISR: maxAge が再生成の間隔を制御', '// ビルド時に生成', '// 無効化可能', '// 毎時再生成 (ISR)', '// ISR フロー:', '// t=0: ビルド → データ入り HTML', '// t=30分: 訪問 → キャッシュ済み HTML（高速）', '// t=61分: キャッシュ期限切れ → stale 配信 + バックグラウンド再生成', '// t=62分: 次の訪問 → 新しいデータの新鮮な HTML'],
    'zh-CN': ['// ISR: maxAge 控制重新生成的频率', '// 构建时生成', '// 可失效', '// 每小时重新生成 (ISR)', '// ISR 流程:', '// t=0: 构建 → 含数据的 HTML', '// t=30min: 访问 → 获取缓存的 HTML（快）', '// t=61min: 缓存过期 → 提供 stale + 后台重新生成', '// t=62min: 下次访问 → 含新数据的新鲜 HTML'],
  },
  'rendering.resume': {
    ja: ['// サーバー生成の HTML には次が含まれる:', '//   <div id="app">', '//     <span data-astra-store="counter" data-astra-value="42">', '//       Counter: 42', '//     </span>', '//     <button data-astra-handler="increment">', '//       +', '//     </button>', '//   </div>', '// クライアントが「再開」するとき:', '//   1. data-astra-store を読み、値 42 でストアを初期化', '//   2. data-astra-handler を読み、保留中の onclick を認識', '//   3. コンポーネントを実行しない、diff もしない', '//   4. ハンドラの JS は「+」をクリックした時だけ読み込まれる'],
    'zh-CN': ['// 服务端生成的 HTML 包括:', '//   <div id="app">', '//     <span data-astra-store="counter" data-astra-value="42">', '//       Counter: 42', '//     </span>', '//     <button data-astra-handler="increment">', '//       +', '//     </button>', '//   </div>', '// 客户端「恢复」时:', '//   1. 读取 data-astra-store → 以值 42 初始化 store', '//   2. 读取 data-astra-handler → 知道有 pending onclick', '//   3. 不执行组件，不做 diffing', '//   4. 点击 "+" 时才加载 handler 的 JS'],
  },
  'router.routes': {
    ja: ['// routes.ts — リアクティブなゲッターを持つオブジェクト', '// レイアウト内:'],
    'zh-CN': ['// routes.ts — 一个带响应式 getter 的对象', '// 在布局中:'],
  },
  'router.patterns': {
    ja: ['// exact match: 「/」のみ', '// prefix match: 「/products」、「/products/123」', '// パラメータ: 「/products/42」 → params.id = "42"', '// パラメータ: 「/blog/hello-world」 → params.slug', '// 複数のパラメータ'],
    'zh-CN': ['// exact match: 仅 "/"', '// prefix match: "/products", "/products/123"', '// 参数: "/products/42" → params.id = "42"', '// 参数: "/blog/hello-world" → params.slug', '// 多个参数'],
  },
  'router.exact': {
    ja: ['// 「/」のみ', '// exact なし → 「/products」、「/products/42」', '// 「/products/42」、「/products/42/reviews」', '// 「/products/42」のみ'],
    'zh-CN': ['// 仅 "/"', '// 无 exact → "/products", "/products/42"', '// "/products/42", "/products/42/reviews"', '// 仅 "/products/42"'],
  },
  'router.params': {
    ja: ['// ルート: /products/:id', '// params.id は :id セグメントの値を保持', '// string', '// server() と組み合わせてデータを読み込む'],
    'zh-CN': ['// 路由: /products/:id', '// params.id 保存 :id 段的值', '// string', '// 与 server() 搭配加载数据'],
  },
  'router.link': {
    ja: ['// 基本ナビゲーション', '// クラスとスタイル付き', '// children 付き（<a> のように動作）'],
    'zh-CN': ['// 基本导航', '// 带类和样式', '// 带 children（行为同 <a>）'],
  },
  'router.navigate': {
    ja: ['// アクションの後', '// リストへリダイレクト', '// イベントハンドラ内', '// スクロール用のハッシュ付き'],
    'zh-CN': ['// 操作之后', '// 重定向到列表', '// 在事件处理函数中', '// 带 hash 滚动'],
  },
  'router.outlet': {
    ja: ['/* 子ルートはここに描画される */', '/* サイドバーはナビゲーションで再作成されない */', '// 子ルート:', '// /dashboard/overview  → OverviewPage を <Outlet /> に', '// /dashboard/analytics → AnalyticsPage を <Outlet /> に', '// /dashboard/settings  → SettingsPage を <Outlet /> に'],
    'zh-CN': ['/* 子路由在此渲染 */', '/* 导航时侧边栏不会重建 */', '// 子路由:', '// /dashboard/overview  → OverviewPage 在 <Outlet /> 中', '// /dashboard/analytics → AnalyticsPage 在 <Outlet /> 中', '// /dashboard/settings  → SettingsPage 在 <Outlet /> 中'],
  },
  'router.viewtransitions': {
    ja: ['// navigate() と <Link> で自動的に有効化', '// ブラウザは:', '//   1. 現在のページのスクリーンショットを撮る', '//   2. 新しいページを描画', '//   3. 2 つをクロスフェード', '// CSS でカスタマイズ:'],
    'zh-CN': ['// 配合 navigate() 和 <Link> 自动启用', '// 浏览器会:', '//   1. 截取当前页面的屏幕快照', '//   2. 渲染新页面', '//   3. 两页之间交叉淡入淡出', '// 用 CSS 自定义:'],
  },
  'router.onroute': {
    ja: ['// アナリティクス', '// ナビゲーション時にトップへスクロール', '// タイトルを更新'],
    'zh-CN': ['// 分析', '// 导航时滚动到顶部', '// 更新标题'],
  },
  'sd.basic': {
    ja: ['// 関数を一度だけ定義', '// キャッシュ TTL（秒）', '// クライアント側 — 通常の async 呼び出しに見える', '// ↑ これは /api/astra/getUsers?args=["admin"] への fetch', '// 型は自動推論 — admins は User[]'],
    'zh-CN': ['// 函数只定义一次', '// 缓存 TTL（秒）', '// 在客户端 — 看起来像普通 async 调用', '// ↑ 这是对 /api/astra/getUsers?args=["admin"] 的 fetch', '// 类型自动推断 — admins 是 User[]'],
  },
  'sd.config': {
    ja: ['// 実行タイプ', '// default: \'dynamic\'', '// キャッシュ', '// ピンポイント無効化のためのタグ', '// TTL（秒）（0 = キャッシュなし）', '// リアルタイム同期', '// ETag によるポーリング', '// 間隔（ms）（default: 3000）', '// 変換', '// クライアントへ送信する前にデータを変換'],
    'zh-CN': ['// 执行类型', '// default: \'dynamic\'', '// 缓存', '// 用于精确失效的标签', '// TTL（秒）（0 = 无缓存）', '// 实时同步', '// 基于 ETag 的轮询', '// 间隔（ms）（default: 3000）', '// 转换', '// 发送给客户端前转换数据'],
  },
  'sd.prebuild': {
    ja: ['// 最適: メニュー、設定、静的コンテンツ', '// ビルド時: db.menu.findMany() → 結果を HTML にシリアライズ', '// クライアント: siteNav() → データは既に利用可能、fetch なし', '// 各ビルドまたは ISR で再生成'],
    'zh-CN': ['// 适用于: 菜单、设置、静态内容', '// 构建时: db.menu.findMany() → 结果序列化进 HTML', '// 在客户端: siteNav() → 数据已就绪，无 fetch', '// 每次构建或通过 ISR 重新生成'],
  },
  'sd.dynamic': {
    ja: ['// 最適: セッション、ユーザーデータ、検索'],
    'zh-CN': ['// 适用于: 会话、用户数据、搜索'],
  },
  'sd.tags': {
    ja: ['// タグ付きサービス'],
    'zh-CN': ['// 带标签的服务'],
  },
  'sd.revalidate': {
    ja: ['// 商品を作成した後:', '// これらのタグを持つクエリだけが再検証される', '// ↑ getProducts が再検証される（タグ \'products\'）', '// ↑ getProductById が再検証される（タグ \'products\'）', '// getCategories は再検証されない（\'products\' なし）', '// カテゴリを更新した後:', '// ↑ getCategories だけが再検証される'],
    'zh-CN': ['// 创建产品之后:', '// 只有带这些标签的查询会重新验证', '// ↑ getProducts 重新验证（含标签 \'products\'）', '// ↑ getProductById 重新验证（含标签 \'products\'）', '// getCategories 不重新验证（无 \'products\'）', '// 更新分类之后:', '// ↑ 只有 getCategories 重新验证'],
  },
  'sd.autosync': {
    ja: ['// 3 秒ごとに自動同期するデータ', '// コンポーネント内:', '/* ↑ サーバーが新しいデータを返した時だけ更新 */', '/* 手動ポーリングなし、useEffect なし、サブスクリプションなし */'],
    'zh-CN': ['// 每 3 秒自动同步的数据', '// 在组件中:', '/* ↑ 只有服务端返回新数据时才更新 */', '/* 无手动轮询、无 useEffect、无订阅 */'],
  },
  'sd.mutation': {
    ja: ['// ミューテーション後に再検証するタグ', '// コンポーネント内:', '// ↑ ミューテーションはサーバーで実行', '// ↑ ミューテーション後、[\'products\'] タグは自動で再検証', '// ↑ UI は追加コードなしで更新される'],
    'zh-CN': ['// 变更后要重新验证的标签', '// 在组件中:', '// ↑ 变更在服务端执行', '// ↑ 变更后 [\'products\'] 标签自动重新验证', '// ↑ UI 无需额外代码即可更新'],
  },
  'testing.vitest': {
    ja: ['// vitest.config.ts'],
    'zh-CN': ['// vitest.config.ts'],
  },
  'testing.store': {
    ja: ['// プロパティ \'items\' へのサブスクリプション', '// サブスクライブ時にエフェクトが実行', '// \'items\' のためだけに再実行'],
    'zh-CN': ['// 订阅 \'items\' 属性', '// 订阅时 effect 执行', '// 仅因 \'items\' 重新执行'],
  },
  'testing.flush': {
    ja: ['// AstraJS のエフェクトはマイクロタスクで実行される'],
    'zh-CN': ['// AstraJS 的效果在微任务中执行'],
  },
  'testing.jest': {
    ja: ['// jest.config.js'],
    'zh-CN': ['// jest.config.js'],
  },
  'testing.jest-test': {
    ja: ['// __tests__/counter.test.tsx'],
    'zh-CN': ['// __tests__/counter.test.tsx'],
  },
  'testing.playwright': {
    ja: ['// playwright.config.ts', '//localhost:5173\',', '// e2e/counter.spec.ts'],
    'zh-CN': ['// playwright.config.ts', '//localhost:5173\',', '// e2e/counter.spec.ts'],
  },
  'testing.cypress': {
    ja: ['// cypress.config.ts', '//localhost:5173\' },', '// cypress/e2e/counter.cy.ts'],
    'zh-CN': ['// cypress.config.ts', '//localhost:5173\' },', '// cypress/e2e/counter.cy.ts'],
  },
  'ex02': {
    ja: ['// store.ts — 共有モジュール', '// コンポーネント A', '// コンポーネント B — 自動更新'],
    'zh-CN': ['// store.ts — 共享模块', '// 组件 A', '// 组件 B — 自行更新'],
  },
  'ex08': {
    ja: ['// auto-cleanup'],
    'zh-CN': ['// auto-cleanup'],
  },
  'ex10': {
    ja: ['// class/disabled だけが変わる', '// 対象ノードのみ。他は何も。'],
    'zh-CN': ['// 只有 class/disabled 变化', '// 且只作用于受影响的节点。别无其他。'],
  },
  'ex11': {
    ja: ['// クライアント — 型付き RPC:', '// users: User[] — e2e 型が自動'],
    'zh-CN': ['// 客户端 — 类型化 RPC:', '// users: User[] — 端到端类型自动'],
  },
  'ex12': {
    ja: ['// 1 回目の fetch → ネットワーク + キャッシュ', '// 以降 → 即時キャッシュ (SWR)', '// 期限切れ → stale + バックグラウンド再検証'],
    'zh-CN': ['// 首次 fetch → 网络 + 缓存', '// 后续 → 即时缓存 (SWR)', '// 过期 → stale + 后台重新验证'],
  },
  'ex13': {
    ja: ['// [\'posts\'] タグが自動で再検証される'],
    'zh-CN': ['// [\'posts\'] 标签自动重新验证'],
  },
  'ex15': {
    ja: ['// クライアント:', '// サーバー:'],
    'zh-CN': ['// 客户端:', '// 服务端:'],
  },
  'ex16': {
    ja: ['// 楽観的', '// サーバー', '// ロールバック'],
    'zh-CN': ['// 乐观', '// 服务端', '// 回滚'],
  },
  'ex18': {
    ja: ['// DOM が更新されるのは', '// サーバーが新しいデータを返した時だけ。', '// WebSocket なし、サブスクリプションなし。'],
    'zh-CN': ['// DOM 只在', '// 服务端返回新数据时更新。', '// 无 WebSockets、无订阅。'],
  },
  'ex19': {
    ja: ['// サーバーの HTML:', '// クライアント: resume()', '// 1. HTML から状態を読み取る', '// 2. 再実行なしでストアを初期化', '// 3. ハンドラはオンデマンドで読み込み'],
    'zh-CN': ['// 服务端的 HTML:', '// 客户端: resume()', '// 1. 从 HTML 读取状态', '// 2. 无需重新执行即可初始化 store', '// 3. 处理函数按需加载'],
  },
  'ex20': {
    ja: ['// ビルド時: クエリ実行済み', '// HTML: データ埋め込み済み (astra-data)', '// クライアント: fetch 0 回、JS 0 KB'],
    'zh-CN': ['// 构建时: 查询已执行', '// HTML: 数据已嵌入 (astra-data)', '// 客户端: 0 fetch、0 KB JS'],
  },
};
