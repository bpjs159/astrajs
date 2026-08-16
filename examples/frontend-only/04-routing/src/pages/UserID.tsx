/**
 * UserID — sub-route inside UserProfile
 * Displays the ID from params.
 */
import { navigate, params } from '@bpjs159/router';

export const UserID = () => (
    <div>
        <p>
            Profile ID: <code>{params.id!}</code>
        </p>
        <p class="hint">Try <code>/user/42</code> or <code>/user/astro</code></p>
        <span class="badge">Sub-route</span>


        <div style="margin-top:16px">
            <button class="btn-back" onClick={() => navigate('/users')}>← Back to Users</button>
        </div>
    </div>
);
