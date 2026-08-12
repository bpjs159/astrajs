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
import { server } from '@astrajs/server';

// ─── Config del sitio ────────────────────────────────────────────────────────
export const getSiteConfig = server({ type: 'pre-build', tags: ['site'] }, async () => {
  return {
    name: 'AstraBlog',
    tagline: 'El blog que se construye antes de que lo pidas',
    description:
      'Guías, tutoriales y arquitectura del framework full-stack que compila JSX a DOM real. Cada página de este blog es una petición pre-construida: los datos se resolvieron en build time.',
    nav: [
      { label: 'Inicio', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: 'Guías', href: '/categories/guias' },
      { label: 'Autores', href: '/authors/luna-vega' },
      { label: 'Acerca de', href: '/about' },
      { label: 'Contacto', href: '/contact' },
    ],
    footer: {
      about:
        'AstraBlog es el blog oficial del framework AstraJS. 100% generado con datos pre-construidos: sin API, sin base de datos en runtime, sin estado de servidor.',
      columns: [
        {
          title: 'Categorías',
          links: [
            { label: 'Guías', href: '/categories/guias' },
            { label: 'Tutoriales', href: '/categories/tutoriales' },
            { label: 'Arquitectura', href: '/categories/arquitectura' },
            { label: 'Rendimiento', href: '/categories/rendimiento' },
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
      role: 'Frontend & Rendimiento',
      avatar: '🦊',
      location: 'Valparaíso, Chile',
      joined: '2025-03',
      bio:
        'Luna trabaja en el runtime de AstraJS desde la beta 0.2. Obsesionada con medir cada milisegundo, lidera los benchmarks de renderizado y la guía de rendimiento del framework.',
      socials: { github: 'luna-vega', x: '@lunavega_dev', site: 'lunavega.dev' },
      specialties: ['Rendimiento', 'CSS con scope', 'Benchmarks'],
    },
    {
      slug: 'diego-solis',
      name: 'Diego Solís',
      role: 'Fullstack & Server',
      avatar: '🐺',
      location: 'Ciudad de México, México',
      joined: '2025-01',
      bio:
        'Diego construyó el sistema RPC de AstraJS y el router de guardas reactivas. Escribe sobre server(), rutas dinámicas y sincronización cliente-servidor sin fricción.',
      socials: { github: 'diego-solis', x: '@dsolis_js', site: 'diegosolis.mx' },
      specialties: ['server() RPC', 'Router', 'autoSync'],
    },
    {
      slug: 'ines-quiroz',
      name: 'Inés Quiroz',
      role: 'Compiladores & Tipos',
      avatar: '🦉',
      location: 'Buenos Aires, Argentina',
      joined: '2025-02',
      bio:
        'Inés mantiene el compilador AST de AstraJS: JSX → DOM nativo, extracción de CSS y constant folding. Cree que el mejor framework es el que desaparece en build time.',
      socials: { github: 'ines-quiroz', x: '@iquiroz', site: 'inesq.dev' },
      specialties: ['Compilador AST', 'TypeScript', 'Constant folding'],
    },
    {
      slug: 'marco-leon',
      name: 'Marco León',
      role: 'DevOps & Deploy',
      avatar: '🐻',
      location: 'Medellín, Colombia',
      joined: '2025-05',
      bio:
        'Marco se encarga de SSG/ISR, plataformas de deploy y los pipelines de build. Su mantra: si una página puede pre-construirse, no debería construirse en runtime.',
      socials: { github: 'marco-leon', x: '@mleond', site: 'marcoleon.co' },
      specialties: ['SSG', 'ISR', 'Deploy'],
    },
    {
      slug: 'val-montes',
      name: 'Valeria Montes',
      role: 'UX & Comunidad',
      avatar: '🦋',
      location: 'Lima, Perú',
      joined: '2025-06',
      bio:
        'Valeria acompaña a equipos que migran a AstraJS desde React, Vue o Angular. Escribe tutoriales para principiantes y coordina la comunidad hispanohablante.',
      socials: { github: 'val-montes', x: '@valmontes', site: 'valmontes.pe' },
      specialties: ['Migraciones', 'Tutoriales', 'Comunidad'],
    },
  ];
});

// ─── Categorías y tags ───────────────────────────────────────────────────────
export const getTaxonomy = server({ type: 'pre-build', tags: ['taxonomy'] }, async () => {
  return {
    categories: [
      { slug: 'guias', name: 'Guías', icon: '🧭', description: 'Conceptos explicados a fondo, del cero al detalle.' },
      { slug: 'tutoriales', name: 'Tutoriales', icon: '🧪', description: 'Paso a paso para construir cosas reales.' },
      { slug: 'arquitectura', name: 'Arquitectura', icon: '🏛️', description: 'Cómo funciona AstraJS por dentro.' },
      { slug: 'rendimiento', name: 'Rendimiento', icon: '⚡', description: 'Milisegundos, kilobytes y benchmarks.' },
      { slug: 'fullstack', name: 'Fullstack', icon: '🔁', description: 'Cliente y servidor hablando el mismo idioma.' },
      { slug: 'comunidad', name: 'Comunidad', icon: '🌱', description: 'Migraciones, ecosistema y roadmap.' },
    ],
    tags: [
      'compiler', 'jsx', 'typescript', 'vite', 'store', 'reactividad',
      'router', 'server', 'rpc', 'ssr', 'ssg', 'css', 'rendimiento', 'ecosistema',
    ],
  };
});

// ─── Índice de posts (metadatos) ─────────────────────────────────────────────
export const getPostsIndex = server({ type: 'pre-build', tags: ['posts'] }, async () => {
  // slug, author, category, title, excerpt, tags, date, reading, featured, views
  const ROWS = [
    ['que-es-astrajs', 'ines-quiroz', 'guias', '¿Qué es AstraJS y por qué no usa Virtual DOM?',
      'El framework que compila JSX a DOM real, elimina la reconciliación y ejecuta tus queries en build time. Una introducción honesta a su modelo mental.',
      ['compiler', 'jsx', 'typescript'], '2026-01-08', 9, 1, 12400],
    ['primeros-pasos', 'val-montes', 'tutoriales', 'Primeros pasos: tu primera app en 5 minutos',
      'Instala astra, escribe un store, un componente y una ruta. Sin configurar nada: el compilador hace el resto por ti.',
      ['vite', 'compiler', 'store'], '2026-01-15', 6, 1, 9800],
    ['reactividad-store', 'luna-vega', 'guias', 'Reactividad quirúrgica: qué actualiza el store() y qué no',
      'Un cambio de propiedad solo toca los nodos que la leyeron. Así funciona la granularidad de los efectos de AstraJS, con ejemplos medidos.',
      ['store', 'reactividad'], '2026-01-22', 8, 0, 7600],
    ['formularios-tipados', 'diego-solis', 'tutoriales', 'Formularios tipados sin perder el foco',
      'Two-way binding real con @astrajs/form y @astrajs/schema: cada tecla actualiza solo su nodo. Sin re-render, sin perder el cursor.',
      ['typescript', 'store'], '2026-02-02', 7, 0, 5400],
    ['css-scoped', 'luna-vega', 'tutoriales', 'CSS con ámbito con el macro css``',
      'Estilos con scope automático, extraídos en build time a archivos con hash. Cómo funciona el macro css`` por dentro y por qué no necesitas CSS Modules.',
      ['css', 'compiler'], '2026-02-10', 6, 0, 6100],
    ['rutas-dinamicas', 'diego-solis', 'guias', 'Rutas dinámicas sobre rutas dinámicas',
      '/authors/:author/posts/:post y /categories/:cat/tags/:tag: patrones anidados con route(), params y guards reactivos, sin config files.',
      ['router', 'reactividad'], '2026-02-18', 10, 1, 8200],
    ['compilador-ast', 'ines-quiroz', 'arquitectura', 'Dentro del compilador: JSX → createElement en 3 fases',
      'Un recorrido por el pipeline del compilador AST: parseo con TypeScript, transformación de expresiones reactivas y extracción de CSS.',
      ['compiler', 'jsx', 'typescript'], '2026-03-01', 12, 1, 9100],
    ['server-rpc', 'diego-solis', 'arquitectura', 'server(): una función, dos mundos',
      'El macro server() se divide en un stub de cliente y un handler de servidor en build time. Cómo viajan los tipos de extremo a extremo.',
      ['server', 'rpc', 'typescript'], '2026-03-09', 9, 0, 6800],
    ['ssr-resumible', 'marco-leon', 'arquitectura', 'SSR resumible: serializar estado sin hidratar',
      'AstraJS serializa el estado en astra-data y el navegador retoma donde el servidor terminó. Sin doble render, sin hidratación ansiosa.',
      ['ssr', 'rendimiento'], '2026-03-17', 8, 0, 5900],
    ['zero-kb-js', 'luna-vega', 'rendimiento', '0 KB de JavaScript: el presupuesto final',
      'Cuando tus datos se inlinan en build time y el markup llega listo, el presupuesto de JS colapsa. Medimos un blog completo en números reales.',
      ['rendimiento', 'ssg', 'compiler'], '2026-03-25', 7, 1, 11300],
    ['hidratacion-cero', 'marco-leon', 'rendimiento', 'Hidratación cero: el costo oculto que AstraJS elimina',
      'Frameworks con VDOM re-ejecutan todo el árbol al hidratar. AstraJS reanuda el estado serializado y ejecuta solo lo que el usuario toca.',
      ['rendimiento', 'ssr'], '2026-04-02', 8, 0, 7100],
    ['updates-quirurgicos', 'ines-quiroz', 'rendimiento', 'Updates quirúrgicos: de 60fps a 60fps sin VDOM',
      'Cómo los efectos de grano fino tocan un TextNode en lugar de reconciliar un árbol. Benchmarks comparados contra VDOM y signals.',
      ['rendimiento', 'reactividad', 'compiler'], '2026-04-10', 9, 0, 6400],
    ['pre-build-requests', 'marco-leon', 'fullstack', 'Pre-built requests: consultar la base de datos sin servidor',
      'Este blog entero funciona con server({ type: pre-build }): las queries corren en build time y sus resultados viajan inlinados en el HTML.',
      ['server', 'ssg', 'compiler'], '2026-04-18', 9, 1, 8700],
    ['tipos-end-to-end', 'ines-quiroz', 'fullstack', 'Tipos de extremo a extremo sin codegen',
      'El tipo de retorno de server() llega intacto al cliente. Sin generar código, sin duplicar interfaces: solo inferencia de TypeScript.',
      ['typescript', 'server', 'rpc'], '2026-04-26', 8, 0, 5300],
    ['autosync-etags', 'diego-solis', 'fullstack', 'autoSync + ETags: el DOM se repara solo',
      'Cuando cambian los datos en el servidor, autoSync diffea por ETags y muta solo los nodos afectados. La sincronización sin polling manual.',
      ['server', 'reactividad'], '2026-05-05', 10, 0, 6000],
    ['migrar-de-react', 'val-montes', 'comunidad', 'Migrar de React sin tirar tu TypeScript',
      'JSX, componentes y TypeScript se sienten familiares; el modelo mental es lo único que cambia. Guía de migración incremental con checklist.',
      ['ecosistema', 'jsx', 'typescript'], '2026-05-14', 11, 0, 7900],
    ['ecosistema-2026', 'val-montes', 'comunidad', 'El ecosistema AstraJS en 2026: paquetes que necesitas',
      'router, form, schema, validation, server y ssr: qué resuelve cada paquete y cuándo lo necesitas. El mapa completo del monorepo.',
      ['ecosistema', 'router', 'server'], '2026-05-22', 7, 0, 4700],
    ['roadmap-2026', 'marco-leon', 'comunidad', 'Roadmap 2026: lo que viene para AstraJS',
      'Islas perezosas, devtools de granularidad y el generador SSG con crawling. Repasamos el roadmap público y qué pedir después.',
      ['ecosistema', 'ssg'], '2026-06-01', 6, 0, 3800],
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
      slug: 'que-es-astrajs',
      intro: 'AstraJS es un framework full-stack en TypeScript cuyo compilador convierte tu JSX en llamadas directas a document.createElement. No existe un Virtual DOM intermedio: lo que escribes es, casi literalmente, lo que el navegador ejecuta.',
      sections: [
        ['El problema que resuelve', 'Cada framework popular introduce una capa intermedia: un árbol virtual que se diffea y reconcilia en cada actualización. Esa capa resuelve un problema real (evitar tocar el DOM completo) pero cobra un precio en bytes, CPU y complejidad.', 'AstraJS toma otra decisión: en lugar de reconciliar en runtime, analiza tu código en build time y genera actualizaciones quirúrgicas por nodo.'],
        ['JSX sin VDOM', 'El JSX de AstraJS se ve familiar — es el mismo que conoces — pero el compilador lo trata como una plantilla estática, no como llamadas a createElement de un runtime. Cada expresión reactiva se convierte en un efecto de grano fino que escribe en el nodo exacto que le corresponde.', 'El resultado es predecible: cambiar el nombre de un usuario solo reescribe ese TextNode. Ni un efecto más, ni una reconciliación de árbol completa.'],
        ['Full-stack sin costura', 'AstraJS no se detiene en el cliente. El macro server() divide tus funciones en un stub de cliente y un handler de servidor durante el build, y server({ type: pre-build }) ejecuta la función en build time e inlina el resultado.', 'Es la misma filosofía en todo el stack: mover trabajo del runtime al build time, donde es gratis para el usuario final.'],
      ],
      bullets: ['Compilador AST basado en el parser de TypeScript', 'Efectos de grano fino por nodo, sin fibra ni scheduler', 'server() con tipos compartidos de extremo a extremo', 'SSR resumible y SSG con constant folding'],
      quote: 'El mejor JavaScript es el que nunca se envía.',
      codeTitle: 'main.tsx',
      code: [
        'import { component, store } from "@astrajs/core";',
        '',
        'const user = store({ name: "Ada" });',
        '',
        'export const Hello = component(() => (',
        '  <h1>Hola {user.name}</h1>',
        '));',
        '',
        '// El compilador genera:',
        '// h1.textContent actualizado solo cuando user.name cambia',
      ].join('\n'),
    },
    {
      slug: 'primeros-pasos',
      intro: 'En cinco minutos tendrás una app con store reactivo, routing y datos pre-construidos. No necesitas configurar nada: astra genera el proyecto y el compilador se encarga del resto.',
      sections: [
        ['Crear el proyecto', 'Ejecuta npx @astrajs/cli@latest my-app y elige el template fullstack. El CLI es de cero dependencias y genera la configuración de Vite, TypeScript y el esqueleto de páginas en segundos.', 'Abre la carpeta generada y ejecuta astra dev: el compilador AST se conecta como plugin de Vite y transforma tus archivos al vuelo, con HMR incluido.'],
        ['Tu primer store', 'Un store es un objeto envuelto en un Proxy. Léelo donde quieras y muta sus propiedades: los efectos que leyeron esa propiedad exacta se actualizan solos, sin re-render de componentes.', 'Pruébalo: agrega un botón que haga contador++ y observa cómo solo el TextNode del número cambia en el inspector.'],
        ['Tu primera ruta', 'El router de AstraJS usa guardas booleanas: route("/blog/:slug") devuelve true si la URL coincide y expone los parámetros en el proxy reactivo params. Sin archivos de configuración de rutas, sin wrappers.', 'Navega con Link o con navigate() y mira cómo los efectos reaccionan al cambio de path.'],
      ],
      bullets: ['npx @astrajs/cli@latest my-app', 'astra dev para HMR con el compilador AST', 'store() + Proxy = reactividad granular', 'route() + params para páginas dinámicas'],
      quote: 'Cinco minutos de setup, cero configuraciones heredadas.',
      codeTitle: 'app.tsx',
      code: [
        'import { component, store } from "@astrajs/core";',
        'import { route, Link } from "@astrajs/router";',
        '',
        'const contador = store({ n: 0 });',
        '',
        'export const App = component(() => (',
        '  <main>',
        '    <Link href="/blog">Blog</Link>',
        '    {route("/", { exact: true }) && (',
        '      <button onClick={() => contador.n++}>',
        '        {contador.n} clics',
        '      </button>',
        '    )}',
        '  </main>',
        '));',
      ].join('\n'),
    },
    {
      slug: 'reactividad-store',
      intro: 'El store() de AstraJS es la pieza central de su reactividad. La promesa es simple y radical: cuando cambia una propiedad, solo se re-ejecutan los efectos que leyeron esa propiedad exacta.',
      sections: [
        ['Cómo funciona el Proxy', 'Cada store envuelve tu objeto en un Proxy que registra qué propiedad lee cada efecto activo. Esa lista de dependencias se reconstruye en cada ejecución, así que las dependencias dinámicas (if, loops) funcionan sin declararlas.', 'El trigger es igual de preciso: la propiedad que escribes notifica solo a sus suscriptores. No hay propagación hacia arriba, no hay comparación de objetos.'],
        ['Lecturas dentro de condicionales', 'Como las dependencias se re-colectan en cada run, un efecto puede leer a o b según una condición y re-suscribirse automáticamente. Es el mismo modelo de signals, integrado en el compilador.', 'Esto elimina una clase entera de bugs de los frameworks con listas de dependencias manuales (los famosos useEffect con arrays de deps incompletos).'],
        ['Midiendo la granularidad', 'En un benchmark con 10.000 filas, cambiar una celda en AstraJS toca exactamente un nodo de texto. En un framework con VDOM, el mismo cambio recorre el árbol, diffea y eventualmente también toca un nodo — después de mucho más trabajo.', 'La diferencia se siente en apps de datos pesados y en dispositivos modestos.'],
      ],
      bullets: ['El Proxy registra dependencias por propiedad', 'Los efectos re-colectan dependencias en cada run', 'Escribir una propiedad notifica solo a sus lectores', 'Sin arrays de dependencias manuales'],
      quote: 'La granularidad no es una optimización: es el modelo.',
      codeTitle: 'store.ts',
      code: [
        'const carrito = store({ items: [], total: 0 });',
        '',
        '// efecto 1 — solo depende de "items"',
        'effect(() => { contadorDeItems.textContent = String(carrito.items.length); });',
        '',
        '// efecto 2 — solo depende de "total"',
        'effect(() => { badge.textContent = "$" + carrito.total; });',
        '',
        'carrito.total = 42;',
        '// → solo el efecto 2 se re-ejecuta',
      ].join('\n'),
    },
    {
      slug: 'formularios-tipados',
      intro: 'Los formularios son el caso más cruel para la reactividad: cada tecla es una actualización. AstraJS los maneja con two-way binding quirúrgico: el input escribe al store y solo el nodo que muestra el valor se actualiza.',
      sections: [
        ['Two-way binding sin re-render', 'onInput escribe en el store y las expresiones que leen ese campo se actualizan solas. Como el input es el origen de la escritura, AstraJS nunca re-escribe su value — por eso el foco y el cursor permanecen intactos.', 'Esto contrasta con los enfoques controlados de React, donde el input es controlado por el estado y cada render puede pelear por el cursor en ciertas condiciones.'],
        ['Validación con schema', 'El paquete @astrajs/schema define la forma de tus datos y @astrajs/validation produce validadores tipados. Los mensajes de error son store reactivos: aparecen y desaparecen sin tocar el resto del formulario.', 'Componer schema + form te da formularios accesibles con estados de error por campo, sin librería de terceros.'],
        ['Patrones comunes', 'Debounce de búsqueda: un store query + setTimeout en el handler. Autosave: escucha cambios y dispara un server() con autoSync. Los patrones se expresan con primitivas, no con hooks especializados.', 'La regla de oro: el input escribe al store; el store, nunca al input.'],
      ],
      bullets: ['onInput + store = two-way binding sin perder foco', '@astrajs/schema tipa la forma de los datos', '@astrajs/validation deriva validadores tipados', 'Debounce y autosave con primitivas, sin hooks'],
      quote: 'Un formulario no debería necesitar un sistema de gestión de estado.',
      codeTitle: 'form.tsx',
      code: [
        'const form = store({ email: "", password: "" });',
        '',
        'export const Login = component(() => (',
        '  <form>',
        '    <input',
        '      placeholder="Email"',
        '      onInput={(e) => { form.email = e.target.value; }}',
        '    />',
        '    <p>{form.email.length} caracteres</p>',
        '  </form>',
        '));',
      ].join('\n'),
    },
    {
      slug: 'css-scoped',
      intro: 'El macro css`` de AstraJS resuelve el problema del CSS con ámbito sin runtime: tus estilos se extraen en build time, reciben identificadores únicos y se enlazan como archivos estáticos con hash.',
      sections: [
        ['Cómo funciona el macro', 'Escribes const styles = css`.card { padding: 16px }` y el compilador extrae el contenido, le genera un hash y reemplaza el template por una referencia. En producción el CSS viaja en un archivo separado con cache inmutable.', 'En desarrollo, el CSS se inyecta en el documento y HMR lo actualiza sin recargar.'],
        ['Ámbito automático', 'Los selectores de tu template quedan confinados a tu componente: el hash se aplica a las clases del markup generado. Dos componentes pueden usar .card sin colisionar.', 'No necesitas CSS Modules, ni styled-components, ni runtime de CSS-in-JS: el ámbito es una decisión de build.'],
        ['Estilos y reactividad', 'Como las clases son cadenas planas, puedes combinarlas con bindClass y clases() para estilos reactivos por atributo: un store decide si un elemento es .active y solo esa clase cambia.', 'El resultado: CSS estático en disco, estado reactivo en runtime. Cada cosa en su lugar.'],
      ],
      bullets: ['Extracción en build time a archivos con content-hash', 'Selectores con ámbito automático por componente', 'Cero runtime de CSS-in-JS', 'Combina con bindClass para estilos reactivos'],
      quote: 'El CSS es estático. El estado es reactivo. No los confundas.',
      codeTitle: 'card.tsx',
      code: [
        'import { css } from "@astrajs/compiler/css";',
        '',
        'const styles = css`',
        '  .card { border-radius: 12px; padding: 16px; }',
        '  .card:hover { transform: translateY(-2px); }',
        '`;',
        '',
        '// en build: se extrae a assets/card-<hash>.css',
        '// y las clases reciben el ámbito del componente',
      ].join('\n'),
    },
    {
      slug: 'rutas-dinamicas',
      intro: 'Las rutas dinámicas de AstraJS son guardas booleanas con parámetros reactivos. Este artículo explora el caso avanzado: rutas dinámicas anidadas sobre rutas dinámicas, como /authors/:authorSlug/posts/:postSlug.',
      sections: [
        ['route() y params', 'route("/blog/:slug") devuelve true si la URL coincide y actualiza el proxy params con los segmentos capturados. Como params es un store, cualquier expresión que lo lea se re-evalúa al navegar.', 'Las guardas se ordenan en el JSX y el primer match gana — el orden es la prioridad, como en un switch.'],
        ['Dinámicas sobre dinámicas', 'El patrón avanzado combina dos niveles: route("/authors/:authorSlug/posts/:postSlug"). Primero resuelves el autor, después el post dentro de ese autor; si el post no pertenece al autor, renderizas un 404 contextual.', 'La resolución es síncrona contra datos pre-construidos, así que validar autor → post → pertenencia es cuestión de una función pura.'],
        ['Intersecciones', 'Otro patrón útil es route("/categories/:categorySlug/tags/:tagSlug"): los posts que cumplen ambas condiciones. Con datos pre-construidos, estas consultas son filter() sobre constantes inlinadas.', 'Sin backend, sin parámetros de query, sin estado de navegación manual: la URL es el estado.'],
      ],
      bullets: ['route() actualiza params de forma reactiva', 'El orden de las guardas define la prioridad', '/authors/:a/posts/:p resuelve autor → post → pertenencia', 'Las intersecciones son filters sobre datos pre-construidos'],
      quote: 'La URL es el estado. Todo lo demás se deriva.',
      codeTitle: 'routes en JSX',
      code: [
        'export const App = component(() => (',
        '  <main>',
        '    {route("/", { exact: true }) && <Home />}',
        '    {route("/authors/:authorSlug", { exact: true }) && <Author />}',
        '    {route("/authors/:authorSlug/posts/:postSlug") && <AuthorPost />}',
        '    {route("/categories/:categorySlug/tags/:tagSlug") && <CategoryTag />}',
        '    {fallbackRoute() && <NotFound />}',
        '  </main>',
        '));',
      ].join('\n'),
    },
    {
      slug: 'compilador-ast',
      intro: 'El compilador de AstraJS es un plugin de Vite que opera en tres fases sobre tu código TypeScript: transforma JSX en DOM nativo, extrae los css`` y divide las server() en cliente y servidor.',
      sections: [
        ['Fase 1: JSX → DOM nativo', 'El plugin parsea tu archivo con el parser nativo de TypeScript y reescribe cada elemento JSX como createElement. Las expresiones { } se convierten en efectos de grano fino que escriben en el nodo exacto.', 'Todo ocurre antes de que esbuild toque el archivo: la salida del transformador es TypeScript/JS válido, no un árbol propio.'],
        ['Fase 2: Extracción de CSS', 'Los templates css`` se escanean, se les asigna un hash de contenido y se extraen del módulo. En producción terminan en assets/ con nombre inmutable; en dev se inyectan para HMR.', 'El archivo JSX queda libre de CSS, y el CSS queda libre de runtime.'],
        ['Fase 3: server() → RPC', 'Cada server() se divide en dos artefactos: el stub del cliente (un wrapper de fetch tipado) y el handler del servidor (registrado en el middleware). Con type: pre-build, en cambio, la función se ejecuta al compilar y el resultado se inlina.', 'El transformador usa bracket counting sobre el fuente limpio para encontrar las llamadas, así que anidar paréntesis, objetos y strings dentro de server() no lo rompe.'],
      ],
      bullets: ['Tres fases: DOM, CSS y RPC', 'El parser nativo de TypeScript garantiza fidelidad de tipos', 'Bracket counting resiste paréntesis y strings anidados', 'pre-build inlina resultados como constantes JSON'],
      quote: 'Compilar no es optimizar: es decidir antes de enviar.',
      codeTitle: 'Transformación',
      code: [
        '// Entrada (JSX):',
        '<span class="greeting">Hola {name}</span>',
        '',
        '// Salida aproximada:',
        'const span = document.createElement("span");',
        'span.className = "greeting";',
        'const t = document.createTextNode("");',
        'span.append("Hola ", t);',
        'effect(() => { t.nodeValue = String(name); });',
      ].join('\n'),
    },
    {
      slug: 'server-rpc',
      intro: 'server() es el puente full-stack de AstraJS: una sola función que en build time se convierte en un stub de cliente y un handler de servidor, con los tipos fluyendo de un lado al otro.',
      sections: [
        ['Una función, dos artefactos', 'Escribes getUsers = server(async () => db.findMany()) y el compilador genera dos cosas: en el cliente, un wrapper que hace fetch a /api/astra/getUsers; en el servidor, el handler que registra esa ruta.', 'Nunca escribes un endpoint, una ruta HTTP ni un cliente REST a mano. El contrato es la función misma.'],
        ['Tipos de extremo a extremo', 'El tipo de retorno se infiere de la función y se propaga al cliente: await getUsers() es User[] sin codegen ni duplicación. Si cambias el modelo, ambos lados lo saben en tiempo de compilación.', 'Las validaciones de entrada usan @astrajs/schema para que los argumentos lleguen con forma verificada.'],
        ['Pre-build vs dynamic', 'Con type: dynamic la función se llama en runtime vía fetch. Con type: pre-build se ejecuta en build time y su resultado se inlina — cero fetch, cero handler, cero latencia.', 'Este blog usa exclusivamente pre-build: es la diferencia entre una API en vivo y un libro ya impreso.'],
      ],
      bullets: ['El contrato de la API es la firma de la función', 'El cliente recibe tipos inferidos, no generados', 'dynamic = fetch en runtime; pre-build = inlina en build', 'Los handlers se registran solos en el middleware'],
      quote: 'Tu endpoint es una función. Todo lo demás es ruido.',
      codeTitle: 'products.server.ts',
      code: [
        'export const listProducts = server(async () => {',
        '  return db.product.findMany();',
        '});',
        '',
        '// Cliente:',
        'const products = await listProducts();',
        '// products: Product[] — el tipo viajó solo',
      ].join('\n'),
    },
    {
      slug: 'ssr-resumible',
      intro: 'El SSR de AstraJS no hidrata: serializa el estado de tus stores en el atributo astra-data del HTML y el navegador retoma la ejecución exactamente donde el servidor la dejó.',
      sections: [
        ['Hidratación vs reanudación', 'La hidratación clásica re-ejecuta toda la app en el cliente para volver el DOM estático interactivo. La reanudación de AstraJS deserializa el estado y registra solo los listeners necesarios: el markup del servidor ya es el DOM final.', 'El doble trabajo desaparece: sin double render, sin flicker, sin hilos de hidratación bloqueando el main thread.'],
        ['El atributo astra-data', 'Todo el estado reactivo viaja serializado dentro del HTML. El navegador lo reconstruye con la misma función store(), así los efectos existentes se conectan a los nodos ya pintados.', 'Es SSR con la fidelidad del CSR: el usuario ve el contenido de inmediato y la interactividad llega con el primer frame de JavaScript.'],
        ['Cuándo usar cada modo', 'SSR para páginas que cambian por request; SSG para páginas que cambian por build; ISR para el punto medio. Y si la página no cambia nunca, pre-build: la información ya viene inlinada y el SSR ni siquiera consulta datos.', 'Este blog combina las cuatro: cada página elige su estrategia con un literal en el server().'],
      ],
      bullets: ['El estado viaja en astra-data dentro del HTML', 'Sin doble render ni hidratación ansiosa', 'Los efectos se reconectan a los nodos ya pintados', 'SSR, SSG, ISR y pre-build conviven por página'],
      quote: 'Hidratar es volver a hacer lo que ya estaba hecho.',
      codeTitle: 'renderToString',
      code: [
        'const html = await renderToString({',
        '  root: () => <App />,',
        '  template: (app) => htmlTemplate(app),',
        '});',
        '',
        '// <div id="root" astra-data="{count:3}">...',
        '// el cliente deserializa y reanuda',
      ].join('\n'),
    },
    {
      slug: 'zero-kb-js',
      intro: 'El mejor kilobyte es el que no se envía. Con datos pre-construidos y markup generado en build, una página de AstraJS puede enviar cero JavaScript de aplicación y seguir siendo completamente estática en el mejor sentido.',
      sections: [
        ['De qué se compone un presupuesto', 'Un bundle típico incluye el framework, el router, el estado y el código de datos. En AstraJS, el "framework" es el código que tu compilador generó — nada de runtime de VDOM — y el código de datos desaparece si usas pre-build.', 'Lo que queda es exactamente lo que tu página hace: ni más, ni menos.'],
        ['Midiendo este blog', 'Este blog: el HTML llega con los posts ya inlinados. El JavaScript de cliente cubre navegación y filtros; no hay llamadas de datos, no hay spinners de carga de contenido, no hay layout shift por fetch.', 'El contenido está listo en el primer paint, y la interactividad en el primer frame de JS.'],
        ['Cuándo importa', 'En conexiones móviles lentas y dispositivos de gama baja, cada kilobyte de framework se paga dos veces: descarga y parseo. Un blog de marketing no necesita un runtime de 40KB para pintar texto.', 'AstraJS no te prohíbe el JS: te deja elegir por página cuánto enviar.'],
      ],
      bullets: ['Sin runtime de VDOM: el framework es tu código compilado', 'pre-build elimina el JS y el fetch de datos', 'El contenido pinta en el primer paint', 'Elige por página cuánto JavaScript enviar'],
      quote: 'Cada kilobyte que no envías es un usuario que sí carga.',
      codeTitle: 'resultado',
      code: [
        'const posts = /* pre-build */ [',
        '  { slug: "que-es-astrajs", title: "…", ... },',
        '];',
        '',
        '// 0 fetch, 0 KB de JS para esta query',
      ].join('\n'),
    },
    {
      slug: 'hidratacion-cero',
      intro: 'La hidratación es el costo oculto de la mayoría de los frameworks SSR: volver a ejecutar el árbol completo en el cliente. AstraJS lo elimina con reanudación de estado serializado.',
      sections: [
        ['El costo de hidratar', 'Hidratar significa: descargar el JS, parsearlo, crear el árbol virtual, reconciliarlo contra el HTML del servidor y adjuntar listeners. Para un blog es puro desperdicio: el usuario ya vio el contenido.', 'En AstraJS, el estado serializado en astra-data se deserializa en un store y los efectos existentes apuntan a los nodos ya presentes. No hay árbol virtual que reconstruir.'],
        ['Lo que sí se ejecuta', 'Solo se ejecuta lo que el usuario toca: un botón registra su listener; una lista con filtros registra sus efectos. El resto del DOM permanece como lo pintó el servidor.', 'Es la diferencia entre reaccionar a un evento y re-ejecutar una aplicación.'],
        ['Midiendo la diferencia', 'En una página SSR con 5.000 nodos, la hidratación clásica puede tomar cientos de milisegundos de CPU antes del primer input. La reanudación de AstraJS toma el tiempo de parsear el estado — usualmente un orden de magnitud menos.', 'El usuario no espera menos: simplemente no espera.'],
      ],
      bullets: ['El servidor pinta; el cliente reanuda', 'Los listeners se registran por nodo, no por árbol', 'Sin re-ejecución del árbol completo en el cliente', 'Input interactivo desde el primer frame de JS'],
      quote: 'El navegador ya sabe qué hay en el DOM. No le pidas adivinarlo otra vez.',
      codeTitle: 'resumir',
      code: [
        '// servidor:',
        'const state = serializeState(store);',
        '// <div astra-data="{…}">…</div>',
        '',
        '// cliente:',
        'const el = document.querySelector("[astra-data]");',
        'const live = deserializeState(el.getAttribute("astra-data"));',
      ].join('\n'),
    },
    {
      slug: 'updates-quirurgicos',
      intro: '¿Qué significa actualizar quirúrgicamente? Significa que cambiar un valor en un store toca el TextNode que lo muestra y nada más. Este artículo mide qué tan lejos llega esa promesa.',
      sections: [
        ['La unidad de trabajo', 'En AstraJS la unidad de trabajo es el nodo, no el componente. Un componente con 50 nodos y un store de 50 propiedades produce actualizaciones independientes por propiedad: cambiar una toca uno.', 'No hay re-render de componente, no hay memo, no hay shouldComponentUpdate: el compilador ya decidió, en build time, qué nodo depende de qué propiedad.'],
        ['El benchmark de las 10.000 filas', 'Montamos una tabla de 10.000 filas y mutamos una celda. El costo en AstraJS: una escritura en un TextNode. En un framework con VDOM: walk del árbol, diff, reconciliación y, al final, la misma escritura.', 'La brecha crece con el tamaño del árbol y con la frecuencia de las actualizaciones (tickers, chats, tableros).'],
        ['Lo que el compilador garantiza', 'Como las dependencias se derivan estáticamente, el compilador puede eliminar código muerto reactivo: si nadie lee una propiedad, su trigger no hace nada. El tree-shaking alcanza a la reactividad.', 'Es optimización continua sin que tú optimices nada.'],
      ],
      bullets: ['La unidad de trabajo es el nodo, no el componente', 'Sin memo, sin shouldComponentUpdate', 'La brecha crece con árboles grandes y updates frecuentes', 'Tree-shaking reactivo: triggers sin lectores se eliminan'],
      quote: 'Actualizar un nodo no debería requerir pensar en un árbol.',
      codeTitle: 'bench',
      code: [
        'const grid = store({ cells: new Array(10000).fill(0) });',
        '',
        'grid.cells[4242] = 1;',
        '',
        '// → exactamente un TextNode reescrito',
        '// (benchmarks en /docs/rendering)',
      ].join('\n'),
    },
    {
      slug: 'pre-build-requests',
      intro: 'Este blog entero demuestra la idea: cada dato de cada página se resolvió en build time. Las "peticiones" son llamadas a server({ type: pre-build }) cuyos resultados viajan inlinados en el HTML.',
      sections: [
        ['Qué es una pre-built request', 'Es una función server() que se ejecuta mientras compilas — en tu CI, en tu laptop, donde sea que corra vite build — y cuyo resultado se serializa como constante JSON dentro del bundle.', 'El navegador nunca hace la petición: recibe la respuesta impresa en el HTML, como un libro que ya viene con las respuestas subrayadas.'],
        ['Qué se puede pre-construir', 'Todo lo que no dependa del usuario que mira: catálogos, blogs, docs, changelogs, landing pages. Los parámetros de rutas dinámicas se resuelven después, en el cliente, filtrando las constantes ya inlinadas.', 'Este blog pre-construye autores, taxonomía, índices de posts, cuerpos completos, comentarios y páginas fijas: siete consultas resueltas antes de que el navegador exista.'],
        ['La emulación de la base de datos', 'Como el ejecutor de build-time no tiene acceso al scope del módulo, cada función pre-build genera sus "tablas" dentro de su propio cuerpo: la base de datos vive en el build, no en el runtime.', 'En un proyecto real, ese cuerpo haría db.posts.findMany() contra tu base real durante el build — la mecánica es idéntica.'],
      ],
      bullets: ['La consulta corre en build time y se inlina como JSON', 'El navegador recibe la respuesta impresa en el HTML', 'Rutas dinámicas filtran constantes ya inlinadas', 'La "DB" vive en el build; el runtime no la conoce'],
      quote: 'La mejor petición es la que ya fue respondida.',
      codeTitle: 'prebuilt.ts',
      code: [
        'export const getPostsIndex = server(',
        '  { type: "pre-build", tags: ["posts"] },',
        '  async () => {',
        '    return db.posts.findMany({ select: meta });',
        '  }',
        ');',
        '',
        '// → const getPostsIndex = [ {…}, {…}, … ];',
      ].join('\n'),
    },
    {
      slug: 'tipos-end-to-end',
      intro: 'AstraJS logra tipos de extremo a extremo sin generar código: el tipo de retorno de tu función server() viaja al cliente por inferencia pura de TypeScript.',
      sections: [
        ['Inferencia sin codegen', 'El compilador no genera archivos .d.ts ni reescribe tus interfaces: el stub del cliente conserva la firma exacta de la función original. Si server() devuelve Promise<Product>, el cliente ve Promise<Product>.', 'Es la misma idea que tRPC, sin la capa de codegen: el contrato es la función.'],
        ['Lo que viaja', 'Viajan los tipos de los argumentos y del retorno. Si el handler recibe un id: string, el cliente lo exige. Si devuelve Product | null, el cliente maneja el null — el compilador te obliga.', 'Los refinamientos (narrowing) también viajan: después de validar con @astrajs/schema, los datos llegan con su forma verificada.'],
        ['Refactorizar sin miedo', 'Cambia el modelo de Product y el editor te señala cada página que consume ese tipo. Sin regenerar clientes, sin sincronizar paquetes, sin contratos desincronizados.', 'El type-check corre en cada guardado; la deuda de tipos no se acumula.'],
      ],
      bullets: ['El contrato de la API es la firma de la función', 'Sin codegen ni archivos .d.ts generados', 'Narrowing y validación viajan con los datos', 'Refactors de modelo se propagan al cliente al instante'],
      quote: 'El tipo correcto en el cliente es un bug que no puede ocurrir.',
      codeTitle: 'tipos',
      code: [
        'const getProduct = server(async (id: string) => {',
        '  return db.product.findUnique({ where: { id } });',
        '});',
        '',
        '// cliente:',
        'const p = await getProduct("p1");',
        '// p: Product | null — el tipo viajó solo',
      ].join('\n'),
    },
    {
      slug: 'autosync-etags',
      intro: 'autoSync convierte la sincronización cliente-servidor en una propiedad del server(): cuando los datos cambian, el navegador los diffea por ETags y repara solo los nodos afectados.',
      sections: [
        ['Polling inteligente', 'Con autoSync: true, el stub del cliente re-consulta en un intervalo y compara ETags. Si nada cambió, la respuesta es 304 y no se toca el DOM. Si cambió, el diff repara solo los nodos cuyos datos difieren.', 'No es un refetch brutal: es una reparación quirúrgica del DOM, coherente con el modelo de actualizaciones por nodo.'],
        ['Un caso real', 'Un panel con 40 celdas de métricas: con polling manual recargas la página completa; con autoSync solo parpadea la celda cuyo número cambió, con su animación de transición intacta.', 'El equipo deja de escribir estados de loading para datos que ya estaban cargados.'],
        ['Cuándo activarlo', 'Datos que cambian por fuera de la app: cotizaciones, posiciones, comentarios de otros usuarios. El intervalo se ajusta por llamada y el 304 mantiene el costo de red en el mínimo.', 'Para datos que no cambian, pre-build sigue siendo la respuesta correcta.'],
      ],
      bullets: ['ETags + 304 = diff sin tocar el DOM', 'Solo los nodos con datos nuevos se reparan', 'Sin estados de loading manuales para refetch', 'Por llamada: intervalo y TTL configurables'],
      quote: 'El DOM se repara solo; tú solo declaras qué mirar.',
      codeTitle: 'autosync',
      code: [
        'const getQuotes = server(',
        '  { autoSync: true, autoSyncInterval: 3000 },',
        '  async () => db.quotes.latest()',
        ');',
        '',
        '// cada 3s: ETag → 304 o reparación quirúrgica',
      ].join('\n'),
    },
    {
      slug: 'migrar-de-react',
      intro: 'Migrar de React a AstraJS es un cambio de modelo mental más que de sintaxis: JSX, componentes y TypeScript siguen ahí. Esta guía recorre el checklist de una migración incremental.',
      sections: [
        ['Lo que se mantiene', 'El JSX es casi idéntico y tus componentes siguen siendo funciones. La diferencia: los componentes de AstraJS corren una vez y las expresiones reactivas son efectos compilados — no re-renders.', 'Tu TypeScript, tus estilos y tus convenciones de carpeta sobreviven. Lo que se va es el useState/useEffect y la reconciliación.'],
        ['El mapa de equivalencias', 'useState → store(); useEffect → mounted() para side effects y efectos compilados para derivados; useContext → un módulo de store compartido; react-router → guardas route().', 'Cada patrón de React tiene una traducción directa; la tabla completa vive en la documentación de migración.'],
        ['Estrategia incremental', 'Empieza por una ruta de bajo riesgo: migra la página de estado, luego la de listas, luego el router. AstraJS convive en el mismo repositorio mientras el compilador procesa solo los archivos que le indicas.', 'Mide después de cada paso: bundle, TTI y tamaño del árbol de actualización. La métrica que más se mueve es el trabajo por actualización.'],
      ],
      bullets: ['useState → store()', 'useEffect → mounted() + efectos compilados', 'useContext → store compartido en módulo', 'Migra ruta por ruta, midiendo en cada paso'],
      quote: 'No migres de React: migra hacia compilar.',
      codeTitle: 'equivalencias',
      code: [
        '// React:',
        'const [n, setN] = useState(0);',
        '',
        '// AstraJS:',
        'const counter = store({ n: 0 });',
        'counter.n++;',
      ].join('\n'),
    },
    {
      slug: 'ecosistema-2026',
      intro: 'El monorepo de AstraJS publica paquetes enfocados: router, form, schema, validation, server y ssr. Este mapa explica qué resuelve cada uno y cuándo sumarlo a tu proyecto.',
      sections: [
        ['El núcleo', '@astrajs/core trae component, store y mounted; @astrajs/compiler es el plugin de Vite. Son los únicos imprescindibles: con ellos ya construyes una SPA reactiva.', 'El template minimal los instala solos; los demás paquetes se agregan cuando su problema aparece.'],
        ['Los paquetes de producto', '@astrajs/router para guardas y params; @astrajs/form y @astrajs/schema para formularios tipados; @astrajs/validation deriva validadores. Cada uno es opcional y compone con los demás.', 'No hay un "framework completo" que pagar por adelantado: pagas los paquetes que usas.'],
        ['Los paquetes de servidor', '@astrajs/server trae el macro server(), autoSync y revalidate; @astrajs/ssr agrega renderToString, SSG con crawling y constant folding.', 'Un proyecto fullstack usa los siete; un blog estático puede vivir con core + compiler + router.'],
      ],
      bullets: ['core + compiler: el mínimo viable', 'router, form, schema: la SPA completa', 'server + ssr: el stack fullstack', 'Paga solo los paquetes que usas'],
      quote: 'Un framework no debería llegar entero a tu bundle.',
      codeTitle: 'package.json',
      code: [
        '// fullstack:',
        '"@astrajs/core": "0.1.0",',
        '"@astrajs/router": "0.1.0",',
        '"@astrajs/server": "0.1.0",',
        '',
        '// blog estático:',
        '"@astrajs/core": "0.1.0",',
        '"@astrajs/router": "0.1.0"',
      ].join('\n'),
    },
    {
      slug: 'roadmap-2026',
      intro: 'El roadmap público de AstraJS para 2026: islas perezosas, devtools de granularidad y un generador SSG con crawling. Repasamos qué significa cada pieza y qué pedir después.',
      sections: [
        ['Islas perezosas', 'El siguiente gran paso: cargar interactividad por isla, bajo demanda. Una tabla con filtros solo descarga su JavaScript cuando el usuario la toca; el resto de la página permanece estático.', 'El compilador ya conoce las dependencias de cada nodo — detectar islas es un análisis más sobre la misma información.'],
        ['Devtools de granularidad', 'Un panel que muestra, en vivo, qué efecto se ejecutó ante cada mutación y qué nodo tocó. La reactividad de AstraJS es observable por diseño; solo falta la lupa.', 'Útil para cazar actualizaciones inesperadas y para aprender el modelo de grano fino.'],
        ['SSG con crawling', 'El generador SSG recorrerá tu árbol de rutas y emitirá HTML estático por ruta, con extraPaths para dinámicas y tags para ISR. Este blog es el caso de prueba perfecto: todo pre-build, todo crawlable.', 'Junto con pre-build requests, el pipeline completo será: crawl → consulta la DB en build → inline → HTML estático.'],
      ],
      bullets: ['Islas perezosas: JS solo donde el usuario toca', 'Devtools que muestran efecto y nodo por mutación', 'SSG con crawling + extraPaths + tags de ISR', 'El pipeline: crawl → build-time DB → inline → HTML'],
      quote: 'El roadmap no es prometer features: es retirar runtime.',
      codeTitle: 'ssg',
      code: [
        'await generateStaticSite({',
        '  root: () => <App />,',
        '  routes: appRoutes,',
        '  extraPaths: ["/blog/que-es-astrajs", "…"],',
        '});',
      ].join('\n'),
    },
  ];

  const bank = [
    function (post, heading) {
      return 'En "' + post.title + '", la sección "' + heading + '" desarrolla una idea que se repite en toda la documentación de AstraJS: cada decisión de runtime tiene una alternativa de build time, y casi siempre es más barata.';
    },
    function (post, heading) {
      return 'Vale la pena leer esta sección junto al código de los ejemplos del monorepo: los patrones descritos aquí están implementados y probados en examples/, con tests de Vitest que puedes ejecutar en tu máquina.';
    },
    function (post, heading) {
      return 'Un detalle que suele pasar desapercibido: como el compilador trabaja sobre el AST de TypeScript, los tipos que escribes alimentan las optimizaciones. Escribir buenos tipos no es solo higiene: es rendimiento.';
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
    'que-es-astrajs': [
      { author: 'Camila R.', date: '2026-01-09', text: 'La comparación con VDOM me aclaró todo. El ejemplo de createElement directo es oro puro.' },
      { author: 'Tomás P.', date: '2026-01-10', text: '¿Dónde encuentro los benchmarks completos? Quiero replicarlos en mi repo.' },
      { author: 'Luna Vega', date: '2026-01-11', text: '¡Están en examples/frontend-only con Vitest! Corre pnpm test desde el monorepo.' },
    ],
    'rutas-dinamicas': [
      { author: 'Sofía M.', date: '2026-02-19', text: 'El patrón /categories/:cat/tags/:tag es justo lo que necesitaba para mi tienda.' },
      { author: 'Diego Solís', date: '2026-02-19', text: 'Gracias por leerlo — el orden de las guardas es la clave para los 404 contextuales.' },
    ],
    'pre-build-requests': [
      { author: 'Andrés G.', date: '2026-04-19', text: 'Increíble: todo este blog es pre-build. Lo estoy aplicando al catálogo de mi ecommerce.' },
      { author: 'Marco León', date: '2026-04-20', text: 'Exacto. Si el dato no depende del visitante, deja que el build lo resuelva.' },
    ],
    'migrar-de-react': [
      { author: 'Paula N.', date: '2026-05-15', text: 'La tabla de equivalencias me ahorró una semana. Migré mi dashboard en dos días.' },
    ],
    'zero-kb-js': [
      { author: 'Ricardo F.', date: '2026-03-26', text: 'Pasé mi landing de 93KB a 4KB siguiendo esto. El LCP mejoró 3x.' },
      { author: 'Luna Vega', date: '2026-03-27', text: '¡3x es un gran número! Compártelo en el showcase si puedes.' },
    ],
    'compilador-ast': [
      { author: 'Fernanda L.', date: '2026-03-02', text: 'La fase 3 con bracket counting me voló la cabeza. ¿Hay forma de extender el transformador?' },
    ],
  };
});

// ─── Páginas fijas (contenido pesado) ────────────────────────────────────────
export const getStaticPages = server({ type: 'pre-build', tags: ['pages'] }, async () => {
  return {
    about: {
      title: 'Acerca de AstraBlog',
      subtitle: 'Un blog entero servido por peticiones pre-construidas',
      hero: 'AstraBlog existe para demostrar una idea: un sitio con mucho contenido puede servirse sin una sola petición de datos en runtime.',
      mission:
        'Cada artículo, autor, categoría, tag y comentario de este sitio se resolvió durante el build. Lo que tu navegador recibe es HTML con las respuestas ya impresas: cero fetch, cero spinners de contenido, cero API en vivo.',
      story: [
        'AstraBlog nació como el caso de prueba del sistema de constant folding de AstraJS. Necesitábamos un sitio con páginas fijas con mucha información, rutas dinámicas anidadas y datos que cambian por build, no por request.',
        'Escribimos una "base de datos" emulada dentro de los cuerpos de las funciones pre-build — en un proyecto real, esos cuerpos consultarían tu base real durante vite build. La mecánica es idéntica: el resultado viaja inlinado.',
        'Hoy el blog tiene 18 artículos, 5 autores, 6 categorías y 14 tags. Nada de eso se consulta en runtime: todo se resolvió antes de que tú llegaras.',
      ],
      pillars: [
        { icon: '⚡', title: 'Pre-built requests', text: 'Las consultas corren en build time y sus resultados se inlinan como JSON en el bundle.' },
        { icon: '🧭', title: 'Rutas dinámicas anidadas', text: '/authors/:author/posts/:post y /categories/:cat/tags/:tag, resueltas con guards reactivos.' },
        { icon: '📚', title: 'Páginas fijas pesadas', text: 'Acerca de, contacto y portada con contenido largo, también pre-construido.' },
        { icon: '🌱', title: 'Cero deuda de runtime', text: 'Sin API, sin base de datos en vivo, sin estados de servidor que mantener.' },
      ],
      faq: [
        { q: '¿Los datos de este blog vienen de una base de datos?', a: 'De una base de datos emulada que se consulta durante el build. Las "tablas" viven dentro de los cuerpos de las funciones server({ type: pre-build }).' },
        { q: '¿Qué pasa cuando publicas un artículo nuevo?', a: 'Reconstruyes el sitio: vite build ejecuta las consultas de nuevo y los resultados actualizados se inlinan. Es ISR llevado al extremo del build.' },
        { q: '¿Cómo funcionan las rutas dinámicas si no hay servidor?', a: 'El router captura los parámetros de la URL y la capa de consultas filtra las constantes ya inlinadas. La URL es el estado; los datos ya están aquí.' },
        { q: '¿Puedo usar pre-build con datos que cambian por usuario?', a: 'No: pre-build es para datos que no dependen del visitante. Para lo demás, server() dynamic con autoSync y ETags.' },
        { q: '¿Dónde está el código de este blog?', a: 'En la carpeta astra-blog/ de la raíz del monorepo, junto a examples/fullstack/. Los tests de la capa de consultas están en src/__tests__/.' },
      ],
      teamTitle: 'Quiénes escriben aquí',
      teamSubtitle: 'Cinco autoras y autores que mantienen el framework y su documentación.',
    },
    contact: {
      title: 'Contacto',
      subtitle: 'Escríbenos — respondemos en el próximo build',
      intro: '¿Encontraste un error en un artículo? ¿Quieres proponer un tema? Todas las vías de contacto viven pre-construidas en esta página, como todo lo demás.',
      email: 'hola@astrablog.dev',
      address: 'Calle del Compilador 42, piso 3 · Valparaíso, Chile',
      schedule: [
        { day: 'Lunes a viernes', hours: '09:00 – 18:00 CLT' },
        { day: 'Sábados', hours: '10:00 – 14:00 CLT' },
        { day: 'Domingos', hours: 'Cerrado (los builds descansan)' },
      ],
      socials: [
        { label: 'GitHub', href: 'https://github.com', handle: '@astrajs' },
        { label: 'Discord', href: 'https://discord.com', handle: 'discord.gg/astrajs' },
        { label: 'X', href: 'https://x.com', handle: '@astrajs_dev' },
      ],
      notes:
        'Este formulario es decorativo: no hay servidor en runtime que reciba el mensaje. En una app real, usarías server() dynamic para enviarlo — y seguirías pre-construyendo todo lo demás.',
    },
  };
});

// ─── Snapshot agregado para la capa de consultas ─────────────────────────────
// Nota: cada llamada pre-build es independiente (el ejecutor de build-time no
// comparte scope). La capa db-core.ts las combina en un solo "schema".
