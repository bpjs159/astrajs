/**
 * Catalog localization — product names/descriptions and category names for
 * every supported locale. Technical features stay in English (standard for
 * product specs). The English db.ts entries act as the fallback.
 */
import type { LocaleCode } from './i18n.js';

export interface CatalogL10n {
  products: Record<string, { name: string; desc: string }>;
  categories: Record<string, string>;
}

const EN: CatalogL10n = {
  categories: { audio: 'Audio', wearables: 'Wearables', home: 'Home', sports: 'Sports', accessories: 'Accessories', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Wireless Headphones', desc: 'Over-ear headphones with adaptive noise cancellation and 40h battery.' },
    p2: { name: 'Pulse Smart Watch', desc: 'AMOLED smart watch with health sensors, GPS and 7-day battery.' },
    p3: { name: 'Echo Smart Speaker', desc: 'Room-filling smart speaker with voice assistant and multi-room sync.' },
    p4: { name: 'Velocity Running Shoes', desc: 'Carbon-plated daily trainers with energy-return foam.' },
    p5: { name: 'Zen Desk Lamp', desc: 'Dimmable LED desk lamp with circadian presets and wireless charging base.' },
    p6: { name: 'Trail Pro Backpack 28L', desc: 'Weatherproof 28L backpack with suspended laptop bay and load lifters.' },
    p7: { name: 'Nova Mechanical Keyboard', desc: 'Hot-swappable 75% mechanical keyboard with gasket mount and RGB.' },
    p8: { name: 'Orbit Gaming Mouse', desc: '26K DPI wireless gaming mouse at 58 g with optical switches.' },
    p9: { name: 'Breeze Smart Fan', desc: 'Bladeless smart fan with app control, night mode and HEPA filter.' },
    p10: { name: 'Summit Yoga Mat Pro', desc: '6mm natural-rubber yoga mat with alignment guides and carry strap.' },
    p11: { name: 'Lumen E-Reader', desc: '7" e-ink reader with warm light, audiobooks and 8-week battery.' },
    p12: { name: 'Titan Portable Charger', desc: '20,000 mAh 65W power bank that charges a laptop and two phones at once.' },
    p13: { name: 'Frost Mini Fridge', desc: '4L thermo-electric mini fridge for desk or dorm, near-silent.' },
    p14: { name: 'Stride Fitness Band', desc: 'Slim fitness band with 14-day battery and 5ATM water resistance.' },
    p15: { name: 'Echo Buds ANC', desc: 'True-wireless earbuds with hybrid ANC and spatial audio.' },
    p16: { name: 'Apex Game Controller', desc: 'Hall-effect wireless controller with back paddles and trigger locks.' },
  },
};

const ES: CatalogL10n = {
  categories: { audio: 'Audio', wearables: 'Wearables', home: 'Hogar', sports: 'Deportes', accessories: 'Accesorios', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Auriculares Inalámbricos', desc: 'Auriculares over-ear con cancelación de ruido adaptativa y 40 h de batería.' },
    p2: { name: 'Pulse Reloj Inteligente', desc: 'Reloj inteligente AMOLED con sensores de salud, GPS y batería de 7 días.' },
    p3: { name: 'Echo Altavoz Inteligente', desc: 'Altavoz inteligente que llena la habitación, con asistente de voz y sincronización multiroom.' },
    p4: { name: 'Velocity Zapatillas de Running', desc: 'Zapatillas de entrenamiento diario con placa de carbono y espuma de retorno de energía.' },
    p5: { name: 'Zen Lámpara de Escritorio', desc: 'Lámpara LED regulable con ajustes circadianos y base de carga inalámbrica.' },
    p6: { name: 'Trail Pro Mochila 28L', desc: 'Mochila impermeable de 28 L con compartimento suspendido para portátil y correas de carga.' },
    p7: { name: 'Nova Teclado Mecánico', desc: 'Teclado mecánico 75% hot-swap con montaje gasket y RGB.' },
    p8: { name: 'Orbit Ratón Gaming', desc: 'Ratón gaming inalámbrico de 26K DPI y 58 g con switches ópticos.' },
    p9: { name: 'Breeze Ventilador Inteligente', desc: 'Ventilador sin aspas con control por app, modo nocturno y filtro HEPA.' },
    p10: { name: 'Summit Esterilla de Yoga Pro', desc: 'Esterilla de yoga de caucho natural de 6 mm con guías de alineación y correa.' },
    p11: { name: 'Lumen Lector de eBooks', desc: 'Lector de tinta electrónica de 7" con luz cálida, audiolibros y 8 semanas de batería.' },
    p12: { name: 'Titan Batería Portátil', desc: 'Power bank de 20.000 mAh y 65 W que carga un portátil y dos móviles a la vez.' },
    p13: { name: 'Frost Mininevera', desc: 'Mininevera termoeléctrica de 4 L para escritorio o residencia, casi silenciosa.' },
    p14: { name: 'Stride Pulsera Fitness', desc: 'Pulsera fitness delgada con 14 días de batería y resistencia al agua 5ATM.' },
    p15: { name: 'Echo Buds ANC', desc: 'Auriculares true-wireless con ANC híbrido y audio espacial.' },
    p16: { name: 'Apex Mando de Juego', desc: 'Mando inalámbrico con sticks Hall-effect, paletas traseras y gatillos con bloqueo.' },
  },
};

const PT: CatalogL10n = {
  categories: { audio: 'Áudio', wearables: 'Wearables', home: 'Casa', sports: 'Esportes', accessories: 'Acessórios', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Fones Sem Fio', desc: 'Fones over-ear com cancelamento de ruído adaptativo e bateria de 40 h.' },
    p2: { name: 'Pulse Relógio Inteligente', desc: 'Relógio inteligente AMOLED com sensores de saúde, GPS e bateria de 7 dias.' },
    p3: { name: 'Echo Caixa de Som Inteligente', desc: 'Caixa de som inteligente que preenche o ambiente, com assistente de voz e sincronização multiroom.' },
    p4: { name: 'Velocity Tênis de Corrida', desc: 'Tênis de treino diário com placa de carbono e espuma de retorno de energia.' },
    p5: { name: 'Zen Luminária de Mesa', desc: 'Luminária LED regulável com ajustes circadianos e base de carregamento sem fio.' },
    p6: { name: 'Trail Pro Mochila 28L', desc: 'Mochila impermeável de 28 L com compartimento suspenso para notebook e alças de carga.' },
    p7: { name: 'Nova Teclado Mecânico', desc: 'Teclado mecânico 75% hot-swap com montagem gasket e RGB.' },
    p8: { name: 'Orbit Mouse Gamer', desc: 'Mouse gamer sem fio de 26K DPI e 58 g com switches ópticos.' },
    p9: { name: 'Breeze Ventilador Inteligente', desc: 'Ventilador sem hélices com controle por app, modo noturno e filtro HEPA.' },
    p10: { name: 'Summit Tapete de Yoga Pro', desc: 'Tapete de yoga de borracha natural de 6 mm com guias de alinhamento e alça.' },
    p11: { name: 'Lumen Leitor de eBooks', desc: 'Leitor de tinta eletrônica de 7" com luz quente, audiolivros e 8 semanas de bateria.' },
    p12: { name: 'Titan Power Bank', desc: 'Power bank de 20.000 mAh e 65 W que carrega um notebook e dois celulares ao mesmo tempo.' },
    p13: { name: 'Frost Mini Geladeira', desc: 'Mini geladeira termoelétrica de 4 L para mesa ou dormitório, quase silenciosa.' },
    p14: { name: 'Stride Pulseira Fitness', desc: 'Pulseira fitness fina com 14 dias de bateria e resistência à água 5ATM.' },
    p15: { name: 'Echo Buds ANC', desc: 'Fones true-wireless com ANC híbrido e áudio espacial.' },
    p16: { name: 'Apex Controle de Jogo', desc: 'Controle sem fio com sticks Hall-effect, botões traseiros e travas de gatilho.' },
  },
};

const FR: CatalogL10n = {
  categories: { audio: 'Audio', wearables: 'Wearables', home: 'Maison', sports: 'Sport', accessories: 'Accessoires', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Casque sans fil', desc: 'Casque circum-aural avec réduction de bruit adaptative et 40 h d\'autonomie.' },
    p2: { name: 'Pulse Montre connectée', desc: 'Montre connectée AMOLED avec capteurs de santé, GPS et 7 jours d\'autonomie.' },
    p3: { name: 'Echo Enceinte intelligente', desc: 'Enceinte intelligente puissante avec assistant vocal et synchronisation multi-pièces.' },
    p4: { name: 'Velocity Chaussures de running', desc: 'Chaussures d\'entraînement à plaque carbone et mousse à retour d\'énergie.' },
    p5: { name: 'Zen Lampe de bureau', desc: 'Lampe LED à intensité variable avec préréglages circadiens et socle de charge sans fil.' },
    p6: { name: 'Trail Pro Sac à dos 28L', desc: 'Sac à dos imperméable de 28 L avec compartiment PC suspendu et sangles de charge.' },
    p7: { name: 'Nova Clavier mécanique', desc: 'Clavier mécanique 75 % hot-swap avec montage gasket et RGB.' },
    p8: { name: 'Orbit Souris gaming', desc: 'Souris gaming sans fil 26K DPI et 58 g avec switchs optiques.' },
    p9: { name: 'Breeze Ventilateur intelligent', desc: 'Ventilateur sans pales avec contrôle par app, mode nuit et filtre HEPA.' },
    p10: { name: 'Summit Tapis de yoga Pro', desc: 'Tapis de yoga en caoutchouc naturel de 6 mm avec repères d\'alignement et sangle.' },
    p11: { name: 'Lumen Liseuse', desc: 'Liseuse à encre électronique 7" avec lumière chaude, livres audio et 8 semaines d\'autonomie.' },
    p12: { name: 'Titan Batterie portable', desc: 'Batterie externe 20 000 mAh 65 W qui charge un PC et deux téléphones à la fois.' },
    p13: { name: 'Frost Mini réfrigérateur', desc: 'Mini réfrigérateur thermoélectrique de 4 L pour bureau ou dortoir, quasi silencieux.' },
    p14: { name: 'Stride Bracelet fitness', desc: 'Bracelet fitness fin avec 14 jours d\'autonomie et étanchéité 5ATM.' },
    p15: { name: 'Echo Buds ANC', desc: 'Écouteurs true-wireless avec ANC hybride et audio spatial.' },
    p16: { name: 'Apex Manette de jeu', desc: 'Manette sans fil avec sticks à effet Hall, palettes arrière et verrous de gâchettes.' },
  },
};

const IT: CatalogL10n = {
  categories: { audio: 'Audio', wearables: 'Wearables', home: 'Casa', sports: 'Sport', accessories: 'Accessori', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Cuffie wireless', desc: 'Cuffie over-ear con cancellazione del rumore adattiva e 40 h di batteria.' },
    p2: { name: 'Pulse Smartwatch', desc: 'Smartwatch AMOLED con sensori di salute, GPS e batteria da 7 giorni.' },
    p3: { name: 'Echo Speaker intelligente', desc: 'Speaker intelligente potente con assistente vocale e sincronizzazione multi-room.' },
    p4: { name: 'Velocity Scarpe da corsa', desc: 'Scarpe da allenamento quotidiano con piastra in carbonio e schiuma energy-return.' },
    p5: { name: 'Zen Lampada da scrivania', desc: 'Lampada LED dimmerabile con preset circadiani e base di ricarica wireless.' },
    p6: { name: 'Trail Pro Zaino 28L', desc: 'Zaino impermeabile da 28 L con vano portatile sospeso e cinghie di carico.' },
    p7: { name: 'Nova Tastiera meccanica', desc: 'Tastiera meccanica 75% hot-swap con montaggio gasket e RGB.' },
    p8: { name: 'Orbit Mouse gaming', desc: 'Mouse gaming wireless da 26K DPI e 58 g con switch ottici.' },
    p9: { name: 'Breeze Ventilatore intelligente', desc: 'Ventilatore senza pale con controllo da app, modalità notte e filtro HEPA.' },
    p10: { name: 'Summit Tappetino yoga Pro', desc: 'Tappetino yoga in gomma naturale da 6 mm con guide di allineamento e tracolla.' },
    p11: { name: 'Lumen E-Reader', desc: 'E-reader a inchiostro elettronico da 7" con luce calda, audiolibri e 8 settimane di batteria.' },
    p12: { name: 'Titan Power bank', desc: 'Power bank da 20.000 mAh e 65 W che carica un laptop e due telefoni insieme.' },
    p13: { name: 'Frost Mini frigo', desc: 'Mini frigo termoelettrico da 4 L per scrivania o dormitorio, quasi silenzioso.' },
    p14: { name: 'Stride Bracciale fitness', desc: 'Bracciale fitness sottile con 14 giorni di batteria e impermeabilità 5ATM.' },
    p15: { name: 'Echo Buds ANC', desc: 'Auricolari true-wireless con ANC ibrido e audio spaziale.' },
    p16: { name: 'Apex Controller di gioco', desc: 'Controller wireless con stick a effetto Hall, paddle posteriori e blocco dei grilletti.' },
  },
};

const DE: CatalogL10n = {
  categories: { audio: 'Audio', wearables: 'Wearables', home: 'Zuhause', sports: 'Sport', accessories: 'Zubehör', gaming: 'Gaming' },
  products: {
    p1: { name: 'Aurora Kabellose Kopfhörer', desc: 'Over-Ear-Kopfhörer mit adaptiver Geräuschunterdrückung und 40 h Akku.' },
    p2: { name: 'Pulse Smartwatch', desc: 'AMOLED-Smartwatch mit Gesundheitssensoren, GPS und 7 Tagen Akkulaufzeit.' },
    p3: { name: 'Echo Smarte Lautsprecher', desc: 'Raumfüllender smarter Lautsprecher mit Sprachassistent und Multiroom-Sync.' },
    p4: { name: 'Velocity Laufschuhe', desc: 'Trainingsschuhe mit Carbonplatte und reaktiver Schaumsohle.' },
    p5: { name: 'Zen Schreibtischlampe', desc: 'Dimmbare LED-Schreibtischlampe mit circadianen Presets und kabelloser Ladestation.' },
    p6: { name: 'Trail Pro Rucksack 28L', desc: 'Wasserdichter 28-L-Rucksack mit hängendem Laptopfach und Lastkontrollriemen.' },
    p7: { name: 'Nova Mechanische Tastatur', desc: 'Hot-Swap-fähige 75-%-Tastatur mit Gasket-Mount und RGB.' },
    p8: { name: 'Orbit Gaming-Maus', desc: 'Kabellose Gaming-Maus mit 26K DPI und 58 g mit optischen Switches.' },
    p9: { name: 'Breeze Smarte Ventilator', desc: 'Flügelloser Ventilator mit App-Steuerung, Nachtmodus und HEPA-Filter.' },
    p10: { name: 'Summit Yogamatte Pro', desc: '6-mm-Yogamatte aus Naturkautschuk mit Ausrichtungslinien und Tragegurt.' },
    p11: { name: 'Lumen E-Reader', desc: '7-Zoll-E-Ink-Reader mit warmem Licht, Hörbüchern und 8 Wochen Akku.' },
    p12: { name: 'Titan Powerbank', desc: '20.000-mAh-Powerbank mit 65 W für Laptop und zwei Handys gleichzeitig.' },
    p13: { name: 'Frost Minikühlschrank', desc: 'Thermoelektrischer 4-L-Minikühlschrank für Schreibtisch oder Wohnheim, fast lautlos.' },
    p14: { name: 'Stride Fitnessband', desc: 'Schlankes Fitnessband mit 14 Tagen Akku und 5ATM-Wasserschutz.' },
    p15: { name: 'Echo Buds ANC', desc: 'True-Wireless-Ohrhörer mit hybridem ANC und Spatial Audio.' },
    p16: { name: 'Apex Game-Controller', desc: 'Kabelloser Controller mit Hall-Effekt-Sticks, Paddles und Trigger-Locks.' },
  },
};

const RU: CatalogL10n = {
  categories: { audio: 'Аудио', wearables: 'Носимые', home: 'Дом', sports: 'Спорт', accessories: 'Аксессуары', gaming: 'Игры' },
  products: {
    p1: { name: 'Aurora Беспроводные наушники', desc: 'Полноразмерные наушники с адаптивным шумоподавлением и 40 ч работы.' },
    p2: { name: 'Pulse Умные часы', desc: 'AMOLED-часы с датчиками здоровья, GPS и 7 днями работы.' },
    p3: { name: 'Echo Умная колонка', desc: 'Мощная умная колонка с голосовым ассистентом и мультирум-синхронизацией.' },
    p4: { name: 'Velocity Кроссовки', desc: 'Кроссовки для ежедневных тренировок с карбоновой пластиной и упругой пеной.' },
    p5: { name: 'Zen Настольная лампа', desc: 'Диммируемая LED-лампа с циркадными пресетами и беспроводной зарядкой.' },
    p6: { name: 'Trail Pro Рюкзак 28L', desc: 'Влагозащищённый рюкзак 28 л с подвесным отделением для ноутбука.' },
    p7: { name: 'Nova Механическая клавиатура', desc: 'Клавиатура 75% с горячей заменой свитчей, gasket-монтажом и RGB.' },
    p8: { name: 'Orbit Игровая мышь', desc: 'Беспроводная игровая мышь 26K DPI, 58 г, с оптическими свитчами.' },
    p9: { name: 'Breeze Умный вентилятор', desc: 'Безлопастной вентилятор с управлением из приложения, ночным режимом и HEPA-фильтром.' },
    p10: { name: 'Summit Коврик для йоги Pro', desc: 'Коврик из натурального каучука 6 мм с разметкой и ремнём для переноски.' },
    p11: { name: 'Lumen Электронная книга', desc: 'Ридер E-Ink 7" с тёплой подсветкой, аудиокнигами и 8 неделями работы.' },
    p12: { name: 'Titan Пауэрбанк', desc: 'Пауэрбанк 20 000 мА·ч на 65 Вт для ноутбука и двух телефонов сразу.' },
    p13: { name: 'Frost Мини-холодильник', desc: 'Термоэлектрический мини-холодильник 4 л для стола или общежития, почти бесшумный.' },
    p14: { name: 'Stride Фитнес-браслет', desc: 'Тонкий фитнес-браслет с 14 днями работы и водозащитой 5ATM.' },
    p15: { name: 'Echo Buds ANC', desc: 'Полностью беспроводные наушники с гибридным ANC и пространственным звуком.' },
    p16: { name: 'Apex Геймпад', desc: 'Беспроводной контроллер с Hall-стиками, задними кнопками и блокировкой триггеров.' },
  },
};

const JA: CatalogL10n = {
  categories: { audio: 'オーディオ', wearables: 'ウェアラブル', home: 'ホーム', sports: 'スポーツ', accessories: 'アクセサリー', gaming: 'ゲーミング' },
  products: {
    p1: { name: 'Aurora ワイヤレスヘッドホン', desc: '適応型ノイズキャンセリング搭載のオーバーイヤーヘッドホン。バッテリー40時間。' },
    p2: { name: 'Pulse スマートウォッチ', desc: '健康センサーとGPSを搭載したAMOLEDスマートウォッチ。7日間持続。' },
    p3: { name: 'Echo スマートスピーカー', desc: '音声アシスタントとマルチルーム同期対応のスマートスピーカー。' },
    p4: { name: 'Velocity ランニングシューズ', desc: 'カーボンプレートと高反発フォームを採用したデイリートレーナー。' },
    p5: { name: 'Zen デスクランプ', desc: '調光可能なLEDランプ。サーカディアンプリセットとワイヤレス充電付き。' },
    p6: { name: 'Trail Pro バックパック28L', desc: '防水28Lバックパック。ノートPC収納とロードリフター付き。' },
    p7: { name: 'Nova メカニカルキーボード', desc: 'ホットスワップ対応75%レイアウト。ガスケットマウントとRGB搭載。' },
    p8: { name: 'Orbit ゲーミングマウス', desc: '26K DPI・58gのワイヤレスゲーミングマウス。光学スイッチ搭載。' },
    p9: { name: 'Breeze スマートファン', desc: '羽根のないスマートファン。アプリ操作・ナイトモード・HEPAフィルター。' },
    p10: { name: 'Summit ヨガマット Pro', desc: '天然ゴム製6mmヨガマット。アライメントガイドとキャリーストラップ付き。' },
    p11: { name: 'Lumen 電子書籍リーダー', desc: '7インチE-Inkリーダー。暖色ライト・オーディオブック対応で8週間持続。' },
    p12: { name: 'Titan モバイルバッテリー', desc: '20,000mAh・65W対応。ノートPCとスマホ2台を同時充電。' },
    p13: { name: 'Frost ミニ冷蔵庫', desc: 'デスクや寮向け4Lサーモ冷蔵庫。ほぼ無音。' },
    p14: { name: 'Stride フィットネスバンド', desc: '14日間持続のスリムなバンド。5ATM防水対応。' },
    p15: { name: 'Echo Buds ANC', desc: 'ハイブリッドANCと空間オーディオ対応の完全ワイヤレスイヤホン。' },
    p16: { name: 'Apex ゲームコントローラー', desc: 'Hallスティック・背面パドル・トリガーロック搭載のワイヤレスコントローラー。' },
  },
};

const ZH: CatalogL10n = {
  categories: { audio: '音频', wearables: '可穿戴设备', home: '家居', sports: '运动', accessories: '配件', gaming: '游戏' },
  products: {
    p1: { name: 'Aurora 无线耳机', desc: '头戴式耳机，支持自适应降噪，续航 40 小时。' },
    p2: { name: 'Pulse 智能手表', desc: 'AMOLED 智能手表，配备健康传感器、GPS，续航 7 天。' },
    p3: { name: 'Echo 智能音箱', desc: '声场饱满的智能音箱，支持语音助手与多房间同步。' },
    p4: { name: 'Velocity 跑步鞋', desc: '碳板日常训练跑鞋，搭载能量回弹泡棉。' },
    p5: { name: 'Zen 台灯', desc: '可调光 LED 台灯，带昼夜节律预设与无线充电底座。' },
    p6: { name: 'Trail Pro 背包 28L', desc: '28 升防泼水背包，配备悬浮笔记本仓与负重调节带。' },
    p7: { name: 'Nova 机械键盘', desc: '75% 热插拔机械键盘，gasket 结构，带 RGB。' },
    p8: { name: 'Orbit 游戏鼠标', desc: '26K DPI 无线游戏鼠标，58 克，光学微动。' },
    p9: { name: 'Breeze 智能风扇', desc: '无叶智能风扇，支持 App 控制、夜间模式与 HEPA 滤网。' },
    p10: { name: 'Summit 瑜伽垫 Pro', desc: '6mm 天然橡胶瑜伽垫，带体位对齐线与背带。' },
    p11: { name: 'Lumen 电子书阅读器', desc: '7 英寸电子墨水阅读器，暖光、有声书，续航 8 周。' },
    p12: { name: 'Titan 充电宝', desc: '20,000mAh、65W，可同时为笔记本和两部手机充电。' },
    p13: { name: 'Frost 迷你冰箱', desc: '4 升半导体制冷迷你冰箱，适合桌面或宿舍，近乎静音。' },
    p14: { name: 'Stride 手环', desc: '轻薄手环，14 天续航，5ATM 防水。' },
    p15: { name: 'Echo Buds ANC', desc: '真无线耳机，混合式 ANC 与空间音频。' },
    p16: { name: 'Apex 游戏手柄', desc: '霍尔摇杆无线手柄，带背部拨片与扳机锁。' },
  },
};

export const CATALOG_I18N: Record<LocaleCode, CatalogL10n> = {
  es: ES,
  en: EN,
  pt: PT,
  fr: FR,
  it: IT,
  de: DE,
  ru: RU,
  ja: JA,
  'zh-CN': ZH,
};

/** Localized product name (falls back to the English base). */
export function l10nProductName(id: string, locale: LocaleCode, fallback: string): string {
  return CATALOG_I18N[locale]?.products[id]?.name ?? fallback;
}

/** Localized product description (falls back to the English base). */
export function l10nProductDesc(id: string, locale: LocaleCode, fallback: string): string {
  return CATALOG_I18N[locale]?.products[id]?.desc ?? fallback;
}

/** Localized category name (falls back to the slug). */
export function l10nCategory(slug: string, locale: LocaleCode): string {
  return CATALOG_I18N[locale]?.categories[slug] ?? slug;
}
