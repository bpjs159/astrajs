/**
 * astra-site — localized code comments: de / ru
 */
export const SNIPPET_COMMENTS_EU: Record<string, Record<string, string[]>> = {
  'home.store': {
    de: ['// Mutieren ist reaktiv — das DOM aktualisiert sich selbst.'],
    ru: ['// Мутация реактивна — DOM обновляется сам.'],
  },
  'home.router': {
    de: ['// app.tsx — route() ist reaktiv: aktive Route ⇒ Komponente.', '// Keine Routendatei, keine Config, kein Switch.'],
    ru: ['// app.tsx — route() реактивен: активный маршрут ⇒ компонент.', '// Ни файла маршрутов, ни конфига, ни switch.'],
  },
  'advanced.jsx-out': {
    de: ['// Eingabe (JSX):', '// Compiler-Ausgabe (ungefähr):'],
    ru: ['// Вход (JSX):', '// Выход компилятора (приблизительно):'],
  },
  'advanced.css-out': {
    de: ['// Eingabe:', '// Ausgabe:', '// 1. Das CSS wird in eine Datei extrahiert: assets/card-a1b2c3.css', '// 2. Das Template wird durch eine Referenz ersetzt:', '// 3. Im HTML: <link rel="stylesheet" href="/assets/card-a1b2c3.css">'],
    ru: ['// Вход:', '// Выход:', '// 1. CSS извлекается в файл: assets/card-a1b2c3.css', '// 2. Шаблон заменяется ссылкой:', '// 3. В HTML: <link rel="stylesheet" href="/assets/card-a1b2c3.css">'],
  },
  'advanced.server-out': {
    de: ['// Eingabe:', '// Ausgabe — Client (im Bundle enthalten):', '// Ausgabe — Server (im Middleware registriert):'],
    ru: ['// Вход:', '// Выход — Клиент (включён в бандл):', '// Выход — Сервер (зарегистрирован в middleware):'],
  },
  'advanced.config': {
    de: ['// vite.config.ts', '// oder \'vanilla\'', '// Präfix für RPC-Endpoints'],
    ru: ['// vite.config.ts', '// или \'vanilla\'', '// префикс RPC-эндпоинтов'],
  },
  'advanced.inference-store': {
    de: ['// → string', '// → number', '// → { bio: string; avatar: string }', '// → string[]', '// user.name ist string (inferiert, nicht annotiert)', '// user.profile.bio ist string (tief inferiert)', '// user.tags ist string[] (aus dem Anfangs-Array inferiert)'],
    ru: ['// → string', '// → number', '// → { bio: string; avatar: string }', '// → string[]', '// user.name — string (выведен, не аннотирован)', '// user.profile.bio — string (выведен на глубину)', '// user.tags — string[] (выведен из исходного массива)'],
  },
  'advanced.inference-server': {
    de: ['// db.product.findUnique gibt Product | null zurück', '// Der Rückgabetyp wird inferiert und zum Client propagiert:', '// const getProduct: (id: string) => Promise<Product | null>', '// Keine manuellen Annotationen, keine Duplikation'],
    ru: ['// db.product.findUnique возвращает Product | null', '// Тип возврата выводится и распространяется в клиент:', '// const getProduct: (id: string) => Promise<Product | null>', '// Без ручных аннотаций, без дублирования'],
  },
  'advanced.inference-e2e': {
    de: ['// types/products.ts (geteilt)', '// server/products.server.ts', '// pages/products.tsx (Client)', '// ↑ products ist Product[] — der Typ reist vom Server zum Client', '// automatisch, ohne Codegen, ohne duplizierte Definitionen'],
    ru: ['// types/products.ts (общий)', '// server/products.server.ts', '// pages/products.tsx (клиент)', '// ↑ products — это Product[] — тип путешествует с сервера в клиент', '// автоматически, без кодогенерации, без дублирования определений'],
  },
  'advanced.vite-config': {
    de: ['// vite.config.ts', '// RPC-Präfix', '// Compiler-Modus', '// Nur im Monorepo/dev nötig'],
    ru: ['// vite.config.ts', '// префикс RPC', '// режим компилятора', '// Нужно только в monorepo/dev'],
  },
  'ai.endpoints': {
    de: ['// src/ai.ts — läuft auf dem Server (Keys werden nie ausgeliefert)', '// src/app.tsx — Client: typisierte Aufrufe', '// { text: string }', '// Tokens kommen live an'],
    ru: ['// src/ai.ts — выполняется на сервере (ключи никогда не отправляются)', '// src/app.tsx — клиент: типизированные вызовы', '// { text: string }', '// токены приходят вживую'],
  },
  'ai.streaming': {
    de: ['// eine TextNode-Mutation pro Token'],
    ru: ['// одна мутация TextNode на токен'],
  },
  'ai.build': {
    de: ['// Der Client erhält: const faq = [{"q":"...","a":"..."}];'],
    ru: ['// Клиент получает: const faq = [{"q":"...","a":"..."}];'],
  },
  'cli.server-split': {
    de: ['// src/server/posts.server.ts — EINE Funktion, vom Compiler aufgeteilt', '// Dieser Code wird NIE an den Browser ausgeliefert.', '// src/pages/posts.tsx — der Client sieht eine typisierte Async-Funktion'],
    ru: ['// src/server/posts.server.ts — ОДНА функция, разделённая компилятором', '// Этот код НИКОГДА не попадает в браузер.', '// src/pages/posts.tsx — клиент видит типизированную async-функцию'],
  },
  'comparison.react-rerender': {
    de: ['// React: die GESAMTE Komponente wird neu ausgeführt', '// Dieser ganze Körper läuft bei jedem Render', '// ← wird bei jedem Klick ausgegeben', '// AstraJS: die Komponente läuft EINMAL', '// Dieser Code läuft NUR beim Mount', '// ← wird EINMAL ausgegeben', '// Nur der TextNode von state.count aktualisiert sich'],
    ru: ['// React: компонент ВЕСЬ перевыполняется', '// Всё это тело выполняется на каждом рендере', '// ← печатается на каждый клик', '// AstraJS: компонент выполняется ОДИН РАЗ', '// Этот код выполняется ТОЛЬКО при монтировании', '// ← печатается ОДИН раз', '// Обновляется только TextNode у state.count'],
  },
  'comparison.react-hooks': {
    de: ['// React: Hook-Regeln, manuelle Memoisierung', '// Hooks dürfen nicht in Bedingungen aufgerufen werden', '// useCallback für stabile Referenzen nötig', '// useMemo für abgeleitete Werte nötig', '// AstraJS: keine Regeln, keine manuelle Memoisierung', '// store() funktioniert überall', '// Der Compiler memoisiert automatisch', '// Kein useCallback, kein useMemo'],
    ru: ['// React: правила хуков, ручная мемоизация', '// Хуки нельзя вызывать внутри условий', '// useCallback нужен для стабильных ссылок', '// useMemo нужен для производных значений', '// AstraJS: без правил, без ручной мемоизации', '// store() работает где угодно', '// Компилятор мемоизирует автоматически', '// Без useCallback, без useMemo'],
  },
  'comparison.vue': {
    de: ['// --- vs ---', '// AstraJS TSX (gleiche Datei)'],
    ru: ['// --- vs ---', '// AstraJS TSX (тот же файл)'],
  },
  'comparison.angular-cd': {
    de: ['// Angular: Zone.js fängt setTimeout, HTTP, Events ab...', '// und löst Change Detection im ganzen Baum aus', '// Angular wertet ALLE Bindings der Komponente neu aus', '// AstraJS: der Proxy benachrichtigt nur den exakten Subscriber', '// Nur dieser TextNode aktualisiert sich. Sonst nichts.'],
    ru: ['// Angular: Zone.js перехватывает setTimeout, HTTP, события...', '// и запускает change detection по всему дереву', '// Angular заново вычисляет ВСЕ биндинги компонента', '// AstraJS: Proxy уведомляет только точного подписчика', '// Обновляется только этот TextNode. Больше ничего.'],
  },
  'deployment.config': {
    de: ['// astra.config.json', '// node | vercel | cloudflare | static'],
    ru: ['// astra.config.json', '// node | vercel | cloudflare | static'],
  },
  'fund.pure': {
    de: ['// Pure Funktion — kein State, kein Wrapping', '// Direkte Verwendung:'],
    ru: ['// Чистая функция — без состояния, без обёрток', '// Прямое использование:'],
  },
  'fund.counter': {
    de: ['// store() erzeugt einen reaktiven Proxy', '// Diese Funktion läuft NUR EINMAL', '// Der Compiler transformiert {state.count}', '// in: effect(() => { textNode.nodeValue = state.count; })', '// Nur dieser TextNode aktualisiert sich, wenn count sich ändert.'],
    ru: ['// store() создаёт реактивный Proxy', '// Эта функция выполняется ТОЛЬКО ОДИН РАЗ', '// Компилятор превращает {state.count}', '// в: effect(() => { textNode.nodeValue = state.count; })', '// Только этот TextNode обновляется при изменении count.'],
  },
  'fund.proxy': {
    de: ['// LESEN → der Proxy registriert, dass du "name" liest', '// Passiert das in einem effect(), entsteht ein Abonnement', '// \'Ada\'', '// SCHREIBEN → der Proxy benachrichtigt NUR die "name"-Abonnenten', '// Intern:', '//   1. Der Wert wird aktualisiert', '//   2. Jeder auf "name" abonnierte Effect wird benachrichtigt', '//   3. Die Effects führen ihre Callbacks aus', '//   4. Nur die "name"-TextNodes ändern sich im DOM', '// Verschachtelte Objekte sind auch reaktiv (Lazy-Proxy)', '// → nur die "profile.bio"-Abonnenten aktualisieren sich'],
    ru: ['// ЧТЕНИЕ → Proxy регистрирует, что вы читаете "name"', '// Если это происходит внутри effect(), создаётся подписка', '// \'Ada\'', '// ЗАПИСЬ → Proxy уведомляет ТОЛЬКО подписчиков "name"', '// Внутри:', '//   1. Значение обновляется', '//   2. Каждый effect, подписанный на "name", уведомляется', '//   3. Effects выполняют свои колбэки', '//   4. В DOM обновляются только TextNode для "name"', '// Вложенные объекты тоже реактивны (ленивый proxy)', '// → обновляются только подписчики "profile.bio"'],
  },
  'fund.arrays': {
    de: ['// Array-Mutationen → reaktiv', '// benachrichtigt die Abonnenten von "items" und "items.length"', '// benachrichtigt die Abonnenten von "items[0]"', '// vollständiger Ersatz → benachrichtigt die "items"-Abonnenten'],
    ru: ['// Мутации массива → реактивны', '// уведомляет подписчиков "items" и "items.length"', '// уведомляет подписчиков "items[0]"', '// полная замена → уведомляет подписчиков "items"'],
  },
  'fund.batch': {
    de: ['// Diese 3 Mutationen → ein einziger DOM-Update-Zyklus', '// Effects laufen einmal, nicht dreimal.', '// Die DOM-Knoten aktualisieren sich in einem einzigen Microtask.'],
    ru: ['// Эти 3 мутации → один цикл обновления DOM', '// Эффекты выполняются один раз, а не три.', '// Узлы DOM обновляются в одном microtask.'],
  },
  'fund.jsx': {
    de: ['// === DEIN CODE (JSX) ===', '// === WAS DER COMPILER GENERIERT (ungefähr) ===', '// Fein granuläres reaktives Binding'],
    ru: ['// === ВАШ КОД (JSX) ===', '// === ЧТО ГЕНЕРИРУЕТ КОМПИЛЯТОР (приблизительно) ===', '// Тонкогранулярный реактивный биндинг'],
  },
  'fund.cond': {
    de: ['// Du schreibst:', '// Der Compiler generiert:', '// Wenn show sich ändert, wird das <span> ins DOM eingefügt/entfernt', '// ohne das übergeordnete <div> neu zu erzeugen.'],
    ru: ['// Вы пишете:', '// Компилятор генерирует:', '// Когда show меняется, <span> вставляется/удаляется из DOM', '// без пересоздания родительского <div>.'],
  },
  'fund.list': {
    de: ['// Du schreibst:', '// Der Compiler generiert bindList mit Key-basiertem Diffing:', '// - Neue Elemente → erstellt', '// - Entfernte Elemente → gelöscht', '// - Umsortierte Elemente → verschoben (ohne Neuerstellung)', '// - Elemente mit gleichem Key → erhalten'],
    ru: ['// Вы пишете:', '// Компилятор генерирует bindList с диффингом по ключам:', '// - Новые элементы → создаются', '// - Удалённые элементы → удаляются', '// - Переупорядоченные элементы → перемещаются (без пересоздания)', '// - Элементы с тем же ключом → сохраняются'],
  },
  'fund.events': {
    de: ['// Native Events — sofort ausgeführt', '// Resumable Events — JS lädt JIT'],
    ru: ['// Нативные события — выполняются сразу', '// Возобновляемые события — JS загружается JIT'],
  },
  'i18n.install': {
    de: ['// package.json', '// vite.config.ts', '// nur Monorepo'],
    ru: ['// package.json', '// vite.config.ts', '// только monorepo'],
  },
  'i18n.setup': {
    de: ['// Anfangssprache', '// Fallback, wenn ein Schlüssel fehlt'],
    ru: ['// начальный язык', '// запасной вариант при отсутствии ключа'],
  },
  'i18n.react': {
    de: ['// ← nur dieser Knoten ändert sich'],
    ru: ['// ← меняется только этот узел'],
  },
  'i18n.interp': {
    de: ['// → "¡Hola, Ada!"'],
    ru: ['// → "¡Hola, Ada!"'],
  },
  'i18n.format': {
    de: ['// es → "1.234.567,89" · en → "1,234,567.89"', '// Datum im lokalen Format', '// Listen mit lokalen Konjunktionen', '// \'rtl\' für ar/he/fa/ur, \'ltr\' sonst'],
    ru: ['// es → "1.234.567,89" · en → "1,234,567.89"', '// дата в локальном формате', '// списки с локальными союзами', '// \'rtl\' для ar/he/fa/ur, \'ltr\' в остальных'],
  },
  'integrations.tailwind-vite': {
    de: ['// vite.config.ts', '// JSX → DOM Compiler', '// Tailwind v4'],
    ru: ['// vite.config.ts', '// компилятор JSX → DOM', '// Tailwind v4'],
  },
  'integrations.tailwind-css': {
    de: ['/* src/main.css */', '/* in deinem Entry: */'],
    ru: ['/* src/main.css */', '/* в вашем entry: */'],
  },
  'integrations.tailwind-config': {
    de: ['// tailwind.config.js — scannt auch deine .tsx', '/**/', '// postcss.config.js'],
    ru: ['// tailwind.config.js — сканирует и ваши .tsx', '/**/', '// postcss.config.js'],
  },
  'integrations.material-web': {
    de: ['// npm install @material/web'],
    ru: ['// npm install @material/web'],
  },
  'integrations.shoelace': {
    de: ['// Shoelace'],
    ru: ['// Shoelace'],
  },
  'integrations.charts': {
    de: ['// automatisches Cleanup beim Unmounten der Komponente'],
    ru: ['// автоматическая очистка при размонтировании компонента'],
  },
  'introduction.vite': {
    de: ['// vite.config.ts'],
    ru: ['// vite.config.ts'],
  },
  'rendering.ssr': {
    de: ['// SSR ist auf dem Server standardmäßig aktiv', '// Keine spezielle Konfiguration nötig', '// server()'],
    ru: ['// SSR включён на сервере по умолчанию', '// Особая конфигурация не нужна', '// server()'],
  },
  'rendering.ssg': {
    de: ['// SSG-Seiten nutzen server({ type: \'pre-build\' })', '// Das Ergebnis wird beim Build ins HTML eingebettet', '// Zur Buildzeit: db.post.findMany() wird ausgeführt', '// Das generierte HTML enthält die serialisierten Posts', '// In Produktion: statisches HTML, keine DB-Abfragen'],
    ru: ['// Страницы SSG используют server({ type: \'pre-build\' })', '// Результат встраивается в HTML при сборке', '// На этапе сборки: выполняется db.post.findMany()', '// Сгенерированный HTML содержит сериализованные посты', '// В проде: отдаётся статический HTML, без запросов к БД'],
  },
  'rendering.isr': {
    de: ['// ISR: maxAge steuert, wie oft neu generiert wird', '// beim Build generiert', '// invalidierbar', '// jede Stunde neu generieren (ISR)', '// ISR-Ablauf:', '// t=0: Build → HTML mit eingebetteten Daten', '// t=30min: Besuch → gecachtes HTML (schnell)', '// t=61min: Cache abgelaufen → Stale wird geliefert + Hintergrund-Regeneration', '// t=62min: Nächster Besuch → frisches HTML mit neuen Daten'],
    ru: ['// ISR: maxAge управляет частотой перегенерации', '// генерируется при сборке', '// инвалидируемый', '// перегенерировать каждый час (ISR)', '// Поток ISR:', '// t=0: Сборка → HTML со встроенными данными', '// t=30мин: Посетитель → получает закешированный HTML (быстро)', '// t=61мин: Кеш истёк → отдаётся stale + фоновая перегенерация', '// t=62мин: Следующий визит → свежий HTML с новыми данными'],
  },
  'rendering.resume': {
    de: ['// Das vom Server generierte HTML enthält:', '//   <div id="app">', '//     <span data-astra-store="counter" data-astra-value="42">', '//       Counter: 42', '//     </span>', '//     <button data-astra-handler="increment">', '//       +', '//     </button>', '//   </div>', '// Wenn der Client "resume" macht:', '//   1. Liest data-astra-store → initialisiert den Store mit Wert 42', '//   2. Liest data-astra-handler → weiß, dass ein onclick aussteht', '//   3. Führt keine Komponenten aus, kein Diffing', '//   4. Das Handler-JS lädt erst beim Klick auf "+"'],
    ru: ['// HTML, сгенерированный сервером, включает:', '//   <div id="app">', '//     <span data-astra-store="counter" data-astra-value="42">', '//       Counter: 42', '//     </span>', '//     <button data-astra-handler="increment">', '//       +', '//     </button>', '//   </div>', '// Когда клиент «возобновляется»:', '//   1. Читает data-astra-store → инициализирует store значением 42', '//   2. Читает data-astra-handler → знает о pending onclick', '//   3. Не выполняет компоненты, не делает diffing', '//   4. JS обработчика загружается только при клике на "+"'],
  },
  'router.routes': {
    de: ['// routes.ts — ein Objekt mit reaktiven Gettern', '// In deinem Layout:'],
    ru: ['// routes.ts — объект с реактивными геттерами', '// В вашем layout:'],
  },
  'router.patterns': {
    de: ['// exact match: nur "/"', '// prefix match: "/products", "/products/123"', '// Parameter: "/products/42" → params.id = "42"', '// Parameter: "/blog/hello-world" → params.slug', '// mehrere Parameter'],
    ru: ['// exact match: только "/"', '// prefix match: "/products", "/products/123"', '// параметр: "/products/42" → params.id = "42"', '// параметр: "/blog/hello-world" → params.slug', '// несколько параметров'],
  },
  'router.exact': {
    de: ['// nur "/"', '// ohne exact → "/products", "/products/42"', '// "/products/42", "/products/42/reviews"', '// nur "/products/42"'],
    ru: ['// только "/"', '// без exact → "/products", "/products/42"', '// "/products/42", "/products/42/reviews"', '// только "/products/42"'],
  },
  'router.params': {
    de: ['// Route: /products/:id', '// params.id enthält den Wert des :id-Segments', '// string', '// Nutze es mit server(), um Daten zu laden'],
    ru: ['// Маршрут: /products/:id', '// params.id содержит значение сегмента :id', '// string', '// Используйте с server() для загрузки данных'],
  },
  'router.link': {
    de: ['// Einfache Navigation', '// Mit Klassen und Stilen', '// Mit Children (funktioniert wie <a>)'],
    ru: ['// Базовая навигация', '// С классами и стилями', '// С children (работает как <a>)'],
  },
  'router.navigate': {
    de: ['// Nach einer Aktion', '// leitet zur Liste weiter', '// In Event-Handlern', '// Mit Hash für Scroll'],
    ru: ['// После действия', '// перенаправляет на список', '// В обработчиках событий', '// С хешем для прокрутки'],
  },
  'router.outlet': {
    de: ['/* Kindrouten werden hier gerendert */', '/* Die Sidebar wird bei Navigation NICHT neu erstellt */', '// Kindrouten:', '// /dashboard/overview  → OverviewPage in <Outlet />', '// /dashboard/analytics → AnalyticsPage in <Outlet />', '// /dashboard/settings  → SettingsPage in <Outlet />'],
    ru: ['/* Дочерние маршруты рендерятся здесь */', '/* Сайдбар НЕ пересоздаётся при навигации */', '// Дочерние маршруты:', '// /dashboard/overview  → OverviewPage в <Outlet />', '// /dashboard/analytics → AnalyticsPage в <Outlet />', '// /dashboard/settings  → SettingsPage в <Outlet />'],
  },
  'router.viewtransitions': {
    de: ['// Aktiviert sich automatisch mit navigate() und <Link>', '// Der Browser macht:', '//   1. Screenshot der aktuellen Seite', '//   2. Rendert die neue Seite', '//   3. Cross-Fade zwischen beiden', '// Anpassung mit CSS:'],
    ru: ['// Активируется автоматически с navigate() и <Link>', '// Браузер делает:', '//   1. Делает скриншот текущей страницы', '//   2. Рендерит новую страницу', '//   3. Cross-fade между ними', '// Настройка через CSS:'],
  },
  'router.onroute': {
    de: ['// Analytics', '// Beim Navigieren nach oben scrollen', '// Titel aktualisieren'],
    ru: ['// Analytics', '// Прокрутка вверх при навигации', '// Обновить заголовок'],
  },
  'sd.basic': {
    de: ['// Definiere die Funktion EINMAL', '// Cache-TTL in Sekunden', '// Im CLIENT — sieht aus wie ein normaler Async-Aufruf', '// ↑ Das ist ein Fetch auf /api/astra/getUsers?args=["admin"]', '// Typen werden automatisch inferiert — admins ist User[]'],
    ru: ['// Определите функцию ОДИН РАЗ', '// TTL кеша в секундах', '// В КЛИЕНТЕ — выглядит как обычный async-вызов', '// ↑ Это fetch на /api/astra/getUsers?args=["admin"]', '// Типы выводятся автоматически — admins это User[]'],
  },
  'sd.config': {
    de: ['// Ausführungstyp', '// default: \'dynamic\'', '// Cache', '// Tags für chirurgische Invalidierung', '// TTL in Sekunden (0 = kein Cache)', '// Echtzeit-Synchronisierung', '// Polling mit ETags', '// Intervall in ms (default: 3000)', '// Transformation', '// Transformiert Daten vor dem Senden an den Client'],
    ru: ['// Тип выполнения', '// default: \'dynamic\'', '// Кеш', '// Теги для точечной инвалидации', '// TTL в секундах (0 = без кеша)', '// Синхронизация в реальном времени', '// Поллинг с ETag', '// Интервал в мс (default: 3000)', '// Трансформация', '// Преобразует данные перед отправкой клиенту'],
  },
  'sd.prebuild': {
    de: ['// Ideal für: Menüs, Einstellungen, statische Inhalte', '// Zur Buildzeit: db.menu.findMany() → Ergebnis ins HTML serialisiert', '// Im Client: siteNav() → Daten sofort verfügbar, ohne Fetch', '// Wird bei jedem Build oder per ISR neu generiert'],
    ru: ['// Идеально для: меню, настроек, статического контента', '// При сборке: db.menu.findMany() → результат сериализуется в HTML', '// В клиенте: siteNav() → данные уже доступны, без fetch', '// Перегенерируется при каждой сборке или через ISR'],
  },
  'sd.dynamic': {
    de: ['// Ideal für: Sitzungen, Nutzerdaten, Suchen'],
    ru: ['// Идеально для: сессий, данных пользователя, поиска'],
  },
  'sd.tags': {
    de: ['// Dienste mit Tags'],
    ru: ['// Сервисы с тегами'],
  },
  'sd.revalidate': {
    de: ['// Nach dem Erstellen eines Produkts:', '// Nur Queries mit diesen Tags werden revalidiert', '// ↑ getProducts wird revalidiert (hat den Tag \'products\')', '// ↑ getProductById wird revalidiert (hat den Tag \'products\')', '// getCategories wird NICHT revalidiert (kein \'products\')', '// Nach dem Aktualisieren einer Kategorie:', '// ↑ Nur getCategories wird revalidiert'],
    ru: ['// После создания продукта:', '// Ревалидируются только запросы с этими тегами', '// ↑ getProducts ревалидируется (есть тег \'products\')', '// ↑ getProductById ревалидируется (есть тег \'products\')', '// getCategories НЕ ревалидируется (нет \'products\')', '// После обновления категории:', '// ↑ Ревалидируется только getCategories'],
  },
  'sd.autosync': {
    de: ['// Daten, die sich alle 3 Sekunden automatisch synchronisieren', '// In der Komponente:', '/* ↑ Aktualisiert sich nur, wenn der Server neue Daten liefert */', '/* Kein manuelles Polling, kein useEffect, keine Abonnements */'],
    ru: ['// Данные, автосинхронизирующиеся каждые 3 секунды', '// В компоненте:', '/* ↑ Обновляется только когда сервер возвращает новые данные */', '/* Без ручного поллинга, без useEffect, без подписок */'],
  },
  'sd.mutation': {
    de: ['// Tags, die nach der Mutation revalidiert werden', '// In der Komponente:', '// ↑ Die Mutation läuft auf dem Server', '// ↑ Die [\'products\']-Tags werden nach der Mutation automatisch revalidiert', '// ↑ Die UI aktualisiert sich ohne zusätzlichen Code'],
    ru: ['// теги для ревалидации после мутации', '// В компоненте:', '// ↑ Мутация выполняется на сервере', '// ↑ Теги [\'products\'] ревалидируются автоматически после мутации', '// ↑ UI обновляется без дополнительного кода'],
  },
  'testing.vitest': {
    de: ['// vitest.config.ts'],
    ru: ['// vitest.config.ts'],
  },
  'testing.store': {
    de: ['// Abonnement der Eigenschaft \'items\'', '// der Effekt läuft beim Abonnieren', '// läuft nur wegen \'items\' erneut'],
    ru: ['// подписка на свойство \'items\'', '// эффект выполняется при подписке', '// повторно выполняется только из-за \'items\''],
  },
  'testing.flush': {
    de: ['// AstraJS-Effects laufen in Microtasks'],
    ru: ['// Эффекты AstraJS выполняются в microtask'],
  },
  'testing.jest': {
    de: ['// jest.config.js'],
    ru: ['// jest.config.js'],
  },
  'testing.jest-test': {
    de: ['// __tests__/counter.test.tsx'],
    ru: ['// __tests__/counter.test.tsx'],
  },
  'testing.playwright': {
    de: ['// playwright.config.ts', '//localhost:5173\',', '// e2e/counter.spec.ts'],
    ru: ['// playwright.config.ts', '//localhost:5173\',', '// e2e/counter.spec.ts'],
  },
  'testing.cypress': {
    de: ['// cypress.config.ts', '//localhost:5173\' },', '// cypress/e2e/counter.cy.ts'],
    ru: ['// cypress.config.ts', '//localhost:5173\' },', '// cypress/e2e/counter.cy.ts'],
  },
  'ex02': {
    de: ['// store.ts — geteiltes Modul', '// Komponente A', '// Komponente B — aktualisiert sich selbst'],
    ru: ['// store.ts — общий модуль', '// Компонент A', '// Компонент B — обновляется сам'],
  },
  'ex08': {
    de: ['// auto-cleanup'],
    ru: ['// auto-cleanup'],
  },
  'ex10': {
    de: ['// Nur class/disabled ändern sich', '// am betroffenen Knoten. Sonst nichts.'],
    ru: ['// Меняются только class/disabled', '// на затронутом узле. Больше ничего.'],
  },
  'ex11': {
    de: ['// Client — typisierter RPC:', '// users: User[] — automatische E2E-Typen'],
    ru: ['// Клиент — типизированный RPC:', '// users: User[] — автоматические e2e-типы'],
  },
  'ex12': {
    de: ['// 1. Fetch → Netzwerk + Cache', '// Folgende → sofortiger Cache (SWR)', '// Abgelaufen → Stale + Revalidierung im Hintergrund'],
    ru: ['// 1-й fetch → сеть + кеш', '// Следующие → мгновенный кеш (SWR)', '// Истёк → stale + фоновая ревалидация'],
  },
  'ex13': {
    de: ['// Die [\'posts\']-Tags werden automatisch revalidiert'],
    ru: ['// Теги [\'posts\'] ревалидируются автоматически'],
  },
  'ex15': {
    de: ['// Client:', '// Server:'],
    ru: ['// Клиент:', '// Сервер:'],
  },
  'ex16': {
    de: ['// optimistisch', '// Server', '// Rollback'],
    ru: ['// оптимистично', '// сервер', '// откат'],
  },
  'ex18': {
    de: ['// Das DOM aktualisiert sich nur, wenn der', '// Server neue Daten liefert.', '// Keine WebSockets, keine Abonnements.'],
    ru: ['// DOM обновляется только когда', '// сервер возвращает новые данные.', '// Без WebSockets, без подписок.'],
  },
  'ex19': {
    de: ['// HTML des Servers:', '// Client: resume()', '// 1. Liest den Zustand aus dem HTML', '// 2. Store ohne erneute Ausführung initialisiert', '// 3. Handler laden on-demand'],
    ru: ['// HTML сервера:', '// Клиент: resume()', '// 1. Читает состояние из HTML', '// 2. Store инициализируется без повторного выполнения', '// 3. Обработчики загружаются по требованию'],
  },
  'ex20': {
    de: ['// Buildzeit: Abfrage ausgeführt', '// HTML: eingebettete Daten (astra-data)', '// Client: 0 Fetch, 0 KB JS'],
    ru: ['// Время сборки: запрос выполнен', '// HTML: встроенные данные (astra-data)', '// Клиент: 0 fetch, 0 КБ JS'],
  },
};
