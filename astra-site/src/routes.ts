import { route, fallbackRoute } from '@astrajs/router';

export const routes = {
  get home() { return route('/', { exact: true }); },
  get docsIntroduction() { return route('/docs/introduction'); },
  get docsFundamentals() { return route('/docs/fundamentals'); },
  get docsServerData() { return route('/docs/server-data'); },
  get docsRouter() { return route('/docs/router'); },
  get docsRendering() { return route('/docs/rendering'); },
  get docsComparison() { return route('/docs/comparison'); },
  get docsExamples() { return route('/docs/examples'); },
  get docsCli() { return route('/docs/cli'); },
  get docsTesting() { return route('/docs/testing'); },
  get docsAdvanced() { return route('/docs/advanced'); },
  get docs() { return route('/docs', { exact: true }); },
  get fallback() { return fallbackRoute(); },
};
