/**
 * AstraJS — Official Site
 * Zero-VDOM, AST-compiled, full-stack TypeScript framework.
 */
import { component } from '@astrajs/core';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { HomePage } from './pages/home.js';
import { DocsIntroduction } from './pages/docs/introduction.js';
import { DocsFundamentals } from './pages/docs/fundamentals.js';
import { DocsServerData } from './pages/docs/server-data.js';
import { DocsRouter } from './pages/docs/router.js';
import { DocsRendering } from './pages/docs/rendering.js';
import { DocsComparison } from './pages/docs/comparison.js';
import { DocsAdvanced } from './pages/docs/advanced.js';
import { routes } from './routes.js';

/* ── Global Styles ── */
const style = document.createElement('style');
style.textContent = `
  /* === FONTS === */
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-Semibold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-Light.ttf') format('truetype');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fauna Pro';
    src: url('/fonts/fauna/FaunaPro-ExtraLight.ttf') format('truetype');
    font-weight: 200;
    font-style: normal;
  }

  /* === RESET === */
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#04060d;color:#e2e8f0;line-height:1.6;overflow-x:hidden}
  a{color:inherit;text-decoration:none}
  img{max-width:100%;display:block}
  code{font-family:'JetBrains Mono','Fira Code',monospace}
  ::selection{background:rgba(139,77,255,.3);color:#fff}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:#0a0f1a}
  ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:#334155}

  /* === UTILITY === */
  .container{max-width:1280px;margin:0 auto;padding:0 32px}
  .gradient-text{background:linear-gradient(135deg,#b84cff 0%,#4d7cff 50%,#00dfff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .glow-purple{box-shadow:0 0 40px rgba(184,76,255,.15),0 0 80px rgba(184,76,255,.05)}
  .glow-cyan{box-shadow:0 0 40px rgba(0,223,255,.15),0 0 80px rgba(0,223,255,.05)}
`;
document.head.appendChild(style);

/* ── App Layout ── */
export const App = component(() => (
  <div class="app">
    <Header />
    <main>
      {(() => {
        if (routes.home) return <HomePage />;
        if (routes.docsIntroduction) return <DocsIntroduction />;
        if (routes.docsFundamentals) return <DocsFundamentals />;
        if (routes.docsServerData) return <DocsServerData />;
        if (routes.docsRouter) return <DocsRouter />;
        if (routes.docsRendering) return <DocsRendering />;
        if (routes.docsComparison) return <DocsComparison />;
        if (routes.docsAdvanced) return <DocsAdvanced />;
        if (routes.docs) return <DocsIntroduction />;
        return <HomePage />;
      })()}
    </main>
    <Footer />
  </div>
));

/* Mount */
const root = document.getElementById('app');
if (root) {
  root.appendChild(App({}) as unknown as Node);
}
