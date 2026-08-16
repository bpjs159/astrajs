/**
 * @bpjs159/compiler/css — CSS Zero-Runtime Macro
 *
 * In production, the Vite compiler plugin processes `css`...`` templates
 * and replaces them with hashed class-name maps.
 *
 * In development, `css` returns class names as-is (no hashing)
 * so styles work without a build step.
 */

/**
 * CSS tagged template macro.
 * At build time: extracted to static .css, replaced with hash map.
 * In dev mode: returns class names unchanged.
 */
export function css(
  _strings: TemplateStringsArray,
  ..._values: (string | number)[]
): Record<string, string> {
  // Dev mode: return a Proxy that captures any property access
  // and returns it as the class name (no hashing in dev).
  return new Proxy({} as Record<string, string>, {
    get(_target, prop: string) {
      return prop;
    },
  });
}

