/**
 * astra-store — minimal i18n (es / en / pt).
 * Locale lives in a reactive store so switching languages re-renders
 * every dynamic block that reads `t()`.
 */
import { store } from 'astrajs.dev/core';

export const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

const i18nState = store({ locale: 'es' as LocaleCode });

export function setLocale(code: string): void {
  const valid = LOCALES.some((l) => l.code === code);
  i18nState.locale = valid ? (code as LocaleCode) : 'es';
}

export function currentLocale(): LocaleCode {
  return i18nState.locale;
}

type Key =
  | 'nav.home' | 'nav.products' | 'nav.cart' | 'nav.orders' | 'nav.about'
  | 'hero.title' | 'hero.sub' | 'hero.cta'
  | 'section.featured' | 'section.catalog' | 'section.assistant'
  | 'search.placeholder' | 'filter.all'
  | 'product.add' | 'product.stock' | 'product.low' | 'product.back'
  | 'product.reviews' | 'product.inStock' | 'product.lowStock' | 'product.loading' | 'product.added'
  | 'cart.title' | 'cart.empty' | 'cart.qty' | 'cart.remove' | 'cart.total' | 'cart.checkout' | 'cart.unknown'
  | 'checkout.title' | 'checkout.name' | 'checkout.email' | 'checkout.address' | 'checkout.card' | 'checkout.pay' | 'checkout.placed'
  | 'orders.title' | 'orders.login' | 'orders.loginBtn' | 'orders.empty' | 'orders.status' | 'orders.signedIn'
  | 'assistant.ask' | 'assistant.hint' | 'assistant.btn'
  | 'about.title' | 'about.body'
  | 'common.loading' | 'common.notFound'
  | 'footer';

const T: Record<LocaleCode, Record<Key, string>> = {
  es: {
    'nav.home': 'Inicio', 'nav.products': 'Productos', 'nav.cart': 'Carrito',
    'nav.orders': 'Mis pedidos', 'nav.about': 'Acerca',
    'hero.title': 'La tienda que demuestra <span>SSR completo</span> con AstraJS',
    'hero.sub': 'Catálogo renderizado en el servidor, RPC tipado, ISR con invalidación, autenticación y un asistente de compras con IA. Todo con cero Virtual DOM.',
    'hero.cta': 'Explorar productos',
    'section.featured': 'Destacados', 'section.catalog': 'Catálogo', 'section.assistant': 'Asistente de compras IA',
    'search.placeholder': 'Buscar productos…', 'filter.all': 'Todos',
    'product.add': 'Añadir al carrito', 'product.stock': 'en stock', 'product.low': '¡quedan pocos!',
    'product.back': '← Volver al catálogo',
    'cart.title': 'Tu carrito', 'cart.empty': 'Tu carrito está vacío.',
    'cart.qty': 'Cantidad', 'cart.remove': 'Quitar', 'cart.total': 'Total', 'cart.checkout': 'Pagar ahora',
    'checkout.title': 'Checkout', 'checkout.name': 'Nombre completo', 'checkout.email': 'Email',
    'checkout.address': 'Dirección de envío', 'checkout.card': 'Tarjeta (demo)', 'checkout.pay': 'Pagar',
    'orders.title': 'Mis pedidos', 'orders.login': 'Inicia sesión con tu email para ver tus pedidos',
    'orders.loginBtn': 'Entrar', 'orders.empty': 'Aún no tienes pedidos.', 'orders.status': 'Estado',
    'assistant.ask': 'Pregúntame por productos…', 'assistant.hint': 'ej. "unos auriculares con cancelación de ruido"', 'assistant.btn': 'Preguntar',
    'about.title': 'Acerca de AstraStore', 'about.body': 'AstraStore es el ejemplo completo del framework: páginas con SSR real, RPC tipado con server(), ISR con Cache-Tag y revalidación, autenticación con el hook de seguridad configureRPC, validación de schema compartida y un asistente IA con RAG sobre el catálogo.',
    'product.reviews': 'reseñas', 'product.inStock': 'en stock', 'product.lowStock': 'pocas unidades',
    'product.loading': 'Cargando producto…', 'product.added': '✓ Añadido al carrito',
    'cart.unknown': 'Producto desconocido',
    'checkout.placed': '✓ Pedido {id} realizado — ${total}',
    'orders.signedIn': 'sesión iniciada como',
    'common.loading': 'Cargando…', 'common.notFound': 'Página no encontrada.',
    'footer': 'AstraStore · demo SSR de AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  en: {
    'nav.home': 'Home', 'nav.products': 'Products', 'nav.cart': 'Cart',
    'nav.orders': 'My orders', 'nav.about': 'About',
    'hero.title': 'The store that proves <span>full SSR</span> with AstraJS',
    'hero.sub': 'Server-rendered catalog, typed RPC, ISR with invalidation, authentication and an AI shopping assistant. All with zero Virtual DOM.',
    'hero.cta': 'Browse products',
    'section.featured': 'Featured', 'section.catalog': 'Catalog', 'section.assistant': 'AI shopping assistant',
    'search.placeholder': 'Search products…', 'filter.all': 'All',
    'product.add': 'Add to cart', 'product.stock': 'in stock', 'product.low': 'low stock!',
    'product.back': '← Back to catalog',
    'cart.title': 'Your cart', 'cart.empty': 'Your cart is empty.',
    'cart.qty': 'Quantity', 'cart.remove': 'Remove', 'cart.total': 'Total', 'cart.checkout': 'Checkout',
    'checkout.title': 'Checkout', 'checkout.name': 'Full name', 'checkout.email': 'Email',
    'checkout.address': 'Shipping address', 'checkout.card': 'Card (demo)', 'checkout.pay': 'Pay now',
    'orders.title': 'My orders', 'orders.login': 'Sign in with your email to see your orders',
    'orders.loginBtn': 'Sign in', 'orders.empty': 'No orders yet.', 'orders.status': 'Status',
    'assistant.ask': 'Ask me about products…', 'assistant.hint': 'e.g. "headphones with noise cancelling"', 'assistant.btn': 'Ask',
    'about.title': 'About AstraStore', 'about.body': 'AstraStore is the complete framework example: real SSR pages, typed RPC with server(), ISR with Cache-Tag and revalidation, authentication via the configureRPC security hook, shared schema validation and an AI assistant with RAG over the catalog.',
    'product.reviews': 'reviews', 'product.inStock': 'in stock', 'product.lowStock': 'low stock',
    'product.loading': 'Loading product…', 'product.added': '✓ Added to cart',
    'cart.unknown': 'Unknown product',
    'checkout.placed': '✓ Order {id} placed — ${total}',
    'orders.signedIn': 'signed in as session',
    'common.loading': 'Loading…', 'common.notFound': 'Page not found.',
    'footer': 'AstraStore · AstraJS SSR demo — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  pt: {
    'nav.home': 'Início', 'nav.products': 'Produtos', 'nav.cart': 'Carrinho',
    'nav.orders': 'Meus pedidos', 'nav.about': 'Sobre',
    'hero.title': 'A loja que prova o <span>SSR completo</span> com AstraJS',
    'hero.sub': 'Catálogo renderizado no servidor, RPC tipado, ISR com invalidação, autenticação e um assistente de compras com IA. Tudo com zero Virtual DOM.',
    'hero.cta': 'Explorar produtos',
    'section.featured': 'Destaques', 'section.catalog': 'Catálogo', 'section.assistant': 'Assistente de compras IA',
    'search.placeholder': 'Buscar produtos…', 'filter.all': 'Todos',
    'product.add': 'Adicionar ao carrinho', 'product.stock': 'em estoque', 'product.low': 'poucas unidades!',
    'product.back': '← Voltar ao catálogo',
    'cart.title': 'Seu carrinho', 'cart.empty': 'Seu carrinho está vazio.',
    'cart.qty': 'Quantidade', 'cart.remove': 'Remover', 'cart.total': 'Total', 'cart.checkout': 'Finalizar compra',
    'checkout.title': 'Checkout', 'checkout.name': 'Nome completo', 'checkout.email': 'E-mail',
    'checkout.address': 'Endereço de entrega', 'checkout.card': 'Cartão (demo)', 'checkout.pay': 'Pagar',
    'orders.title': 'Meus pedidos', 'orders.login': 'Entre com seu e-mail para ver seus pedidos',
    'orders.loginBtn': 'Entrar', 'orders.empty': 'Nenhum pedido ainda.', 'orders.status': 'Status',
    'assistant.ask': 'Pergunte sobre produtos…', 'assistant.hint': 'ex. "fones com cancelamento de ruído"', 'assistant.btn': 'Perguntar',
    'about.title': 'Sobre a AstraStore', 'about.body': 'AstraStore é o exemplo completo do framework: páginas com SSR real, RPC tipado com server(), ISR com Cache-Tag e revalidação, autenticação com o hook de segurança configureRPC, validação de schema compartilhada e um assistente IA com RAG sobre o catálogo.',
    'product.reviews': 'avaliações', 'product.inStock': 'em estoque', 'product.lowStock': 'poucas unidades',
    'product.loading': 'Carregando produto…', 'product.added': '✓ Adicionado ao carrinho',
    'cart.unknown': 'Produto desconhecido',
    'checkout.placed': '✓ Pedido {id} realizado — R${total}',
    'orders.signedIn': 'sessão iniciada como',
    'common.loading': 'Carregando…', 'common.notFound': 'Página não encontrada.',
    'footer': 'AstraStore · demo SSR do AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.products': 'Produits', 'nav.cart': 'Panier',
    'nav.orders': 'Mes commandes', 'nav.about': 'À propos',
    'hero.title': 'La boutique qui prouve le <span>SSR complet</span> avec AstraJS',
    'hero.sub': 'Catalogue rendu côté serveur, RPC typé, ISR avec invalidation, authentification et assistant shopping IA. Le tout sans Virtual DOM.',
    'hero.cta': 'Explorer les produits',
    'section.featured': 'À la une', 'section.catalog': 'Catalogue', 'section.assistant': 'Assistant shopping IA',
    'search.placeholder': 'Rechercher des produits…', 'filter.all': 'Tous',
    'product.add': 'Ajouter au panier', 'product.stock': 'en stock', 'product.low': 'stock faible !',
    'product.back': '← Retour au catalogue',
    'product.reviews': 'avis', 'product.inStock': 'en stock', 'product.lowStock': 'stock faible',
    'product.loading': 'Chargement du produit…', 'product.added': '✓ Ajouté au panier',
    'cart.title': 'Votre panier', 'cart.empty': 'Votre panier est vide.',
    'cart.qty': 'Quantité', 'cart.remove': 'Retirer', 'cart.total': 'Total', 'cart.checkout': 'Payer',
    'cart.unknown': 'Produit inconnu',
    'checkout.title': 'Paiement', 'checkout.name': 'Nom complet', 'checkout.email': 'E-mail',
    'checkout.address': 'Adresse de livraison', 'checkout.card': 'Carte (démo)', 'checkout.pay': 'Payer maintenant',
    'checkout.placed': '✓ Commande {id} passée — {total} €',
    'orders.title': 'Mes commandes', 'orders.login': 'Connectez-vous avec votre e-mail pour voir vos commandes',
    'orders.loginBtn': 'Se connecter', 'orders.empty': 'Aucune commande pour le moment.', 'orders.status': 'Statut',
    'orders.signedIn': 'session ouverte en tant que',
    'assistant.ask': 'Posez-moi des questions sur les produits…', 'assistant.hint': 'ex. « un casque avec réduction de bruit »', 'assistant.btn': 'Demander',
    'about.title': 'À propos d\'AstraStore', 'about.body': 'AstraStore est l\'exemple complet du framework : pages SSR réelles, RPC typé avec server(), ISR avec Cache-Tag et revalidation, authentification via le hook de sécurité configureRPC, validation de schéma partagée et un assistant IA avec RAG sur le catalogue.',
    'common.loading': 'Chargement…', 'common.notFound': 'Page introuvable.',
    'footer': 'AstraStore · démo SSR AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  it: {
    'nav.home': 'Home', 'nav.products': 'Prodotti', 'nav.cart': 'Carrello',
    'nav.orders': 'I miei ordini', 'nav.about': 'Info',
    'hero.title': 'Il negozio che dimostra l\'<span>SSR completo</span> con AstraJS',
    'hero.sub': 'Catalogo renderizzato lato server, RPC tipizzato, ISR con invalidazione, autenticazione e assistente shopping IA. Il tutto senza Virtual DOM.',
    'hero.cta': 'Esplora i prodotti',
    'section.featured': 'In evidenza', 'section.catalog': 'Catalogo', 'section.assistant': 'Assistente shopping IA',
    'search.placeholder': 'Cerca prodotti…', 'filter.all': 'Tutti',
    'product.add': 'Aggiungi al carrello', 'product.stock': 'disponibili', 'product.low': 'scorte limitate!',
    'product.back': '← Torna al catalogo',
    'product.reviews': 'recensioni', 'product.inStock': 'disponibili', 'product.lowStock': 'scorte limitate',
    'product.loading': 'Caricamento prodotto…', 'product.added': '✓ Aggiunto al carrello',
    'cart.title': 'Il tuo carrello', 'cart.empty': 'Il tuo carrello è vuoto.',
    'cart.qty': 'Quantità', 'cart.remove': 'Rimuovi', 'cart.total': 'Totale', 'cart.checkout': 'Vai al pagamento',
    'cart.unknown': 'Prodotto sconosciuto',
    'checkout.title': 'Pagamento', 'checkout.name': 'Nome completo', 'checkout.email': 'Email',
    'checkout.address': 'Indirizzo di spedizione', 'checkout.card': 'Carta (demo)', 'checkout.pay': 'Paga ora',
    'checkout.placed': '✓ Ordine {id} effettuato — {total} €',
    'orders.title': 'I miei ordini', 'orders.login': 'Accedi con la tua email per vedere i tuoi ordini',
    'orders.loginBtn': 'Accedi', 'orders.empty': 'Nessun ordine ancora.', 'orders.status': 'Stato',
    'orders.signedIn': 'sessione avviata come',
    'assistant.ask': 'Chiedimi dei prodotti…', 'assistant.hint': 'es. "cuffie con cancellazione del rumore"', 'assistant.btn': 'Chiedi',
    'about.title': 'Informazioni su AstraStore', 'about.body': 'AstraStore è l\'esempio completo del framework: pagine SSR reali, RPC tipizzato con server(), ISR con Cache-Tag e revalidazione, autenticazione tramite il hook di sicurezza configureRPC, validazione schema condivisa e un assistente IA con RAG sul catalogo.',
    'common.loading': 'Caricamento…', 'common.notFound': 'Pagina non trovata.',
    'footer': 'AstraStore · demo SSR AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  de: {
    'nav.home': 'Start', 'nav.products': 'Produkte', 'nav.cart': 'Warenkorb',
    'nav.orders': 'Meine Bestellungen', 'nav.about': 'Über',
    'hero.title': 'Der Shop, der <span>volles SSR</span> mit AstraJS beweist',
    'hero.sub': 'Server-gerenderter Katalog, typisierte RPC, ISR mit Invalidierung, Authentifizierung und ein KI-Einkaufsassistent. Alles ohne Virtual DOM.',
    'hero.cta': 'Produkte ansehen',
    'section.featured': 'Empfohlen', 'section.catalog': 'Katalog', 'section.assistant': 'KI-Einkaufsassistent',
    'search.placeholder': 'Produkte suchen…', 'filter.all': 'Alle',
    'product.add': 'In den Warenkorb', 'product.stock': 'auf Lager', 'product.low': 'nur noch wenige!',
    'product.back': '← Zurück zum Katalog',
    'product.reviews': 'Bewertungen', 'product.inStock': 'auf Lager', 'product.lowStock': 'geringer Bestand',
    'product.loading': 'Produkt wird geladen…', 'product.added': '✓ In den Warenkorb gelegt',
    'cart.title': 'Dein Warenkorb', 'cart.empty': 'Dein Warenkorb ist leer.',
    'cart.qty': 'Menge', 'cart.remove': 'Entfernen', 'cart.total': 'Gesamt', 'cart.checkout': 'Zur Kasse',
    'cart.unknown': 'Unbekanntes Produkt',
    'checkout.title': 'Kasse', 'checkout.name': 'Vollständiger Name', 'checkout.email': 'E-Mail',
    'checkout.address': 'Lieferadresse', 'checkout.card': 'Karte (Demo)', 'checkout.pay': 'Jetzt bezahlen',
    'checkout.placed': '✓ Bestellung {id} aufgegeben — {total} €',
    'orders.title': 'Meine Bestellungen', 'orders.login': 'Melde dich mit deiner E-Mail an, um deine Bestellungen zu sehen',
    'orders.loginBtn': 'Anmelden', 'orders.empty': 'Noch keine Bestellungen.', 'orders.status': 'Status',
    'orders.signedIn': 'angemeldet als Sitzung',
    'assistant.ask': 'Frag mich nach Produkten…', 'assistant.hint': 'z. B. „Kopfhörer mit Geräuschunterdrückung“', 'assistant.btn': 'Fragen',
    'about.title': 'Über AstraStore', 'about.body': 'AstraStore ist das vollständige Framework-Beispiel: echtes SSR, typisierte RPC mit server(), ISR mit Cache-Tag und Revalidierung, Authentifizierung über den configureRPC-Sicherheits-Hook, gemeinsame Schema-Validierung und ein KI-Assistent mit RAG über den Katalog.',
    'common.loading': 'Wird geladen…', 'common.notFound': 'Seite nicht gefunden.',
    'footer': 'AstraStore · AstraJS-SSR-Demo — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  ru: {
    'nav.home': 'Главная', 'nav.products': 'Товары', 'nav.cart': 'Корзина',
    'nav.orders': 'Мои заказы', 'nav.about': 'О проекте',
    'hero.title': 'Магазин, доказывающий <span>полный SSR</span> на AstraJS',
    'hero.sub': 'Каталог, отрендеренный на сервере, типизированные RPC, ISR с инвалидацией, аутентификация и ИИ-ассистент по покупкам. Всё без Virtual DOM.',
    'hero.cta': 'Смотреть товары',
    'section.featured': 'Рекомендуем', 'section.catalog': 'Каталог', 'section.assistant': 'ИИ-ассистент по покупкам',
    'search.placeholder': 'Поиск товаров…', 'filter.all': 'Все',
    'product.add': 'В корзину', 'product.stock': 'в наличии', 'product.low': 'осталось мало!',
    'product.back': '← Назад в каталог',
    'product.reviews': 'отзывов', 'product.inStock': 'в наличии', 'product.lowStock': 'мало на складе',
    'product.loading': 'Загрузка товара…', 'product.added': '✓ Добавлено в корзину',
    'cart.title': 'Ваша корзина', 'cart.empty': 'Ваша корзина пуста.',
    'cart.qty': 'Количество', 'cart.remove': 'Убрать', 'cart.total': 'Итого', 'cart.checkout': 'Оформить заказ',
    'cart.unknown': 'Неизвестный товар',
    'checkout.title': 'Оформление', 'checkout.name': 'Полное имя', 'checkout.email': 'Email',
    'checkout.address': 'Адрес доставки', 'checkout.card': 'Карта (демо)', 'checkout.pay': 'Оплатить',
    'checkout.placed': '✓ Заказ {id} оформлен — {total} $',
    'orders.title': 'Мои заказы', 'orders.login': 'Войдите с вашим email, чтобы увидеть заказы',
    'orders.loginBtn': 'Войти', 'orders.empty': 'Заказов пока нет.', 'orders.status': 'Статус',
    'orders.signedIn': 'сессия от имени',
    'assistant.ask': 'Спросите меня о товарах…', 'assistant.hint': 'напр. «наушники с шумоподавлением»', 'assistant.btn': 'Спросить',
    'about.title': 'О магазине AstraStore', 'about.body': 'AstraStore — полный пример фреймворка: настоящие SSR-страницы, типизированные RPC через server(), ISR с Cache-Tag и ревалидацией, аутентификация через хук безопасности configureRPC, общая валидация схемы и ИИ-ассистент с RAG по каталогу.',
    'common.loading': 'Загрузка…', 'common.notFound': 'Страница не найдена.',
    'footer': 'AstraStore · SSR-демо AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  ja: {
    'nav.home': 'ホーム', 'nav.products': '商品', 'nav.cart': 'カート',
    'nav.orders': '注文履歴', 'nav.about': '概要',
    'hero.title': 'AstraJSで<span>完全なSSR</span>を実証するストア',
    'hero.sub': 'サーバーレンダリングされたカタログ、型付きRPC、キャッシュ無効化付きISR、認証、AIショッピングアシスタント。Virtual DOMなし。',
    'hero.cta': '商品を見る',
    'section.featured': '注目商品', 'section.catalog': 'カタログ', 'section.assistant': 'AIショッピングアシスタント',
    'search.placeholder': '商品を検索…', 'filter.all': 'すべて',
    'product.add': 'カートに追加', 'product.stock': '在庫あり', 'product.low': '残りわずか！',
    'product.back': '← カタログに戻る',
    'product.reviews': '件のレビュー', 'product.inStock': '在庫あり', 'product.lowStock': '残りわずか',
    'product.loading': '商品を読み込み中…', 'product.added': '✓ カートに追加しました',
    'cart.title': 'カート', 'cart.empty': 'カートは空です。',
    'cart.qty': '数量', 'cart.remove': '削除', 'cart.total': '合計', 'cart.checkout': 'レジへ進む',
    'cart.unknown': '不明な商品',
    'checkout.title': 'チェックアウト', 'checkout.name': '氏名', 'checkout.email': 'メールアドレス',
    'checkout.address': '配送先住所', 'checkout.card': 'カード（デモ）', 'checkout.pay': '支払う',
    'checkout.placed': '✓ 注文 {id} が確定しました — ${total}',
    'orders.title': '注文履歴', 'orders.login': '注文を確認するにはメールでログインしてください',
    'orders.loginBtn': 'ログイン', 'orders.empty': 'まだ注文がありません。', 'orders.status': 'ステータス',
    'orders.signedIn': 'ログイン中のセッション',
    'assistant.ask': '商品について質問してください…', 'assistant.hint': '例：「ノイズキャンセリングのヘッドホン」', 'assistant.btn': '質問する',
    'about.title': 'AstraStoreについて', 'about.body': 'AstraStoreはフレームワークの完全な実例です：本物のSSRページ、server()による型付きRPC、Cache-Tagと再検証付きISR、configureRPCセキュリティフックによる認証、共有スキーマ検証、カタログを対象にしたRAG付きAIアシスタント。',
    'common.loading': '読み込み中…', 'common.notFound': 'ページが見つかりません。',
    'footer': 'AstraStore · AstraJS SSRデモ — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  'zh-CN': {
    'nav.home': '首页', 'nav.products': '商品', 'nav.cart': '购物车',
    'nav.orders': '我的订单', 'nav.about': '关于',
    'hero.title': '用 AstraJS 证明<span>完整 SSR</span>的商店',
    'hero.sub': '服务端渲染的目录、类型安全的 RPC、带失效机制的 ISR、身份认证与 AI 购物助手。零 Virtual DOM。',
    'hero.cta': '浏览商品',
    'section.featured': '精选', 'section.catalog': '目录', 'section.assistant': 'AI 购物助手',
    'search.placeholder': '搜索商品…', 'filter.all': '全部',
    'product.add': '加入购物车', 'product.stock': '有货', 'product.low': '库存紧张！',
    'product.back': '← 返回目录',
    'product.reviews': '条评价', 'product.inStock': '有货', 'product.lowStock': '库存紧张',
    'product.loading': '正在加载商品…', 'product.added': '✓ 已加入购物车',
    'cart.title': '我的购物车', 'cart.empty': '购物车是空的。',
    'cart.qty': '数量', 'cart.remove': '移除', 'cart.total': '合计', 'cart.checkout': '去结算',
    'cart.unknown': '未知商品',
    'checkout.title': '结算', 'checkout.name': '姓名', 'checkout.email': '邮箱',
    'checkout.address': '收货地址', 'checkout.card': '银行卡（演示）', 'checkout.pay': '立即支付',
    'checkout.placed': '✓ 订单 {id} 已提交 — ¥{total}',
    'orders.title': '我的订单', 'orders.login': '使用邮箱登录以查看订单',
    'orders.loginBtn': '登录', 'orders.empty': '暂无订单。', 'orders.status': '状态',
    'orders.signedIn': '会话身份',
    'assistant.ask': '向我提问商品信息…', 'assistant.hint': '例如“带降噪的耳机”', 'assistant.btn': '提问',
    'about.title': '关于 AstraStore', 'about.body': 'AstraStore 是框架的完整示例：真正的 SSR 页面、基于 server() 的类型安全 RPC、带 Cache-Tag 与再验证的 ISR、通过 configureRPC 安全钩子实现的认证、共享 schema 校验，以及基于目录的 RAG AI 助手。',
    'common.loading': '加载中…', 'common.notFound': '页面不存在。',
    'footer': 'AstraStore · AstraJS SSR 演示 — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
};

export function t(key: Key): string {
  return T[i18nState.locale][key] ?? T.es[key];
}

/** Splits a translated string around <span>…</span> for JSX markup. */
export function spanParts(key: Key): { before: string; span: string; after: string } {
  const raw = t(key);
  const m = /^(.*)<span>(.*)<\/span>(.*)$/s.exec(raw);
  if (!m) return { before: raw, span: '', after: '' };
  return { before: m[1]!, span: m[2]!, after: m[3]! };
}
