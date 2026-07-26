/**
 * 01 — Simple State · Styles
 *
 * Defined with the `css` macro — the compiler extracts them
 * to static CSS at build time (zero-runtime).
 */
import { css } from '@astrajs/compiler/css';

export const styles = css`
  .box { padding: 1rem; text-align: center; font-family: sans-serif; }
  .buttons { display: flex; gap: 10px; justify-content: center; }
`;
