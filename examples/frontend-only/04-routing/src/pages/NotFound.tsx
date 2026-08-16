/**
 * 404 — fallbackRoute() triggers this
 */
import { navigate } from '@bpjs159/router';

export const NotFound = () => (
  <div class="page">
    <div class="emoji">🚫</div>
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <div style="margin-top:16px">
      <button class="btn-back" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  </div>
);
