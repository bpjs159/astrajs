import { component } from '@bpjs159/core';

/**
 * BrandLogo — wordmark "ASTRAJS" para cuando el logo se muestra SIN
 * isotipo (header arriba de todo, footer).
 *
 * NOTA: la estrella logo_star.png sobre la primera "A" está desactivada
 * por ahora; para reactivarla basta re-añadir el wrapper `.bl-first` con
 * el `<img class="bl-star">` y la regla CSS correspondiente.
 *
 * Usage: <BrandLogo cls="header-wordmark" />
 */

export interface BrandLogoProps {
  /** Clase extra para el contenedor (tamaño, peso, animaciones…). */
  cls?: string;
}

const blStyle = `
  .bl-wordmark{position:relative;display:inline-flex;align-items:center;font-family:'Fauna Pro',serif;font-weight:500;color:#ffffff;letter-spacing:.06em;line-height:1;text-shadow:0 0 80px rgba(255,255,255,.15),0 0 160px rgba(255,255,255,.05)}
  .bl-js{background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
`;

export const BrandLogo = component((props: BrandLogoProps) => (
  <span class={props.cls ? `bl-wordmark ${props.cls}` : 'bl-wordmark'}>
    <style>{blStyle}</style>
    <span>A</span>
    <span>STRA</span>
    <span class="bl-js">JS</span>
  </span>
));
