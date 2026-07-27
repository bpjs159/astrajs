/**
 * @astrajs/router — params — Global reactive proxy
 *
 * `params` is a global read-only store that exposes dynamic
 * route segments (`:id`, `:botId`) from the currently matched route.
 *
 * ```tsx
 * import { params } from '@astrajs/router';
 * // params.botId → 'alpha' when route is /dashboard/:botId
 * ```
 */

import { store } from '@astrajs/core';

export const params = store<Record<string, string>>({});
