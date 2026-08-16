// @ts-nocheck — los cuerpos pre-build deben ser JS puro (se ejecutan via new Function en build time)
/**
 * astra-blog — Pre-Built Data Layer
 *
 * Los cuerpos de las llamadas pre-build DEBEN ser JS puro (sin anotaciones
 * de tipos): el compilador los ejecuta en build time vía `new Function`,
 * y una anotación TypeScript rompería el parseo. La seguridad de tipos la
 * garantizan los casts explícitos en db.ts.
 *
 * TODAS las peticiones de datos de este blog usan `server({ type: 'pre-build' })`.
 * El compilador de AstraJS ejecuta cada función EN BUILD TIME (durante
 * `vite build` o al transformar en dev) e inlina el resultado como una
 * constante JSON en el bundle. Consecuencias:
 *
 *   1. Cero fetch en runtime — el cliente nunca llama a una API.
 *   2. Cero KB de JavaScript para las queries — solo datos.
 *   3. Las "tablas" se generan dentro del cuerpo de cada función
 *      (el ejecutor de build-time no tiene acceso al scope del módulo),
 *      simulando una base de datos que se consulta al construir el sitio.
 *
 * Las rutas dinámicas (/blog/:slug, /authors/:a/posts/:p, …) resuelven
 * sus parámetros contra estas constantes pre-construidas vía la capa
 * de consultas de `db-core.ts`.
 */
import { server } from 'astrajs.dev/server';

// ─── Config del sitio ────────────────────────────────────────────────────────
export const getSiteConfig = server({ type: 'pre-build', tags: ['site'] }, async () => {
  return {
    name: 'Flores del Mundo',
    tagline: 'El atlas floral que florece antes de que lo pidas',
    description:
      'Historias, cuidados y curiosidades de las flores de cada continente. Cada página de este blog es una petición pre-construida: los datos se resolvieron en build time.',
    nav: [
      { label: 'Inicio', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: 'Regiones', href: '/categories/asia' },
      { label: 'Autores', href: '/authors/luna-vega' },
      { label: 'Acerca de', href: '/about' },
      { label: 'Contacto', href: '/contact' },
    ],
    footer: {
      about:
        'Flores del Mundo es el atlas floral de AstraJS. 100% generado con datos pre-construidos: sin API, sin base de datos en runtime, sin estado de servidor.',
      columns: [
        {
          title: 'Categorías',
          links: [
            { label: 'Asia', href: '/categories/asia' },
            { label: 'Europa', href: '/categories/europa' },
            { label: 'América', href: '/categories/america' },
            { label: 'África', href: '/categories/africa' },
          ],
        },
        {
          title: 'Autores',
          links: [
            { label: 'Luna Vega', href: '/authors/luna-vega' },
            { label: 'Diego Solís', href: '/authors/diego-solis' },
            { label: 'Inés Quiroz', href: '/authors/ines-quiroz' },
          ],
        },
        {
          title: 'Sitio',
          links: [
            { label: 'Acerca de', href: '/about' },
            { label: 'Contacto', href: '/contact' },
            { label: 'Blog', href: '/blog' },
          ],
        },
      ],
    },
    socials: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Discord', href: 'https://discord.com' },
      { label: 'X', href: 'https://x.com' },
    ],
  };
});

// ─── Autores ─────────────────────────────────────────────────────────────────
export const getAuthors = server({ type: 'pre-build', tags: ['authors'] }, async () => {
  return [
    {
      slug: 'luna-vega',
      name: 'Luna Vega',
      role: 'Botánica & Flores de Asia',
      avatar: '🌸',
      location: 'Kioto, Japón',
      joined: '2025-03',
      bio:
        'Luna vive en Kioto y documenta los jardines de Oriente desde la floración del primer cerezo. Escribe sobre sakura, lotos y la ceremonia del hanami con precisión de botánica.',
      socials: { github: 'luna-vega', x: '@lunavega_floral', site: 'lunavega.flor' },
      specialties: ['Sakura', 'Jardines japoneses', 'Hanami'],
    },
    {
      slug: 'diego-solis',
      name: 'Diego Solís',
      role: 'Horticultor & Cuidados',
      avatar: '🌿',
      location: 'Bogotá, Colombia',
      joined: '2025-01',
      bio:
        'Diego mantiene vivas más macetas de las que puede contar. Sus guías de riego, poda y sustratos salvan orquídeas cada semana — la suya incluida.',
      socials: { github: 'diego-solis', x: '@dsolis_jardin', site: 'diegosolis.co' },
      specialties: ['Riego', 'Poda', 'Sustratos'],
    },
    {
      slug: 'ines-quiroz',
      name: 'Inés Quiroz',
      role: 'Paisajista & Flores de Europa',
      avatar: '🌷',
      location: 'Ámsterdam, Países Bajos',
      joined: '2025-02',
      bio:
        'Inés estudió paisajismo en Ámsterdam y ha caminado cada campo de tulipanes de Holanda. Su especialidad: los jardines de campo y la lavanda de la Provenza.',
      socials: { github: 'ines-quiroz', x: '@iquiroz_garden', site: 'inesq.eu' },
      specialties: ['Tulipanes', 'Jardines de campo', 'Lavanda'],
    },
    {
      slug: 'marco-leon',
      name: 'Marco León',
      role: 'Explorador & Flores de América',
      avatar: '🌻',
      location: 'Austin, EE. UU.',
      joined: '2025-05',
      bio:
        'Marco persigue superblooms de costa a costa: girasoles en Texas, amapolas en California y orquídeas en la niebla de los Andes. Su mochila pesa más por las semillas que por la cámara.',
      socials: { github: 'marco-leon', x: '@mleond_bloom', site: 'marcoleon.co' },
      specialties: ['Girasoles', 'Superblooms', 'Orquídeas'],
    },
    {
      slug: 'val-montes',
      name: 'Valeria Montes',
      role: 'Botánica & Flores de África',
      avatar: '🌺',
      location: 'Ciudad del Cabo, Sudáfrica',
      joined: '2025-06',
      bio:
        'Valeria estudia el fynbos sudafricano, el reino floral más pequeño y diverso del planeta. Escribe sobre proteas, lirios del Nilo y jardines que sobreviven al fuego.',
      socials: { github: 'val-montes', x: '@valmontes_fynbos', site: 'valmontes.africa' },
      specialties: ['Proteas', 'Fynbos', 'Lirios'],
    },
  ];
});

// ─── Categorías y tags ───────────────────────────────────────────────────────
export const getTaxonomy = server({ type: 'pre-build', tags: ['taxonomy'] }, async () => {
  return {
    categories: [
      { slug: 'asia', name: 'Flores de Asia', icon: '🌸', description: 'Sakura, lotos y glicinas: los jardines de Oriente.' },
      { slug: 'europa', name: 'Flores de Europa', icon: '🌷', description: 'Tulipanes, lavandas y flores de alta montaña.' },
      { slug: 'america', name: 'Flores de América', icon: '🌻', description: 'Girasoles, orquídeas y desiertos en flor.' },
      { slug: 'africa', name: 'Flores de África', icon: '🌺', description: 'Proteas y lirios: los jardines del sur.' },
      { slug: 'cuidados', name: 'Cuidados', icon: '🪴', description: 'Riego, poda y tierra: el oficio de mantenerlas vivas.' },
      { slug: 'curiosidades', name: 'Curiosidades', icon: '📖', description: 'Historias, símbolos y récords del mundo floral.' },
    ],
    tags: [
      'sakura', 'loto', 'glicina', 'tulipan', 'lavanda', 'edelweiss', 'girasol',
      'orquidea', 'amapola', 'protea', 'hibisco', 'rosa', 'camelias', 'jazmin',
    ],
  };
});

// ─── Índice de posts (metadatos) ─────────────────────────────────────────────
export const getPostsIndex = server({ type: 'pre-build', tags: ['posts'] }, async () => {
  // slug, author, category, title, excerpt, tags, date, reading, featured, views
  const ROWS = [
    ['sakura-japon', 'luna-vega', 'asia', 'Sakura: el cerezo que detiene Japón',
      'Cada primavera, millones de personas hacen picnic bajo los cerezos en flor. Qué hay detrás del hanami y por qué el sakura es mucho más que una flor.',
      ['sakura'], '2026-01-08', 9, 1, 15200],
    ['loto-sagrado', 'luna-vega', 'asia', 'El loto sagrado: la flor que nace del lodo',
      'Crece en aguas turbias y emerge impecable. La historia, el simbolismo y los trucos para cultivarlo en tu estanque.',
      ['loto'], '2026-01-15', 8, 0, 9100],
    ['glicina-fuji', 'luna-vega', 'asia', 'Glicinas de Fuji: cascadas moradas de primavera',
      'Los túneles de glicinas del parque Ashikaga parecen de otro planeta. Cómo crecen, cuánto viven y por qué huelen tan bien.',
      ['glicina'], '2026-01-22', 7, 0, 7400],
    ['tulipanes-holanda', 'ines-quiroz', 'europa', 'Tulipanes de Holanda: la burbuja que se volvió mar',
      'De bulbos más caros que una casa a millones de flores en fila. La historia completa del tulipán y dónde ver los campos hoy.',
      ['tulipan'], '2026-02-02', 10, 1, 13800],
    ['lavanda-provenza', 'ines-quiroz', 'europa', 'Lavanda de Provenza: el mar morado de Francia',
      'Valensole en julio es un océano púrpura con olor a verano. Cuándo ir, qué variedades existen y cómo cultivarla en maceta.',
      ['lavanda'], '2026-02-10', 8, 0, 8700],
    ['edelweiss-alpes', 'ines-quiroz', 'europa', 'Edelweiss: la flor de las alturas',
      'Crece donde casi nada sobrevive, entre rocas y nieve. La leyenda alpina de la flor más famosa de las montañas.',
      ['edelweiss'], '2026-02-18', 7, 0, 6300],
    ['girasoles-campo', 'marco-leon', 'america', 'Girasoles: los relojes que siguen al sol',
      'Giran siguiendo la luz desde el amanecer. Por qué lo hacen, cuánto miden los récords y dónde están los campos más grandes de América.',
      ['girasol'], '2026-03-01', 8, 1, 11200],
    ['orquideas-colombia', 'marco-leon', 'america', 'Orquídeas de Colombia: 4.000 especies en un país',
      'Colombia es el país con más especies de orquídeas del mundo. Un recorrido por sus bosques de niebla y sus flores más raras.',
      ['orquidea'], '2026-03-09', 9, 0, 9500],
    ['amapolas-california', 'marco-leon', 'america', 'Amapolas de California: el superbloom',
      'Unos años, el desierto explota en naranja. Qué es un superbloom, cuándo ocurre y cómo verlo sin pisotearlo.',
      ['amapola'], '2026-03-17', 7, 0, 8200],
    ['protea-rey', 'val-montes', 'africa', 'La protea rey: una flor de la era de los dinosaurios',
      'Las proteas llevan en la Tierra más de 90 millones de años. La historia del fynbos sudafricano y su flor insignia.',
      ['protea'], '2026-03-25', 8, 1, 9900],
    ['ave-del-paraiso', 'val-montes', 'africa', 'Ave del paraíso: la grulla naranja de Sudáfrica',
      'Parece un pájaro a punto de volar. Por qué se llama así, cómo se poliniza y cómo cuidarla en casa.',
      ['hibisco'], '2026-04-02', 6, 0, 6800],
    ['lirio-nilo', 'val-montes', 'africa', 'Lirios del Nilo: azul sobre el río',
      'Esferas azules que bordean caminos y ríos de medio mundo. Del Nilo a tu jardín: la historia del agapanthus.',
      ['loto'], '2026-04-10', 6, 0, 5700],
    ['regar-sin-ahogar', 'diego-solis', 'cuidados', 'Regar sin ahogar: la regla de oro de las macetas',
      'Más plantas mueren por exceso de agua que por sequía. Cómo saber cuándo regar, cuánto, y por qué el dedo sigue siendo la mejor herramienta.',
      ['orquidea', 'lavanda'], '2026-04-18', 7, 0, 7100],
    ['poda-primavera', 'diego-solis', 'cuidados', 'Poda de primavera: cuándo y cómo cortar',
      'Cortar mal mata más que no cortar. La guía por tipo de planta para podar en la ventana exacta y conseguir más flores.',
      ['rosa', 'camelias'], '2026-04-26', 8, 0, 6400],
    ['tierra-perfecta', 'diego-solis', 'cuidados', 'La tierra perfecta: mezcla por tipo de flor',
      'Cada flor quiere un suelo distinto: ácido, arenoso, rico en humus. Cómo preparar el sustrato exacto para tulipanes, girasoles y orquídeas.',
      ['tulipan', 'girasol'], '2026-05-05', 7, 0, 5900],
    ['lenguaje-de-las-flores', 'luna-vega', 'curiosidades', 'El lenguaje de las flores: lo que un ramo dice',
      'En la época victoriana, un ramo era una carta de amor cifrada. El diccionario de la floriografía y lo que regalar (y no regalar) hoy.',
      ['rosa'], '2026-05-14', 9, 1, 8800],
    ['flores-comestibles', 'ines-quiroz', 'curiosidades', 'Flores que se comen: del huerto al plato',
      'Capuchinas picantes, hibiscos en infusión, caléndulas en ensalada. Cuáles flores se comen, cuáles no, y cómo cultivarlas.',
      ['hibisco'], '2026-05-22', 7, 0, 6100],
    ['reloj-floral-linneo', 'marco-leon', 'curiosidades', 'El reloj floral de Linneo: la hora según las flores',
      'Cada especie abre y cierra a su hora exacta. El sueño de Linneo de un jardín que da la hora, y por qué casi funciona.',
      ['jazmin'], '2026-06-01', 6, 0, 5400],
  ];
  return {
    posts: ROWS.map(function (row) {
      return {
        slug: row[0],
        authorSlug: row[1],
        categorySlug: row[2],
        title: row[3],
        excerpt: row[4],
        tags: row[5],
        date: row[6],
        readingMinutes: row[7],
        featured: row[8] === 1,
        views: row[9],
      };
    }),
  };
});

// ─── Cuerpos completos de los posts (contenido pesado) ───────────────────────
export const getPostBodies = server({ type: 'pre-build', tags: ['posts', 'bodies'] }, async () => {
  const SEEDS = [
    {
      slug: 'sakura-japon',
      intro: 'Cada primavera, Japón entero se detiene bajo los cerezos en flor. El sakura es efímero — dura apenas una semana — y esa brevedad es, exactamente, su encanto.',
      sections: [
        ['El hanami, la fiesta de mirar flores', 'Hanami significa, literalmente, "mirar flores". Familias enteras extienden lonas azules bajo los árboles, comparten comida y observan los pétalos caer como nieve rosa.', 'La tradición tiene más de mil años: nació en la corte imperial de Nara, y hoy la cadena de floración se sigue por televisión, de sur a norte, como una ola que sube por el archipiélago.'],
        ['Dónde y cuándo florece', 'La floración empieza en Okinawa a finales de enero y llega a Hokkaidō en mayo. Los parques de Ueno, las riberas del Meguro y el monte Yoshino concentran los mejores ejemplares.', 'El pronóstico del sakura (sakura-zensen) se publica cada febrero y se corrige semana a semana: un error de dos días cambia la fecha de millones de reservas.'],
        ['Mucho más que una flor', 'El cerezo en flor es el símbolo nacional no oficial: aparece en monedas, uniformes y canciones. Su caída rápida se lee como metáfora del samurái y de la vida misma.', 'La variedad más famosa, la somei-yoshino, no produce fruta: fue criada solo por su flor. Casi todos los ejemplares son clones de un único árbol original.'],
      ],
      bullets: ['El hanami se celebra desde el período Nara', 'La ola de floración sube de Okinawa a Hokkaidō', 'Somei-yoshino: una variedad clonada, criada solo por flores', 'La flor dura unos siete días: por eso importa tanto'],
      quote: 'La flor del cerezo no se apresura a florecer, ni se lamenta al caer.',
      codeTitle: 'Ficha técnica — Sakura',
      code: [
        'Familia: Rosaceae · Prunus serrulata',
        'Origen: Japón, Corea, China',
        'Floración: marzo – mayo (según latitud)',
        'Luz: pleno sol · Suelo: bien drenado',
        'Altura: 5 – 12 m · Vida: 20 – 30 años',
      ].join('\n'),
    },
    {
      slug: 'loto-sagrado',
      intro: 'El loto crece en el agua más turbia y emerge impecable, pétalo a pétalo. Por eso medio mundo lo convirtió en símbolo: pureza, renacimiento, desapego.',
      sections: [
        ['La flor que se limpia sola', 'Las hojas del loto repelen el agua gracias a una microestructura cerosa: las gotas ruedan y se llevan el barro consigo. Es el llamado efecto loto, que la nanotecnología imita hoy.', 'Cada noche la flor se cierra y cada mañana vuelve a abrirse, tres días seguidos. Después deja caer los pétalos y deja ver la cápsula de semillas, un panal perfecto.'],
        ['Símbolo de tres religiones', 'En el budismo representa la iluminación que nace del sufrimiento; en el hinduismo sostiene a dioses enteros; en el antiguo Egipto, el loto azul era la flor del sol que renace.', 'No es casualidad: es una de las pocas plantas que florece y fructifica al mismo tiempo, pasado y futuro en un solo tallo.'],
        ['Cómo cultivarlo en casa', 'Solo necesitas un estanque o un macetón grande con 30 cm de agua quieta y pleno sol. Las semillas pueden germinar décadas después: hay registros de lotos nacidos de semillas con 1.300 años.', 'En invierno entra en reposo; no lo descartes: en primavera los rizomas brotan de nuevo con más fuerza.'],
      ],
      bullets: ['Efecto loto: sus hojas se autolimpian con agua', 'Florece y fructifica al mismo tiempo', 'Símbolo central en budismo, hinduismo y Egipto antiguo', 'Semillas viables después de 1.300 años'],
      quote: 'Ningún barro puede manchar a quien decide florecer.',
      codeTitle: 'Ficha técnica — Loto',
      code: [
        'Familia: Nelumbonaceae · Nelumbo nucifera',
        'Origen: Asia tropical y templada',
        'Floración: junio – septiembre',
        'Agua: 30 – 60 cm quieta · Sol pleno',
        'Diámetro de flor: 15 – 30 cm',
      ].join('\n'),
    },
    {
      slug: 'glicina-fuji',
      intro: 'En el parque Ashikaga de Japón, dos glicinas centenarias forman un techo de 1.000 metros cuadrados. Caminar bajo sus racimos morados es como entrar en una cascada con olor.',
      sections: [
        ['Cascadas que cuelgan', 'Los racimos de la glicina japonesa pueden medir más de un metro y medio. Cuelgan en abril como uvas gigantes, en tonos que van del blanco al violeta profundo.', 'El gran árbol de Ashikaga tiene más de 150 años y su copa está sostenida por un enrejado de postes: la glicina es una trepadora que se vuelve escultura con el tiempo.'],
        ['Una trepadora con carácter', 'La glicina abraza lo que encuentra — pérgolas, muros, otros árboles — y puede doblar barandas débiles con la fuerza de su leño retorcido.', 'Podarla es obligatorio dos veces al año: una poda ligera en verano y una de formación en invierno. Sin poda, crece hojas y no flores.'],
        ['Significado y color', 'En el lenguaje de las flores, la glicina significa bienvenida y amistad persistente. El fuji morado aparece en escudos de clanes y en los kimonos de primavera.', 'En Occidente fue un símbolo romántico de la época victoriana: colgarla en el pórtico era invitar a los viajeros a quedarse.'],
      ],
      bullets: ['Racimos de hasta 1,5 metros de largo', 'El gran árbol de Ashikaga cubre 1.000 m²', 'Poda de verano e invierno: sin poda, sin flores', 'Símbolo de bienvenida en Japón y en la Inglaterra victoriana'],
      quote: 'Lo que cuelga con paciencia, florece con fuerza.',
      codeTitle: 'Ficha técnica — Glicina',
      code: [
        'Familia: Fabaceae · Wisteria floribunda',
        'Origen: Japón (fuji) · China (sinensis)',
        'Floración: abril – mayo',
        'Soporte: pérgola o muro firme · Sol pleno',
        'Poda: 2 veces al año · Vida: más de 100 años',
      ].join('\n'),
    },
    {
      slug: 'tulipanes-holanda',
      intro: 'Un solo bulbo de tulipán llegó a valer el precio de una casa en Ámsterdam. Hoy, Holanda planta tres mil millones de bulbos al año y los campos parecen banderas tendidas en el suelo.',
      sections: [
        ['La burbuja más florida de la historia', 'En la década de 1630, los bulbos raros se compraban y revendían en tabernas antes de ser plantados. El tulipán Semper Augustus, rojo con llamas blancas, alcanzó el valor de una casa junto al canal.', 'La burbuja reventó en 1637, pero dejó una lección económica que se sigue estudiando — y un país enamorado de la flor para siempre.'],
        ['Franjas de color perfecto', 'Los campos entre Leiden y Lisse forman franjas rectas de rojo, amarillo y violeta: una agricultura de precisión nacida de siglos de drenaje de pólderes.', 'Keukenhof, el jardín de bulbos más grande del mundo, planta siete millones de bulbos cada otoño y abre solo ocho semanas: lo efímero es parte del negocio.'],
        ['De Asia Central a tu maceta', 'El tulipán no nació en Holanda: viene de las estepas de Asia Central, donde el Imperio otomano lo cultivó antes que nadie. Su nombre viene del turbante que la flor parece imitar.', 'En maceta, necesita frío: los bulbos plantados en otoño pasan el invierno bajo tierra y florecen en primavera. Sin ese reposo frío, no hay flor.'],
      ],
      bullets: ['Un bulbo llegó a valer una casa en 1637', 'Países Bajos planta 3.000 millones de bulbos al año', 'Keukenhof: 7 millones de bulbos para 8 semanas', 'El nombre viene del turbante otomano'],
      quote: 'La flor más cara de la historia terminó valiendo lo que siempre valió: una primavera.',
      codeTitle: 'Ficha técnica — Tulipán',
      code: [
        'Familia: Liliaceae · Tulipa',
        'Origen: Asia Central (cultivado por otomanos)',
        'Plantación: otoño · Floración: marzo – mayo',
        'Frío necesario: 12 – 16 semanas bajo 5 °C',
        'Altura: 20 – 70 cm según variedad',
      ].join('\n'),
    },
    {
      slug: 'lavanda-provenza',
      intro: 'En julio, la meseta de Valensole se convierte en un océano morado con olor a verano. La lavanda de Provenza es un paisaje, un perfume y una industria que se cosecha a mano.',
      sections: [
        ['El mar morado de Valensole', 'Entre finales de junio y principios de agosto, los campos de la Provenza francesa florecen en filas que huelen a kilómetros. Los pueblos de Valensole y Sault viven de esa marea púrpura.', 'El momento exacto de la cosecha lo decide el aroma: cuando la esencia alcanza su pico, las destilerías trabajan día y noche durante tres semanas.'],
        ['No toda la lavanda es igual', 'La lavanda fina (Lavandula angustifolia) crece por encima de los 800 metros y es la de perfume; el lavandín, un híbrido rústico, rinde el triple y huele más alcanforado.', 'La diferencia importa: una botella de aceite esencial puede llevar cualquiera de las dos, pero la etiqueta "lavande fine AOP" garantiza la especie noble y la altitud.'],
        ['De la Provenza a tu balcón', 'La lavanda solo pide tres cosas: sol, suelo pobre y riego escaso. Es la planta perfecta para principiantes: casi todas las plagas la ignoran.', 'Pódala después de florecer para mantener la mata compacta; si no, se vuelve leñosa y pierde forma en dos temporadas.'],
      ],
      bullets: ['Valensole florece entre junio y agosto', 'Lavanda fina > 800 m: la de perfume', 'El lavandín rinde el triple pero huele distinto', 'Sol, suelo pobre y riego escaso: el secreto completo'],
      quote: 'Donde la tierra es más pobre, la lavanda huele mejor.',
      codeTitle: 'Ficha técnica — Lavanda',
      code: [
        'Familia: Lamiaceae · Lavandula angustifolia',
        'Origen: cuenca mediterránea',
        'Floración: junio – agosto',
        'Suelo: pobre y calcáreo · Riego: escaso',
        'Poda anual tras la floración',
      ].join('\n'),
    },
    {
      slug: 'edelweiss-alpes',
      intro: 'La edelweiss crece entre rocas, nieve y viento, a más de 2.000 metros. Su aspecto aterciopelado y su fama de inalcanzable la convirtieron en la flor más legendaria de los Alpes.',
      sections: [
        ['Una estrella de fieltro', 'Lo que parece una flor de pétalos blancos es un truco: las "pétalos" son brácteas cubiertas de pelusa lanuda que protege a las diminutas flores amarillas del centro.', 'Ese abrigo de pelos refleja la radiación ultravioleta de la alta montaña y retiene humedad: un traje de astronauta en miniatura.'],
        ['La flor que los montañistas ganaban', 'En el siglo XIX, arrancar una edelweiss era la prueba de amor definitiva — y de valor. Tantos murieron intentándolo que hoy la planta está protegida en casi todos los países alpinos.', 'Su recolección está prohibida en estado silvestre: Austria, Suiza y Alemania la cuidan como símbolo nacional.'],
        ['Cómo cultivarla en el llano', 'Contra la leyenda, la edelweiss se cultiva bien en maceta: solo exige suelo calcáreo con buen drenaje y sol directo, pero sin calor extremo.', 'Las variedades comerciales no pierden su encanto: las mismas brácteas lanudas, sin riesgo de avalancha.'],
      ],
      bullets: ['Sus "pétalos" blancos son brácteas lanudas', 'La pelusa filtra la radiación UV de altura', 'Protegida en los Alpes: arrancarla es ilegal', 'En maceta: suelo calcáreo, drenaje y sol'],
      quote: 'La flor más valiente no grita: se abriga.',
      codeTitle: 'Ficha técnica — Edelweiss',
      code: [
        'Familia: Asteraceae · Leontopodium alpinum',
        'Origen: Alpes, Cárpatos, Pirineos',
        'Floración: julio – septiembre',
        'Altitud natural: 1.800 – 3.000 m',
        'Cultivo: suelo calcáreo, pleno sol',
      ].join('\n'),
    },
    {
      slug: 'girasoles-campo',
      intro: 'Los girasoles giran con el sol desde el amanecer: sus cabezas siguen la luz como antenas vivas. Por eso los campos de girasol parecen mirarte mientras cruzas la carretera.',
      sections: [
        ['Relojes vegetales', 'El heliotropismo es el baile diario del girasol joven: por la mañana mira al este, al mediodía al cenit y al atardecer al oeste. Por la noche, vuelve a empezar.', 'Cuando madura, se detiene mirando al este para siempre. Los científicos siguen discutiendo por qué — quizá para calentarse al primer sol de la mañana y atraer más polinizadores.'],
        ['El récord de altura', 'El girasol más alto registrado midió 9,17 metros: una torre de tres pisos con una sola flor. El récord mundial de cabeza más ancha supera los 82 centímetros.', 'El secreto de esas marcas es la genética rusa: variedades criadas para aceite crecen descomunales con riego constante.'],
        ['Mucho más que un adorno', 'Cada cabeza es en realidad una inflorescencia con cientos de flores diminutas: las del borde fingen pétalos y las del centro se convierten en semillas.', 'Y las semillas se ordenan en espirales que siguen la sucesión de Fibonacci: la forma más compacta de empaquetar el futuro.'],
      ],
      bullets: ['Heliotropismo: siguen al sol de este a oeste', 'El récord mundial mide 9,17 metros', 'Una cabeza = cientos de flores diminutas', 'Sus espirales siguen la secuencia de Fibonacci'],
      quote: 'Para mirar al sol todos los días, hay que saber volver al este cada noche.',
      codeTitle: 'Ficha técnica — Girasol',
      code: [
        'Familia: Asteraceae · Helianthus annuus',
        'Origen: América del Norte',
        'Floración: verano · 80 – 120 días desde siembra',
        'Altura: 1 – 3 m (récord: 9,17 m)',
        'Luz: pleno sol · Riego: moderado',
      ].join('\n'),
    },
    {
      slug: 'orquideas-colombia',
      intro: 'Colombia alberga más de 4.000 especies de orquídeas — el récord mundial. En sus bosques de niebla viven flores que imitan abejas, zapatillas y mariposas con precisión obsesiva.',
      sections: [
        ['El país con más orquídeas', 'Ningún país supera a Colombia en especies de orquídeas: la combinación de tres cordilleras, dos océanos y bosques de niebla crea un laboratorio evolutivo único.', 'Se descubren especies nuevas cada año, muchas en los robledales de los Andes, a más de 2.000 metros, donde las nubes se posan sobre el musgo.'],
        ['Flores que engañan', 'Muchas orquídeas no ofrecen néctar: imitan a insectos hembra para atraer machos que las polinizan confundidos. Otras huelen a podredumbre para seducir moscas.', 'La Cattleya trianae — la flor nacional de Colombia — pinta sus pétalos con los colores de la bandera en algunas variedades, o eso juran sus admiradores.'],
        ['Cuidarlas sin ahogarlas', 'La mayoría de orquídeas son epífitas: viven sobre los árboles, con las raíces al aire. En casa, maceta transparente con corteza de pino, luz filtrada y riego cuando las raíces se vean plateadas.', 'El error clásico es regar de más: una orquídea aguanta semanas sin agua, pero muere en días con las raíces encharcadas.'],
      ],
      bullets: ['Colombia: 4.000+ especies, récord mundial', 'Bosques de niebla sobre los 2.000 metros', 'Muchas engañan polinizadores imitando insectos', 'Epífitas: raíces al aire, riego cuando platean'],
      quote: 'La flor más rara no pide agua: pide niebla.',
      codeTitle: 'Ficha técnica — Orquídea',
      code: [
        'Familia: Orchidaceae · Cattleya trianae',
        'Origen: bosques de niebla de los Andes',
        'Floración: diciembre – marzo',
        'Sustrato: corteza de pino, maceta transparente',
        'Luz: filtrada · Riego: cuando las raíces platean',
      ].join('\n'),
    },
    {
      slug: 'amapolas-california',
      intro: 'Algunos años, el desierto de California explota en naranja: millones de amapolas cubren colinas enteras. Es el superbloom, un espectáculo que no se puede reservar con antelación.',
      sections: [
        ['Qué es un superbloom', 'Un superbloom ocurre cuando un invierno lluvioso coincide con un banco de semillas dormidas: las amapolas, que pueden esperar años enterradas, germinan todas a la vez.', 'El desierto entero se sincroniza: amapolas naranjas, lupinos azules y verbenas moradas dibujan mantos que se ven desde satélites.'],
        ['Dónde y cuándo verlo', 'La reserva de Antelope Valley, al norte de Los Ángeles, es el epicentro clásico: colinas enteras teñidas de naranja entre febrero y abril, según las lluvias.', 'El Walker Canyon se hizo famoso en 2019, cuando miles de turistas colapsaron una carretera para verlo. Hoy se controla el acceso: la flor es frágil y las pisadas matan el banco de semillas.'],
        ['La etiqueta del visitante', 'Camina solo por senderos marcados: cada planta pisoteada es una generación de semillas que no volverá. La flor dura pocas semanas; las fotos, para siempre.', 'No la arranques: además de ilegal en reservas, la amapola se marchita en minutos fuera de la tierra. El mejor recuerdo es la paciencia.'],
      ],
      bullets: ['El superbloom nace de semillas que esperan años', 'Antelope Valley: el epicentro naranja', '2019: el Walker Canyon colapsó de visitantes', 'Caminar fuera de senda mata el próximo superbloom'],
      quote: 'El desierto no florece cuando quieres, sino cuando puede.',
      codeTitle: 'Ficha técnica — Amapola de California',
      code: [
        'Familia: Papaveraceae · Eschscholzia californica',
        'Origen: oeste de América del Norte',
        'Floración: febrero – abril (según lluvias)',
        'Suelo: pobre y seco · Sol pleno',
        'Es la flor estatal de California desde 1903',
      ].join('\n'),
    },
    {
      slug: 'protea-rey',
      intro: 'Las proteas llevan en la Tierra más de 90 millones de años: compartieron planeta con los dinosaurios. La protea rey, con su corona de pétalos rosados, es la flor nacional de Sudáfrica.',
      sections: [
        ['Una flor prehistórica', 'La familia Proteaceae nació en el supercontinente Gondwana y se fragmentó con él: por eso hay proteas en Sudáfrica y parientes suyos en Australia y Sudamérica.', 'La protea rey (Protea cynaroides) abre una cabeza del tamaño de un plato, rodeada de brácteas rígidas que parecen pétalos de plástico.'],
        ['El fynbos: el reino floral más pequeño', 'El fynbos, la vegetación del Cabo sudafricano, ocupa menos del 1% de África y alberga más especies vegetales que todo el Reino Unido. Es el reino floral más diverso por kilómetro cuadrado.', 'Y depende del fuego: muchas proteas solo liberan sus semillas después de un incendio, que limpia el suelo y fertiliza la próxima generación.'],
        ['La flor que sobrevive al fuego', 'La corteza gruesa protege a la planta del calor y las semillas quedan en conos que se abren con la ceniza. El fuego no destruye el fynbos: lo renueva.', 'Por eso los jardines botánicos sudafricanos hacen quemas controladas: sin fuego, el ecosistema envejece y se agota.'],
      ],
      bullets: ['Proteaceae: 90+ millones de años, era de los dinosaurios', 'El fynbos: menos del 1% de África, récord de especies', 'Muchas proteas solo germinan tras un incendio', 'La protea rey es la flor nacional de Sudáfrica'],
      quote: 'Hay flores que no esperan la primavera: esperan el fuego.',
      codeTitle: 'Ficha técnica — Protea rey',
      code: [
        'Familia: Proteaceae · Protea cynaroides',
        'Origen: fynbos del Cabo, Sudáfrica',
        'Floración: todo el año, pico en invierno',
        'Cabeza floral: hasta 30 cm de diámetro',
        'Suelo: ácido y bien drenado',
      ].join('\n'),
    },
    {
      slug: 'ave-del-paraiso',
      intro: 'La Strelitzia parece un pájaro a punto de alzar el vuelo: pétalos azules, cresta naranja y una silueta que mira al cielo. Un error de la evolución convertido en icono tropical.',
      sections: [
        ['Por qué se llama así', 'La flor fue bautizada Strelitzia en honor a Carlota de Mecklemburgo-Strelitz, reina de Gran Bretaña. Pero el mundo la conoce por lo que imita: una grulla en pleno despegue.', 'Lo que parece el pico es una bráctea horizontal; los pétalos azules son la lengua; la cresta naranja, los sépalos. Una ilusión perfecta ensamblada pieza a pieza.'],
        ['Polinizada por pájaros', 'En su Sudáfrica natal, el ave del paraíso no la polinizan abejas: la poliniza el suimanga, un pájaro que se posa sobre la bráctea y la abre con su peso.', 'Ese mecanismo de precisión explica su éxito en jardines de medio mundo: en ausencia de suimangas, las flores se cortan y viajan como joyas florales.'],
        ['En casa: paciencia y sol', 'En interiores florece a partir del tercer o cuarto año y exige luz intensa, calor y abono constante. Cada flor dura semanas en la planta y en el jarrón.', 'No la podas en exceso: la Strelitzia florece mejor apretada en su maceta, con las raíces ligeramente comprimidas.'],
      ],
      bullets: ['Strelitzia: homenaje a la reina Carlota', 'El "pico" es una bráctea; los pétalos, azules', 'La poliniza el suimanga con su peso', 'Florece mejor apretada de raíces'],
      quote: 'La flor más escultural no se esculpió: se polinizó.',
      codeTitle: 'Ficha técnica — Ave del paraíso',
      code: [
        'Familia: Strelitziaceae · Strelitzia reginae',
        'Origen: costa este de Sudáfrica',
        'Floración: otoño – invierno (interior)',
        'Altura: 1 – 2 m en maceta',
        'Luz: intensa · Abono: cada 2 semanas',
      ].join('\n'),
    },
    {
      slug: 'lirio-nilo',
      intro: 'Esferas azules que bordean caminos, ríos y jardines de medio mundo: el lirio del Nilo, o agapanthus, viajó de Sudáfrica a cada acera soleada del planeta.',
      sections: [
        ['Azul sobre el río', 'El nombre agapanthus significa "flor del amor" en griego, pero todo el mundo lo conoce por donde lo vio crecer: las riberas del Nilo, donde llegó como planta de jardín.', 'Sus umbelas reúnen decenas de flores en una esfera de 20 centímetros, en azules que van del celeste al violeta profundo.'],
        ['Resistencia sudafricana', 'Viene del Cabo, donde aprende a sobrevivir sequías largas: sus raíces carnosas guardan agua para meses. Por eso aguanta aceras, macetas y veranos duros.', 'Las variedades enanas caben en una maceta de balcón; las altas llegan al metro y medio y bordean avenidas enteras.'],
        ['Cuidados mínimos', 'Pide sol, drenaje y poca agua. Se multiplica sola por rizomas, tanto que en algunas regiones de Nueva Zelanda y Australia es planta invasora.', 'Divide las matas cada cuatro años: más flores, más vigor, y regala los sobrantes — no hay mejor planta para empezar una colección.'],
      ],
      bullets: ['Agapanthus: "flor del amor" en griego', 'Esferas de hasta 20 cm con decenas de flores', 'Raíces carnosas: sobrevive sequías largas', 'Divídela cada 4 años: más flores y regalos'],
      quote: 'La flor más azul del camino viene del Cabo y no se queja.',
      codeTitle: 'Ficha técnica — Lirio del Nilo',
      code: [
        'Familia: Amaryllidaceae · Agapanthus africanus',
        'Origen: Sudáfrica',
        'Floración: junio – agosto',
        'Altura: 40 – 150 cm según variedad',
        'Luz: pleno sol · Riego: escaso',
      ].join('\n'),
    },
    {
      slug: 'regar-sin-ahogar',
      intro: 'Mueren más plantas por exceso de agua que por sequía. La regla de oro no está en el calendario: está en el dedo, a dos centímetros de profundidad.',
      sections: [
        ['El dedo, la mejor herramienta', 'Antes de regar, hunde el dedo en la tierra: si sale limpio y seco, toca agua; si sale con tierra pegada, espera. Dos segundos de diagnóstico evitan el 90% de los ahogamientos.', 'Los medidores de humedad ayudan, pero no distinguen texturas: la misma lectura significa cosas distintas en turba que en arena.'],
        ['Agua profunda y espaciada', 'Mejor un riego profundo cada varios días que gotas diarias: el agua debe llegar a las raíces bajas, no solo mojar la superficie.', 'Regar poco y a menudo crea raíces perezosas en la superficie; regar profundo y espaciado entrena raíces que buscan y resisten.'],
        ['Señales de auxilio', 'Hojas amarillas y blandas: demasiada agua. Hojas secas con puntas marrones: poca. Ambos síntomas se parecen — el dedo desempata.', 'En macetas, asegúrate del drenaje: un platillo lleno de agua estancada es una sentencia. Vierte el sobrante media hora después de regar.'],
      ],
      bullets: ['El dedo a 2 cm desempata húmedo y seco', 'Riego profundo y espaciado: raíces fuertes', 'Hojas amarillas y blandas = exceso', 'Vacía el platillo 30 minutos después de regar'],
      quote: 'La planta no pide agua todos los días: pide agua cuando la necesita.',
      codeTitle: 'Ficha técnica — Riego',
      code: [
        'Diagnóstico: dedo a 2 cm de profundidad',
        'Frecuencia: según planta y estación',
        'Método: profundo, hasta ver drenar',
        'Platillo: vaciar tras 30 minutos',
        'Hora ideal: temprano en la mañana',
      ].join('\n'),
    },
    {
      slug: 'poda-primavera',
      intro: 'Cortar mal mata más que no cortar. La poda de primavera tiene una ventana exacta por tipo de planta, y respetarla es la diferencia entre un arbusto y una nube de flores.',
      sections: [
        ['La ventana exacta', 'La regla general: poda después de florecer, nunca antes. Si cortas en plena formación de botones, te quedas sin temporada.', 'Los rosales se podan a finales de invierno; los arbustos de primavera, justo tras su floración; las glicinas, dos veces. Cada planta tiene su calendario y no se negocia.'],
        ['Herramientas limpias, cortes limpios', 'Tijeras desinfectadas con alcohol evitan transmitir hongos entre plantas. El corte debe ser diagonal, justo encima de una yema que mire hacia afuera.', 'Corta las ramas muertas, cruzadas y las que crecen hacia dentro: la luz y el aire deben atravesar la copa.'],
        ['El error más común', 'Podar de más por miedo a que crezca: un arbusto recortado en esfera pierde su forma natural y florece menos cada año.', 'Poda un tercio como máximo por temporada. Si heredaste un arbusto descuidado, recupéralo en tres años, no en una tarde.'],
      ],
      bullets: ['Poda después de florecer, nunca antes', 'Rosales: finales de invierno', 'Tijeras desinfectadas y cortes diagonales', 'Máximo: un tercio por temporada'],
      quote: 'La mejor poda es la que nadie nota en primavera.',
      codeTitle: 'Ficha técnica — Poda',
      code: [
        'Rosales: poda a finales de invierno',
        'Arbustos de primavera: tras su floración',
        'Glicinas: verano (ligera) + invierno (formación)',
        'Herramientas: desinfectar con alcohol',
        'Corte: diagonal, sobre yema hacia afuera',
      ].join('\n'),
    },
    {
      slug: 'tierra-perfecta',
      intro: 'Cada flor quiere un suelo distinto: a la azalea le gusta ácido, al tulipán le gusta arenoso y la orquídea prefiere no tocar tierra en absoluto. La mezcla correcta vale más que el mejor abono.',
      sections: [
        ['Tres texturas, infinitas mezclas', 'Arena drena rápido, arcilla retiene agua y limo está en medio. La mayoría de las flores quieren una mezcla franca: un tercio de cada, con materia orgánica.', 'Un puñado de tierra apretada en la mano dice todo: si se desmorona, drena bien; si forma una bola pegajosa, retiene de más.'],
        ['Ácido vs alcalino', 'Las hortensias, azaleas y camelias piden suelo ácido (pH 4,5 – 6); la lavanda y la salvia, calcáreo y alcalino. El pH decide si el hierro y el fósforo están disponibles.', 'Un medidor de pH barato y un poco de azufre (acidifica) o cal (alcaliniza) resuelven la mayoría de los casos.'],
        ['Sustratos por tipo de flor', 'Bulbos (tulipán): arena gruesa y buen drenaje — odian encharcarse. Girasoles: suelo suelto y profundo para raíces largas. Orquídeas: corteza y musgo, nada de tierra.', 'En maceta, renueva el sustrato cada dos años: se compacta, pierde aire y acumula sales.'],
      ],
      bullets: ['Prueba del puñado: bola pegajosa = mal drenaje', 'Hortensias y azaleas: suelo ácido', 'Bulbos: arena gruesa, drenaje perfecto', 'Renueva el sustrato de maceta cada 2 años'],
      quote: 'La flor no vive del agua: vive del aire que hay en la tierra.',
      codeTitle: 'Ficha técnica — Sustratos',
      code: [
        'Franco ideal: 1/3 arena + 1/3 limo + 1/3 arcilla',
        'Acidificar: azufre · Alcalinizar: cal',
        'Bulbos: arena gruesa · pH neutro',
        'Orquídeas: corteza + musgo, sin tierra',
        'Macetas: renovar sustrato cada 2 años',
      ].join('\n'),
    },
    {
      slug: 'lenguaje-de-las-flores',
      intro: 'En la Inglaterra victoriana, un ramo era una carta de amor cifrada: cada flor, cada color y hasta la mano con la que se entregaba cambiaban el mensaje.',
      sections: [
        ['La floriografía victoriana', 'Cuando el decoro prohibía decir ciertas cosas, las flores hablaban: un tulipán rojo declaraba amor; uno amarillo, celos. Los diccionarios florales se vendían por miles.', 'Un ramo entregado con la mano derecha respondía "sí"; con la izquierda, "no". El lazo inclinado a un lado añadía matices que hoy parecen un protocolo diplomático.'],
        ['El diccionario esencial', 'Rosa roja: amor. Rosa blanca: pureza. Girasol: admiración. Lavanda: devoción. Amapola: consuelo. Glicina: bienvenida. Azucena: nobleza. Crisantemo blanco: duelo en Europa, celebración en Japón.', 'El mismo crisantemo demuestra la regla de oro de la floriografía: el significado depende de la cultura, y regalar flores sin diccionario local es jugar a la ruleta.'],
        ['Regalar sin equivocarse', 'Hoy la guía práctica es más simple: pregunta qué flores le gustan, evita los símbolos fúnebres locales y recuerda que el pensamiento vale más que el código.', 'Y si quieres un mensaje cifrado, el ramo de novia victoriano sigue siendo imbatible: azahar para la fecundidad, mirto para el amor duradero y hiedra para la fidelidad.'],
      ],
      bullets: ['La era victoriana cifraba mensajes en ramos', 'Entrega con mano derecha: "sí" · izquierda: "no"', 'El crisantemo: duelo en Europa, fiesta en Japón', 'El ramo de novia clásico: azahar, mirto y hiedra'],
      quote: 'Cada flor es una palabra; un ramo, una frase completa.',
      codeTitle: 'Ficha técnica — Floriografía',
      code: [
        'Rosa roja: amor · Rosa blanca: pureza',
        'Girasol: admiración · Lavanda: devoción',
        'Amapola: consuelo · Glicina: bienvenida',
        'Azucena: nobleza · Azahar: fecundidad',
        '⚠ El significado cambia según la cultura',
      ].join('\n'),
    },
    {
      slug: 'flores-comestibles',
      intro: 'Las capuchinas pican como pimienta, el hibisco da el té más rojo del mundo y las caléndulas convierten una ensalada en un cuadro. Comer flores es cocina, botánica y un poco de valor.',
      sections: [
        ['Del huerto al plato', 'Las flores comestibles no son un lujo moderno: el azafrán — el estigma seco de un crocus — es la especia más cara del mundo, y el agua de azahar perfuma la repostería árabe desde hace siglos.', 'El hibisco (flor de Jamaica) se bebe frío desde Senegal hasta México; la caléndula, llamada "azafrán del pobre", tiñe arroces de amarillo.'],
        ['Cuáles sí, cuáles no', 'Seguras y clásicas: capuchina, caléndula, pensamiento, borraja, rosa y flor de calabacín. La calabacín rellena es patrimonio de la cocina italiana.', 'Peligrosas: hortensia, azalea, digitalis, lirio de los valles y adelfa son tóxicas. La regla: si no estás 100% seguro de la especie, no se come.'],
        ['Cómo cultivarlas en casa', 'Las capuchinas crecen en cualquier maceta soleada y dan flores todo el verano: pétalos picantes para ensaladas. Las borrajas, azules y dulces, atraen abejas y congelan bonito en cubitos.', 'Recolecta por la mañana, cuando las flores están frescas y llenas de néctar. Lava suave y consume el mismo día.'],
      ],
      bullets: ['El azafrán es el estigma seco de un crocus', 'Hibisco: la bebida roja de tres continentes', 'Flor de calabacín rellena: clásico italiano', 'Hortensia y azalea: bonitas y tóxicas'],
      quote: 'La huerta no termina en las hojas: termina en los pétalos.',
      codeTitle: 'Ficha técnica — Comestibles',
      code: [
        'Seguras: capuchina, caléndula, pensamiento, rosa',
        'Borraja: azul, dulce, perfecta en cubitos',
        'Flor de calabacín: rellena o rebozada',
        'Tóxicas: hortensia, azalea, adelfa, digitalis',
        'Cosecha: por la mañana, consumo el mismo día',
      ].join('\n'),
    },
    {
      slug: 'reloj-floral-linneo',
      intro: 'Carolus Linnaeus, el padre de la taxonomía, soñó un jardín que diera la hora: cada flor abre y cierra en un momento exacto del día. Su reloj floral casi funcionó.',
      sections: [
        ['El jardín que da la hora', 'Linnaeus observó que cada especie tiene su horario: el diente de león abre a las seis, la caléndula a las nueve, la correhuela se cierra al mediodía.', 'Publicó su Horologium Florae en 1751, ordenando especies para que el jardinero pudiera leer la hora con un vistazo — un reloj de sol hecho de pétalos.'],
        ['Por qué casi funciona', 'El ritmo de apertura depende de luz, temperatura y latitud: un reloj floral calibrado en Upsala se desajusta cien kilómetros al sur.', 'Los científicos de hoy lo llaman ritmo circadiano vegetal: cada flor guarda su propio oscilador interno, ajustado cada mañana por la luz.'],
        ['Horarios para tu jardín', 'Mañana: diente de león (6-7), nenúfar (7-8), maravilla (9). Mediodía: la correhuela se cierra (12). Tarde: onagra y jazmín de noche abren al caer el sol.', 'Plantar estas especies en secuencia crea un jardín que "pasa la tarde" contigo: cada hora, una flor distinta toma el turno.'],
      ],
      bullets: ['Horologium Florae: publicado en 1751', 'Cada especie abre y cierra a su hora', 'El ritmo depende de luz, temperatura y latitud', 'Onagra y jazmín de noche: turno del atardecer'],
      quote: 'El primer reloj de jardín no tenía agujas: tenía pétalos.',
      codeTitle: 'Ficha técnica — Reloj floral',
      code: [
        '06:00 – Diente de león abre',
        '07:00 – Nenúfar se despliega',
        '09:00 – Caléndula y maravilla abren',
        '12:00 – Correbuela se cierra',
        '19:00 – Onagra y jazmín de noche abren',
      ].join('\n'),
    },
  ];

  const bank = [
    function (post, heading) {
      return 'En "' + post.title + '", la sección "' + heading + '" resume décadas de jardinería en un consejo simple: observa la planta antes de intervenir. Casi todos los errores comunes vienen de hacer demasiado, no de hacer poco.';
    },
    function (post, heading) {
      return 'Esta sección se lee mejor con un calendario de floración a mano: cada especie tiene su ventana exacta, y quien la respeta consigue flores año tras año sin forzar nada.';
    },
    function (post, heading) {
      return 'Un detalle que suele pasarse por alto: el clima local importa más que la especie perfecta. Antes de plantar, mira qué florece ya en tu barrio — esa es tu mejor guía.';
    },
  ];

  const bodies = {};
  SEEDS.forEach(function (seed) {
    bodies[seed.slug] = {
      intro: seed.intro,
      sections: seed.sections.map(function (section, i) {
        return {
          heading: section[0],
          paragraphs: [section[1], section[2], bank[i % bank.length]({ title: seed.slug }, section[0])],
        };
      }),
      bullets: seed.bullets,
      quote: seed.quote,
      codeTitle: seed.codeTitle,
      code: seed.code,
    };
  });

  return bodies;
});

// ─── Comentarios ─────────────────────────────────────────────────────────────
export const getComments = server({ type: 'pre-build', tags: ['comments'] }, async () => {
  return {
    'sakura-japon': [
      { author: 'Camila R.', date: '2026-01-09', text: 'Estuve en Ueno el año pasado y este artículo me devolvió el olor. ¡Quiero volver ya!' },
      { author: 'Tomás P.', date: '2026-01-10', text: '¿El sakura-zensen se publica realmente en la tele? Necesito verlo.' },
      { author: 'Luna Vega', date: '2026-01-11', text: '¡Sí! El pronóstico sale en todos los noticieros desde febrero. Es un evento nacional.' },
    ],
    'tulipanes-holanda': [
      { author: 'Sofía M.', date: '2026-02-03', text: 'Lo de la burbuja de 1637 me voló la cabeza. ¿Recomiendas Keukenhof con niños?' },
      { author: 'Inés Quiroz', date: '2026-02-03', text: 'Totalmente: hay senderos, barcas y jardines temáticos. Ve temprano, abre a las 8.' },
    ],
    'protea-rey': [
      { author: 'Andrés G.', date: '2026-03-26', text: 'No sabía que el fynbos dependía del fuego. Naturaleza brutal y hermosa.' },
      { author: 'Valeria Montes', date: '2026-03-27', text: 'Exacto. Las quemas controladas del jardín botánico de Kirstenbosch se agotan en minutos.' },
    ],
    'girasoles-campo': [
      { author: 'Paula N.', date: '2026-03-02', text: 'Lo de Fibonacci en las espirales es mi nuevo dato favorito de sobremesa.' },
      { author: 'Marco León', date: '2026-03-02', text: '¡Y el récord de 9,17 metros! Hay fotos históricas de la torre con escalera incluida.' },
    ],
    'lenguaje-de-las-flores': [
      { author: 'Ricardo F.', date: '2026-05-15', text: 'Le regalé girasoles a mi esposa sin saber que significaban admiración. Acerté sin querer.' },
      { author: 'Luna Vega', date: '2026-05-16', text: 'Mejor acertar sin querer que equivocarse con crisantemos blancos en Japón…' },
    ],
    'orquideas-colombia': [
      { author: 'Fernanda L.', date: '2026-03-10', text: 'Las orquídeas que imitan insectos hembra me dejaron sin palabras. La evolución es artista.' },
    ],
  };
});

// ─── Páginas fijas (contenido pesado) ────────────────────────────────────────
export const getStaticPages = server({ type: 'pre-build', tags: ['pages'] }, async () => {
  return {
    about: {
      title: 'Acerca de Flores del Mundo',
      subtitle: 'Un atlas floral servido por peticiones pre-construidas',
      hero: 'Flores del Mundo existe para demostrar una idea: un sitio con mucho contenido puede servirse sin una sola petición de datos en runtime.',
      mission:
        'Cada artículo, autor, categoría, tag y comentario de este sitio se resolvió durante el build. Lo que tu navegador recibe es HTML con las respuestas ya impresas: cero fetch, cero spinners de contenido, cero API en vivo.',
      story: [
        'Flores del Mundo nació como el caso de prueba del sistema de constant folding de AstraJS. Necesitábamos un sitio con páginas fijas con mucha información, rutas dinámicas anidadas y datos que cambian por build, no por request.',
        'Escribimos una "base de datos" emulada dentro de los cuerpos de las funciones pre-build — en un proyecto real, esos cuerpos consultarían tu base real durante vite build. La mecánica es idéntica: el resultado viaja inlinado.',
        'Hoy el atlas tiene 18 artículos sobre flores de cuatro continentes, 5 botánicos, 6 categorías y 14 tags. Nada de eso se consulta en runtime: todo se resolvió antes de que tú llegaras.',
      ],
      pillars: [
        { icon: '⚡', title: 'Pre-built requests', text: 'Las consultas corren en build time y sus resultados se inlinan como JSON en el bundle.' },
        { icon: '🧭', title: 'Rutas dinámicas anidadas', text: '/authors/:author/posts/:post y /categories/:cat/tags/:tag, resueltas con guards reactivos.' },
        { icon: '🌸', title: 'Flores de cuatro continentes', text: 'Sakura, tulipanes, girasoles y proteas: el atlas completo con ficha técnica.' },
        { icon: '🌱', title: 'Cero deuda de runtime', text: 'Sin API, sin base de datos en vivo, sin estados de servidor que mantener.' },
      ],
      faq: [
        { q: '¿Los datos de este atlas vienen de una base de datos?', a: 'De una base de datos emulada que se consulta durante el build. Las "tablas" viven dentro de los cuerpos de las funciones server({ type: pre-build }).' },
        { q: '¿Qué pasa cuando publicas una flor nueva?', a: 'Reconstruyes el sitio: vite build ejecuta las consultas de nuevo y los resultados actualizados se inlinan. Es ISR llevado al extremo del build.' },
        { q: '¿Cómo funcionan las rutas dinámicas si no hay servidor?', a: 'El router captura los parámetros de la URL y la capa de consultas filtra las constantes ya inlinadas. La URL es el estado; los datos ya están aquí.' },
        { q: '¿Puedo usar pre-build con datos que cambian por usuario?', a: 'No: pre-build es para datos que no dependen del visitante. Para lo demás, server() dynamic con autoSync y ETags.' },
        { q: '¿Dónde está el código de este atlas?', a: 'En la carpeta astra-blog/ de la raíz del monorepo, junto a examples/fullstack/. Los tests de la capa de consultas están en src/__tests__/.' },
      ],
      teamTitle: 'Quiénes escriben aquí',
      teamSubtitle: 'Cinco botánicos y horticultores que documentan las flores del mundo.',
    },
    contact: {
      title: 'Contacto',
      subtitle: 'Escríbenos — respondemos en el próximo build',
      intro: '¿Encontraste un error en un artículo? ¿Quieres proponer una flor? Todas las vías de contacto viven pre-construidas en esta página, como todo lo demás.',
      email: 'hola@floresdelmundo.dev',
      address: 'Calle del Jardín Botánico 42, piso 3 · Valparaíso, Chile',
      schedule: [
        { day: 'Lunes a viernes', hours: '09:00 – 18:00 CLT' },
        { day: 'Sábados', hours: '10:00 – 14:00 CLT' },
        { day: 'Domingos', hours: 'Cerrado (las flores descansan)' },
      ],
      socials: [
        { label: 'GitHub', href: 'https://github.com', handle: '@astra' },
        { label: 'Discord', href: 'https://discord.com', handle: 'discord.gg/astrajs' },
        { label: 'X', href: 'https://x.com', handle: '@floresdelmundo' },
      ],
      notes:
        'Este formulario es decorativo: no hay servidor en runtime que reciba el mensaje. En una app real, usarías server() dynamic para enviarlo — y seguirías pre-construyendo todo lo demás.',
    },
  };
});

// ─── Snapshot agregado para la capa de consultas ─────────────────────────────
// Nota: cada llamada pre-build es independiente (el ejecutor de build-time no
// comparte scope). La capa db-core.ts las combina en un solo "schema".
